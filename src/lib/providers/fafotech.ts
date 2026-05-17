// ── Fafotech API Adapter
// Register:  https://fafotech.com/signup/
// API Docs:  https://fafotech.com/developer/ (login required)
// Contact:   fafodata@gmail.com | 0706 141 8530
// Address:   No 24, Aliobume Idumuesah, Agbor, Delta State
//
// ⚠️  VERIFY: After registering, check Developer's API section
// in your dashboard for the exact endpoint paths, auth method,
// and request/response field names. Update the // VERIFY lines.

import { ProviderConfig, PurchaseParams, PurchaseResult } from "./types";

// ── Network ID mapping — VERIFY these IDs in Fafotech dashboard
// Common patterns: numeric IDs or string names
const NETWORK_MAP: Record<string, string> = {
  mtn:     "1",   // VERIFY: check Fafotech network list endpoint
  airtel:  "4",   // VERIFY
  glo:     "2",   // VERIFY
  "9mobile": "3", // VERIFY
};

// ── Auth headers — VERIFY: Token vs Bearer vs Api-Key header name
function headers(config: ProviderConfig) {
  return {
    "Content-Type": "application/json",
    Authorization: `Token ${config.apiKey}`, // VERIFY auth scheme
  };
}

// ── Verify wallet balance before purchasing
export async function fafoBalance(
  config: ProviderConfig
): Promise<number> {
  try {
    const res = await fetch(
      `${config.baseUrl}/balance/`, // VERIFY endpoint
      { method: "GET", headers: headers(config) }
    );
    const data = await res.json();
    return parseFloat(data?.balance || data?.wallet_balance || "0");
  } catch {
    return 0;
  }
}

// ── Buy Airtime via Fafotech
export async function fafotechAirtime(
  config: ProviderConfig,
  params: PurchaseParams
): Promise<PurchaseResult> {
  try {
    const networkId = NETWORK_MAP[params.network];
    if (!networkId) {
      return {
        success: false,
        provider: "fafotech",
        message: `Network ${params.network} not mapped for Fafotech`,
      };
    }

    // VERIFY: exact endpoint path and field names from API docs
    const res = await fetch(`${config.baseUrl}/topup/`, {
      method: "POST",
      headers: headers(config),
      body: JSON.stringify({
        network:       networkId,        // VERIFY field name
        amount:        params.amount,    // VERIFY field name
        mobile_number: params.phone,     // VERIFY field name
        Ported_number: true,             // VERIFY if required
        airtime_type:  "VTU",            // VERIFY value
        request_id:    params.ref,       // VERIFY field name
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Fafotech Airtime] HTTP error:", res.status, errText);
      return { success: false, provider: "fafotech", message: `HTTP ${res.status}` };
    }

    const data = await res.json();

    // VERIFY: exact success indicators in Fafotech response
    const success =
      data?.Status === "successful" ||
      data?.status === "success" ||
      data?.message?.toLowerCase().includes("successful") ||
      data?.code === "00" ||
      data?.success === true;

    return {
      success,
      provider: "fafotech",
      providerRef: data?.ident || data?.id || data?.order_id || data?.transaction_id,
      message: success
        ? "Airtime sent via Fafotech"
        : data?.info || data?.message || data?.detail || "Failed",
      raw: data,
    };
  } catch (err: any) {
    console.error("[Fafotech Airtime] Error:", err.message);
    return { success: false, provider: "fafotech", message: err.message };
  }
}

// ── Buy Data Bundle via Fafotech
export async function fafotechData(
  config: ProviderConfig,
  params: PurchaseParams
): Promise<PurchaseResult> {
  try {
    const networkId = NETWORK_MAP[params.network];
    if (!networkId) {
      return {
        success: false,
        provider: "fafotech",
        message: `Network ${params.network} not mapped for Fafotech`,
      };
    }

    // VERIFY: exact endpoint and fields from Fafotech API docs
    const res = await fetch(`${config.baseUrl}/data/`, {
      method: "POST",
      headers: headers(config),
      body: JSON.stringify({
        network:       networkId,        // VERIFY
        mobile_number: params.phone,     // VERIFY
        plan:          params.planId,    // VERIFY field name (may be "plan_id" or "bundle_id")
        Ported_number: true,             // VERIFY if required
        request_id:    params.ref,       // VERIFY
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Fafotech Data] HTTP error:", res.status, errText);
      return { success: false, provider: "fafotech", message: `HTTP ${res.status}` };
    }

    const data = await res.json();

    const success =
      data?.Status === "successful" ||
      data?.status === "success" ||
      data?.message?.toLowerCase().includes("successful") ||
      data?.code === "00" ||
      data?.success === true;

    return {
      success,
      provider: "fafotech",
      providerRef: data?.ident || data?.id || data?.order_id || data?.transaction_id,
      message: success
        ? "Data activated via Fafotech"
        : data?.info || data?.message || data?.detail || "Failed",
      raw: data,
    };
  } catch (err: any) {
    console.error("[Fafotech Data] Error:", err.message);
    return { success: false, provider: "fafotech", message: err.message };
  }
}

// ── Fetch available data plans from Fafotech
// Call this to populate your data bundle list dynamically
// VERIFY: the exact endpoint from your developer dashboard
export async function fafotechGetPlans(
  config: ProviderConfig,
  network: string
): Promise<any[]> {
  try {
    const networkId = NETWORK_MAP[network];
    const res = await fetch(
      `${config.baseUrl}/data-plans/?network=${networkId}`, // VERIFY
      { method: "GET", headers: headers(config) }
    );
    const data = await res.json();
    return data?.plans || data?.results || data?.data || [];
  } catch {
    return [];
  }
}
