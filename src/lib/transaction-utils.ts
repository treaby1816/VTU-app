/**
 * Shared VTU Transaction Orchestrator
 * 
 * Extracts the common transaction pipeline logic shared between airtime and data routes.
 * Handles: tenant resolution, balance checks, ledger creation, provider routing,
 * status updates, fire-and-forget side effects (notifications, referral rewards), and refunds.
 *
 * Key performance optimization: post-transaction side effects (notifications, referral rewards)
 * are processed via Promise.allSettled() fire-and-forget to avoid blocking the user response.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { resolveTenant } from "@/lib/tenant";
import { checkRateLimit } from "@/lib/rate-limit";
import { routeAirtime, routeData } from "@/lib/providers/router";
import type { TenantConfig } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────────────────────

interface TenantResult {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  logoUrl: string | null;
  primaryColor: string;
  parentId: string | null;
  isActive: boolean;
  airtimeMargin: number;
  dataMargin: number;
}

export interface TransactionParams {
  user_id: string;
  network: string;
  phone: string;
  amount: number;
  serviceType: "airtime" | "data";
  /** For data transactions */
  plan_id?: string;
  plan_name?: string;
}

interface TransactionResult {
  success: boolean;
  transaction_id: string;
  provider_used: string;
  providers_tried: string[];
  message: string;
}

// ── Tenant Resolution ────────────────────────────────────────────────────────

export async function resolveTenantFromRequest(req: NextRequest): Promise<TenantResult | null> {
  const apiKeyHeader = req.headers.get("x-api-key");

  if (apiKeyHeader) {
    const { data } = await supabaseAdmin
      .from("tenants")
      .select("*")
      .eq("api_key", apiKeyHeader)
      .maybeSingle();

    if (!data) return null; // Caller should return 401

    return {
      id: data.id,
      name: data.name,
      subdomain: data.subdomain,
      customDomain: data.custom_domain,
      logoUrl: data.logo_url,
      primaryColor: data.primary_color,
      parentId: data.parent_id,
      isActive: data.is_active,
      airtimeMargin: data.airtime_margin || 0,
      dataMargin: data.data_margin || 0,
    };
  }

  const host = req.headers.get("x-tenant-host") || req.headers.get("host") || "";
  const tenant = await resolveTenant(host);
  return tenant ? { ...tenant, airtimeMargin: tenant.airtimeMargin || 0, dataMargin: tenant.dataMargin || 0 } : null;
}

// ── Rate Limiting ────────────────────────────────────────────────────────────

export async function enforceRateLimit(req: NextRequest, userId: string): Promise<NextResponse | null> {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
  const rateLimitId = userId ? `vtu_limit:${userId}` : `vtu_limit:${ip}`;
  const limitCheck = await checkRateLimit(rateLimitId);

  if (!limitCheck.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429 }
    );
  }

  return null; // Passed
}

// ── Price Calculation ────────────────────────────────────────────────────────

export function calculatePrices(
  amount: number,
  tenant: TenantResult | null,
  serviceType: "airtime" | "data"
): { retailPrice: number; wholesalePrice: number } {
  if (!tenant) return { retailPrice: amount, wholesalePrice: amount };

  const margin = serviceType === "airtime" ? tenant.airtimeMargin : tenant.dataMargin;
  return {
    retailPrice: amount * (1 + margin / 100),
    wholesalePrice: amount,
  };
}

// ── Balance Checks ───────────────────────────────────────────────────────────

export async function checkBalances(
  userId: string,
  retailPrice: number,
  wholesalePrice: number,
  tenant: TenantResult | null
): Promise<NextResponse | null> {
  // End-user balance
  const { data: balance } = await supabaseAdmin.rpc("get_wallet_balance", { p_user_id: userId });
  if (!balance || balance < retailPrice) {
    return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
  }

  // Reseller parent balance
  if (tenant?.parentId) {
    const { data: resellerBalance } = await supabaseAdmin.rpc("get_wallet_balance", { p_user_id: tenant.parentId });
    if (!resellerBalance || resellerBalance < wholesalePrice) {
      return NextResponse.json(
        { error: "Reseller account system balance is too low. Please contact your reseller admin." },
        { status: 400 }
      );
    }
  }

  return null; // Passed
}

// ── Reference Generator ─────────────────────────────────────────────────────

export function generateRef(prefix: string): string {
  return prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

// ── Ledger Creation ──────────────────────────────────────────────────────────

export async function createLedgerEntries(
  params: TransactionParams,
  ref: string,
  retailPrice: number,
  wholesalePrice: number,
  tenant: TenantResult | null,
  serviceLabel: string
) {
  const txRecords: Record<string, unknown>[] = [];

  // Customer debit
  txRecords.push({
    user_id: params.user_id,
    type: "debit",
    service: serviceLabel,
    amount: retailPrice,
    status: "pending",
    phone: params.phone,
    network: params.network.toUpperCase(),
    ref,
    tenant_id: tenant?.id ?? null,
  });

  // Reseller parent debit
  if (tenant?.parentId) {
    txRecords.push({
      user_id: tenant.parentId,
      type: "debit",
      service: `Wholesale: ${serviceLabel} (User: ${params.phone})`,
      amount: wholesalePrice,
      status: "pending",
      phone: params.phone,
      network: params.network.toUpperCase(),
      ref: "RES_" + ref,
      tenant_id: tenant.id,
    });
  }

  const { data: insertedTxs, error: txInsertErr } = await supabaseAdmin
    .from("transactions")
    .insert(txRecords)
    .select();

  if (txInsertErr || !insertedTxs || insertedTxs.length !== txRecords.length) {
    return { error: "Could not initialize transaction ledger" };
  }

  const txData = insertedTxs.find((t: any) => t.ref === ref);
  const resellerTxData = insertedTxs.find((t: any) => t.ref === "RES_" + ref) || null;

  if (!txData) {
    return { error: "Transaction record mismatch in ledger" };
  }

  return { txData, resellerTxData };
}

// ── Status Update ────────────────────────────────────────────────────────────

export async function updateTransactionStatuses(
  txData: any,
  resellerTxData: any | null,
  result: { success: boolean; provider: string; providerRef?: string },
  wholesalePrice: number
): Promise<void> {
  const statusUpdate = {
    status: result.success ? "success" : "failed",
    provider: result.provider,
    provider_ref: result.providerRef,
    provider_cost: wholesalePrice,
  };

  // Update customer tx and reseller tx in parallel
  const updates = [
    supabaseAdmin.from("transactions").update(statusUpdate).eq("id", txData.id),
  ];

  if (resellerTxData) {
    updates.push(
      supabaseAdmin.from("transactions").update({
        status: result.success ? "success" : "failed",
        provider: result.provider,
        provider_ref: result.providerRef,
      }).eq("id", resellerTxData.id)
    );
  }

  await Promise.all(updates);
}

// ── Post-Transaction Side Effects (Fire-and-Forget) ──────────────────────────

async function processPostTransactionSideEffects(params: {
  userId: string;
  amount: number;
  ref: string;
  serviceType: "airtime" | "data";
  tenantId: string | null;
}): Promise<void> {
  const { userId, amount, ref, serviceType, tenantId } = params;
  const serviceLabel = serviceType === "airtime" ? "Airtime" : "Data";

  // 1. Notify the user
  const userNotification = supabaseAdmin.from("notifications").insert({
    user_id: userId,
    title: `${serviceLabel} Purchase Successful!`,
    message: `Your purchase of ₦${amount} ${serviceLabel.toLowerCase()} was successful.`,
  });

  // 2. Fetch referral info and process reward
  const referralProcessing = (async () => {
    const { data: userData } = await supabaseAdmin
      .from("profiles")
      .select("referred_by")
      .eq("id", userId)
      .maybeSingle();

    if (!userData?.referred_by) return;

    const rewardPercent = serviceType === "airtime" ? 0.005 : 0.01;
    const rewardAmount = amount * rewardPercent;

    // Insert reward record, credit wallet, and notify referrer in parallel
    await Promise.allSettled([
      supabaseAdmin.from("referral_rewards").insert({
        user_id: userData.referred_by,
        referred_user_id: userId,
        amount: rewardAmount,
        service_type: serviceType,
      }),
      supabaseAdmin.from("transactions").insert({
        user_id: userData.referred_by,
        type: "credit",
        service: `Referral Reward (${serviceLabel})`,
        amount: rewardAmount,
        status: "success",
        ref: "REF_RWD_" + ref,
        tenant_id: tenantId,
      }),
      supabaseAdmin.from("notifications").insert({
        user_id: userData.referred_by,
        title: "Referral Reward Received!",
        message: `You earned ₦${rewardAmount} from a referral's ${serviceLabel.toLowerCase()} purchase.`,
      }),
    ]);
  })();

  await Promise.allSettled([userNotification, referralProcessing]);
}

// ── Refund Processing ────────────────────────────────────────────────────────

async function processRefunds(
  userId: string,
  ref: string,
  retailPrice: number,
  wholesalePrice: number,
  serviceLabel: string,
  tenant: TenantResult | null,
  resellerTxData: any | null
): Promise<void> {
  const refundRecords: Record<string, unknown>[] = [];

  refundRecords.push({
    user_id: userId,
    type: "credit",
    service: `Refund – ${serviceLabel}`,
    amount: retailPrice,
    status: "success",
    ref: "REF_" + ref,
    phone: null,
    network: null,
    tenant_id: tenant?.id ?? null,
  });

  if (resellerTxData && tenant) {
    refundRecords.push({
      user_id: tenant.parentId,
      type: "credit",
      service: `Refund – Wholesale: ${serviceLabel}`,
      amount: wholesalePrice,
      status: "success",
      ref: "REF_RES_" + ref,
      phone: null,
      network: null,
      tenant_id: tenant.id,
    });
  }

  await supabaseAdmin.from("transactions").insert(refundRecords);
}

// ── Main Orchestrator ────────────────────────────────────────────────────────

export async function executeTransaction(
  req: NextRequest,
  params: TransactionParams
): Promise<NextResponse> {
  // 1. Rate Limiting
  const rateLimitResponse = await enforceRateLimit(req, params.user_id);
  if (rateLimitResponse) return rateLimitResponse;

  // 2. Resolve Tenant
  const apiKeyHeader = req.headers.get("x-api-key");
  let tenant: TenantResult | null = null;

  if (apiKeyHeader) {
    tenant = await resolveTenantFromRequest(req);
    if (!tenant) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
    }
  } else {
    tenant = await resolveTenantFromRequest(req);
  }

  // 3. Calculate Prices
  const { retailPrice, wholesalePrice } = calculatePrices(params.amount, tenant, params.serviceType);

  // 4. Balance Checks
  const balanceError = await checkBalances(params.user_id, retailPrice, wholesalePrice, tenant);
  if (balanceError) return balanceError;

  // 5. Generate Reference
  const refPrefix = params.serviceType === "airtime" ? "AIR" : "DAT";
  const ref = generateRef(refPrefix);

  // 6. Build service label
  const network = params.network.toUpperCase();
  const serviceLabel = params.serviceType === "airtime"
    ? `${network} Airtime`
    : `${network} Data – ${params.plan_name}`;

  // 7. Create Ledger Entries
  const ledgerResult = await createLedgerEntries(params, ref, retailPrice, wholesalePrice, tenant, serviceLabel);
  if ("error" in ledgerResult) {
    return NextResponse.json({ error: ledgerResult.error }, { status: 500 });
  }
  const { txData, resellerTxData } = ledgerResult;

  // 8. Smart Hop — route through providers
  const routerParams = params.serviceType === "airtime"
    ? { network: params.network as any, phone: params.phone, amount: params.amount, ref }
    : { network: params.network as any, phone: params.phone, planId: params.plan_id!, planName: params.plan_name!, ref };

  const result = params.serviceType === "airtime"
    ? await routeAirtime(routerParams)
    : await routeData(routerParams);

  // 9. Update Transaction Statuses (parallel)
  await updateTransactionStatuses(txData, resellerTxData, result, wholesalePrice);

  // 10. Post-transaction side effects (fire-and-forget — NOT blocking user response)
  if (result.success) {
    processPostTransactionSideEffects({
      userId: params.user_id,
      amount: params.amount,
      ref,
      serviceType: params.serviceType,
      tenantId: tenant?.id ?? null,
    }).catch((err) => console.error(`[PostTx] Side effect error:`, err));
  }

  // 11. Process refunds on failure
  if (!result.success) {
    await processRefunds(params.user_id, ref, retailPrice, wholesalePrice, serviceLabel, tenant, resellerTxData);
  }

  // 12. Return response immediately
  return NextResponse.json({
    success: result.success,
    transaction_id: txData.id,
    provider_used: result.provider,
    providers_tried: result.attemptedProviders,
    message: result.message,
  });
}
