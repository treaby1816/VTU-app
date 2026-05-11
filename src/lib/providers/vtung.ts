// VTU.ng API adapter — last resort fallback
// Docs: https://vtu.ng/developers

import { ProviderConfig, PurchaseParams, PurchaseResult } from "./types";

function headers(config: ProviderConfig) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.apiKey}`,
  };
}

export async function vtungAirtime(
  config: ProviderConfig,
  params: PurchaseParams
): Promise<PurchaseResult> {
  try {
    const res = await fetch(`${config.baseUrl}/airtime`, {
      method: "POST",
      headers: headers(config),
      body: JSON.stringify({
        network: params.network,
        phone: params.phone,
        amount: params.amount,
        "airtime-type": "VTU",
        ported_number: true,
        request_id: params.ref,
      }),
    });

    const data = await res.json();
    const success = data?.Status === "successful" || data?.status === "success";

    return {
      success,
      provider: "vtung",
      providerRef: data?.ident,
      message: success ? "Airtime sent" : data?.message || "Failed",
      raw: data,
    };
  } catch (err: any) {
    return { success: false, provider: "vtung", message: err.message };
  }
}

export async function vtungData(
  config: ProviderConfig,
  params: PurchaseParams
): Promise<PurchaseResult> {
  try {
    const res = await fetch(`${config.baseUrl}/data`, {
      method: "POST",
      headers: headers(config),
      body: JSON.stringify({
        network: params.network,
        mobile_number: params.phone,
        plan: params.planId,
        ported_number: true,
        request_id: params.ref,
      }),
    });

    const data = await res.json();
    const success = data?.Status === "successful" || data?.status === "success";

    return {
      success,
      provider: "vtung",
      providerRef: data?.ident,
      message: success ? "Data activated" : data?.message || "Failed",
      raw: data,
    };
  } catch (err: any) {
    return { success: false, provider: "vtung", message: err.message };
  }
}
