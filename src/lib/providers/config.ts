import { ProviderConfig } from "./types";

export const PROVIDERS: ProviderConfig[] = [
  {
    name: "smeplug",
    label: "Smeplug (SME)",
    baseUrl: process.env.SMEPLUG_BASE_URL || "https://smeplug.com/api/v1",
    apiKey: process.env.SMEPLUG_API_KEY || "",
    priority: 1,
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
    priority: 2,
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
    priority: 3,
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
    priority: 4,
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

// Skip providers that have failed recently (stored in memory cache)
const failureCache = new Map<string, number>(); // provider -> fail timestamp

export function markProviderFailed(name: string): void {
  failureCache.set(name, Date.now());
}

export function isProviderCoolingDown(name: string): boolean {
  const failedAt = failureCache.get(name);
  if (!failedAt) return false;
  // Cool down for 5 minutes after a failure
  return Date.now() - failedAt < 5 * 60 * 1000;
}
