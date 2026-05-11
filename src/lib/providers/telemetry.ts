import { supabase } from "@/lib/supabase";

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
 * This runs asynchronously to prevent blocking the user's transaction.
 */
export const logApiRequest = async (log: TelemetryLog) => {
  try {
    // Fire and forget (don't await unless you want to block)
    supabase.from("api_logs").insert([{
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
