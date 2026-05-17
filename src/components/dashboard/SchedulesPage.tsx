"use client";

import React, { useState, useEffect } from "react";
import { Clock, Pause, Play, Trash2, Wifi, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fmtN } from "@/lib/utils";

export default function SchedulesPage({ user }: { user: any }) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, [user?.id]);

  const fetchSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSchedules(data);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("schedules")
      .update({ status })
      .eq("id", id);

    if (!error) {
      setSchedules(schedules.map(s => s.id === id ? { ...s, status } : s));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", id);

    if (!error) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  return (
    <div className="fade-up" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text)" }}>Scheduled Recharges</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Manage your automated airtime and data purchases.</p>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 40 }}>Loading schedules...</p>
      ) : schedules.length === 0 ? (
        <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: 40, textAlign: "center", border: "1px solid var(--border)" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.05)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Clock size={24} color="var(--text-muted)" />
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>You don't have any scheduled recharges yet.</p>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>You can schedule a recharge when buying airtime or data.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {schedules.map((s) => (
            <div key={s.id} style={{ background: "var(--bg-card)", borderRadius: 16, padding: 16, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.service_type === "airtime" ? "rgba(0,212,170,.1)" : "rgba(59,130,246,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {s.service_type === "airtime" ? <Phone size={18} color="var(--primary)" /> : <Wifi size={18} color="#3B82F6" />}
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", textTransform: "capitalize" }}>{s.network} {s.service_type}</h4>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.phone} • {fmtN(s.amount)}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    Frequency: <span style={{ color: "var(--text)", fontWeight: 600, textTransform: "capitalize" }}>{s.frequency}</span> | 
                    Next Run: <span style={{ color: "var(--text)", fontWeight: 600 }}>{new Date(s.next_run).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: s.status === "active" ? "rgba(0,212,170,.1)" : "rgba(244,63,94,.1)", color: s.status === "active" ? "var(--primary)" : "#f43f5e", textTransform: "uppercase" }}>
                  {s.status}
                </span>
                
                {s.status === "active" ? (
                  <button onClick={() => handleUpdateStatus(s.id, "paused")} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.05)", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Pause">
                    <Pause size={14} />
                  </button>
                ) : (
                  <button onClick={() => handleUpdateStatus(s.id, "active")} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(0,212,170,.1)", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Resume">
                    <Play size={14} />
                  </button>
                )}

                <button onClick={() => handleDelete(s.id)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(244,63,94,.1)", color: "#f43f5e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
