import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env as any).NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for your database tables — expand as you build
export type Transaction = {
  id: string;
  user_id: string;
  type: "credit" | "debit";
  service: string;
  amount: number;
  status: "pending" | "success" | "failed";
  phone: string | null;
  network: string | null;
  ref: string;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
};
