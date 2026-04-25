"use client";

import React, { useState } from "react";
import { User, Phone, Lock, Save, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage({ user, isMobile }: { user: any, isMobile: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || "",
    phone: user?.user_metadata?.phone || "",
    currentPassword: "",
    newPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: form.name,
          phone: form.phone,
        }
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
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: form.newPassword
      });
      if (error) throw error;
      setMessage({ type: "success", text: "Password updated successfully!" });
      setForm(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
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
            </div>

            <button onClick={handleUpdatePassword} disabled={loading || !form.newPassword} style={{ marginTop: 8, padding: "14px 24px", borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontWeight: 700, cursor: (loading || !form.newPassword) ? "not-allowed" : "pointer", alignSelf: "flex-start", opacity: form.newPassword ? 1 : 0.5 }}>
              Update Password
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
