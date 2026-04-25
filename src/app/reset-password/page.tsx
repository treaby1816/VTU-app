"use client";

import React, { useState, useEffect } from "react";
import { Zap, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase auto-detects the recovery token from the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    // Also check if we already have a session (user may have landed here with a valid session)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setStatus("success");
      setMessage("Password updated successfully! Redirecting to login...");
      
      // Sign out and redirect to home
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
      }, 2500);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strengthChecks = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase", met: /[A-Z]/.test(password) },
    { label: "Passwords match", met: password.length > 0 && password === confirmPassword },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg, #080C14)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      position: "relative",
      overflow: "hidden",
      color: "var(--text, #F1F5F9)",
    }}>
      {/* Background effects */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,170,.06) 0%,transparent 70%)", top: -200, right: -200, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,.04) 0%,transparent 70%)", bottom: -200, left: -200, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 440, zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #00D4AA, #00b896)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(0,212,170,.3)"
            }}>
              <Zap size={22} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "-.5px" }}>VaultPay</span>
          </div>
          <p style={{ color: "var(--text-muted, #64748b)", fontSize: 13 }}>Set your new password</p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-card, #0D1426)",
          borderRadius: 20,
          padding: 28,
          border: "1px solid var(--border, rgba(255,255,255,0.06))",
          boxShadow: "0 24px 60px rgba(0,0,0,.15)",
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: status === "success" ? "rgba(0,212,170,.1)" : "rgba(0,212,170,.1)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: 12,
            }}>
              {status === "success" ? (
                <CheckCircle2 size={28} color="#00D4AA" />
              ) : (
                <Lock size={28} color="#00D4AA" />
              )}
            </div>
            <h2 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20,
              marginBottom: 4,
            }}>
              {status === "success" ? "Password Updated!" : "Create New Password"}
            </h2>
            <p style={{ color: "var(--text-muted, #64748b)", fontSize: 13 }}>
              {status === "success"
                ? "You can now sign in with your new password"
                : "Your new password must be different from previous passwords"
              }
            </p>
          </div>

          {/* Status messages */}
          {message && (
            <div style={{
              marginBottom: 16, padding: "10px 14px",
              background: status === "success" ? "rgba(0,212,170,.1)" : "rgba(255,68,68,.1)",
              border: `1px solid ${status === "success" ? "rgba(0,212,170,.2)" : "rgba(255,68,68,.2)"}`,
              borderRadius: 10, display: "flex", alignItems: "center", gap: 8,
            }}>
              {status === "success" ? (
                <CheckCircle2 size={16} color="#00D4AA" />
              ) : (
                <AlertCircle size={16} color="#ff4444" />
              )}
              <p style={{
                color: status === "success" ? "#00D4AA" : "#ff4444",
                fontSize: 13, flex: 1,
              }}>{message}</p>
            </div>
          )}

          {status !== "success" && (
            <>
              {/* New Password Field */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: "var(--text-muted, #64748b)", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  New Password
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <span style={{ position: "absolute", left: 13, color: "var(--text-muted, #64748b)" }}>
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%", background: "var(--bg, #080C14)",
                      border: "1px solid var(--border, rgba(255,255,255,0.06))",
                      borderRadius: 10, padding: "12px 42px 12px 38px",
                      color: "var(--text, #F1F5F9)", fontSize: 14, outline: "none",
                    }}
                  />
                  <button onClick={() => setShowPass(!showPass)} style={{
                    position: "absolute", right: 13, background: "none", border: "none",
                    cursor: "pointer", color: "var(--text-muted, #64748b)", display: "flex",
                  }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", color: "var(--text-muted, #64748b)", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  Confirm Password
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <span style={{ position: "absolute", left: 13, color: "var(--text-muted, #64748b)" }}>
                    <Lock size={15} />
                  </span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: "100%", background: "var(--bg, #080C14)",
                      border: `1px solid ${password && confirmPassword && password !== confirmPassword ? "#ff444450" : "var(--border, rgba(255,255,255,0.06))"}`,
                      borderRadius: 10, padding: "12px 42px 12px 38px",
                      color: "var(--text, #F1F5F9)", fontSize: 14, outline: "none",
                    }}
                  />
                  <button onClick={() => setShowConfirm(!showConfirm)} style={{
                    position: "absolute", right: 13, background: "none", border: "none",
                    cursor: "pointer", color: "var(--text-muted, #64748b)", display: "flex",
                  }}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Password strength indicators */}
              <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                {strengthChecks.map((check, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      background: check.met ? "rgba(0,212,170,.15)" : "rgba(255,255,255,.05)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .2s",
                    }}>
                      {check.met && <CheckCircle2 size={12} color="#00D4AA" />}
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 500,
                      color: check.met ? "#00D4AA" : "var(--text-muted, #64748b)",
                      transition: "color .2s",
                    }}>{check.label}</span>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleReset}
                disabled={loading || !sessionReady}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: loading ? "var(--border, rgba(255,255,255,0.06))" : "linear-gradient(135deg, #00D4AA, #00b896)",
                  color: "#fff", fontWeight: 700, fontSize: 15,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  opacity: sessionReady ? 1 : 0.5,
                  transition: "all .2s",
                }}
              >
                {loading ? (
                  <div style={{
                    width: 20, height: 20, border: "2px solid rgba(255,255,255,.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "spin .6s linear infinite",
                  }} />
                ) : sessionReady ? (
                  "Update Password →"
                ) : (
                  "Verifying session..."
                )}
              </button>

              {!sessionReady && (
                <p style={{ color: "var(--text-muted, #64748b)", fontSize: 11, textAlign: "center", marginTop: 8 }}>
                  If you arrived here directly, please use the link from your email
                </p>
              )}
            </>
          )}

          {/* Footer */}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border, rgba(255,255,255,0.06))", textAlign: "center" }}>
            <a href="/" style={{
              color: "#00D4AA", fontSize: 13, fontWeight: 600,
              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <ArrowLeft size={14} /> Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
