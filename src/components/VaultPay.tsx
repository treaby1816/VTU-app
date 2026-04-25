"use client";

import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import React from "react";
import {
  Wallet, Zap, LogOut, Bell, Shield, TrendingUp, Users,
  ChevronRight, CheckCircle2, XCircle, Clock, RefreshCw, Download,
  Eye, EyeOff, Phone, X, ArrowUpRight, ArrowDownLeft, Copy,
  Search, ChevronDown, Home, CreditCard, Activity, Lock, Wifi,
  Plus, Minus, Check, Info, Globe, History, Menu, Sun, Moon, Settings, MessageCircle
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
import SettingsPage from "./dashboard/SettingsPage";
import SupportPage from "./dashboard/SupportPage";
import AIChatbot from "./ui/AIChatbot";

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
  const [showProgress, setShowProgress] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowProgress(true), 400);
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(iv);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onDone, 600);
          }, 400);
          return 100;
        }
        return p + 1.5;
      });
    }, 30);
    return () => { clearInterval(iv); clearTimeout(t1); };
  }, [onDone]);

  return (
    <div className={isExiting ? "fade-out" : ""} style={{ 
      position: "fixed", inset: 0, zIndex: 9999, background: "var(--bg)", 
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" 
    }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ 
          width: 90, height: 90, borderRadius: 28, 
          background: "linear-gradient(135deg,#00D4AA,#00b896)", 
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 20px 60px rgba(0,212,170,.4)"
        }}>
          <Zap size={45} color="#fff" fill="#fff" />
        </div>
      </div>
      
      <h1 style={{ 
        fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 34, 
        color: "var(--text)", margin: 0
      }}>
        VaultPay
      </h1>

      <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {showProgress && (
          <div style={{ 
            width: 220, height: 3, background: "var(--border)", 
            borderRadius: 3, overflow: "hidden"
          }}>
            <div style={{ 
              height: "100%", background: "var(--primary)", 
              width: `${progress}%`, transition: "width .15s linear"
            }} />
          </div>
        )}
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
  const [showBalance, setShowBalance] = useState(true);
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
              { id: "settings", label: "Settings", icon: <Settings size={18} /> },
              { id: "support", label: "Support", icon: <Info size={18} /> },
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
              {/* Virtual ATM Card */}
              <div style={{ 
                background: "linear-gradient(135deg, #00D4AA 0%, #00b896 100%)", 
                borderRadius: 24, 
                padding: 28, 
                marginBottom: 32, 
                boxShadow: "0 20px 40px rgba(0,212,170,.3)", 
                color: "#000",
                position: "relative",
                overflow: "hidden",
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                {/* Decorative Circles */}
                <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                <div style={{ position: "absolute", bottom: -20, left: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, letterSpacing: 1 }}>VAULTPAY PLATINUM</p>
                    <div style={{ width: 40, height: 30, background: "rgba(0,0,0,0.1)", borderRadius: 6, marginTop: 12, position: "relative", overflow: "hidden" }}>
                       <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.2)" }} />
                       <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.2)" }} />
                    </div>
                  </div>
                  <button onClick={() => setShowBalance(!showBalance)} style={{ background: "rgba(0,0,0,0.1)", border: "none", width: 36, height: 36, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                <div style={{ position: "relative", zIndex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.8 }}>Available Balance</p>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 36, margin: "4px 0", letterSpacing: -1 }}>
                    {showBalance ? fmtN(balance) : "₦ • • • • •"}
                  </h2>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative", zIndex: 1 }}>
                   <div>
                     <p style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, marginBottom: 2 }}>CARD HOLDER</p>
                     <p style={{ fontSize: 14, fontWeight: 700 }}>{user.name.toUpperCase()}</p>
                   </div>
                   <div style={{ textAlign: "right" }}>
                     <Zap size={24} fill="#000" color="#000" />
                   </div>
                </div>
              </div>
              
              <button onClick={() => setModal("fund")} style={{ width: "100%", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border)", padding: "16px 0", borderRadius: 16, fontWeight: 700, fontSize: 14, marginBottom: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Plus size={18} color="var(--primary)" /> Add Money to Wallet
              </button>

              {/* Supported Networks */}
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, letterSpacing: 0.5 }}>SUPPORTED NETWORKS</p>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {[
                    { name: "MTN", logo: "/images/mtn_official.png" },
                    { name: "Airtel", logo: "/images/airtel_official.png" },
                    { name: "Glo", logo: "/images/glo_official.png" },
                    { name: "9mobile", logo: "/images/9mobile_official.png" },
                  ].map(n => (
                    <div key={n.name} style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", padding: 6 }}>
                      <img src={n.logo} alt={n.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                  ))}
                </div>
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

          {activePage === "settings" && <SettingsPage user={user} isMobile={isMobile} />}
          {activePage === "support" && <SupportPage isMobile={isMobile} />}
          {activePage === "admin" && user.isAdmin && <AdminPanel isMobile={isMobile} />}
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatbot />

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
