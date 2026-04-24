"use client";

import React, { useState } from "react";
import { Phone, CheckCircle2, XCircle } from "lucide-react";
import { Modal, InputField, NetworkSelector } from "../ui/Modals";
import { fmtN, NETWORKS, sleep } from "@/lib/utils";
import { DATA_BUNDLES } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

export default function DataModal({ onClose, balance, onSubmit, isMobile }: any) {
  const [network, setNetwork] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [bundle, setBundle] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [txResult, setTxResult] = useState<any>(null);
  const bundles = DATA_BUNDLES[network] || [];

  const handleBuy = async () => {
    setStep(3);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/vtu/data", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          user_id: session?.user.id,
          network,
          phone,
          plan_id: bundle.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transaction failed");

      setTxResult(data.transaction);
      setStep(4);
      onSubmit(data.transaction);
    } catch (err: any) {
      setTxResult({ status: "failed", service: "Data Purchase" });
      setStep(4);
      onSubmit({ status: "failed", amount: bundle.price, service: "Data Purchase" });
    }
  };

  return (
    <Modal title="Buy Data Bundle" onClose={onClose} isMobile={isMobile}>
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <NetworkSelector selected={network} onSelect={(n: string) => { setNetwork(n); setBundle(null); }} />
          <InputField label="Phone Number" placeholder="08012345678" value={phone} onChange={setPhone} icon={<Phone size={15} />} />
          <div>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Select Bundle</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
              {bundles.map(b => (
                <button key={b.id} onClick={() => setBundle(b)} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${bundle?.id === b.id ? "#00D4AA50" : "#1E2D4A"}`, background: bundle?.id === b.id ? "rgba(0,212,170,.1)" : "#080C14", color: bundle?.id === b.id ? "#00D4AA" : "#e2e8f0", cursor: "pointer", textAlign: "left", transition: "all .2s" }}>
                  <p style={{ fontWeight: 700, fontSize: 13 }}>{b.name}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{b.validity}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#00D4AA" }}>₦{b.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => { if (phone.length >= 11 && bundle) setStep(2); }} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#00D4AA,#00b896)", color: "#000", fontWeight: 700, fontSize: 15 }}>Continue →</button>
        </div>
      )}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#080C14", borderRadius: 14, padding: 18 }}>
            {[["Network", NETWORKS.find(n => n.id === network)?.name], ["Bundle", `${bundle.name} (${bundle.validity})`], ["Phone", phone], ["Cost", fmtN(bundle.price)]].map(([k, v]) => (
              <div key={k as string} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>{k}</span>
                <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ padding: "12px 0", borderRadius: 12, border: "1px solid #1E2D4A", background: "transparent", color: "#94a3b8", cursor: "pointer", fontWeight: 600 }}>← Back</button>
            <button onClick={handleBuy} style={{ padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#00D4AA,#00b896)", color: "#000", fontWeight: 700 }}>Confirm</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <div className="spin" style={{ width: 52, height: 52, border: "3px solid #1E2D4A", borderTopColor: "#00D4AA", borderRadius: "50%", margin: "0 auto 18px" }} />
          <p style={{ color: "#e2e8f0", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18 }}>Processing...</p>
        </div>
      )}
      {step === 4 && txResult && (
        <div style={{ textAlign: "center" }}>
          <div className="bounce-in" style={{ width: 64, height: 64, borderRadius: "50%", background: txResult.status === "success" ? "rgba(0,212,170,.15)" : "rgba(255,68,68,.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: `2px solid ${txResult.status === "success" ? "#00D4AA40" : "#ff444440"}` }}>
            {txResult.status === "success" ? <CheckCircle2 size={32} color="#00D4AA" /> : <XCircle size={32} color="#ff4444" />}
          </div>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 6 }}>{txResult.status === "success" ? "Data Sent!" : "Transaction Failed"}</h3>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>{txResult.status === "success" ? `${bundle?.name} sent to ${phone}` : "Wallet refunded automatically"}</p>
          <button onClick={onClose} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer", background: "#1E2D4A", color: "#e2e8f0", fontWeight: 600 }}>Close</button>
        </div>
      )}
    </Modal>
  );
}
