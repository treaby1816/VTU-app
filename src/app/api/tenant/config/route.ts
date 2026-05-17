import { NextResponse } from "next/server";
import { resolveTenant } from "@/lib/tenant";
import { supabase } from "@/lib/supabase";
import { DATA_BUNDLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Returns tenant-specific whitelabel configurations (logos, branding theme colors, custom retail pricing plans)
 */
export async function GET(req: Request) {
  try {
    const host = req.headers.get("host") || "";
    const tenant = await resolveTenant(host);

    // Master Domain
    if (!tenant) {
      return NextResponse.json({
        isReseller: false,
        tenantId: null,
        name: "VaultPay",
        logoUrl: null,
        primaryColor: "#00D4AA",
        bundles: DATA_BUNDLES,
      });
    }

    // Reseller Tenant: Fetch custom retail pricing margins
    const { data: pricingList, error } = await supabase
      .from("tenant_pricing")
      .select("*")
      .eq("tenant_id", tenant.id);

    // Deep clone global DATA_BUNDLES to safely apply pricing overrides
    const customBundles = JSON.parse(JSON.stringify(DATA_BUNDLES));

    if (!error && pricingList && pricingList.length > 0) {
      pricingList.forEach((item: any) => {
        if (item.service_type === "data") {
          // Search networks for the plan identifier and override with custom retail price
          for (const net in customBundles) {
            const index = customBundles[net].findIndex((b: any) => b.id === item.service_name);
            if (index !== -1) {
              customBundles[net][index].price = Number(item.retail_price);
            }
          }
        }
      });
    }

    return NextResponse.json({
      isReseller: true,
      tenantId: tenant.id,
      name: tenant.name,
      logoUrl: tenant.logoUrl,
      primaryColor: tenant.primaryColor,
      bundles: customBundles,
    });
  } catch (error: any) {
    console.error("[Tenant Config Route Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
