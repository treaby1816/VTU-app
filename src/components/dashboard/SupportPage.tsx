"use client";

import React, { useState } from "react";
import { HelpCircle, MessageCircle, Mail, ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    q: "How long does top-up take?",
    a: "Airtime and data top-ups are usually instant. If you experience a delay, please wait 5 minutes or contact support."
  },
  {
    q: "My wallet funding failed but I was debited.",
    a: "Failed transactions are usually reversed by your bank within 24 hours. If not, contact our support team with your transaction reference."
  },
  {
    q: "Can I withdraw money from my wallet?",
    a: "Currently, wallet funds can only be used to purchase VTU services (Airtime, Data, etc.) on the platform."
  },
  {
    q: "What are your support hours?",
    a: "Our automated systems run 24/7. Human support via WhatsApp and Email is available Monday to Saturday, 8AM to 6PM."
  }
];

export default function SupportPage({ isMobile }: { isMobile: boolean }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: isMobile ? 22 : 26, color: "var(--text)" }}>Help & Support</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Need help? We're here for you.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 32 }}>
        <a href="https://wa.me/2348000000000" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: 24, border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16, transition: "transform 0.2s", cursor: "pointer" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(37,211,102,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageCircle size={24} color="#25D366" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>WhatsApp Support</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Chat with our agents instantly</p>
            </div>
          </div>
        </a>

        <a href="mailto:support@vaultpay.com" style={{ textDecoration: "none" }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: 24, border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16, transition: "transform 0.2s", cursor: "pointer" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(59,130,246,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mail size={24} color="#3B82F6" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Email Us</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 13 }}>support@vaultpay.com</p>
            </div>
          </div>
        </a>
      </div>

      <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: isMobile ? 20 : 32, border: "1px solid var(--border)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <HelpCircle size={20} color="var(--primary)" /> Frequently Asked Questions
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)", border: "none", cursor: "pointer", textAlign: "left", color: "var(--text)", fontWeight: 600, fontSize: 14 }}>
                {faq.q}
                {openFaq === i ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 16px 16px", background: "var(--bg)", color: "var(--text-muted)", fontSize: 13, lineHeight: 1.5 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
