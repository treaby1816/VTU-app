"use client";

import React, { useState, useEffect } from "react";
import { Users, TrendingUp, Activity, Shield, Minus, Plus, Search, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fmtN } from "../../../src/lib/utils";
import TxTable from "../transactions/TxTable";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function AdminPanel({ isMobile }: { isMobile: boolean }) {
  const [tab, setTab] = useState<"overview" | "users" | "transactions" | "pricing" | "activity" | "providers" | "resellers" | "tickets">("overview");
  const [providerStats, setProviderStats] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalBalance: 0, totalTx: 0, totalInflow: 0, totalOutflow: 0 });
  const [loading, setLoading] = useState(true);

  // Resellers Management State
  const [resellers, setResellers] = useState<any[]>([]);
  const [loadingResellers, setLoadingResellers] = useState(false);
  const [creatingReseller, setCreatingReseller] = useState(false);
  const [resellerForm, setResellerForm] = useState({
    name: "",
    subdomain: "",
    custom_domain: "",
    logo_url: "",
    primary_color: "#00D4AA",
    parent_id: ""
  });
  const [resellerMsg, setResellerMsg] = useState("");

  const fetchResellers = async () => {
    setLoadingResellers(true);
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setResellers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResellers(false);
    }
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });
      if (data) setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleUpdateTicketStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ status })
        .eq("id", id);
      if (!error) fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReseller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resellerForm.name || !resellerForm.subdomain || !resellerForm.parent_id) {
      setResellerMsg("❌ Error: Brand Name, Subdomain, and Owner ID are required!");
      return;
    }
    setCreatingReseller(true);
    setResellerMsg("");
    try {
      const { error } = await supabase
        .from("tenants")
        .insert({
          name: resellerForm.name,
          subdomain: resellerForm.subdomain.toLowerCase().trim(),
          custom_domain: resellerForm.custom_domain ? resellerForm.custom_domain.toLowerCase().trim() : null,
          logo_url: resellerForm.logo_url || null,
          primary_color: resellerForm.primary_color,
          parent_id: resellerForm.parent_id.trim(),
          is_active: true
        });

      if (error) throw error;

      setResellerMsg("✅ Reseller brand created successfully!");
      setResellerForm({
        name: "",
        subdomain: "",
        custom_domain: "",
        logo_url: "",
        primary_color: "#00D4AA",
        parent_id: ""
      });
      fetchResellers();
    } catch (err: any) {
      setResellerMsg(`❌ Error: ${err.message || "Failed to create reseller."}`);
    } finally {
      setCreatingReseller(false);
    }
  };

  const toggleResellerActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("tenants")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      fetchResellers();
    } catch (err) {
      console.error(err);
    }
  };

  // Fafotech live plans state
  const [fafoPlans, setFafoPlans] = useState<any[]>([]);
  const [loadingFafoPlans, setLoadingFafoPlans] = useState(false);
  const [showFafoPlans, setShowFafoPlans] = useState(false);
  const [selectedFafoNetwork, setSelectedFafoNetwork] = useState("mtn");
  const [fafoError, setFafoError] = useState("");

  const fetchFafoPlans = async (net: string) => {
    setLoadingFafoPlans(true);
    setFafoError("");
    try {
      const res = await fetch(`/api/admin/fafotech-plans?network=${net}`);
      const data = await res.json();
      if (data.error) {
        setFafoError(data.error);
        setFafoPlans([]);
      } else {
        setFafoPlans(data.plans || []);
      }
    } catch (err: any) {
      setFafoError("Failed to connect to endpoint");
      setFafoPlans([]);
    } finally {
      setLoadingFafoPlans(false);
    }
  };

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

  useEffect(() => {
    if (tab === "providers") {
      setLoadingProviders(true);
      fetch("/api/admin/providers")
        .then(res => res.json())
        .then(data => {
           if (data.providers) setProviderStats(data.providers);
        })
        .finally(() => setLoadingProviders(false));
    }
    if (tab === "resellers") {
      fetchResellers();
    }
    if (tab === "tickets") {
      fetchTickets();
    }
  }, [tab]);

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
        {(["overview", "users", "transactions", "activity", "pricing", "providers", "resellers", "tickets"] as const).map(t => (
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
                            { name: "Airtime", value: transactions.filter(t => t.service && t.service.includes("Airtime") && !t.service.includes("Refund") && t.status === "success").reduce((a,c) => a + c.amount, 0), color: "#3B82F6" },
                            { name: "Data", value: transactions.filter(t => t.service && t.service.includes("Data") && !t.service.includes("Refund") && t.status === "success").reduce((a,c) => a + c.amount, 0), color: "#a78bfa" },
                            { name: "Funding", value: transactions.filter(t => (t.type === "credit" && (!t.service || t.service.includes("Funding"))) && t.status === "success").reduce((a,c) => a + c.amount, 0), color: "#10b981" },
                          ].filter(d => d.value > 0)} 
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        >
                          {transactions.length > 0 && [
                            { name: "Airtime", value: transactions.filter(t => t.service && t.service.includes("Airtime") && !t.service.includes("Refund") && t.status === "success").reduce((a,c) => a + c.amount, 0), color: "#3B82F6" },
                            { name: "Data", value: transactions.filter(t => t.service && t.service.includes("Data") && !t.service.includes("Refund") && t.status === "success").reduce((a,c) => a + c.amount, 0), color: "#a78bfa" },
                            { name: "Funding", value: transactions.filter(t => (t.type === "credit" && (!t.service || t.service.includes("Funding"))) && t.status === "success").reduce((a,c) => a + c.amount, 0), color: "#10b981" },
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
                        { name: "Airtime", amount: transactions.filter(t => t.service && t.service.includes("Airtime") && !t.service.includes("Refund") && t.status === "success").reduce((a,c) => a + c.amount, 0) },
                        { name: "Data", amount: transactions.filter(t => t.service && t.service.includes("Data") && !t.service.includes("Refund") && t.status === "success").reduce((a,c) => a + c.amount, 0) }
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

      {tab === "providers" && (
        <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
             <div>
               <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, marginBottom: 6 }}>Provider Health</h3>
               <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Monitor and manage VTU provider routing logic.</p>
             </div>
             <button onClick={() => {
                setLoadingProviders(true);
                fetch("/api/admin/providers").then(res => res.json()).then(data => setProviderStats(data.providers || [])).finally(() => setLoadingProviders(false));
             }} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(0,212,170,.1)", color: "var(--primary)", border: "none", fontWeight: 600, cursor: "pointer" }}>Refresh</button>
          </div>

          {loadingProviders ? (
             <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading provider stats...</div>
          ) : (
             <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
               {providerStats.sort((a, b) => a.priority - b.priority).map((p) => {
                  const rateColor = p.last24h.successRate >= 80 ? "#10b981" : (p.last24h.successRate >= 50 ? "#f59e0b" : "#f43f5e");
                  const isFafotech = p.name === "fafotech";
                  
                  return (
                    <div key={p.name} style={{ background: "#0D1426", border: isFafotech ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,.05)", borderRadius: 12, padding: 20 }}>
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                               <h4 style={{ fontFamily: "Syne, sans-serif", fontSize: 16, margin: 0 }}>{p.label}</h4>
                               {isFafotech ? (
                                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                                    ⭐ Primary
                                  </span>
                               ) : (
                                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(255,255,255,0.1)", color: "var(--text-muted)" }}>
                                    Priority {p.priority}
                                  </span>
                               )}
                               {p.supportsSME ? (
                                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>SME ✓</span>
                               ) : (
                                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}>Standard</span>
                               )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                               <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.hasKey ? "#10b981" : "#f43f5e" }} />
                               <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.hasKey ? "API Key Set" : "No Key — Add to .env.local"}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                             <span style={{ fontSize: 13, fontWeight: 600 }}>{p.markup}% Markup</span>
                          </div>
                       </div>

                       <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr 1fr", gap: 16, alignItems: "center" }}>
                          <div>
                            <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Last 24h Tx</p>
                            <p style={{ fontSize: 18, fontWeight: 700 }}>{p.last24h.total}</p>
                          </div>
                          
                          <div>
                             <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
                               Success Rate ({p.last24h.successRate}%)
                             </p>
                             <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${p.last24h.successRate}%`, background: rateColor, transition: "width 0.3s" }} />
                             </div>
                             <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                                <span style={{ fontSize: 11, color: "#10b981" }}>{p.last24h.success} OK</span>
                                <span style={{ fontSize: 11, color: "#f43f5e" }}>{p.last24h.failed} Failed</span>
                             </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                             {isFafotech ? (
                               <button 
                                 onClick={() => {
                                   setShowFafoPlans(!showFafoPlans);
                                   if (!showFafoPlans && fafoPlans.length === 0) {
                                     fetchFafoPlans(selectedFafoNetwork);
                                   }
                                 }} 
                                 style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                               >
                                 {showFafoPlans ? "Hide Live Plans" : "Fetch Live Plans"}
                               </button>
                             ) : (
                               <button onClick={() => alert("POST /api/admin/providers logic to be implemented for priority reordering.")} style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                  Set as Primary
                               </button>
                             )}
                          </div>
                       </div>

                       {isFafotech && showFafoPlans && (
                         <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                             <h5 style={{ fontFamily: "Syne, sans-serif", fontSize: 14, margin: 0, color: "#F59E0B" }}>Fafotech Live Data Plans</h5>
                             <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                               <select 
                                 value={selectedFafoNetwork} 
                                 onChange={(e) => {
                                   setSelectedFafoNetwork(e.target.value);
                                   fetchFafoPlans(e.target.value);
                                 }}
                                 style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: 12, padding: "4px 8px" }}
                               >
                                 <option value="mtn">MTN</option>
                                 <option value="airtel">Airtel</option>
                                 <option value="glo">Glo</option>
                                 <option value="9mobile">9mobile</option>
                               </select>
                               <button 
                                 onClick={() => fetchFafoPlans(selectedFafoNetwork)}
                                 style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "none", color: "var(--text)", fontSize: 12, cursor: "pointer" }}
                               >
                                 Reload
                               </button>
                             </div>
                           </div>

                           {loadingFafoPlans ? (
                             <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>Fetching live plans...</p>
                           ) : fafoError ? (
                             <p style={{ fontSize: 12, color: "#f43f5e", textAlign: "center" }}>{fafoError}</p>
                           ) : fafoPlans.length === 0 ? (
                             <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>No plans returned. Check if API key is set.</p>
                           ) : (
                             <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 250, overflowY: "auto", paddingRight: 4 }}>
                               {fafoPlans.map((plan: any, idx: number) => {
                                 const name = plan?.plan_name || plan?.name || plan?.plan_size || "Plan";
                                 const price = plan?.plan_amount || plan?.price || plan?.amount || 0;
                                 const validity = plan?.plan_validity || plan?.validity || "30 Days";
                                 const id = plan?.plan_id || plan?.id || plan?.plan_number || plan?.planId || "N/A";
                                 return (
                                   <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                                     <div>
                                       <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{name}</span>
                                       <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>({validity})</span>
                                     </div>
                                     <div style={{ textAlign: "right" }}>
                                       <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700, marginRight: 12 }}>₦{price}</span>
                                       <span style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", color: "#94a3b8" }}>ID: {id}</span>
                                     </div>
                                   </div>
                                 );
                               })}
                             </div>
                           )}
                         </div>
                       )}
                    </div>
                  );
               })}
             </div>
          )}
        </div>
      )}

      {tab === "resellers" && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 20 }}>
          {/* Resellers list */}
          <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", padding: 20 }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, marginBottom: 6 }}>Active Resellers</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Browse all active whitelabel reseller networks and their mapped domains.</p>
            
            {loadingResellers ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 40 }}>Loading resellers...</p>
            ) : resellers.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 40 }}>No resellers onboarded yet. Use the form on the right to add one!</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Reseller Brand", "Domain / Subdomain", "Primary Color", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "12px 10px", textAlign: "left", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resellers.map(r => (
                      <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", opacity: r.is_active ? 1 : 0.6 }}>
                        <td style={{ padding: "12px 10px" }}>
                          <div>
                            <span style={{ color: "var(--text)", fontSize: 13, fontWeight: 700 }}>{r.name}</span>
                            <p style={{ color: "var(--text-muted)", fontSize: 10, fontFamily: "monospace", marginTop: 2 }}>Owner ID: {r.parent_id}</p>
                          </div>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <div>
                            <span style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>{r.subdomain}.vaultpay.com</span>
                            {r.custom_domain && (
                              <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>{r.custom_domain}</p>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 14, height: 14, borderRadius: "50%", background: r.primary_color, border: "1px solid rgba(255,255,255,0.1)" }} />
                            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{r.primary_color}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: r.is_active ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)", color: r.is_active ? "#10b981" : "#f43f5e" }}>
                            {r.is_active ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <button 
                            onClick={() => toggleResellerActive(r.id, r.is_active)}
                            style={{ padding: "4px 8px", borderRadius: 6, background: r.is_active ? "rgba(244,63,94,0.1)" : "rgba(16,185,129,0.1)", border: "none", color: r.is_active ? "#f43f5e" : "#10b981", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                          >
                            {r.is_active ? "Disable" : "Enable"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Onboarding Form */}
          <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", padding: 20, height: "fit-content" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 17, marginBottom: 4 }}>Onboard Brand</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 16 }}>Provision a new reseller tenant in the multi-tenant registry.</p>
            
            <form onSubmit={handleCreateReseller} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Brand Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. MobiPay" 
                  value={resellerForm.name}
                  onChange={(e) => setResellerForm(p => ({ ...p, name: e.target.value }))}
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Subdomain Prefix</label>
                <div style={{ display: "flex", alignItems: "center", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                  <input 
                    type="text" 
                    placeholder="mobipay" 
                    value={resellerForm.subdomain}
                    onChange={(e) => setResellerForm(p => ({ ...p, subdomain: e.target.value }))}
                    style={{ flex: 1, background: "transparent", border: "none", padding: "8px 12px", color: "var(--text)", fontSize: 13, outline: "none" }}
                  />
                  <span style={{ fontSize: 12, color: "var(--text-muted)", paddingRight: 12 }}>.vaultpay.com</span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Custom Domain (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. vtu.mobipay.com" 
                  value={resellerForm.custom_domain}
                  onChange={(e) => setResellerForm(p => ({ ...p, custom_domain: e.target.value }))}
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Brand Primary Color</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input 
                    type="color" 
                    value={resellerForm.primary_color}
                    onChange={(e) => setResellerForm(p => ({ ...p, primary_color: e.target.value }))}
                    style={{ width: 40, height: 32, border: "none", background: "none", cursor: "pointer" }}
                  />
                  <input 
                    type="text" 
                    value={resellerForm.primary_color}
                    onChange={(e) => setResellerForm(p => ({ ...p, primary_color: e.target.value }))}
                    style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", fontSize: 13, fontFamily: "monospace" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Owner User UUID (Parent ID)</label>
                <input 
                  type="text" 
                  placeholder="e.g. d290f1ee-6c54-4b01-90e6..." 
                  value={resellerForm.parent_id}
                  onChange={(e) => setResellerForm(p => ({ ...p, parent_id: e.target.value }))}
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", fontSize: 13 }}
                />
              </div>

              <button 
                type="submit" 
                disabled={creatingReseller}
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: creatingReseller ? "not-allowed" : "pointer", marginTop: 10 }}
              >
                {creatingReseller ? "Provisioning..." : "Onboard Reseller"}
              </button>

              {resellerMsg && (
                <p style={{ fontSize: 12, textAlign: "center", marginTop: 6, fontWeight: 600, color: resellerMsg.startsWith("❌") ? "#ff4444" : "var(--primary)" }}>{resellerMsg}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {tab === "tickets" && (
        <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", padding: 20 }}>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, marginBottom: 6 }}>Support Tickets</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Manage user support requests.</p>

          {loadingTickets ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 40 }}>Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 40 }}>No support tickets found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tickets.map((t: any) => (
                <div key={t.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "var(--bg)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{t.subject}</h4>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>By: {t.profiles?.full_name || t.profiles?.email || "Unknown"}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: t.status === "open" ? "rgba(245,158,11,.1)" : "rgba(0,212,170,.1)", color: t.status === "open" ? "#f59e0b" : "var(--primary)", textTransform: "uppercase" }}>{t.status}</span>
                      <select 
                        value={t.status} 
                        onChange={(e) => handleUpdateTicketStatus(t.id, e.target.value)}
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: 12, padding: "4px 8px" }}
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.4 }}>{t.message}</p>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginTop: 8 }}>{new Date(t.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
