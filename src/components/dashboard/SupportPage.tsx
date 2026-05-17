"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, MessageCircle, Mail, ChevronDown, ChevronUp, Plus, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

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

export default function SupportPage({ user, isMobile }: { user: any, isMobile: boolean }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) fetchTickets();
  }, [user?.id]);

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) setTickets(data);
    setLoading(false);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("tickets")
      .insert({
        user_id: user.id,
        subject,
        message,
        status: "open"
      });
    
    if (!error) {
      setSubject("");
      setMessage("");
      fetchTickets();
    }
    setSubmitting(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: isMobile ? 22 : 26, color: "var(--text)" }}>Help & Support</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Need help? We're here for you.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 32 }}>
        <a href="https://wa.me/2348065136221" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
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

      {/* Tickets Section */}
      <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: isMobile ? 20 : 32, border: "1px solid var(--border)", marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <Mail size={20} color="var(--primary)" /> Support Tickets
        </h2>

        {/* Create Ticket Form */}
        <form onSubmit={handleCreateTicket} style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Wallet funding failed" style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue in detail..." style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none", minHeight: 100, resize: "vertical" }} />
          </div>
          <button type="submit" disabled={submitting || !subject || !message} style={{ padding: "14px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,var(--primary),var(--primary-hover))", color: "#000", fontWeight: 700, cursor: (submitting || !subject || !message) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, alignSelf: "flex-start", opacity: (submitting || !subject || !message) ? 0.5 : 1 }}>
            <Plus size={18} /> {submitting ? "Submitting..." : "Create Ticket"}
          </button>
        </form>

        {/* Tickets List */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Your Tickets</h3>
          {loading ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>You have no support tickets.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tickets.map((t: any) => (
                <div key={t.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "var(--bg)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{t.subject}</h4>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: t.status === "open" ? "rgba(245,158,11,.1)" : "rgba(0,212,170,.1)", color: t.status === "open" ? "#f59e0b" : "var(--primary)", textTransform: "uppercase" }}>{t.status}</span>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.4 }}>{t.message}</p>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginTop: 8 }}>{new Date(t.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
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
