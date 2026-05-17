"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Medal, Star, Shield } from "lucide-react";
import { fmtN } from "@/lib/utils";

export default function LeaderboardPage({ user }: { user: any }) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vtu/leaderboard");
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    }
    setLoading(false);
  };

  const getRank = (spend: number) => {
    if (spend >= 200000) return { name: "Platinum", color: "#E5E7EB", icon: <Shield size={16} color="#E5E7EB" /> };
    if (spend >= 50000) return { name: "Gold", color: "#F59E0B", icon: <Star size={16} color="#F59E0B" /> };
    if (spend >= 10000) return { name: "Silver", color: "#94A3B8", icon: <Medal size={16} color="#94A3B8" /> };
    return { name: "Bronze", color: "#B45309", icon: <Trophy size={16} color="#B45309" /> };
  };

  return (
    <div className="fade-up" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text)" }}>Top Spenders</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>See where you stand among top users. Keep transacting to rank up!</p>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 40 }}>Loading leaderboard...</p>
      ) : leaderboard.length === 0 ? (
        <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: 40, textAlign: "center", border: "1px solid var(--border)" }}>
          <Trophy size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No data available yet.</p>
        </div>
      ) : (
        <div style={{ background: "var(--bg-card)", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden" }}>
          {leaderboard.map((item, index) => {
            const isMe = item.user_id === user?.id;
            const rank = getRank(item.total_spend);
            const maskedId = `User...${item.user_id.slice(-4)}`;

            return (
              <div key={item.user_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: index === leaderboard.length - 1 ? "none" : "1px solid var(--border)", background: isMe ? "rgba(0,212,170,.05)" : "transparent" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: index === 0 ? "#F59E0B" : index === 1 ? "#94A3B8" : index === 2 ? "#B45309" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: index < 3 ? "#000" : "var(--text-muted)" }}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: isMe ? "var(--primary)" : "var(--text)" }}>
                      {isMe ? "You" : maskedId}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      {rank.icon}
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{rank.name}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{fmtN(item.total_spend)}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Total Spend</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
