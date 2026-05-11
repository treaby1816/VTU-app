import { NextRequest, NextResponse } from "next/server";
import { routeData } from "@/lib/providers/router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DataSchema = z.object({
  user_id:   z.string().uuid(),
  network:   z.enum(["mtn", "airtel", "glo", "9mobile"]),
  phone:     z.string().regex(/^0[789][01]\d{8}$/, "Invalid phone"),
  plan_id:   z.string().min(1),
  plan_name: z.string().min(1),
  amount:    z.number().min(50).max(100000),
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

    const { data: balance } = await supabase.rpc(
      "get_wallet_balance", { p_user_id: user_id }
    );
    if (!balance || balance < amount) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    const ref = "DAT" + Date.now().toString(36).toUpperCase() +
                Math.random().toString(36).slice(2, 5).toUpperCase();

    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id, type: "debit",
        service: `${network.toUpperCase()} Data – ${plan_name}`,
        amount, status: "pending", phone,
        network: network.toUpperCase(), ref,
      })
      .select().single();

    if (txError || !txData) {
      return NextResponse.json(
        { error: "Could not create transaction" },
        { status: 500 }
      );
    }

    // ── SMART HOP ───────────────────────────────────────────────
    const result = await routeData({
      network, phone, planId: plan_id, planName: plan_name, ref
    });
    // ────────────────────────────────────────────────────────────

    await supabase
      .from("transactions")
      .update({
        status: result.success ? "success" : "failed",
        provider: result.provider,
        provider_ref: result.providerRef,
      })
      .eq("id", txData.id);

    if (!result.success) {
      await supabase.from("transactions").insert({
        user_id, type: "credit",
        service: `Refund – ${network.toUpperCase()} Data`,
        amount, status: "success",
        ref: "REF_" + ref, phone: null, network: null,
      });
    }

    return NextResponse.json({
      success: result.success,
      transaction_id: txData.id,
      provider_used: result.provider,
      providers_tried: result.attemptedProviders,
      message: result.message,
    });

  } catch (err) {
    console.error("[Data API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
