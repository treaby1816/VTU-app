"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  // Support WhatsApp Number
  const SUPPORT_NUMBER = "2349071066072";
  const defaultMessage = "Hello VaultPay Support, I need help with my account.";

  useEffect(() => {
    let typeTimer: NodeJS.Timeout;
    let msgTimer: NodeJS.Timeout;
    
    if (isOpen) {
      setIsTyping(true);
      setShowMessage(false);
      
      // Simulate "Agent is typing..." for 1.5 seconds
      typeTimer = setTimeout(() => {
        setIsTyping(false);
        setShowMessage(true);
      }, 1500);
    }

    return () => {
      clearTimeout(typeTimer);
    };
  }, [isOpen]);

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 10000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
      {/* Chat Window */}
      {isOpen && (
        <div style={{ 
          width: 320, 
          background: "var(--bg)", 
          borderRadius: 24,
          border: "1px solid var(--border)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(37,211,102,0.1)",
          overflow: "hidden",
          animation: "fadeUp 0.3s ease",
          transformOrigin: "bottom right"
        }}>
          {/* Header */}
          <div style={{ 
            background: "#25D366", // WhatsApp Green
            padding: "16px 20px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src="/images/logo.png" alt="Support" style={{ width: 24, height: 24, objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <MessageCircle size={20} color="#25D366" style={{ position: "absolute", opacity: 0.5 }} />
                </div>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: "#fff", borderRadius: "50%", border: "2px solid #25D366" }} />
              </div>
              <div>
                <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 16, margin: 0 }}>Support Agent</h3>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 600, margin: 0 }}>Typically replies instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.8, transition: "opacity 0.2s" }} onMouseOver={e => e.currentTarget.style.opacity = "1"} onMouseOut={e => e.currentTarget.style.opacity = "0.8"}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ padding: 20, background: "var(--bg-card)", minHeight: 120 }}>
            {isTyping ? (
              <div style={{ display: "flex", gap: 10, alignSelf: "flex-start", maxWidth: "85%" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MessageCircle size={14} color="#fff" />
                </div>
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", padding: "12px 16px", borderRadius: 16, borderTopLeftRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <div className="dot-flashing" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animationDelay: "0s" }} />
                  <div className="dot-flashing" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animationDelay: "0.2s" }} />
                  <div className="dot-flashing" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animationDelay: "0.4s" }} />
                </div>
              </div>
            ) : showMessage ? (
              <div style={{ display: "flex", gap: 10, alignSelf: "flex-start", maxWidth: "90%", animation: "fadeUp 0.3s ease" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MessageCircle size={14} color="#fff" />
                </div>
                <div style={{ 
                  background: "var(--bg)", 
                  border: "1px solid var(--border)", 
                  padding: "12px 16px", 
                  borderRadius: 16, 
                  borderTopLeftRadius: 4,
                  color: "var(--text)",
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  Hi there! 👋 Welcome to VaultPay. How can I help you today?
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right", marginTop: 4 }}>Just now</div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Input Area / Call to Action */}
          <div style={{ padding: 16, borderTop: "1px solid var(--border)", background: "var(--bg)", textAlign: "center" }}>
             <button 
                onClick={handleOpenWhatsApp}
                style={{ 
                  width: "100%", 
                  padding: "14px 20px", 
                  borderRadius: 24, 
                  background: "#25D366", 
                  border: "none", 
                  color: "#fff", 
                  fontWeight: 700, 
                  fontSize: 14, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: 8,
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(37,211,102,0.3)"
                }}
              >
                <Send size={16} color="#fff" /> Start Chat on WhatsApp
              </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          className="zoom-slow"
          style={{ 
            width: 64, height: 64, borderRadius: "50%", 
            background: "#25D366", 
            boxShadow: "0 10px 30px rgba(37,211,102,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", border: "2px solid rgba(255,255,255,0.2)",
            position: "relative"
          }}
        >
          <MessageCircle size={32} color="#fff" />
          {/* Notification dot */}
          <div style={{ position: "absolute", top: 0, right: 0, width: 16, height: 16, background: "#ff4444", borderRadius: "50%", border: "2px solid var(--bg)" }} />
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dot-flashing {
          animation: dotFlashing 1s infinite linear alternate;
        }
        @keyframes dotFlashing {
          0% { background-color: var(--text-muted); }
          50%, 100% { background-color: rgba(255,255,255,0.1); }
        }
      ` }} />
    </div>
  );
}
