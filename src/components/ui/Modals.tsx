"use client";

import React from "react";
import { X } from "lucide-react";

export const Modal = ({ title, onClose, children, isMobile }: any) => (
  <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(3,7,18,0.85)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", padding: isMobile ? 0 : 20 }} onClick={onClose}>
    <div style={{ background: "#0D1426", width: "100%", maxWidth: 440, borderRadius: isMobile ? "24px 24px 0 0" : 20, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", position: "relative" }} onClick={e => e.stopPropagation()} className={isMobile ? "slide-up" : "fade-up"}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#fff" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", width: 32, height: 32, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
          <X size={18} />
        </button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

export const InputField = ({ label, icon, ...props }: any) => (
  <div>
    <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{label}</label>
    <div style={{ position: "relative" }}>
      {icon && <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569" }}>{icon}</div>}
      <input {...props} className="inp" style={{ width: "100%", background: "#080C14", border: "1px solid #1E2D4A", borderRadius: 12, padding: "12px 14px", paddingLeft: icon ? 40 : 14, color: "#e2e8f0", fontSize: 14, outline: "none" }} />
    </div>
  </div>
);

export const NetworkSelector = ({ selected, onSelect }: any) => {
  const networks = [
    { id: "mtn", name: "MTN", color: "#FFCC00", logo: "/images/mtn.png" },
    { id: "airtel", name: "Airtel", color: "#FF0000", logo: "/images/airtel.png" },
    { id: "glo", name: "Glo", color: "#00FF00", logo: "/images/glo.png" },
    { id: "9mobile", name: "9mobile", color: "#006600", logo: "/images/9mobile.png" },
  ];
  return (
    <div>
      <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Select Network</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {networks.map(n => (
          <button key={n.id} onClick={() => onSelect(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 0", borderRadius: 12, border: `1px solid ${selected === n.id ? n.color + "40" : "#1E2D4A"}`, background: selected === n.id ? n.color + "10" : "#080C14", cursor: "pointer", transition: "all .2s" }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, overflow: "hidden", background: n.id === "mtn" ? "#000" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}>
              <img src={n.logo} alt={n.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: selected === n.id ? "#fff" : "#64748b" }}>{n.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
