"use client";

import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import React from "react";
import {
  Wallet, Zap, LogOut, Bell, Shield, TrendingUp, Users,
  ChevronRight, CheckCircle2, XCircle, Clock, RefreshCw, Download,
  Eye, EyeOff, Phone, X, ArrowUpRight, ArrowDownLeft, Copy,
  Search, ChevronDown, Home, CreditCard, Activity, Lock, Wifi,
  Plus, Minus, Check, Info, Globe, History, Menu, Sun, Moon, Settings, MessageCircle, ArrowLeft, Award
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
import CursorWanderCard from "./ui/cursor-wander-card";
import WhatsAppWidget from "./ui/WhatsAppWidget";

// Whitelabel Reseller Onboarding Component
const ResellerPage = memo(({ user }: { user: any }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMsg = `Hello VaultPay Support, I would like to upgrade my account and activate my custom whitelabel reseller VTU platform!\n\nMy Details:\n- Name: ${user.name}\n- User UUID: ${user.id}\n- Brand Name: [My Brand Name]\n- Desired Subdomain: [mybrand]`;
  const whatsappUrl = `https://wa.me/2348065136221?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="fade-up" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(0,212,170,.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
          <Award size={32} color="var(--primary)" />
        </div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>Become a Whitelabel Reseller</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>Launch your custom branded VTU website and earn passive income!</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        {/* Why become a reseller? */}
        <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: 24, border: "1px solid var(--border)" }}>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>🚀 Reseller Brand Features</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { t: "Custom Branding", d: "Your custom business name, logo, HSL color palette, and custom sub-domain/domain setup." },
              { t: "Double-Wallet Ledger", d: "Prepaid automatic balance splits. Customers pay retail, and you pay wholesale, keeping 100% of the markups!" },
              { t: "Automated VTU API Routing", d: "Zero server configurations. Purchases route instantly through active high-speed providers." },
              { t: "Isolated Tenancy Security", d: "Full Row-Level Security (RLS). Resellers can only see transaction reports of their own users." }
            ].map((f, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ color: "var(--primary)", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{f.t}</h4>
                <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.5 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Activation */}
        <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: 24, border: "1px solid var(--border)", textAlign: "center" }}>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Ready to Activate?</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Upgrading is automated. Just copy your Profile UUID below and click the button to message our Admin Support on WhatsApp for provisioning!</p>

          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, maxWidth: 500, margin: "0 auto 24px", textAlign: "left" }}>
            <div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Your Profile User ID (UUID)</span>
              <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 700, fontFamily: "monospace", marginTop: 4, wordBreak: "break-all" }}>{user.id}</p>
            </div>
            <button 
              onClick={handleCopy}
              style={{ padding: "8px 16px", borderRadius: 8, background: copied ? "rgba(16,185,129,0.15)" : "var(--primary)", border: "none", color: copied ? "#10b981" : "#000", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              {copied ? "Copied! ✓" : "Copy ID"}
            </button>
          </div>

          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#25D366", color: "#fff", padding: "14px 28px", borderRadius: 12, fontWeight: 700, textDecoration: "none", fontSize: 14, boxShadow: "0 8px 24px rgba(37,211,102,.3)" }}
          >
            <MessageCircle size={18} fill="#fff" /> Contact Support on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
});
ResellerPage.displayName = "ResellerPage";

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

// ─── Login Success Screen ────────────────────────────────────────────────
const LoginSuccessScreen = ({ userName, onDone }: { userName: string, onDone: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{ 
      position: "fixed", inset: 0, zIndex: 9999, background: "var(--bg)", 
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: 20
    }}>
      <div className="bounce-in" style={{ 
        width: 100, height: 100, borderRadius: "50%", 
        background: "rgba(0,212,170,.1)", display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24, border: "2px solid rgba(0,212,170,.2)"
      }}>
        <Check size={50} color="var(--primary)" strokeWidth={3} />
      </div>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, color: "var(--text)", marginBottom: 8 }}>Welcome back!</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 18, fontWeight: 500 }}>{userName}</p>
      <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 10 }}>
        <div className="spin" style={{ width: 18, height: 18, border: "2px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%" }} />
        <span style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 600 }}>Redirecting to Dashboard...</span>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────
export default function VaultPay() {
  const isMobile = useIsMobile();
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  
  const { user, setUser, balance, transactions, logout, theme, toggleTheme } = useStore();
  const { isLoading: loadingDash, refetch } = useUserData();

  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [toasts, setToasts] = useState<any[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const toastId = useRef(0);

  // Ref to prevent duplicate welcome screen triggers across re-renders
  const welcomeHandledRef = useRef(false);
  // Ref to track if initial session has been loaded (skip welcome for it)
  const initialSessionLoaded = useRef(false);

  const addToast = useCallback((type: string, title: string, msg?: string) => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, type, title, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  // Helper: fetch admin status from profiles table with safer .limit(1) query
  const fetchUserWithRole = useCallback(async (sessionUser: any) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", sessionUser.id)
        .limit(1);

      const isMasterAdmin = sessionUser.email === "felixadewole16@gmail.com";
      return {
        id: sessionUser.id,
        email: sessionUser.email!,
        name: sessionUser.user_metadata?.full_name || sessionUser.email?.split("@")[0] || "User",
        isAdmin: isMasterAdmin || (!error && data && data.length > 0 && data[0].is_admin === true) ? true : false
      };
    } catch {
      return {
        id: sessionUser.id,
        email: sessionUser.email!,
        name: sessionUser.user_metadata?.full_name || sessionUser.email?.split("@")[0] || "User",
        isAdmin: false
      };
    }
  }, []);

  useEffect(() => {
    // 1. Load existing session on mount (NEVER show welcome for this)
    supabase.auth.getSession().then(async ({ data: { session } }: any) => {
      initialSessionLoaded.current = true;
      if (session?.user) {
        const userData = await fetchUserWithRole(session.user);
        setUser(userData);
      }
    });

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.user) {
        const userData = await fetchUserWithRole(session.user);
        setUser(userData);

        // ONLY show welcome for genuine user-initiated sign-ins:
        // - Must be SIGNED_IN event (not INITIAL_SESSION, TOKEN_REFRESHED, etc.)
        // - Must have the justLoggedIn sessionStorage flag (set by AuthScreen before login)
        // - Must not have already been handled in this component lifecycle
        // - Must have already loaded the initial session (skip the very first SIGNED_IN)
        if (
          event === "SIGNED_IN" &&
          !welcomeHandledRef.current &&
          initialSessionLoaded.current
        ) {
          const justLoggedIn = sessionStorage.getItem("justLoggedIn");
          if (justLoggedIn === "true") {
            welcomeHandledRef.current = true;
            sessionStorage.removeItem("justLoggedIn");
            setShowWelcome(true);
          }
        }
      } else {
        setUser(null);
        setShowWelcome(false);
        welcomeHandledRef.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, fetchUserWithRole]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('hasSeenWelcome'); // Reset welcome flag for next login
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
  if (showWelcome && user) return <LoginSuccessScreen userName={user.name} onDone={() => setShowWelcome(false)} />;
  if (!user) return <AuthScreen isMobile={isMobile} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {/* Modals */}
      {modal === "airtime" && <AirtimeModal onClose={() => setModal(null)} balance={balance} onSubmit={handleTransaction} isMobile={isMobile} />}
      {modal === "data" && <DataModal onClose={() => setModal(null)} balance={balance} onSubmit={handleTransaction} isMobile={isMobile} />}
      {modal === "fund" && <FundModal onClose={() => setModal(null)} onSubmit={handleTransaction} isMobile={isMobile} />}

      {/* Sidebar / Nav */}
      {!isMobile && (
        <div style={{ width: sidebarCollapsed ? 80 : 260, borderRight: "1px solid var(--border)", padding: 20, transition: "width .3s", display: "flex", flexDirection: "column", position: "relative" }}>
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
              { id: "reseller", label: "Become a Reseller", icon: <Award size={18} /> },
              ...(user.isAdmin ? [{ id: "admin", label: "Admin Panel", icon: <Shield size={18} /> }] : [])
            ].map(item => (
              <button key={item.id} onClick={() => handleNav(item.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", background: activePage === item.id ? "rgba(0,212,170,.1)" : "transparent", color: activePage === item.id ? "var(--primary)" : "var(--text-muted)", cursor: "pointer", fontWeight: 600, transition: "all .2s" }}>
                {item.icon}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
          <button onClick={handleLogout} style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", background: "transparent", color: "#ff4444", cursor: "pointer", fontWeight: 600 }}>
            <LogOut size={18} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobile && drawerOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setDrawerOpen(false)} />
          <div style={{ position: "relative", width: 260, background: "var(--bg)", height: "100%", display: "flex", flexDirection: "column", padding: 20, boxShadow: "2px 0 20px rgba(0,0,0,0.2)", animation: "slide-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Zap size={20} color="#000" fill="#000" />
                </div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20 }}>{BRAND}</h2>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: "none", border: "none", color: "var(--text)", display: "flex" }}><X size={24} /></button>
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
                { id: "reseller", label: "Become a Reseller", icon: <Award size={18} /> },
                ...(user.isAdmin ? [{ id: "admin", label: "Admin Panel", icon: <Shield size={18} /> }] : [])
              ].map(item => (
                <button key={item.id} onClick={() => handleNav(item.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", background: activePage === item.id ? "rgba(0,212,170,.1)" : "transparent", color: activePage === item.id ? "var(--primary)" : "var(--text)", cursor: "pointer", fontWeight: 600 }}>
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <button onClick={handleLogout} style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", background: "transparent", color: "#ff4444", cursor: "pointer", fontWeight: 600 }}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "var(--bg)", opacity: 0.95, backdropFilter: "blur(12px)", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && activePage === "dashboard" && <button onClick={() => setDrawerOpen(true)} style={{ background: "none", border: "none", color: "var(--text)", display: "flex" }}><Menu /></button>}
            {isMobile && activePage !== "dashboard" && <button onClick={() => setActivePage("dashboard")} style={{ background: "none", border: "none", color: "var(--text)", display: "flex" }}><ArrowLeft /></button>}
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18 }}>{activePage === "dashboard" ? "Dashboard" : activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={toggleTheme} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", width: 36, height: 36, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)" }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div style={{ textAlign: "right", display: isMobile ? "none" : "block" }}>
              <p style={{ fontSize: 13, fontWeight: 700 }}>{user.name}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{user.email}</p>
            </div>
            <div onClick={() => handleNav("settings")} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,212,170,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: 700, cursor: "pointer", transition: "all .2s" }} title="Go to Settings">
              {user.name[0]}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: isMobile ? 16 : 32, maxWidth: 1200, width: "100%", margin: "0 auto" }}>
          {activePage === "dashboard" && (
            <div className="fade-up">
              {/* Virtual ATM Card */}
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 24, marginBottom: 32, alignItems: "center", background: "var(--bg-card)", padding: 24, borderRadius: 24, border: "1px solid var(--border)" }}>
                <div style={{ flex: 1, width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18 }}>Virtual NGN Card</h3>
                    <button onClick={() => setShowBalance(!showBalance)} style={{ background: "rgba(0,212,170,.1)", border: "none", width: 36, height: 36, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                      {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>Available Balance</p>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: 1, margin: 0, color: "var(--primary)" }}>
                    {showBalance ? fmtN(balance) : "₦ • • • • •"}
                  </h2>
                </div>
                <div style={{ flexShrink: 0, display: "flex", justifyContent: "center", width: isMobile ? "100%" : "auto" }}>
                  <CursorWanderCard 
                    cardholderName={user.name.toUpperCase()} 
                    width={isMobile ? "320px" : "380px"} 
                    height={isMobile ? "200px" : "240px"} 
                    theme={{ primaryColor: "#00D4AA", secondaryColor: "#0D1426", glowColor: "rgba(0, 212, 170, 0.4)" }}
                    logoText={{ topText: "VAULT", bottomText: "PAY" }}
                  />
                </div>
              </div>
              
              <button onClick={() => setModal("fund")} style={{ width: "100%", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border)", padding: "16px 0", borderRadius: 16, fontWeight: 700, fontSize: 14, marginBottom: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Plus size={18} color="var(--primary)" /> Add Money to Wallet
              </button>

              {/* Supported Networks */}
              <div style={{ marginBottom: 32, width: "100%" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 16, letterSpacing: 0.5 }}>SUPPORTED NETWORKS</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  {[
                    { name: "MTN", logo: "/images/mtn.png" },
                    { name: "Airtel", logo: "/images/airtel.png" },
                    { name: "Glo", logo: "/images/glo.png" },
                    { name: "9mobile", logo: "/images/9mobile.png" }
                  ].map((n, idx) => (
                    <div key={idx} style={{ aspectRatio: "1/1", width: "100%", borderRadius: 24, overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", padding: 6, transition: "transform .3s", cursor: "pointer" }} onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}>
                      <img src={n.logo} alt={n.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }} />
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
          {activePage === "reseller" && <ResellerPage user={user} />}
          {activePage === "admin" && user.isAdmin && <AdminPanel isMobile={isMobile} />}
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatbot />
      
      {/* WhatsApp Widget */}
      <WhatsAppWidget />

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
