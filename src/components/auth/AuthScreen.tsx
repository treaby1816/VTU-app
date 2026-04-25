"use client";

import React, { useState } from "react";
import { Zap, Lock, Globe, Phone, Shield, Eye, EyeOff, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

import WelcomeScreen from "./WelcomeScreen";

const BRAND = "VaultPay";

// Temporary InputField component (will be moved to UI folder later)
const InputField = React.memo(({ label, type = "text", placeholder, value, onChange, icon, error, suffix }: any) => (
  <div>
    <label style={{ display: "block", color: "var(--text-muted)", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</label>
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {icon && <span style={{ position: "absolute", left: 13, color: "var(--text-muted)" }}>{icon}</span>}
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value} 
        onChange={(e: any) => onChange(e.target.value)} 
        className="inp" 
        style={{
          width: "100%", background: "var(--bg)", border: `1px solid ${error ? "#ff444450" : "var(--border)"}`,
          borderRadius: 10, padding: `12px ${suffix ? "42px" : "14px"} 12px ${icon ? "38px" : "14px"}`,
          color: "var(--text)", fontSize: 14, outline: "none"
        }} 
      />
      {suffix && <span style={{ position: "absolute", right: 13 }}>{suffix}</span>}
    </div>
    {error && <p style={{ color: "#ff4444", fontSize: 11, marginTop: 4 }}>{error}</p>}
  </div>
));
InputField.displayName = "InputField";

export default function AuthScreen({ isMobile }: { isMobile: boolean }) {
  const [mode, setMode] = useState<"welcome" | "login" | "register" | "forgot" | "success">("welcome");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [debugClicks, setDebugClicks] = useState(0);

  const checkDebug = () => {
    const next = debugClicks + 1;
    if (next >= 5) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      alert(`DEBUG INFO:\nURL: ${url ? 'FOUND ('+url.substring(0,10)+'...)' : 'MISSING'}\nKEY: ${key ? 'FOUND ('+key.substring(0,10)+'...)' : 'MISSING'}\nENV: ${process.env.NODE_ENV}`);
      setDebugClicks(0);
    } else {
      setDebugClicks(next);
    }
  };

  const set = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (mode !== "forgot" && form.password.length < 6) e.password = "Min 6 characters";
    if (mode === "register" && form.name.length < 2) e.name = "Name required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleForgotPassword = async () => {
    if (!form.email.includes("@")) {
      setErrors({ email: "Valid email required" });
      return;
    }
    setLoading(true);
    setAuthError(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccessMsg("Password reset link sent! Check your email inbox (and spam folder).");
    } catch (err: any) {
      setAuthError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === "forgot") {
      handleForgotPassword();
      return;
    }
    if (!validate()) return;
    setLoading(true);
    setAuthError(null);

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: form.name,
              phone: form.phone || null,
            }
          }
        });

        if (error) throw error;
        
        if (data.user) {
          setMode("success");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "welcome") {
    return (
      <WelcomeScreen onGetStarted={() => setMode("register")} onLogin={() => setMode("login")} isMobile={isMobile} />
    );
  }

  if (mode === "success") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 440, background: "var(--bg-card)", borderRadius: 24, padding: "40px 30px", border: "1px solid var(--border)", textAlign: "center", boxShadow: "0 30px 70px rgba(0,0,0,.3)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,212,170,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", border: "2px solid rgba(0,212,170,.2)" }}>
            <Zap size={40} color="var(--primary)" fill="var(--primary)" className="bounce" />
          </div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text)", marginBottom: 12 }}>Check your email!</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 30 }}>
            We've sent a verification link to <span style={{ color: "var(--primary)", fontWeight: 700 }}>{form.email}</span>. Click the link to activate your account and start using {BRAND}.
          </p>
          <div style={{ background: "rgba(245,158,11,.05)", borderRadius: 12, padding: 16, marginBottom: 30, border: "1px solid rgba(245,158,11,.1)" }}>
            <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 500 }}>{"Don't see it? Check your spam folder or wait a few minutes."}</p>
          </div>
          <button onClick={() => setMode("login")} className="btn-p" style={{ width: "100%", padding: "16px 0", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,var(--primary),var(--primary-hover))", color: "#fff", fontWeight: 700, fontSize: 16 }}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  const forgotHeader = (
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(0,212,170,.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <Lock size={24} color="var(--primary)" />
      </div>
      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 4 }}>Forgot Password?</h3>
      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{"Enter your email and we'll send you a reset link"}</p>
    </div>
  );

  const tabSwitcher = (
    <div style={{ display: "flex", background: "var(--bg)", borderRadius: 10, padding: 4, marginBottom: 24, gap: 4 }}>
      {(["login", "register"] as const).map(m => (
        <button key={m} onClick={() => { setMode(m); setErrors({}); setAuthError(null); setSuccessMsg(null); }} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: mode === m ? "var(--primary)" : "transparent", color: mode === m ? "#fff" : "var(--text-muted)", transition: "all .2s" }}>
          {m === "login" ? "Sign In" : "Sign Up"}
        </button>
      ))}
    </div>
  );

  let buttonLabel = "Sign In \u2192";
  if (mode === "forgot") buttonLabel = "Send Reset Link \u2192";
  else if (mode === "register") buttonLabel = "Create Account \u2192";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", padding: isMobile ? "16px" : "20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,170,.06) 0%,transparent 70%)", top: -200, right: -200, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,.04) 0%,transparent 70%)", bottom: -200, left: -200, pointerEvents: "none" }} />

      <button onClick={() => mode === "forgot" ? setMode("login") : setMode("welcome")} style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        width: 40, height: 40, borderRadius: 12, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text)", fontSize: 18, zIndex: 10, marginBottom: 16, flexShrink: 0
      }}>
        {"\u2190"}
      </button>
      
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 440, zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div onClick={checkDebug} style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,var(--primary),var(--primary-hover))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,212,170,.3)" }}>
                <Zap size={22} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text)", letterSpacing: "-.5px" }}>{BRAND}</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {mode === "forgot" ? "Reset your password" : "Nigeria's fastest VTU platform"}
            </p>
          </div>

          <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: isMobile ? "20px" : "28px", border: "1px solid var(--border)", boxShadow: "0 24px 60px rgba(0,0,0,.15)" }}>
            
            {mode !== "forgot" && tabSwitcher}
            {mode === "forgot" && forgotHeader}

            {successMsg && (
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(0,212,170,.1)", border: "1px solid rgba(0,212,170,.2)", borderRadius: 10 }}>
                <p style={{ color: "var(--primary)", fontSize: 13, textAlign: "center" }}>{successMsg}</p>
              </div>
            )}

            {authError && (
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(255,68,68,.1)", border: "1px solid rgba(255,68,68,.2)", borderRadius: 10 }}>
                <p style={{ color: "#ff4444", fontSize: 13, textAlign: "center" }}>{authError}</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mode === "register" && (
                <>
                  <InputField label="Full Name" placeholder="Adaeze Okonkwo" value={form.name} onChange={set("name")} icon={<Users size={15} />} error={errors.name} />
                  <InputField label="Phone Number (Optional)" placeholder="08012345678" value={form.phone} onChange={set("phone")} icon={<Phone size={15} />} />
                </>
              )}
              <InputField label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} icon={<Globe size={15} />} error={errors.email} />
              {mode !== "forgot" && (
                <InputField label="Password" type={showPass ? "text" : "password"} placeholder="********" value={form.password} onChange={set("password")} icon={<Lock size={15} />} error={errors.password} suffix={
                  <button onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                } />
              )}
            </div>

            {mode === "login" && (
              <div style={{ textAlign: "right", marginTop: 8 }}>
                <span onClick={() => { setMode("forgot"); setErrors({}); setAuthError(null); setSuccessMsg(null); }} style={{ color: "var(--primary)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Forgot password?</span>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} className="btn-p" style={{ width: "100%", padding: "14px 0", marginTop: 22, borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? "var(--border)" : "linear-gradient(135deg,var(--primary),var(--primary-hover))", color: "#fff", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? <div className="spin" style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }} /> : buttonLabel}
            </button>

            {mode === "forgot" && (
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <span onClick={() => { setMode("login"); setSuccessMsg(null); setAuthError(null); }} style={{ color: "var(--text-muted)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                  {"\u2190 Back to Sign In"}
                </span>
              </div>
            )}

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{"🔒 256-bit SSL \u00b7 Secure Supabase Auth"}</p>
            </div>
            
            <button onClick={checkDebug} style={{ marginTop: 20, width: "100%", background: "transparent", border: "1px solid #ff444450", color: "#ff4444", padding: "8px", borderRadius: 8, fontSize: 10, cursor: "pointer", opacity: 0.5 }}>
              {"🔧 DEBUG SYSTEM (Click to check keys)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
