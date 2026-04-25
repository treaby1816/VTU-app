import { NextRequest, NextResponse } from "next/server";
import { purchaseAirtime, VTUNetwork } from "@/lib/vtu";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Client will be initialized inside the handler to prevent build errors

// ── Input validation schema ──────────────────────────────────────────────
const AirtimeSchema = z.object({
  user_id: z.string().uuid(),
  network: z.enum(["mtn", "airtel", "glo", "9mobile"]),
  phone:   z.string().regex(/^0[789][01]\d{8}$/, "Invalid Nigerian phone number"),
  amount:  z.number().min(50).max(50000),
});

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();

    // ── 1. Validate input ────────────────────────────────────────────────
    const parsed = AirtimeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { user_id, network, phone, amount } = parsed.data;

    // ── 2. Verify Session (Security Fix) ──────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user || user.id !== user_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── 2. Check wallet balance (computed from ledger) ───────────────────
    const { data: balanceData, error: balanceError } = await supabase.rpc(
      "get_wallet_balance",
      { p_user_id: user_id }
    );

    if (balanceError || balanceData === null) {
      return NextResponse.json({ error: "Could not fetch balance" }, { status: 500 });
    }

    if (balanceData < amount) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    // ── 3. Create PENDING debit transaction ──────────────────────────────
    const ref = generateVTPassRef();

    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id,
        type: "debit",
        service: `${network.toUpperCase()} Airtime`,
        amount,
        status: "pending",
        phone,
        network: network.toUpperCase(),
        ref,
      })
      .select()
      .single();

    if (txError || !txData) {
      return NextResponse.json({ error: "Could not create transaction" }, { status: 500 });
    }

    // ── 4. Call VTU provider ─────────────────────────────────────────────
    const vtuResponse = await purchaseAirtime({
      network: network as VTUNetwork,
      phone,
      amount,
      ref,
    });

    // VTPass returns code '000' for success
    const success = vtuResponse?.code === "000" || vtuResponse?.content?.transactions?.status === "delivered";

    // ── 5. Update transaction status ─────────────────────────────────────
    await supabase
      .from("transactions")
      .update({ status: success ? "success" : "failed" })
      .eq("id", txData.id);

    // ── 6. Refund on failure ─────────────────────────────────────────────
    if (!success) {
      await supabase.from("transactions").insert({
        user_id,
        type: "credit",
        service: `Refund – ${network.toUpperCase()} Airtime`,
        amount,
        status: "success",
        ref: "REF_" + ref,
        phone: null,
        network: null,
      });
    }

    return NextResponse.json({
      success,
      transaction_id: txData.id,
      message: success ? "Airtime sent successfully" : "Airtime failed — wallet refunded",
    });

  } catch (err) {
    console.error("[VTU Airtime] Unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
