"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "../ui/Modals";
import { fmtN, generateTxId } from "@/lib/utils";
import { useStore } from "@/store/useStore";

export default function FundModal({ onClose, onSubmit, isMobile }: any) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(1);
  const presets = [1000, 2000, 5000, 10000, 20000, 50000];
  const { user } = useStore();

  const handlePay = () => {
    if (+amount < 100 || !user) return;
    
    const handler = (window as any).PaystackPop.setup({
      key: (process.env as any).NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
      email: user.email,
      amount: +amount * 100, // Kobo
      currency: "NGN",
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      callback: (response: any) => {
        setStep(2);
        onSubmit({
          id: generateTxId(),
          type: "credit",
          service: "Wallet Funding",
          amount: +amount,
          status: "success",
          date: new Date().toLocaleString("en-NG"),
          ref: response.reference
        });
        setStep(3);
      },
      onClose: () => {
        // User closed the popup
      }
    });
    handler.openIframe();
  };

  return (
    <Modal title="Fund Wallet" onClose={onClose} isMobile={isMobile}>
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "rgba(0,212,170,.06)", borderRadius: 12, padding: "13px 16px", border: "1px solid rgba(0,212,170,.1)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 48, height: 22, background: "#fff", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontWeight: 900, fontSize: 7, color: "#00c2a8", letterSpacing: -0.5 }}>PAYSTACK</span>
            </div>
            <p style={{ color: "#64748b", fontSize: 12 }}>Secured by Paystack · Cards, Transfer, USSD</p>
          </div>
          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Amount to Fund (₦)</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
              {presets.map(p => <button key={p} onClick={() => setAmount(String(p))} style={{ padding: "9px 0", borderRadius: 8, border: `1px solid ${amount === String(p) ? "#00D4AA50" : "#1E2D4A"}`, background: amount === String(p) ? "rgba(0,212,170,.1)" : "#080C14", color: amount === String(p) ? "#00D4AA" : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>₦{p.toLocaleString()}</button>)}
            </div>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Custom amount" type="number" className="inp" style={{ width: "100%", background: "#080C14", border: "1px solid #1E2D4A", borderRadius: 10, padding: "11px 14px", color: "#e2e8f0", fontSize: 14 }} />
          </div>
          <button onClick={() => { if (+amount >= 100) handlePay(); }} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#00D4AA,#00b896)", color: "#000", fontWeight: 700, fontSize: 15 }}>
            Pay {amount ? fmtN(+amount) : "Now"} via Paystack →
          </button>
          <p style={{ color: "#475569", fontSize: 11, textAlign: "center" }}>Min: ₦100 · Instant credit · No extra charges</p>
        </div>
      )}
      {step === 2 && (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <div className="spin" style={{ width: 40, height: 40, border: "3px solid #eee", borderTopColor: "#00c2a8", borderRadius: "50%", margin: "0 auto 12px" }} />
          <p style={{ color: "#e2e8f0", fontSize: 13 }}>Processing payment...</p>
        </div>
      )}
      {step === 3 && (
        <div style={{ textAlign: "center" }}>
          <div className="bounce-in" style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,212,170,.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "2px solid #00D4AA40" }}>
            <CheckCircle2 size={32} color="#00D4AA" />
          </div>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 6 }}>Wallet Funded!</h3>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>{fmtN(+amount)} added to your wallet</p>
          <button onClick={onClose} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#00D4AA,#00b896)", color: "#000", fontWeight: 700 }}>Back to Dashboard</button>
        </div>
      )}
    </Modal>
  );
}
