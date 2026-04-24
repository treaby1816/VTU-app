"use client";

import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import React from "react";
import {
  Wallet, Zap, LogOut, Bell, Shield, TrendingUp, Users,
  ChevronRight, CheckCircle2, XCircle, Clock, RefreshCw, Download,
  Eye, EyeOff, Phone, X, ArrowUpRight, ArrowDownLeft, Copy,
  Search, ChevronDown, Home, CreditCard, Activity, Lock, Wifi,
  Plus, Minus, Check, Info, Globe, History, Menu, Sun, Moon,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { useUserData } from "@/hooks/useUserData";
import { fmtN, BRAND, sleep } from "@/lib/utils";

// Extracted Components
import AuthScreen from "./auth/AuthScreen";
import AdminPanel from "./admin/AdminPanel";
import AirtimeModal from "./transactions/AirtimeModal";
import DataModal from "./transactions/DataModal";
import FundModal from "./transactions/FundModal";
import TxTable from "./transactions/TxTable";

// ─── Responsive hook ─────────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

// ─── Splash Screen ────────────────────────────────────────────────────────
const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(iv);
          setTimeout(onDone, 500);
          return 100;
        }
        return p + 2;
      });
    }, 30);
    return () => clearInterval(iv);
  }, [onDone]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div className="splash-in" style={{ marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg,var(--primary),var(--primary-hover))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(0,212,170,.3)" }}>
          <Zap size={40} color="#fff" fill="#fff" />
        </div>
      </div>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, color: "var(--text)" }}>{BRAND}</h1>
      <div style={{ width: 200, height: 3, background: "var(--border)", borderRadius: 3, marginTop: 32, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "var(--primary)", width: `${progress}%`, transition: "width .1s linear" }} />
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────
export default function VaultPay() {
  const isMobile = useIsMobile();
  const [showSplash, setShowSplash] = useState(true);
  
  const { user, setUser, balance, transactions, logout, theme, toggleTheme } = useStore();
  const { isLoading: loadingDash, refetch } = useUserData();

  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [toasts, setToasts] = useState<any[]>([]);
  const toastId = useRef(0);

  const addToast = useCallback((type: string, title: string, msg?: string) => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, type, title, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.full_name || session.user.email?.split("@")[0],
          isAdmin: session.user.email?.includes("admin") || false
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.full_name || session.user.email?.split("@")[0],
          isAdmin: session.user.email?.includes("admin") || false
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    setActivePage("dashboard");
    setModal(null);
  };

  const handleTransaction = (tx: any) => {
    refetch();
    if (tx.status === "success") {
      addToast("success", "Success!", tx.service);
    } else {
      addToast("error", "Failed", "Transaction failed");
    }
    setModal(null);
  };

  const handleNav = (page: string) => {
    if (["airtime", "data", "fund"].includes(page)) { setModal(page); return; }
    setActivePage(page);
    if (isMobile) setDrawerOpen(false);
  };

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />;
  if (!user) return <AuthScreen isMobile={isMobile} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {/* Modals */}
      {modal === "airtime" && <AirtimeModal onClose={() => setModal(null)} balance={balance} onSubmit={handleTransaction} isMobile={isMobile} />}
      {modal === "data" && <DataModal onClose={() => setModal(null)} balance={balance} onSubmit={handleTransaction} isMobile={isMobile} />}
      {modal === "fund" && <FundModal onClose={() => setModal(null)} onSubmit={handleTransaction} isMobile={isMobile} />}

      {/* Sidebar / Nav */}
      {!isMobile && (
        <div style={{ width: sidebarCollapsed ? 80 : 260, borderRight: "1px solid var(--border)", padding: 20, transition: "width .3s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={20} color="#000" fill="#000" />
            </div>
            {!sidebarCollapsed && <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20 }}>{BRAND}</h2>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
              { id: "transactions", label: "Transactions", icon: <History size={18} /> },
              { id: "airtime", label: "Buy Airtime", icon: <Phone size={18} /> },
              { id: "data", label: "Buy Data", icon: <Wifi size={18} /> },
              { id: "fund", label: "Fund Wallet", icon: <Plus size={18} /> },
              ...(user.isAdmin ? [{ id: "admin", label: "Admin Panel", icon: <Shield size={18} /> }] : [])
            ].map(item => (
              <button key={item.id} onClick={() => handleNav(item.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", background: activePage === item.id ? "rgba(0,212,170,.1)" : "transparent", color: activePage === item.id ? "var(--primary)" : "var(--text-muted)", cursor: "pointer", fontWeight: 600, transition: "all .2s" }}>
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
          <button onClick={handleLogout} style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", background: "transparent", color: "#ff4444", cursor: "pointer", fontWeight: 600, position: "absolute", bottom: 20 }}>
            <LogOut size={18} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "var(--bg)", opacity: 0.95, backdropFilter: "blur(12px)", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && <button onClick={() => setDrawerOpen(true)} style={{ background: "none", border: "none", color: "var(--text)" }}><Menu /></button>}
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18 }}>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={toggleTheme} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", width: 36, height: 36, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)" }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div style={{ textAlign: "right", display: isMobile ? "none" : "block" }}>
              <p style={{ fontSize: 13, fontWeight: 700 }}>{user.name}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{user.email}</p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,212,170,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: 700 }}>
              {user.name[0]}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: isMobile ? 16 : 32, maxWidth: 1200, width: "100%", margin: "0 auto" }}>
          {activePage === "dashboard" && (
            <div className="fade-up">
              <div style={{ background: "linear-gradient(135deg,#00D4AA,#00b896)", borderRadius: 24, padding: 28, marginBottom: 32, boxShadow: "0 20px 40px rgba(0,212,170,.2)", color: "#000" }}>
                <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.8 }}>Available Balance</p>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 36, margin: "8px 0" }}>{fmtN(balance)}</h2>
                <button onClick={() => setModal("fund")} style={{ background: "#000", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13, marginTop: 12, cursor: "pointer" }}>+ Fund Wallet</button>
              </div>

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Quick Actions</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {[
                    { id: "airtime", label: "Airtime", icon: <Phone />, color: "#F59E0B" },
                    { id: "data", label: "Data", icon: <Wifi />, color: "#3B82F6" },
                    { id: "fund", label: "Fund", icon: <Plus />, color: "#00D4AA" }
                  ].map(action => (
                    <button key={action.id} onClick={() => setModal(action.id)} style={{ background: "#0D1426", border: "1px solid rgba(255,255,255,.05)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", transition: "transform .2s" }}>
                      <div style={{ color: action.color }}>{action.icon}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18 }}>Recent Transactions</h3>
                  <button onClick={() => setActivePage("transactions")} style={{ background: "none", border: "none", color: "#00D4AA", fontWeight: 600, fontSize: 13 }}>View All</button>
                </div>
                <TxTable transactions={transactions} limit={5} onDownload={() => {}} onRetry={() => {}} isMobile={isMobile} />
              </div>
            </div>
          )}

          {activePage === "transactions" && (
            <div className="fade-up">
              <TxTable transactions={transactions} onDownload={() => {}} onRetry={() => {}} isMobile={isMobile} />
            </div>
          )}

          {activePage === "admin" && user.isAdmin && <AdminPanel isMobile={isMobile} />}
        </div>
      </div>

      {/* Toasts */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 10000, display: "flex", flexDirection: "column", gap: 10 }}>
        {toasts.map(t => (
          <div key={t.id} className="toast-slide" style={{ background: "#0D1426", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}>
            {t.type === "success" ? <CheckCircle2 color="#00D4AA" size={18} /> : <XCircle color="#ff4444" size={18} />}
            <div>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{t.title}</p>
              {t.msg && <p style={{ fontSize: 11, color: "#64748b" }}>{t.msg}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
