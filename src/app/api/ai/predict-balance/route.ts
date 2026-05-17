import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, balance } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 1. Fetch user transactions
    const { data: txs, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    if (!txs || txs.length === 0) {
      return NextResponse.json({ 
        prediction: "Not enough transaction history to make a prediction. Keep using VaultPay to enable AI insights!" 
      });
    }

    // 2. Format transactions for prompt
    const txSummary = txs.map((t: any) => 
      `${new Date(t.created_at).toLocaleDateString()}: ${t.type === "debit" ? "-" : "+"}${t.amount} for ${t.service}`
    ).join("\n");

    const prompt = `You are a financial assistant for VaultPay. 
Analyze the following recent transactions for a user and predict when their balance will run out or if they need to top up soon based on their spending frequency and amount.

Current Balance: ₦${balance}

Recent Transactions:
${txSummary}

Provide a concise, friendly summary (max 3 sentences) and a recommendation.`;

    // 3. Call Gemini API
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!res.ok) {
      const errData = await res.json();
      console.error("[Predict API] Gemini error:", errData);
      return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 });
    }

    const data = await res.json();
    const prediction = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate prediction at this time.";

    return NextResponse.json({ prediction });

  } catch (err: any) {
    console.error("[Predict API] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
