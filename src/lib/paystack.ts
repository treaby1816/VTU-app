// ⚠️  This file is server-side ONLY — never import on the client
import crypto from "crypto";

export const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
export const PAYSTACK_BASE = "https://api.paystack.co";

/**
 * Verify Paystack webhook signature
 * Call this in /api/paystack/webhook/route.ts
 */
export function verifyPaystackSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(body)
    .digest("hex");
  return hash === signature;
}

/**
 * Verify a transaction directly with Paystack API
 */
export async function verifyTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
}
