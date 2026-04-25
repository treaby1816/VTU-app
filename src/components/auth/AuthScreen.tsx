"use client";

import React, { useState, useEffect } from "react";
import { Zap, Lock, Globe, Phone, Shield, Eye, EyeOff, Users, CheckCircle2 } from "lucide-react";
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
      setSuccessMsg("Password reset link sent! Check your email inbox.");
    } catch (err: any) {
      setAuthError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    setLoading(true);
    setAuthError(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: form.email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      if (error) throw error;
      setSuccessMsg("Verification link resent! Please check your inbox.");
    } catch (err: any) {
      setAuthError(err.message || "Failed to resend link.");
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
        if (data.user) setMode("success");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "welcome") {
    return <WelcomeScreen onGetStarted={() => setMode("register")} onLogin={() => setMode("login")} isMobile={isMobile} />;
  }

  if (mode === "success") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 440, background: "var(--bg-card)", borderRadius: 24, padding: "40px 30px", border: "1px solid var(--border)", textAlign: "center", boxShadow: "0 30px 70px rgba(0,0,0,.3)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,212,170,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", border: "2px solid rgba(0,212,170,.2)" }}>
            <Zap size={40} color="var(--primary)" fill="var(--primary)" />
          </div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text)", marginBottom: 12 }}>Check your email!</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 30 }}>
            We've sent a verification link to <span style={{ color: "var(--primary)", fontWeight: 700 }}>{form.email}</span>. Click the link to activate your account and start using {BRAND}.
          </p>
          {successMsg && <p style={{ color: "var(--primary)", fontSize: 13, marginBottom: 20, fontWeight: 600 }}>{successMsg}</p>}
          {authError && <p style={{ color: "#ff4444", fontSize: 13, marginBottom: 20, fontWeight: 600 }}>{authError}</p>}
          <div style={{ background: "rgba(245,158,11,.05)", borderRadius: 12, padding: 16, marginBottom: 30, border: "1px solid rgba(245,158,11,.1)" }}>
            <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 500 }}>{"Don't see it? Check your spam folder or wait a few minutes."}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={() => setMode("login")} className="btn-p" style={{ width: "100%", padding: "16px 0", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,var(--primary),var(--primary-hover))", color: "#fff", fontWeight: 700, fontSize: 16 }}>Back to Sign In</button>
            <button onClick={handleResendLink} disabled={loading} style={{ width: "100%", padding: "12px 0", background: "transparent", border: "none", color: "var(--text-muted)", cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>{loading ? "Resending..." : "Didn't receive email? Resend Link"}</button>
          </div>
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

      <button onClick={() => mode === "forgot" ? setMode("login") : setMode("welcome")} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", width: 40, height: 40, borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)", fontSize: 18, zIndex: 10, marginBottom: 16 }}>{"\u2190"}</button>
      
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 440, zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,var(--primary),var(--primary-hover))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,212,170,.3)" }}>
                <Zap size={22} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text)", letterSpacing: "-.5px" }}>{BRAND}</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{mode === "forgot" ? "Reset your password" : "Nigeria's fastest VTU platform"}</p>
          </div>

          <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: isMobile ? "20px" : "28px", border: "1px solid var(--border)", boxShadow: "0 24px 60px rgba(0,0,0,.15)" }}>
            {mode !== "forgot" && tabSwitcher}
            {mode === "forgot" && forgotHeader}
            {(successMsg || authError) && (
              <div style={{ marginBottom: 16, padding: "10px 14px", background: successMsg ? "rgba(0,212,170,.1)" : "rgba(255,68,68,.1)", border: `1px solid ${successMsg ? "rgba(0,212,170,.2)" : "rgba(255,68,68,.2)"}`, borderRadius: 10 }}>
                <p style={{ color: successMsg ? "var(--primary)" : "#ff4444", fontSize: 13, textAlign: "center" }}>{successMsg || authError}</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mode === "register" && (
                <>
                  <InputField label="Full Name" placeholder="Adaeze Okonkwo" value={form.name} onChange={set("name")} icon={<Users size={15} />} error={errors.name} />
                  <InputField label="Phone Number" placeholder="08012345678" value={form.phone} onChange={set("phone")} icon={<Phone size={15} />} />
                </>
              )}
              <InputField label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} icon={<Globe size={15} />} error={errors.email} />
              {mode !== "forgot" && (
                <InputField label="Password" type={showPass ? "text" : "password"} placeholder="********" value={form.password} onChange={set("password")} icon={<Lock size={15} />} error={errors.password} suffix={
                  <button onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                } />
              )}
            </div>
            {mode === "login" && (
              <div style={{ textAlign: "right", marginTop: 8 }}>
                <span onClick={() => setMode("forgot")} style={{ color: "var(--primary)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Forgot password?</span>
              </div>
            )}
            <button onClick={handleSubmit} disabled={loading} className="btn-p" style={{ width: "100%", padding: "14px 0", marginTop: 22, borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? "var(--border)" : "linear-gradient(135deg,var(--primary),var(--primary-hover))", color: "#fff", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? <div className="spin" style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }} /> : buttonLabel}
            </button>
            {mode !== "forgot" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>
                <button onClick={handleGoogleLogin} className="inp" style={{ width: "100%", padding: "12px 0", borderRadius: 12, cursor: "pointer", background: "var(--bg)", color: "var(--text)", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: "1px solid var(--border)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  Continue with Google
                </button>
              </>
            )}
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{"🔒 256-bit SSL \u00b7 Secure Supabase Auth"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
