import { NextRequest, NextResponse } from "next/server";
import { purchaseData, VTUNetwork } from "@/lib/vtu";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DataSchema = z.object({
  user_id:  z.string().uuid(),
  network:  z.enum(["mtn", "airtel", "glo", "9mobile"]),
  phone:    z.string().regex(/^0[789][01]\d{8}$/, "Invalid Nigerian phone number"),
  plan_id:  z.string().min(1),
  plan_name: z.string().min(1),  // e.g. "1GB"
  amount:   z.number().min(50).max(100000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = DataSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { user_id, network, phone, plan_id, plan_name, amount } = parsed.data;

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

    // Balance check
    const { data: balanceData } = await supabase.rpc("get_wallet_balance", { p_user_id: user_id });
    if (balanceData === null || balanceData < amount) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    const ref = "DAT" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

    // Create pending transaction
    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id,
        type: "debit",
        service: `${network.toUpperCase()} Data – ${plan_name}`,
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

    // Call VTU provider
    const vtuResponse = await purchaseData({ network: network as VTUNetwork, phone, planId: plan_id, ref });
    const success = vtuResponse?.Status === "successful" || vtuResponse?.status === "success";

    // Update status
    await supabase.from("transactions").update({ status: success ? "success" : "failed" }).eq("id", txData.id);

    // Refund on failure
    if (!success) {
      await supabase.from("transactions").insert({
        user_id, type: "credit",
        service: `Refund – ${network.toUpperCase()} Data`,
        amount, status: "success",
        ref: "REF_" + ref, phone: null, network: null,
      });
    }

    return NextResponse.json({
      success,
      transaction_id: txData.id,
      message: success ? "Data bundle activated" : "Data failed — wallet refunded",
    });

  } catch (err) {
    console.error("[VTU Data] Unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
