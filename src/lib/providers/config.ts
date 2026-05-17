import { ProviderConfig } from "./types";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const PROVIDERS: ProviderConfig[] = [
  {
    name: "fafotech",
    label: "Fafotech (SME)",
    baseUrl: process.env.FAFOTECH_BASE_URL || "https://fafotech.com/api",
    apiKey: process.env.FAFOTECH_API_KEY || "",
    username: process.env.FAFOTECH_USERNAME || "",
    priority: 1,
    markup: 5,
    supportsAirtime: true,
    supportsData: true,
    supportsSME: true,
  },
  {
    name: "smeplug",
    label: "Smeplug (SME)",
    baseUrl: process.env.SMEPLUG_BASE_URL || "https://smeplug.com/api/v1",
    apiKey: process.env.SMEPLUG_API_KEY || "",
    priority: 2,
    markup: 5,
    supportsAirtime: true,
    supportsData: true,
    supportsSME: true,
  },
  {
    name: "datastation",
    label: "Datastation (SME)",
    baseUrl: process.env.DATASTATION_BASE_URL || "https://datastationng.com/api",
    apiKey: process.env.DATASTATION_API_KEY || "",
    priority: 3,
    markup: 5,
    supportsAirtime: true,
    supportsData: true,
    supportsSME: true,
  },
  {
    name: "n3tdata",
    label: "N3tData (SME)",
    baseUrl: process.env.N3TDATA_BASE_URL || "https://n3tdata.com/api/v1",
    apiKey: process.env.N3TDATA_API_KEY || "",
    priority: 4,
    markup: 5,
    supportsAirtime: false,
    supportsData: true,
    supportsSME: true,
  },
  {
    name: "vtung",
    label: "VTU.ng (Fallback)",
    baseUrl: process.env.VTU_BASE_URL || "https://api.vtu.ng/v1",
    apiKey: process.env.VTU_API_KEY || "",
    priority: 5,
    markup: 8,
    supportsAirtime: true,
    supportsData: true,
    supportsSME: false,
  },
];

// Get providers sorted by priority, filter by capability
export function getAirtimeProviders(): ProviderConfig[] {
  return PROVIDERS
    .filter(p => p.supportsAirtime && p.apiKey)
    .sort((a, b) => a.priority - b.priority);
}

export function getDataProviders(): ProviderConfig[] {
  return PROVIDERS
    .filter(p => p.supportsData && p.apiKey)
    .sort((a, b) => a.priority - b.priority);
}

// ── Local container cache (zero-latency within same execution) ───────────────
const failureCache = new Map<string, number>(); // provider -> fail timestamp
const LOCAL_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// ── Global health cache (fetched from DB with TTL) ───────────────────────────
let globalCooldownSet = new Set<string>();
let cacheLastFetched = 0;
const GLOBAL_CACHE_TTL = 15 * 1000; // 15 seconds

/**
 * Batch-fetch all providers currently in cooldown.
 * Called ONCE before the routing loop begins — eliminates per-iteration DB calls.
 * Returns a Set of provider names that are currently cooling down.
 */
export async function fetchActiveCooldowns(): Promise<Set<string>> {
  const coolingDown = new Set<string>();

  // 1. Add local container failures
  const now = Date.now();
  Array.from(failureCache.entries()).forEach(([name, failedAt]) => {
    if (now - failedAt < LOCAL_COOLDOWN_MS) {
      coolingDown.add(name);
    } else {
      // Expired — clean up
      failureCache.delete(name);
    }
  });

  // 2. Merge global DB cooldowns (with TTL caching)
  if (now - cacheLastFetched > GLOBAL_CACHE_TTL) {
    try {
      const { data, error } = await supabaseAdmin
        .from("provider_health")
        .select("provider_name")
        .eq("status", "cooldown")
        .gt("cooldown_until", new Date().toISOString());

      if (!error && data) {
        globalCooldownSet = new Set(data.map((row: any) => row.provider_name));
        cacheLastFetched = now;
        if (globalCooldownSet.size > 0) {
          console.log("[Provider Health] Active global cooldowns:", Array.from(globalCooldownSet));
        }
      }
    } catch (err) {
      console.error("[Provider Health] Error fetching global cooldowns:", err);
    }
  }

  // Merge
  Array.from(globalCooldownSet).forEach(name => {
    coolingDown.add(name);
  });

  return coolingDown;
}

/**
 * Mark a provider as failed — updates both local cache and global DB.
 * The DB upsert is fire-and-forget to avoid blocking the routing loop.
 */
export async function markProviderFailed(name: string): Promise<void> {
  // 1. Update local cache instantly
  failureCache.set(name, Date.now());

  // 2. Persist globally in DB (fire-and-forget)
  try {
    const cooldownMinutes = 5;
    const cooldownUntil = new Date(Date.now() + cooldownMinutes * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin
      .from("provider_health")
      .upsert({
        provider_name: name,
        status: "cooldown",
        failed_at: new Date().toISOString(),
        cooldown_until: cooldownUntil,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`[Provider Health] Failed to update global cooldown for ${name}:`, error.message);
    } else {
      console.log(`[Provider Health] Persisted global cooldown for ${name} until ${cooldownUntil}`);
    }
  } catch (err) {
    console.error(`[Provider Health] Exception updating global cooldown for ${name}:`, err);
  }
}
