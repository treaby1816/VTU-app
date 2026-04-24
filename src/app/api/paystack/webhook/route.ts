import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role (bypasses RLS for webhooks)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";

    // ── 1. Verify webhook signature ──────────────────────────────────────
    if (!verifyPaystackSignature(rawBody, signature)) {
      console.error("[Paystack Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // ── 2. Only handle successful charges ───────────────────────────────
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const { reference, amount, metadata, customer } = event.data;
    const amountNGN = amount / 100; // Paystack sends in kobo
    const userId = metadata?.user_id;

    if (!userId) {
      console.error("[Paystack Webhook] No user_id in metadata");
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // ── 3. Idempotency — prevent duplicate credits ───────────────────────
    const { data: existing } = await supabase
      .from("transactions")
      .select("id")
      .eq("ref", reference)
      .single();

    if (existing) {
      console.log("[Paystack Webhook] Duplicate reference, skipping:", reference);
      return NextResponse.json({ received: true });
    }

    // ── 4. Insert credit transaction (atomic via DB trigger) ─────────────
    const { error: txError } = await supabase.from("transactions").insert({
      user_id: userId,
      type: "credit",
      service: "Wallet Funding",
      amount: amountNGN,
      status: "success",
      ref: reference,
      phone: null,
      network: null,
    });

    if (txError) {
      console.error("[Paystack Webhook] DB insert failed:", txError);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    console.log(`[Paystack Webhook] Credited ₦${amountNGN} to user ${userId}`);
    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("[Paystack Webhook] Unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
