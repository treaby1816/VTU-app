import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/vector";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // --- FALLBACK KNOWLEDGE BASE (in case OpenAI fails) ---
    const localKB = [
      { kw: ["fund", "deposit", "wallet", "add money"], res: "To fund your wallet, go to your Dashboard and click on 'Fund Wallet'. We support card, bank transfer, and USSD via Paystack." },
      { kw: ["airtime", "recharge", "mtn", "glo", "airtel", "9mobile"], res: "You can buy airtime from the 'Buy Airtime' menu. Select network, enter phone and amount, then confirm." },
      { kw: ["data", "mb", "gb", "internet"], res: "Go to 'Buy Data' to purchase bundles. We support SME and Gifting for all major Nigerian networks." },
      { kw: ["failed", "debit", "issue", "error"], res: "If a transaction failed but you were debited, it will automatically reverse within 24-48 hours. Otherwise, contact support with your Ref ID." },
      { kw: ["support", "contact", "agent", "human", "whatsapp"], res: "Our human agents are available via WhatsApp/Email. Visit the 'Support' page for contact details." }
    ];

    try {
      // 1. Generate embedding for the user's question
      const embedding = await generateEmbedding(message);

      // 2. Search for relevant context in Supabase
      const { data: documents, error: searchError } = await supabase.rpc(
        "match_documents",
        {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: 3,
        }
      );

      if (searchError) throw searchError;

      const context = documents?.map((doc: any) => doc.content).join("\n\n") || "";

      // 3. Generate response with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are VaultAI for VaultPay (Nigerian VTU). Context: ${context}`
          },
          { role: "user", content: message }
        ],
        max_tokens: 500,
      });

      return NextResponse.json({ text: response.choices[0].message.content });

    } catch (aiError: any) {
      console.warn("⚠️ AI Quota exceeded or error. Falling back to local search.");
      
      const query = message.toLowerCase();
      let bestMatch = "I'm sorry, I'm having trouble reaching my AI brain. Please check our Support page or try asking differently (e.g., 'how to fund').";

      for (const item of localKB) {
        if (item.kw.some(k => query.includes(k))) {
          bestMatch = item.res;
          break;
        }
      }

      return NextResponse.json({ text: bestMatch, isFallback: true });
    }
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response", details: error.message },
      { status: 500 }
    );
  }
}
