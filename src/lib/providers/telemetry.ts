import { supabaseAdmin } from "@/lib/supabase-admin";

export interface TelemetryLog {
  provider: string;
  serviceType: "airtime" | "data";
  requestPayload?: any;
  responsePayload?: any;
  statusCode?: number;
  isSuccess: boolean;
  latencyMs: number;
}

/**
 * Logs an API request to the global telemetry table in Supabase.
 * Uses the service-role admin client to bypass RLS on the api_logs table.
 * This runs fire-and-forget to prevent blocking the user's transaction.
 */
export const logApiRequest = (log: TelemetryLog): void => {
  try {
    // Fire and forget — no await, no blocking
    supabaseAdmin.from("api_logs").insert([{
      provider: log.provider,
      service_type: log.serviceType,
      request_payload: log.requestPayload,
      response_payload: log.responsePayload,
      status_code: log.statusCode,
      is_success: log.isSuccess,
      latency_ms: log.latencyMs,
    }]).then(({ error }) => {
      if (error) {
        console.error("[Telemetry Error] Failed to insert API log:", error.message);
      }
    });
  } catch (err) {
    console.error("[Telemetry Error] Exception:", err);
  }
};
