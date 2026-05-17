import { NextRequest, NextResponse } from "next/server";
import { routeData } from "@/lib/providers/router";
import { createClient } from "@supabase/supabase-js";
import { resolveTenant } from "@/lib/tenant";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DataSchema = z.object({
  user_id:   z.string().uuid(),
  network:   z.enum(["mtn", "airtel", "glo", "9mobile"]),
  phone:     z.string().regex(/^0[789][01]\d{8}$/, "Invalid phone"),
  plan_id:   z.string().min(1),
  plan_name: z.string().min(1),
  amount:    z.number().min(50).max(100000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DataSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { user_id, network, phone, plan_id, plan_name, amount } = parsed.data;

    // 1. Resolve Active Reseller Tenant
    const host = req.headers.get("x-tenant-host") || req.headers.get("host") || "";
    const tenant = await resolveTenant(host);

    let retailPrice = amount;
    let wholesalePrice = amount;

    // If running under a reseller whitelabel, resolve pricing overrides
    if (tenant) {
      const { data: pricing } = await supabase
        .from("tenant_pricing")
        .select("retail_price, wholesale_price")
        .eq("tenant_id", tenant.id)
        .eq("service_name", plan_id)
        .maybeSingle();

      if (pricing) {
        retailPrice = Number(pricing.retail_price);
        wholesalePrice = Number(pricing.wholesale_price);
      }
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

    const ref = "DAT" + Date.now().toString(36).toUpperCase() +
                Math.random().toString(36).slice(2, 5).toUpperCase();

    // 4. Create Customer Debit Transaction
    // 4. Batch Create Transactions (Customer + Reseller Parent Debits)
    const txRecords = [];
    txRecords.push({
      user_id, type: "debit",
      service: `${network.toUpperCase()} Data – ${plan_name}`,
      amount: retailPrice, status: "pending", phone,
      network: network.toUpperCase(), ref,
      tenant_id: tenant ? tenant.id : null,
    });

    if (tenant && tenant.parentId) {
      txRecords.push({
        user_id: tenant.parentId, type: "debit",
        service: `Wholesale: ${network.toUpperCase()} Data – ${plan_name} (User: ${phone})`,
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

    // ── SMART HOP ───────────────────────────────────────────────
    const result = await routeData({
      network, phone, planId: plan_id, planName: plan_name, ref
    });
    // ────────────────────────────────────────────────────────────

    // 6. Update Debit Transaction Statuses
    await supabase
      .from("transactions")
      .update({
        status: result.success ? "success" : "failed",
        provider: result.provider,
        provider_ref: result.providerRef,
        provider_cost: wholesalePrice, // track reseller wholesale price as cost to master system
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

    // 7. Process Combined Refunds on Failure (Batch Insert)
    if (!result.success) {
      const refundRecords = [];
      
      refundRecords.push({
        user_id, type: "credit",
        service: `Refund – ${network.toUpperCase()} Data`,
        amount: retailPrice, status: "success",
        ref: "REF_" + ref, phone: null, network: null,
        tenant_id: tenant ? tenant.id : null,
      });

      if (resellerTxData && tenant) {
        refundRecords.push({
          user_id: tenant.parentId, type: "credit",
          service: `Refund – Wholesale: ${network.toUpperCase()} Data`,
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
    console.error("[Data API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
