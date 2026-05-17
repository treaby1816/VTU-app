"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Bell, Check, X, CheckCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Notification, VaultUser } from "@/lib/types";

const MAX_NOTIFICATIONS = 50;

export default function NotificationDropdown({ user }: { user: VaultUser }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch notifications + subscribe to real-time
  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel(`public:notifications:user_id=eq.${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
        setNotifications(prev => [payload.new as Notification, ...prev].slice(0, MAX_NOTIFICATIONS));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(MAX_NOTIFICATIONS);

    if (!error && data) {
      setNotifications(data as Notification[]);
    }
  };

  const markAsRead = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button 
        onClick={() => setOpen(!open)} 
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", width: 36, height: 36, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)", position: "relative" }}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{ position: "absolute", top: -5, right: -5, background: "#ff4444", color: "#fff", fontSize: 10, fontWeight: 700, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", top: "120%", right: 0, width: 320, background: "#0D1426", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,.5)", zIndex: 1000, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Notifications</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, padding: 0 }}
                  title="Mark all as read"
                >
                  <CheckCheck size={14} /> Mark All
                </button>
              )}
              <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600 }}>{unreadCount} Unread</span>
            </div>
          </div>

          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center", padding: 20 }}>No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.03)", background: n.read ? "transparent" : "rgba(0,212,170,.03)", display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: 13, fontWeight: 700, color: n.read ? "var(--text-muted)" : "var(--text)" }}>{n.title}</h5>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{n.message}</p>
                    <p style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                    {!n.read && (
                      <button onClick={() => markAsRead(n.id)} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", padding: 2 }} title="Mark as read">
                        <Check size={14} />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(n.id)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 2 }} title="Delete">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
