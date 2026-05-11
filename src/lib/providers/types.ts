export type ProviderName = "smeplug" | "datastation" | "n3tdata" | "vtung";
export type ProviderStatus = "active" | "degraded" | "offline";

export interface ProviderConfig {
  name: ProviderName;
  label: string;
  baseUrl: string;
  apiKey: string;
  priority: number;         // 1 = try first, 4 = last resort
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
