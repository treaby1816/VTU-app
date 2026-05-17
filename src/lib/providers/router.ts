// Smart provider router — tries providers in priority order
// Hops to the next if one fails or is cooling down.
// Cooldowns are batch-fetched ONCE before the loop to minimize DB calls.

import {
  getAirtimeProviders,
  getDataProviders,
  markProviderFailed,
  fetchActiveCooldowns,
} from "./config";
import { PurchaseParams, PurchaseResult } from "./types";
import { smeplugAirtime, smeplugData } from "./smeplug";
import { datastationAirtime, datastationData } from "./datastation";
import { vtungAirtime, vtungData } from "./vtung";
import { logApiRequest } from "./telemetry";
import { fafotechAirtime, fafotechData } from "./fafotech";

// ── Dispatch table — maps provider name to its adapter function
const AIRTIME_ADAPTERS: Record<string, Function> = {
  fafotech:    fafotechAirtime,    // Priority 1 — cheapest
  smeplug:     smeplugAirtime,     // Priority 2
  datastation: datastationAirtime, // Priority 3
  n3tdata:     datastationAirtime, // Priority 4
  vtung:       vtungAirtime,       // Priority 5 — last resort
};

const DATA_ADAPTERS: Record<string, Function> = {
  fafotech:    fafotechData,       // Priority 1 — cheapest
  smeplug:     smeplugData,        // Priority 2
  datastation: datastationData,    // Priority 3
  n3tdata:     datastationData,    // Priority 4
  vtung:       vtungData,          // Priority 5 — last resort
};

// ── Main hop function for AIRTIME
export async function routeAirtime(
  params: PurchaseParams
): Promise<PurchaseResult & { attemptedProviders: string[] }> {
  const providers = getAirtimeProviders();
  const attempted: string[] = [];

  // Batch-fetch all cooldowns ONCE before the loop
  const cooldowns = await fetchActiveCooldowns();

  for (const provider of providers) {
    // Skip if in cooldown (no DB call — uses pre-fetched set)
    if (cooldowns.has(provider.name)) {
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

    // Fire-and-forget telemetry log
    logApiRequest({
      provider: provider.name,
      serviceType: "airtime",
      requestPayload: params,
      responsePayload: result,
      isSuccess: result.success,
      latencyMs: elapsed
    });

    if (result.success) {
      return { ...result, attemptedProviders: attempted };
    }

    // Mark as failed and try next provider
    await markProviderFailed(provider.name);
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

  // Batch-fetch all cooldowns ONCE before the loop
  const cooldowns = await fetchActiveCooldowns();

  for (const provider of providers) {
    // Skip if in cooldown (no DB call — uses pre-fetched set)
    if (cooldowns.has(provider.name)) {
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

    // Fire-and-forget telemetry log
    logApiRequest({
      provider: provider.name,
      serviceType: "data",
      requestPayload: params,
      responsePayload: result,
      isSuccess: result.success,
      latencyMs: elapsed
    });

    if (result.success) {
      return { ...result, attemptedProviders: attempted };
    }

    await markProviderFailed(provider.name);
    console.log(`[Router] Hopping to next provider...`);
  }

  return {
    success: false,
    provider: "vtung",
    message: "All providers failed. Please try again shortly.",
    attemptedProviders: attempted,
  };
}
