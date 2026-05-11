// Datastation API adapter
// Docs: https://datastationng.com/developers

import { ProviderConfig, PurchaseParams, PurchaseResult } from "./types";

function headers(config: ProviderConfig) {
  return {
    "Content-Type": "application/json",
    Authorization: `Token ${config.apiKey}`,
  };
}

export async function datastationAirtime(
  config: ProviderConfig,
  params: PurchaseParams
): Promise<PurchaseResult> {
  try {
    const networkMap: Record<string, string> = {
      mtn: "mtn", airtel: "airtel", glo: "glo", "9mobile": "9mobile",
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
    const success =
      data?.Status === "successful" ||
      data?.status === "success" ||
      data?.message?.toLowerCase().includes("successful");

    return {
      success,
      provider: "datastation",
      providerRef: data?.ident || data?.order_id,
      message: success ? "Airtime sent" : data?.info || data?.message || "Failed",
      raw: data,
    };
  } catch (err: any) {
    return { success: false, provider: "datastation", message: err.message };
  }
}

export async function datastationData(
  config: ProviderConfig,
  params: PurchaseParams
): Promise<PurchaseResult> {
  try {
    const networkMap: Record<string, string> = {
      mtn: "mtn", airtel: "airtel", glo: "glo", "9mobile": "9mobile",
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
    const success =
      data?.Status === "successful" ||
      data?.status === "success" ||
      data?.message?.toLowerCase().includes("successful");

    return {
      success,
      provider: "datastation",
      providerRef: data?.ident || data?.order_id,
      message: success ? "Data activated" : data?.info || data?.message || "Failed",
      raw: data,
    };
  } catch (err: any) {
    return { success: false, provider: "datastation", message: err.message };
  }
}
