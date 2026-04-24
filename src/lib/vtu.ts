// ⚠️  Server-side only — API key must never reach the browser
const VTU_BASE = process.env.VTU_BASE_URL!;
const VTU_KEY  = process.env.VTU_API_KEY!;
const VTU_USER = process.env.VTU_USERNAME!;

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${VTU_KEY}`,
  };
}

export type VTUNetwork = "mtn" | "airtel" | "glo" | "9mobile";

/**
 * Purchase airtime via VTU.ng
 */
export async function purchaseAirtime(params: {
  network: VTUNetwork;
  phone: string;
  amount: number;
  ref: string;
}) {
  const res = await fetch(`${VTU_BASE}/airtime`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      network: params.network,
      phone: params.phone,
      amount: params.amount,
      "airtime-type": "VTU",
      ported_number: true,
      request_id: params.ref,
    }),
  });
  return res.json();
}

/**
 * Purchase data bundle via VTU.ng
 */
export async function purchaseData(params: {
  network: VTUNetwork;
  phone: string;
  planId: string;
  ref: string;
}) {
  const res = await fetch(`${VTU_BASE}/data`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      network: params.network,
      mobile_number: params.phone,
      plan: params.planId,
      ported_number: true,
      request_id: params.ref,
    }),
  });
  return res.json();
}
