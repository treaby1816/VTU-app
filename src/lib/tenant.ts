import { supabase } from "./supabase";

export interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  logoUrl: string | null;
  primaryColor: string;
  parentId: string | null;
  isActive: boolean;
}

// Memory cache to prevent querying Supabase on every serverless function invocation
const tenantCache = new Map<string, { data: TenantConfig | null; expires: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache lifetime

/**
 * Resolves active tenant config dynamically based on host header
 */
export async function resolveTenant(host: string): Promise<TenantConfig | null> {
  if (!host) return null;

  // Split port off if host header is e.g. localhost:3000
  const cleanHost = host.split(":")[0].toLowerCase();

  // Core master domains check
  const masterDomains = ["vaultpay.com", "vaultpay.ng", "localhost", "127.0.0.1"];
  if (masterDomains.includes(cleanHost)) {
    return null;
  }

  // Check cache first
  const cached = tenantCache.get(cleanHost);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    let tenantData: any = null;

    // Check if it is a reseller subdomain under vaultpay (e.g. mobipay.vaultpay.com)
    if (cleanHost.endsWith(".vaultpay.com") || cleanHost.endsWith(".vaultpay.ng")) {
      const parts = cleanHost.split(".");
      const subdomain = parts[0];
      
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("subdomain", subdomain)
        .eq("is_active", true)
        .maybeSingle();

      if (!error && data) {
        tenantData = data;
      }
    } else {
      // Look up by full custom domain (e.g. vtu.mobipay.com)
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("custom_domain", cleanHost)
        .eq("is_active", true)
        .maybeSingle();

      if (!error && data) {
        tenantData = data;
      }
    }

    if (tenantData) {
      const config: TenantConfig = {
        id: tenantData.id,
        name: tenantData.name,
        subdomain: tenantData.subdomain,
        customDomain: tenantData.custom_domain,
        logoUrl: tenantData.logo_url,
        primaryColor: tenantData.primary_color,
        parentId: tenantData.parent_id,
        isActive: tenantData.is_active,
      };
      
      tenantCache.set(cleanHost, { data: config, expires: Date.now() + CACHE_TTL_MS });
      return config;
    }

    // Cache null value to prevent spamming DB for non-existent subdomains
    tenantCache.set(cleanHost, { data: null, expires: Date.now() + CACHE_TTL_MS });
    return null;
  } catch (error) {
    console.error("[Tenant Resolution Error]:", error);
    return null;
  }
}
