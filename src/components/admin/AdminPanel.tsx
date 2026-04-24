"use client";

import React, { useState, useEffect } from "react";
import { Users, TrendingUp, Activity, Shield, Minus, Plus, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fmtN } from "../../../src/lib/utils";

export default function AdminPanel({ isMobile }: { isMobile: boolean }) {
  const [tab, setTab] = useState<"users" | "transactions" | "pricing">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalBalance: 0, totalTx: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      setLoading(true);
      try {
        // Fetch all profiles
        const { data: userData, error: userErr } = await supabase
          .from("profiles")
          .select("*");
        
        if (userData) {
          setUsers(userData);
          const totalBal = userData.reduce((acc: number, curr: any) => acc + (curr.balance || 0), 0);
          setStats(prev => ({ ...prev, totalUsers: userData.length, totalBalance: totalBal }));
        }

        // Fetch transaction count
        const { count, error: txErr } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true });
        
        if (count !== null) {
          setStats(prev => ({ ...prev, totalTx: count }));
        }
      } catch (err) {
        console.error("Admin data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading admin data...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: isMobile ? 22 : 26, color: "var(--text)", letterSpacing: "-.5px" }}>Admin Panel</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>System oversight and management</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { l: "Total Users", v: stats.totalUsers, c: "#3B82F6" },
          { l: "Total Wallets", v: fmtN(stats.totalBalance), c: "var(--primary)" },
          { l: "Transactions", v: stats.totalTx, c: "var(--accent)" },
          { l: "Active Now", v: "12", c: "#a78bfa" }
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--bg-card)", borderRadius: 14, padding: 16, border: "1px solid var(--border)" }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: isMobile ? 18 : 20, color: s.c }}>{s.v}</p>
            <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{s.l}</p>
          </div>
        ))}
      </div>

      <div style={{ position: "relative", marginBottom: 20 }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input 
          placeholder="Search users by name or email..." 
          style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px 12px 42px", color: "var(--text)", fontSize: 14 }}
          onChange={(e) => {
            const q = e.target.value.toLowerCase();
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 18, background: "var(--bg)", padding: 4, borderRadius: 12, width: "fit-content" }}>
        {(["users", "transactions", "pricing"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === t ? "var(--bg-card)" : "transparent", color: tab === t ? "var(--primary)" : "var(--text-muted)", fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {tab === "users" && (
        <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["User", "Balance", "Created", "Status"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", opacity: 0.9 }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div>
                        <p style={{ color: "var(--text)", fontSize: 13, fontWeight: 600 }}>{u.full_name || "User"}</p>
                        <p style={{ color: "var(--text-muted)", fontSize: 11 }}>{u.email || "No email"}</p>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}><span style={{ color: "var(--primary)", fontWeight: 700 }}>{fmtN(u.balance || 0)}</span></td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, background: "rgba(0,212,170,.1)", color: "var(--primary)" }}>Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "transactions" && <div style={{ color: "var(--text-muted)", padding: 20 }}>Detailed transaction logs coming soon...</div>}
      
      {tab === "pricing" && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
          {["Airtime Markup", "Data Markup"].map(label => (
            <div key={label} style={{ background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--border)" }}>
              <h4 style={{ color: "var(--text)", marginBottom: 16 }}>{label}</h4>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>Configure profit margins for all network providers.</p>
              <button style={{ width: "100%", padding: 12, borderRadius: 10, background: "rgba(0,212,170,.1)", color: "var(--primary)", border: "1px solid var(--border)", fontWeight: 700, cursor: "pointer" }}>Adjust Pricing</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
