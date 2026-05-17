import { NextRequest, NextResponse } from "next/server";
import { routeAirtime } from "@/lib/providers/router";
import { createClient } from "@supabase/supabase-js";
import { resolveTenant } from "@/lib/tenant";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AirtimeSchema = z.object({
  user_id: z.string().uuid(),
  network: z.enum(["mtn", "airtel", "glo", "9mobile"]),
  phone:   z.string().regex(/^0[789][01]\d{8}$/, "Invalid phone"),
  amount:  z.number().min(50).max(50000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AirtimeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { user_id, network, phone, amount } = parsed.data;

    // 1. Resolve Active Reseller Tenant
    const apiKeyHeader = req.headers.get("x-api-key");
    let tenant = null;

    if (apiKeyHeader) {
      const { data } = await supabase
        .from("tenants")
        .select("*")
        .eq("api_key", apiKeyHeader)
        .maybeSingle();
      
      if (!data) {
        return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
      }
      tenant = {
        id: data.id,
        name: data.name,
        subdomain: data.subdomain,
        customDomain: data.custom_domain,
        logoUrl: data.logo_url,
        primaryColor: data.primary_color,
        parentId: data.parent_id,
        isActive: data.is_active,
        airtimeMargin: data.airtime_margin,
        dataMargin: data.data_margin,
      };
    } else {
      const host = req.headers.get("x-tenant-host") || req.headers.get("host") || "";
      tenant = await resolveTenant(host);
    }

    let retailPrice = amount;
    let wholesalePrice = amount;
 
    // If running under a reseller whitelabel, apply margins
    if (tenant) {
      const airtimeMargin = tenant.airtimeMargin || 0;
      retailPrice = amount * (1 + airtimeMargin / 100);
      wholesalePrice = amount; // Reseller pays base amount
    }

    // 2. Check End-User Wallet Balance
    const { data: balance } = await supabase.rpc(
      "get_wallet_balance", { p_user_id: user_id }
    );
    if (!balance || balance < retailPrice) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    // 3. Check Reseller Parent Wallet Balance
    if (tenant && tenant.parentId) {
      const { data: resellerBalance } = await supabase.rpc(
        "get_wallet_balance", { p_user_id: tenant.parentId }
      );
      if (!resellerBalance || resellerBalance < wholesalePrice) {
        return NextResponse.json(
          { error: "Reseller account system balance is too low. Please contact your reseller admin." },
          { status: 400 }
        );
      }
    }

    // Generate unique reference
    const ref = "AIR" + Date.now().toString(36).toUpperCase() +
                Math.random().toString(36).slice(2, 5).toUpperCase();

    // 4. Batch Create Transactions (Customer + Reseller Parent Debits)
    const txRecords = [];
    txRecords.push({
      user_id, type: "debit",
      service: `${network.toUpperCase()} Airtime`,
      amount: retailPrice, status: "pending", phone,
      network: network.toUpperCase(), ref,
      tenant_id: tenant ? tenant.id : null,
    });

    if (tenant && tenant.parentId) {
      txRecords.push({
        user_id: tenant.parentId, type: "debit",
        service: `Wholesale: ${network.toUpperCase()} Airtime (User: ${phone})`,
        amount: wholesalePrice, status: "pending", phone,
        network: network.toUpperCase(), ref: "RES_" + ref,
        tenant_id: tenant.id,
      });
    }

    const { data: insertedTxs, error: txInsertErr } = await supabase
      .from("transactions")
      .insert(txRecords)
      .select();

    if (txInsertErr || !insertedTxs || insertedTxs.length !== txRecords.length) {
      return NextResponse.json(
        { error: "Could not initialize transaction ledger" },
        { status: 500 }
      );
    }

    const txData = insertedTxs.find(t => t.ref === ref);
    const resellerTxData = insertedTxs.find(t => t.ref === "RES_" + ref) || null;

    if (!txData) {
      return NextResponse.json(
        { error: "Transaction record mismatch in ledger" },
        { status: 500 }
      );
    }

    // ── SMART HOP — try all providers in order ──────────────────
    const result = await routeAirtime({ network, phone, amount, ref });
    // ────────────────────────────────────────────────────────────

    // 6. Update Debit Transaction Statuses
    await supabase
      .from("transactions")
      .update({
        status: result.success ? "success" : "failed",
        provider: result.provider,           // store which provider was used
        provider_ref: result.providerRef,
        provider_cost: wholesalePrice,       // track reseller wholesale price as cost to master system
      })
      .eq("id", txData.id);

    if (resellerTxData) {
      await supabase
        .from("transactions")
        .update({
          status: result.success ? "success" : "failed",
          provider: result.provider,
          provider_ref: result.providerRef,
        })
        .eq("id", resellerTxData.id);
    }

    // Process Referral Reward
    if (result.success) {
      const { data: userData } = await supabase
        .from("profiles")
        .select("referred_by")
        .eq("id", user_id)
        .maybeSingle();

      if (userData && userData.referred_by) {
        const rewardAmount = amount * 0.005; // 0.5% for airtime
        
        // 1. Insert reward record
        await supabase
          .from("referral_rewards")
          .insert({
            user_id: userData.referred_by,
            referred_user_id: user_id,
            amount: rewardAmount,
            service_type: "airtime"
          });

        // 2. Credit the referrer's wallet
        await supabase
          .from("transactions")
          .insert({
            user_id: userData.referred_by,
            type: "credit",
            service: `Referral Reward (Airtime)`,
            amount: rewardAmount,
            status: "success",
            ref: "REF_RWD_" + ref,
            tenant_id: tenant ? tenant.id : null,
          });
      }
    }

    // 7. Process Combined Refunds on Failure (Batch Insert)
    if (!result.success) {
      const refundRecords = [];

      refundRecords.push({
        user_id, type: "credit",
        service: `Refund – ${network.toUpperCase()} Airtime`,
        amount: retailPrice, status: "success",
        ref: "REF_" + ref, phone: null, network: null,
        tenant_id: tenant ? tenant.id : null,
      });

      if (resellerTxData && tenant) {
        refundRecords.push({
          user_id: tenant.parentId, type: "credit",
          service: `Refund – Wholesale: ${network.toUpperCase()} Airtime`,
          amount: wholesalePrice, status: "success",
          ref: "REF_RES_" + ref, phone: null, network: null,
          tenant_id: tenant.id,
        });
      }

      await supabase.from("transactions").insert(refundRecords);
    }

    return NextResponse.json({
      success: result.success,
      transaction_id: txData.id,
      provider_used: result.provider,
      providers_tried: result.attemptedProviders,
      message: result.message,
    });

  } catch (err: any) {
    console.error("[Airtime API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
