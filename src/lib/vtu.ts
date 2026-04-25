// ⚠️ Server-side only — VTPass API keys must never reach the browser
const VTPASS_API_KEY = process.env.VTPASS_API_KEY!;
const VTPASS_PUBLIC_KEY = process.env.VTPASS_PUBLIC_KEY!;
// Use https://sandbox.vtpass.com/api for testing, https://vtpass.com/api for production
const VTPASS_BASE_URL = process.env.NODE_ENV === "production" 
  ? "https://vtpass.com/api" 
  : "https://sandbox.vtpass.com/api";

export type VTUNetwork = "mtn" | "airtel" | "glo" | "9mobile";

/**
 * Generate a VTPass-compliant Request ID
 * Format: YYYYMMDDHHII[unique_id] (at least 12 chars)
 * Note: Uses Africa/Lagos time (UTC+1)
 */
export function generateVTPassRef() {
  const now = new Date();
  // Adjust to Nigeria Time (UTC+1)
  const lagosTime = new Date(now.getTime() + (1 * 60 * 60 * 1000));
  
  const year = lagosTime.getUTCFullYear();
  const month = String(lagosTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(lagosTime.getUTCDate()).padStart(2, "0");
  const hour = String(lagosTime.getUTCHours()).padStart(2, "0");
  const minute = String(lagosTime.getUTCMinutes()).padStart(2, "0");
  
  // Unique suffix (e.g., 8 chars)
  const suffix = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  return `${year}${month}${day}${hour}${minute}${suffix}`;
}

function getHeaders() {
  return {
    "api-key": VTPASS_API_KEY,
    "public-key": VTPASS_PUBLIC_KEY,
    "Content-Type": "application/json",
  };
}

/**
 * Purchase Airtime via VTPass
 */
export async function purchaseAirtime(params: {
  network: VTUNetwork;
  phone: string;
  amount: number;
  ref: string;
}) {
  // VTPass uses 'etisalat' for 9mobile
  const serviceID = params.network === "9mobile" ? "etisalat" : params.network;
  
  const res = await fetch(`${VTPASS_BASE_URL}/pay`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      request_id: params.ref,
      serviceID: serviceID,
      amount: params.amount,
      phone: params.phone,
    }),
  });
  
  return res.json();
}

/**
 * Purchase Data Subscription via VTPass
 */
export async function purchaseData(params: {
  network: VTUNetwork;
  phone: string;
  variation_code: string; // VTPass plan code
  ref: string;
}) {
  const serviceID = `${params.network === "9mobile" ? "etisalat" : params.network}-data`;
  
  const res = await fetch(`${VTPASS_BASE_URL}/pay`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      request_id: params.ref,
      serviceID: serviceID,
      billersCode: params.phone, // Mandatory for data
      variation_code: params.variation_code,
      phone: params.phone,
    }),
  });
  
  return res.json();
}
