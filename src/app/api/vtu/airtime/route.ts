import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { executeTransaction } from "@/lib/transaction-utils";

const AirtimeSchema = z.object({
  user_id: z.string().uuid(),
  network: z.enum(["mtn", "airtel", "glo", "9mobile"]),
  phone:   z.string().regex(/^0[789][01]\d{8}$/, "Invalid phone"),
  amount:  z.number().min(50).max(50000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AirtimeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { user_id, network, phone, amount } = parsed.data;

    return await executeTransaction(req, {
      user_id,
      network,
      phone,
      amount,
      serviceType: "airtime",
    });

  } catch (err: any) {
    console.error("[Airtime API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
