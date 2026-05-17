"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User, Phone, Lock, Save, Shield, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { VaultUser } from "@/lib/types";

interface SettingsPageProps {
  user: VaultUser;
  isMobile: boolean;
}

export default function SettingsPage({ user, isMobile }: SettingsPageProps) {
  const [loading, setLoading] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [resetAnswer, setResetAnswer] = useState("");
  const [newPin, setNewPin] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    pin: "",
    question: "",
    answer: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Enforce numeric-only for PIN fields
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setForm({ ...form, pin: value });
  };

  const handleNewPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setNewPin(value);
  };

  const handleUpdatePin = async () => {
    if (form.pin.length !== 4) {
      setMessage({ type: "error", text: "PIN must be exactly 4 digits." });
      return;
    }
    if (!/^\d{4}$/.test(form.pin)) {
      setMessage({ type: "error", text: "PIN must contain only numbers." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ transaction_pin: form.pin })
        .eq("id", user.id);

      if (error) throw error;
      setMessage({ type: "success", text: "Transaction PIN updated successfully!" });
      setForm((prev) => ({ ...prev, pin: "" }));
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update PIN." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSecurityQuestions = async () => {
    if (!form.question || !form.answer) {
      setMessage({ type: "error", text: "Please select a question and provide an answer." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          security_questions: [
            { question: form.question, answer: form.answer.toLowerCase().trim() },
          ],
        })
        .eq("id", user.id);

      if (error) throw error;
      setMessage({ type: "success", text: "Security questions updated successfully!" });
      setForm((prev) => ({ ...prev, question: "", answer: "" }));
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update security questions." });
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityQuestion = useCallback(async () => {
    setLoadingQuestion(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("security_questions")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data && data.security_questions && data.security_questions.length > 0) {
        setSecurityQuestion(data.security_questions[0].question);
      } else {
        setSecurityQuestion("No security question set. Please set one below.");
      }
    } finally {
      setLoadingQuestion(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (resetModalOpen) {
      fetchSecurityQuestion();
    }
  }, [resetModalOpen, fetchSecurityQuestion]);

  const handleResetPin = async () => {
    if (!resetAnswer || newPin.length !== 4) {
      setMessage({ type: "error", text: "Please provide the answer and a new 4-digit PIN." });
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setMessage({ type: "error", text: "New PIN must contain only numbers." });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc(
        "verify_security_question_and_reset_pin",
        {
          p_user_id: user.id,
          p_answer: resetAnswer,
          p_new_pin: newPin,
        }
      );

      if (error) throw error;

      if (data === true) {
        setMessage({ type: "success", text: "PIN reset successfully!" });
        setResetModalOpen(false);
        setResetAnswer("");
        setNewPin("");
      } else {
        setMessage({ type: "error", text: "Incorrect answer to security question." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to reset PIN." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: form.name,
          phone: form.phone,
        },
      });
      if (error) throw error;

      // Update local profiles table if needed
      await supabase.from("profiles").update({ full_name: form.name }).eq("id", user.id);

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!form.newPassword) return;
    if (form.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: form.newPassword,
      });
      if (error) throw error;
      setMessage({ type: "success", text: "Password updated successfully!" });
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: isMobile ? 22 : 26, color: "var(--text)" }}>Account Settings</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Manage your profile and security preferences.</p>
      </div>

      {message && (
        <div style={{ padding: "12px 16px", borderRadius: 12, marginBottom: 20, background: message.type === "success" ? "rgba(0,212,170,.1)" : "rgba(255,68,68,.1)", color: message.type === "success" ? "var(--primary)" : "#ff4444", fontSize: 14, fontWeight: 600, border: `1px solid ${message.type === "success" ? "rgba(0,212,170,.2)" : "rgba(255,68,68,.2)"}` }}>
          {message.text}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Profile Settings */}
        <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: isMobile ? 20 : 32, border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <User size={20} color="var(--primary)" /> Profile Information
          </h2>

          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Email Address</label>
              <input type="text" value={user?.email || ""} disabled style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-muted)", cursor: "not-allowed" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted)" }} />
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" style={{ width: "100%", padding: "14px 14px 14px 40px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Phone Number</label>
              <div style={{ position: "relative" }}>
                <Phone size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted)" }} />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="08012345678" style={{ width: "100%", padding: "14px 14px 14px 40px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }} />
              </div>
            </div>

            <button onClick={handleUpdateProfile} disabled={loading} style={{ marginTop: 8, padding: "14px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,var(--primary),var(--primary-hover))", color: "#000", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, alignSelf: "flex-start" }}>
              <Save size={18} /> {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: isMobile ? 20 : 32, border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={20} color="var(--primary)" /> Security
          </h2>

          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>New Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted)" }} />
                <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="Leave blank to keep current" style={{ width: "100%", padding: "14px 14px 14px 40px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }} />
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>Minimum 8 characters required.</p>
            </div>

            <button onClick={handleUpdatePassword} disabled={loading || !form.newPassword} style={{ marginTop: 8, padding: "14px 24px", borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontWeight: 700, cursor: (loading || !form.newPassword) ? "not-allowed" : "pointer", alignSelf: "flex-start", opacity: form.newPassword ? 1 : 0.5 }}>
              Update Password
            </button>
          </div>
        </div>

        {/* Transaction PIN Settings */}
        <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: isMobile ? 20 : 32, border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={20} color="var(--primary)" /> Transaction PIN
          </h2>

          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>{user?.hasPin ? "Change PIN" : "Set 4-Digit PIN"}</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-muted)" }} />
                <input
                  type="password"
                  name="pin"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={form.pin}
                  onChange={handlePinChange}
                  placeholder="****"
                  style={{ width: "100%", padding: "14px 14px 14px 40px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }}
                />
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>This PIN will be required for all airtime and data purchases.</p>
              {user?.hasPin && (
                <button onClick={() => setResetModalOpen(true)} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 11, cursor: "pointer", marginTop: 4, padding: 0 }}>Forgot PIN?</button>
              )}
            </div>

            <button onClick={handleUpdatePin} disabled={loading || form.pin.length !== 4} style={{ marginTop: 8, padding: "14px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,var(--primary),var(--primary-hover))", color: "#000", fontWeight: 700, cursor: (loading || form.pin.length !== 4) ? "not-allowed" : "pointer", alignSelf: "flex-start", opacity: form.pin.length === 4 ? 1 : 0.5 }}>
              {user?.hasPin ? "Update PIN" : "Set PIN"}
            </button>
          </div>
        </div>

        {/* Security Questions Settings */}
        <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: isMobile ? 20 : 32, border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={20} color="var(--primary)" /> Security Questions
          </h2>

          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Select a Question</label>
              <select name="question" value={form.question} onChange={handleChange} style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }}>
                <option value="">Select a question...</option>
                <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                <option value="What city were you born in?">What city were you born in?</option>
                <option value="What is your mother's maiden name?">What is your mother&apos;s maiden name?</option>
                <option value="What was the name of your first school?">What was the name of your first school?</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Your Answer</label>
              <input type="text" name="answer" value={form.answer} onChange={handleChange} placeholder="Your answer" style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }} />
              <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>Answers are case-insensitive and trimmed of whitespace.</p>
            </div>

            <button onClick={handleUpdateSecurityQuestions} disabled={loading || !form.question || !form.answer} style={{ marginTop: 8, padding: "14px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,var(--primary),var(--primary-hover))", color: "#000", fontWeight: 700, cursor: (loading || !form.question || !form.answer) ? "not-allowed" : "pointer", alignSelf: "flex-start", opacity: form.question && form.answer ? 1 : 0.5 }}>
              Save Questions
            </button>
          </div>
        </div>

        {/* Reset PIN Modal */}
        {resetModalOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
            <div style={{ background: "#0D1426", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 32, maxWidth: 400, width: "100%", position: "relative" }}>
              <button onClick={() => setResetModalOpen(false)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={20} /></button>

              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Reset Transaction PIN</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Answer your security question to set a new PIN.</p>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Question</label>
                {loadingQuestion ? (
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading...</p>
                ) : (
                  <p style={{ color: "var(--text)", fontSize: 14, fontWeight: 600 }}>{securityQuestion}</p>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Your Answer</label>
                <input type="text" value={resetAnswer} onChange={(e) => setResetAnswer(e.target.value)} placeholder="Your answer" style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>New 4-Digit PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={newPin}
                  onChange={handleNewPinChange}
                  placeholder="****"
                  style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none" }}
                />
              </div>

              <button onClick={handleResetPin} disabled={loading || loadingQuestion || !resetAnswer || newPin.length !== 4} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: "linear-gradient(135deg,var(--primary),var(--primary-hover))", color: "#000", fontWeight: 700, cursor: (loading || loadingQuestion || !resetAnswer || newPin.length !== 4) ? "not-allowed" : "pointer", opacity: resetAnswer && newPin.length === 4 ? 1 : 0.5 }}>
                {loading ? "Resetting..." : "Reset PIN"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
