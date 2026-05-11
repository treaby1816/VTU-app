import { NextRequest, NextResponse } from "next/server";
import { PROVIDERS } from "@/lib/providers/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — return provider stats from transaction history
export async function GET(req: NextRequest) {
  try {
    const stats: any[] = [];

    for (const provider of PROVIDERS) {
      const { data } = await supabase
        .from("transactions")
        .select("status, provider")
        .eq("provider", provider.name)
        .eq("type", "debit")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const total   = data?.length || 0;
      const success = data?.filter(t => t.status === "success").length || 0;
      const rate    = total > 0 ? Math.round((success / total) * 100) : 0;

      stats.push({
        name:        provider.name,
        label:       provider.label,
        priority:    provider.priority,
        supportsSME: provider.supportsSME,
        markup:      provider.markup,
        hasKey:      !!provider.apiKey,
        last24h: {
          total, success,
          failed:      total - success,
          successRate: rate,
        },
      });
    }

    return NextResponse.json({ providers: stats });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
