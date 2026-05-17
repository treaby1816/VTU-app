import { NextRequest, NextResponse } from "next/server";
import { fafotechGetPlans } from "@/lib/providers/fafotech";
import { PROVIDERS } from "@/lib/providers/config";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const network = searchParams.get("network") || "mtn";

    const fafotechConfig = PROVIDERS.find(p => p.name === "fafotech");
    if (!fafotechConfig || !fafotechConfig.apiKey) {
      return NextResponse.json(
        { error: "Fafotech API key not configured in .env.local" },
        { status: 503 }
      );
    }

    const plans = await fafotechGetPlans(fafotechConfig, network);

    return NextResponse.json({
      network,
      provider: "fafotech",
      count: plans.length,
      plans,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch Fafotech plans" },
      { status: 500 }
    );
  }
}
