/**
 * Shared type definitions for VaultPay
 * Centralizes all domain types to replace `any` usage across the codebase.
 */

// ── User Types ───────────────────────────────────────────────────────────────
export interface VaultUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  hasPin?: boolean;
}

// ── Transaction Types ────────────────────────────────────────────────────────
export type TransactionType = "credit" | "debit";
export type TransactionStatus = "pending" | "success" | "failed";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  service: string;
  amount: number;
  status: TransactionStatus;
  phone: string | null;
  network: string | null;
  ref: string;
  provider?: string;
  provider_ref?: string;
  provider_cost?: number;
  margin?: number;
  tenant_id?: string | null;
  created_at: string;
}

// ── Notification Types ───────────────────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// ── Tenant Types ─────────────────────────────────────────────────────────────
export interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  logoUrl: string | null;
  primaryColor: string;
  parentId: string | null;
  isActive: boolean;
  airtimeMargin?: number;
  dataMargin?: number;
}

// ── Toast Types ──────────────────────────────────────────────────────────────
export interface Toast {
  id: number;
  type: "success" | "error" | "info";
  title: string;
  msg?: string;
}

// ── Nav Item Types ───────────────────────────────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  soon?: boolean;
}
