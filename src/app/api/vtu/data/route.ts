import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { executeTransaction } from "@/lib/transaction-utils";

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

    return await executeTransaction(req, {
      user_id,
      network,
      phone,
      amount,
      serviceType: "data",
      plan_id,
      plan_name,
    });

  } catch (err: any) {
    console.error("[Data API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
