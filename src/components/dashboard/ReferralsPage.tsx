"use client";

import React, { useState, useEffect } from "react";
import { Users, Copy, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fmtN } from "@/lib/utils";

export default function ReferralsPage({ user }: { user: any }) {
  const [referralCode, setReferralCode] = useState("");
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, [user?.id]);

  const fetchReferralData = async () => {
    setLoading(true);
    
    // 1. Fetch or generate referral code
    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", user?.id)
      .maybeSingle();

    if (profile?.referral_code) {
      setReferralCode(profile.referral_code);
    } else if (user?.id) {
      // Generate code if missing
      const code = user.id.slice(0, 8).toUpperCase();
      await supabase
        .from("profiles")
        .update({ referral_code: code })
        .eq("id", user.id);
      setReferralCode(code);
    }

    // 2. Fetch rewards
    const { data: rewardsData } = await supabase
      .from("referral_rewards")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (rewardsData) {
      setRewards(rewardsData);
    }
    
    setLoading(false);
  };

  const handleCopy = () => {
    const link = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEarned = rewards.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fade-up" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text)" }}>Refer & Earn</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Invite your friends and earn on every transaction they make!</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(0,212,170,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={18} color="var(--primary)" />
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>TOTAL EARNED</span>
          </div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>{fmtN(totalEarned)}</h2>
        </div>

        <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(59,130,246,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={18} color="#3B82F6" />
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>TOTAL REFERRALS</span>
          </div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>{rewards.length}</h2>
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: 24, border: "1px solid var(--border)", marginBottom: 24 }}>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Your Referral Link</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>Share this link with your friends. When they sign up, you'll earn 0.5% on their airtime purchases and 1% on data purchases!</p>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input 
            type="text" 
            value={referralCode ? `${window.location.origin}/signup?ref=${referralCode}` : "Loading..."} 
            readOnly 
            style={{ flex: 1, padding: 14, borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", outline: "none", fontSize: 13 }} 
          />
          <button 
            onClick={handleCopy} 
            style={{ padding: "14px 24px", borderRadius: 12, border: "none", background: copied ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg,var(--primary),var(--primary-hover))", color: copied ? "#10b981" : "#000", fontWeight: 700, cursor: "pointer", transition: "all .2s" }}
          >
            {copied ? "Copied! ✓" : "Copy Link"}
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Recent Rewards</h3>
        
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>Loading rewards...</p>
        ) : rewards.length === 0 ? (
          <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 30, textAlign: "center", border: "1px solid var(--border)" }}>
            <Award size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No rewards earned yet.</p>
            <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>Share your link to start earning!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rewards.map((r) => (
              <div key={r.id} style={{ background: "var(--bg-card)", borderRadius: 12, padding: 14, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", textTransform: "capitalize" }}>{r.service_type} Reward</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <span style={{ color: "var(--primary)", fontWeight: 700, fontSize: 14 }}>+{fmtN(r.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
