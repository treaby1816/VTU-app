// Smeplug API adapter
// Docs: https://smeplug.com/developer

import { ProviderConfig, PurchaseParams, PurchaseResult } from "./types";

function headers(config: ProviderConfig) {
  return {
    "Content-Type": "application/json",
    Authorization: `Token ${config.apiKey}`,
  };
}

export async function smeplugAirtime(
  config: ProviderConfig,
  params: PurchaseParams
): Promise<PurchaseResult> {
  try {
    const networkMap: Record<string, number> = {
      mtn: 1, airtel: 4, glo: 2, "9mobile": 3,
    };

    const res = await fetch(`${config.baseUrl}/topup/`, {
      method: "POST",
      headers: headers(config),
      body: JSON.stringify({
        network: networkMap[params.network],
        amount: params.amount,
        mobile_number: params.phone,
        Ported_number: true,
        airtime_type: "VTU",
      }),
    });

    const data = await res.json();
    const success = data?.Status === "successful" || data?.status === "success";

    return {
      success,
      provider: "smeplug",
      providerRef: data?.ident || data?.id,
      message: success ? "Airtime sent" : data?.info || "Failed",
      raw: data,
    };
  } catch (err: any) {
    return { success: false, provider: "smeplug", message: err.message };
  }
}

export async function smeplugData(
  config: ProviderConfig,
  params: PurchaseParams
): Promise<PurchaseResult> {
  try {
    const networkMap: Record<string, number> = {
      mtn: 1, airtel: 4, glo: 2, "9mobile": 3,
    };

    const res = await fetch(`${config.baseUrl}/data/`, {
      method: "POST",
      headers: headers(config),
      body: JSON.stringify({
        network: networkMap[params.network],
        mobile_number: params.phone,
        plan: params.planId,
        Ported_number: true,
      }),
    });

    const data = await res.json();
    const success = data?.Status === "successful" || data?.status === "success";

    return {
      success,
      provider: "smeplug",
      providerRef: data?.ident || data?.id,
      message: success ? "Data activated" : data?.info || "Failed",
      raw: data,
    };
  } catch (err: any) {
    return { success: false, provider: "smeplug", message: err.message };
  }
}
