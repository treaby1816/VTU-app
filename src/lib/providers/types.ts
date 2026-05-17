export type ProviderName = 
  | "fafotech"      // Priority 1 — cheapest
  | "smeplug"       // Priority 2
  | "datastation"   // Priority 3
  | "n3tdata"       // Priority 4
  | "vtung";        // Priority 5 — last resort
export type ProviderStatus = "active" | "degraded" | "offline";

export interface ProviderConfig {
  name: ProviderName;
  label: string;
  baseUrl: string;
  apiKey: string;
  username?: string;
  priority: number;         // 1 = try first, 5 = last resort
  markup: number;           // percentage profit margin
  supportsAirtime: boolean;
  supportsData: boolean;
  supportsSME: boolean;     // true = has cheap SME data
}

export interface PurchaseParams {
  network: "mtn" | "airtel" | "glo" | "9mobile";
  phone: string;
  amount?: number;           // for airtime
  planId?: string;           // for data
  planName?: string;
  ref: string;
}

export interface PurchaseResult {
  success: boolean;
  provider: ProviderName;
  providerRef?: string;
  message: string;
  raw?: any;
}

export interface ProviderHealth {
  name: ProviderName;
  status: ProviderStatus;
  lastChecked: string;
  successRate: number;       // 0-100
  avgResponseMs: number;
  failCount: number;
}
