"use client";

import React, { useState, useEffect } from "react";
import { Users, TrendingUp, Activity, Shield, Minus, Plus, Search, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fmtN } from "../../../src/lib/utils";
import TxTable from "../transactions/TxTable";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function AdminPanel({ isMobile }: { isMobile: boolean }) {
  const [tab, setTab] = useState<"overview" | "users" | "transactions" | "pricing" | "activity">("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalBalance: 0, totalTx: 0, totalInflow: 0, totalOutflow: 0 });
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

        // Fetch recent transactions
        const { data: txData, error: txErr } = await supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500);
        
        if (txData) {
          setTransactions(txData);
          const inflow = txData.filter(t => t.type === "credit" && t.status === "success").reduce((a, c) => a + (c.amount || 0), 0);
          const outflow = txData.filter(t => t.type === "debit" && t.status === "success").reduce((a, c) => a + (c.amount || 0), 0);
          setStats(prev => ({ ...prev, totalTx: txData.length, totalInflow: inflow, totalOutflow: outflow }));
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
          { l: "Total Inflow", v: fmtN(stats.totalInflow), c: "#10b981" },
          { l: "Total Outflow", v: fmtN(stats.totalOutflow), c: "#f43f5e" }
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

      <div style={{ display: "flex", gap: 6, marginBottom: 18, background: "var(--bg)", padding: 4, borderRadius: 12, width: "fit-content", overflowX: "auto", maxWidth: "100%" }}>
        {(["overview", "users", "transactions", "activity", "pricing"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === t ? "var(--bg-card)" : "transparent", color: tab === t ? "var(--primary)" : "var(--text-muted)", fontWeight: 600, fontSize: 13, textTransform: "capitalize", whiteSpace: "nowrap" }}>{t}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gap: 20 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--border)" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, marginBottom: 16 }}>Platform Activity</h3>
            <div style={{ display: "flex", gap: 16, flexDirection: isMobile ? "column" : "row", marginBottom: 24 }}>
              <div style={{ flex: 1, background: "rgba(16,185,129,.1)", padding: 16, borderRadius: 12, border: "1px solid rgba(16,185,129,.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><ArrowDownLeft size={16} color="#10b981" /><span style={{ color: "var(--text)", fontSize: 13, fontWeight: 600 }}>Total Wallet Funding</span></div>
                <h4 style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>{fmtN(stats.totalInflow)}</h4>
              </div>
              <div style={{ flex: 1, background: "rgba(244,63,94,.1)", padding: 16, borderRadius: 12, border: "1px solid rgba(244,63,94,.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><ArrowUpRight size={16} color="#f43f5e" /><span style={{ color: "var(--text)", fontSize: 13, fontWeight: 600 }}>Total Value Disbursed</span></div>
                <h4 style={{ fontSize: 24, fontWeight: 700, color: "#f43f5e" }}>{fmtN(stats.totalOutflow)}</h4>
              </div>
            </div>

            {/* Charts Section */}
            {transactions.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                {/* Revenue Breakdown */}
                <div>
                  <h4 style={{ fontFamily: "Syne, sans-serif", fontSize: 15, marginBottom: 16, color: "var(--text)" }}>Volume Breakdown</h4>
                  <div style={{ height: 250, width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={[
                            { name: "Airtime", value: transactions.filter(t => t.service === "Airtime" && t.status === "success").reduce((a,c) => a + c.amount, 0), color: "#3B82F6" },
                            { name: "Data", value: transactions.filter(t => t.service === "Data" && t.status === "success").reduce((a,c) => a + c.amount, 0), color: "#a78bfa" },
                            { name: "Funding", value: transactions.filter(t => (t.service === "Wallet Funding" || t.type === "credit") && t.status === "success").reduce((a,c) => a + c.amount, 0), color: "#10b981" },
                          ].filter(d => d.value > 0)} 
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        >
                          {transactions.length > 0 && [
                            { name: "Airtime", value: transactions.filter(t => t.service === "Airtime" && t.status === "success").reduce((a,c) => a + c.amount, 0), color: "#3B82F6" },
                            { name: "Data", value: transactions.filter(t => t.service === "Data" && t.status === "success").reduce((a,c) => a + c.amount, 0), color: "#a78bfa" },
                            { name: "Funding", value: transactions.filter(t => (t.service === "Wallet Funding" || t.type === "credit") && t.status === "success").reduce((a,c) => a + c.amount, 0), color: "#10b981" },
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => fmtN(Number(value) || 0)} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Service Comparison Bar */}
                <div>
                  <h4 style={{ fontFamily: "Syne, sans-serif", fontSize: 15, marginBottom: 16, color: "var(--text)" }}>Service Comparison</h4>
                  <div style={{ height: 250, width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: "Airtime", amount: transactions.filter(t => t.service === "Airtime" && t.status === "success").reduce((a,c) => a + c.amount, 0) },
                        { name: "Data", amount: transactions.filter(t => t.service === "Data" && t.status === "success").reduce((a,c) => a + c.amount, 0) }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => "₦" + (val / 1000) + "k"} />
                        <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} formatter={(value: any) => fmtN(Number(value) || 0)} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                        <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, marginBottom: 16 }}>Recent Transactions</h3>
            <TxTable transactions={transactions} limit={10} onDownload={() => alert("Receipt download feature coming soon!")} onRetry={() => alert("Retry functionality coming soon!")} isMobile={isMobile} />
          </div>
        </div>
      )}

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

      {tab === "transactions" && (
        <div>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, marginBottom: 16 }}>All System Transactions</h3>
          <TxTable transactions={transactions} onDownload={() => alert("Receipt download feature coming soon!")} onRetry={() => alert("Retry functionality coming soon!")} isMobile={isMobile} />
        </div>
      )}

      {tab === "activity" && (
        <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", padding: 20 }}>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, marginBottom: 6 }}>Security & Activity Audit Log</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Real-time monitoring of user registrations and transactions.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ...users.map(u => ({ id: `usr-${u.id}`, title: "New User Registration", desc: `${u.full_name || u.email || 'A user'} joined the platform.`, date: new Date(u.created_at).getTime(), icon: <Users size={16} color="#3B82F6"/>, color: "rgba(59,130,246,.1)" })),
              ...transactions.map(t => ({ id: `tx-${t.id}`, title: t.type === "credit" ? "Wallet Funded" : "Service Purchased", desc: `A user ${t.type === "credit" ? "funded wallet" : "spent"} ${fmtN(t.amount)} on ${t.service}.`, date: new Date(t.created_at || t.date).getTime(), icon: <Activity size={16} color="var(--primary)"/>, color: "rgba(0,212,170,.1)" }))
            ].sort((a, b) => b.date - a.date).slice(0, 50).map(log => (
              <div key={log.id} style={{ display: "flex", gap: 16, alignItems: "flex-start", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: log.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {log.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{log.title}</p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{log.desc}</p>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {new Date(log.date).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {tab === "pricing" && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
          {["Airtime Markup", "Data Markup"].map(label => (
            <div key={label} style={{ background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--border)" }}>
              <h4 style={{ color: "var(--text)", marginBottom: 16 }}>{label}</h4>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>Configure profit margins for all network providers.</p>
              <button onClick={() => alert("Pricing configuration module coming soon!")} style={{ width: "100%", padding: 12, borderRadius: 10, background: "rgba(0,212,170,.1)", color: "var(--primary)", border: "1px solid var(--border)", fontWeight: 700, cursor: "pointer" }}>Adjust Pricing</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
