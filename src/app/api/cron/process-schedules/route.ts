import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch active schedules due for run
    const { data: schedules, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("status", "active")
      .lte("next_run", new Date().toISOString());

    if (error) throw error;

    const results = [];

    for (const schedule of schedules || []) {
      try {
        // 2. Call the appropriate API
        const endpoint = schedule.service_type === "airtime" ? "/api/vtu/airtime" : "/api/vtu/data";
        
        // We need to simulate the request body
        const body: any = {
          user_id: schedule.user_id,
          network: schedule.network,
          phone: schedule.phone,
          amount: schedule.amount,
        };
        
        if (schedule.service_type === "data") {
          body.plan_id = schedule.plan_id;
          // We might need plan_name too, but let's assume the API can handle it or we fetch it
          body.plan_name = "Scheduled Data Plan"; // Fallback
        }

        // Call the API internally or via fetch
        // Since we are in a serverless function, calling ourselves via fetch is fine if we use the full URL!
        // But calling the function directly is better if possible.
        // For simplicity, let's just simulate the transaction logic here or call the API!
        // Let's call the API via fetch to ensure all ledger and provider logic runs!
        
        const origin = req.headers.get("origin") || `https://${req.headers.get("host")}`;
        const res = await fetch(`${origin}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // We might need to bypass auth or pass a master key!
            // Let's use a special header or just trust the call if it's from localhost/cron
            "x-api-key": process.env.INTERNAL_CRON_KEY || "fallback_secret_key",
          },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        
        // 3. Update schedule next_run
        const nextRun = new Date();
        if (schedule.frequency === "daily") nextRun.setDate(nextRun.getDate() + 1);
        if (schedule.frequency === "weekly") nextRun.setDate(nextRun.getDate() + 7);
        if (schedule.frequency === "monthly") nextRun.setMonth(nextRun.getMonth() + 1);

        await supabase
          .from("schedules")
          .update({
            last_run: new Date().toISOString(),
            next_run: nextRun.toISOString(),
            status: res.ok ? "active" : "failed", // Or keep active and retry?
          })
          .eq("id", schedule.id);

        results.push({ id: schedule.id, status: res.ok ? "success" : "failed", data });

      } catch (err: any) {
        console.error(`[Cron] Failed to process schedule ${schedule.id}:`, err);
        results.push({ id: schedule.id, status: "error", error: err.message });
      }
    }

    return NextResponse.json({ processed: results.length, results });

  } catch (err: any) {
    console.error("[Cron API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
