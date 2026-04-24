// ─── Shared Types ────────────────────────────────────────────────────────

export type TxType    = "credit" | "debit";
export type TxStatus  = "pending" | "success" | "failed";
export type Network   = "MTN" | "Airtel" | "Glo" | "9mobile";
export type VTUNetwork = "mtn" | "airtel" | "glo" | "9mobile";

export interface Transaction {
  id:         string;
  user_id:    string;
  type:       TxType;
  service:    string;
  amount:     number;
  status:     TxStatus;
  phone:      string | null;
  network:    string | null;
  ref:        string;
  created_at: string;
}

export interface Profile {
  id:         string;
  full_name:  string;
  phone:      string | null;
  is_admin:   boolean;
  created_at: string;
  updated_at: string;
}

export interface DataBundle {
  id:       string;
  name:     string;
  validity: string;
  price:    number;
}

export interface NetworkConfig {
  id:    VTUNetwork;
  name:  Network;
  color: string;
  bg:    string;
  logo:  string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  error?:  string;
  message?: string;
}
