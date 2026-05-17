import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/vector";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
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

      // 3. Generate response with Hybrid AI Engine (Priority: Gemini 1.5 Flash -> OpenAI gpt-4o-mini)
      let responseText = "";
      const geminiKey = process.env.GEMINI_API_KEY;

      if (geminiKey) {
        try {
          console.log("[AI Chat] Generating response via Google Gemini 1.5 Flash...");
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    role: "user",
                    parts: [{ text: message }]
                  }
                ],
                systemInstruction: {
                  parts: [{ text: `You are VaultAI for VaultPay (Nigerian VTU). Answer the user politely based on this context:\n${context}` }]
                },
                generationConfig: {
                  maxOutputTokens: 500,
                  temperature: 0.7
                }
              })
            }
          );

          if (res.ok) {
            const data = await res.json();
            responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          } else {
            console.warn(`[AI Chat] Gemini API returned status ${res.status}`);
          }
        } catch (gemError) {
          console.warn("⚠️ Gemini request failed, attempting OpenAI fallback:", gemError);
        }
      }

      // If Gemini wasn't configured or failed, try OpenAI
      if (!responseText && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "dummy-key-for-build") {
        console.log("[AI Chat] Falling back to OpenAI gpt-4o-mini...");
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
        responseText = response.choices[0].message.content || "";
      }

      if (!responseText) {
        throw new Error("No active AI providers were able to process the request.");
      }

      return NextResponse.json({ text: responseText });

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
