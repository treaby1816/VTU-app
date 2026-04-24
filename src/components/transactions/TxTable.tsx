"use client";

import React from "react";
import { ArrowUpRight, ArrowDownLeft, Download, RefreshCw, Clock, CheckCircle2, XCircle } from "lucide-react";
import { fmtN } from "@/lib/utils";

interface TxTableProps {
  transactions: any[];
  limit?: number;
  onDownload: (tx: any) => void;
  onRetry: (tx: any) => void;
  showFilters?: boolean;
  isMobile: boolean;
}

export default function TxTable({ transactions, limit, onDownload, onRetry, showFilters, isMobile }: TxTableProps) {
  const displayTxs = limit ? transactions.slice(0, limit) : transactions;

  if (transactions.length === 0) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(148,163,184,.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "var(--text-muted)" }}>
          <Clock size={20} />
        </div>
        <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>No transactions yet</p>
        <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>Your transaction history will appear here.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? 0 : 600 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Status", "Service", "Amount", "Date", ""].map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayTxs.map((tx) => (
              <tr key={tx.id} className="tx-row" style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: tx.status === "success" ? "rgba(0,212,170,.1)" : tx.status === "failed" ? "rgba(255,68,68,.1)" : "rgba(245,158,11,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {tx.status === "success" ? <CheckCircle2 size={16} color="var(--primary)" /> : tx.status === "failed" ? <XCircle size={16} color="#ff4444" /> : <Clock size={16} color="var(--accent)" />}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <div>
                    <p style={{ color: "var(--text)", fontSize: 13, fontWeight: 600 }}>{tx.service}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>ID: {tx.id.slice(0, 12)}...</p>
                  </div>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{ color: tx.type === "credit" ? "var(--primary)" : "var(--text)", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14 }}>
                    {tx.type === "credit" ? "+" : "-"}{fmtN(tx.amount)}
                  </span>
                </td>
                <td style={{ padding: "14px 20px", color: "var(--text-muted)", fontSize: 12 }}>{new Date(tx.created_at || tx.date).toLocaleDateString()}</td>
                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    {tx.status === "failed" && (
                      <button onClick={() => onRetry(tx)} style={{ width: 30, height: 30, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" }} title="Retry">
                        <RefreshCw size={14} />
                      </button>
                    )}
                    <button onClick={() => onDownload(tx)} style={{ width: 30, height: 30, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" }} title="Download Receipt">
                      <Download size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
