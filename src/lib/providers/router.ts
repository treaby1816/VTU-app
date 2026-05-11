// Smart provider router — tries providers in priority order
// Hops to the next if one fails or is cooling down

import {
  getAirtimeProviders,
  getDataProviders,
  markProviderFailed,
  isProviderCoolingDown,
} from "./config";
import { PurchaseParams, PurchaseResult } from "./types";
import { smeplugAirtime, smeplugData } from "./smeplug";
import { datastationAirtime, datastationData } from "./datastation";
import { vtungAirtime, vtungData } from "./vtung";

// ── Dispatch table — maps provider name to its adapter function
const AIRTIME_ADAPTERS: Record<string, Function> = {
  smeplug:     smeplugAirtime,
  datastation: datastationAirtime,
  n3tdata:     datastationAirtime, // same API shape as datastation
  vtung:       vtungAirtime,
};

const DATA_ADAPTERS: Record<string, Function> = {
  smeplug:     smeplugData,
  datastation: datastationData,
  n3tdata:     datastationData,   // same API shape as datastation
  vtung:       vtungData,
};

// ── Main hop function for AIRTIME
export async function routeAirtime(
  params: PurchaseParams
): Promise<PurchaseResult & { attemptedProviders: string[] }> {
  const providers = getAirtimeProviders();
  const attempted: string[] = [];

  for (const provider of providers) {
    // Skip if in cooldown from a recent failure
    if (isProviderCoolingDown(provider.name)) {
      console.log(`[Router] Skipping ${provider.name} — cooling down`);
      continue;
    }

    const adapter = AIRTIME_ADAPTERS[provider.name];
    if (!adapter) continue;

    attempted.push(provider.name);
    console.log(`[Router] Trying airtime via ${provider.label}...`);

    const startTime = Date.now();
    const result = await adapter(provider, params) as PurchaseResult;
    const elapsed = Date.now() - startTime;

    console.log(
      `[Router] ${provider.label} → ${result.success ? "✅ SUCCESS" : "❌ FAILED"} (${elapsed}ms)`
    );

    if (result.success) {
      return { ...result, attemptedProviders: attempted };
    }

    // Mark as failed and try next provider
    markProviderFailed(provider.name);
    console.log(`[Router] Hopping to next provider...`);
  }

  // All providers failed
  return {
    success: false,
    provider: "vtung",
    message: "All providers failed. Please try again shortly.",
    attemptedProviders: attempted,
  };
}

// ── Main hop function for DATA
export async function routeData(
  params: PurchaseParams
): Promise<PurchaseResult & { attemptedProviders: string[] }> {
  const providers = getDataProviders();
  const attempted: string[] = [];

  for (const provider of providers) {
    if (isProviderCoolingDown(provider.name)) {
      console.log(`[Router] Skipping ${provider.name} — cooling down`);
      continue;
    }

    const adapter = DATA_ADAPTERS[provider.name];
    if (!adapter) continue;

    attempted.push(provider.name);
    console.log(`[Router] Trying data via ${provider.label}...`);

    const startTime = Date.now();
    const result = await adapter(provider, params) as PurchaseResult;
    const elapsed = Date.now() - startTime;

    console.log(
      `[Router] ${provider.label} → ${result.success ? "✅ SUCCESS" : "❌ FAILED"} (${elapsed}ms)`
    );

    if (result.success) {
      return { ...result, attemptedProviders: attempted };
    }

    markProviderFailed(provider.name);
    console.log(`[Router] Hopping to next provider...`);
  }

  return {
    success: false,
    provider: "vtung",
    message: "All providers failed. Please try again shortly.",
    attemptedProviders: attempted,
  };
}
