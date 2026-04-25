"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

// --- FAQ KNOWLEDGE BASE ---
const knowledgeBase = [
  {
    keywords: ["hi", "hello", "hey", "start"],
    response: "Hello! I am VaultAI, your virtual assistant. How can I help you today? You can ask me about funding your wallet, buying airtime/data, or checking your transactions."
  },
  {
    keywords: ["fund", "add money", "deposit", "wallet"],
    response: "To fund your wallet, go to your Dashboard and click on the 'Fund Wallet' button. We support instant card payments, bank transfers, and USSD via Paystack."
  },
  {
    keywords: ["airtime", "recharge", "credit", "mtn", "glo", "airtel", "9mobile"],
    response: "You can buy airtime by selecting 'Buy Airtime' from the navigation menu. Select your network provider (MTN, Glo, Airtel, or 9mobile), enter the phone number and amount, and confirm the transaction."
  },
  {
    keywords: ["data", "mb", "gb", "internet"],
    response: "To purchase a data bundle, go to 'Buy Data' on the menu. Choose your network, select the desired data plan, enter the recipient's phone number, and proceed to pay from your wallet balance."
  },
  {
    keywords: ["failed", "not working", "error", "debit", "issue"],
    response: "I'm sorry you're experiencing an issue. If your transaction failed but you were debited, the funds will automatically be reversed by your bank. If the issue persists, please visit the 'Support' page to contact our human agents."
  },
  {
    keywords: ["history", "transactions", "receipt", "check"],
    response: "You can view all your past activities by clicking on 'Transactions' in the menu. This will show a detailed list of your funding, airtime, and data purchases."
  },
  {
    keywords: ["admin", "support", "agent", "human", "contact"],
    response: "You can reach our human support agents via WhatsApp or Email. Please navigate to the 'Support' tab in the menu to find our contact details."
  },
  {
    keywords: ["password", "settings", "profile", "change"],
    response: "To update your profile information or change your password, click on the 'Settings' tab in the menu."
  }
];

// Fallback response
const fallbackResponse = "I'm not completely sure about that. I'm still learning! For complex issues, please visit our 'Support' page to chat with a human agent via WhatsApp or Email.";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "msg-1", text: "Hi there! 👋 I'm VaultAI. Ask me any question about using VaultPay.", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate "thinking / researching" delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Simple NLP / Keyword matching
    const query = userMsg.text.toLowerCase();
    let bestMatch = fallbackResponse;

    for (const item of knowledgeBase) {
      // If any keyword is found in the user's message
      const matchFound = item.keywords.some((kw) => query.includes(kw));
      if (matchFound) {
        bestMatch = item.response;
        break;
      }
    }

    const botMsg: Message = { id: (Date.now() + 1).toString(), text: bestMatch, sender: "bot" };
    setIsTyping(false);
    setMessages((prev) => [...prev, botMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 10000 }}>
      {/* Floating Button */}
      {!isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          className="zoom-slow"
          style={{ 
            width: 64, height: 64, borderRadius: "50%", 
            background: "linear-gradient(135deg, #00D4AA, #00b896)", 
            boxShadow: "0 10px 30px rgba(0,212,170,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", border: "2px solid rgba(255,255,255,0.2)"
          }}
        >
          <Bot size={32} color="#000" />
          {/* Notification dot */}
          <div style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, background: "#ff4444", borderRadius: "50%", border: "2px solid #0D1426" }} />
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{ 
          width: 340, height: 500, maxHeight: "80vh",
          background: "var(--bg)", borderRadius: 24,
          border: "1px solid var(--border)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,170,0.1)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "fadeUp 0.3s ease"
        }}>
          {/* Header */}
          <div style={{ 
            background: "linear-gradient(135deg, #00D4AA, #00b896)", 
            padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={20} color="#000" />
              </div>
              <div>
                <h3 style={{ color: "#000", fontWeight: 800, fontSize: 16 }}>VaultAI</h3>
                <p style={{ color: "rgba(0,0,0,0.6)", fontSize: 12, fontWeight: 600 }}>Always Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.7, transition: "opacity 0.2s" }} onMouseOver={e => e.currentTarget.style.opacity = "1"} onMouseOut={e => e.currentTarget.style.opacity = "0.7"}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16, background: "var(--bg-card)" }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ 
                display: "flex", gap: 10, 
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                flexDirection: msg.sender === "user" ? "row-reverse" : "row",
                maxWidth: "85%"
              }}>
                {/* Avatar */}
                <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: msg.sender === "user" ? "rgba(0,212,170,0.1)" : "#00D4AA" }}>
                  {msg.sender === "user" ? <User size={14} color="var(--primary)" /> : <Bot size={14} color="#000" />}
                </div>

                {/* Bubble */}
                <div style={{ 
                  background: msg.sender === "user" ? "rgba(0,212,170,0.1)" : "var(--bg)", 
                  border: msg.sender === "user" ? "1px solid rgba(0,212,170,0.3)" : "1px solid var(--border)",
                  padding: "12px 16px", borderRadius: 16,
                  borderTopRightRadius: msg.sender === "user" ? 4 : 16,
                  borderTopLeftRadius: msg.sender === "bot" ? 4 : 16,
                  color: msg.sender === "user" ? "var(--primary)" : "var(--text)",
                  fontSize: 14, lineHeight: 1.5
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", gap: 10, alignSelf: "flex-start", maxWidth: "85%" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#00D4AA" }}>
                  <Bot size={14} color="#000" />
                </div>
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "12px 16px", borderRadius: 16, borderTopLeftRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <div className="dot-flashing" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animationDelay: "0s" }} />
                  <div className="dot-flashing" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animationDelay: "0.2s" }} />
                  <div className="dot-flashing" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: 16, borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
            <div style={{ display: "flex", alignItems: "center", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 6px 6px 16px" }}>
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 14 }}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                style={{ width: 36, height: 36, borderRadius: "50%", background: input.trim() ? "var(--primary)" : "var(--border)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed", transition: "background 0.2s" }}
              >
                <Send size={16} color={input.trim() ? "#000" : "var(--text-muted)"} style={{ transform: "translateX(-1px)" }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
