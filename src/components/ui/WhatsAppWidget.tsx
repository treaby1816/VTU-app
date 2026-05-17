"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppWidget() {
  const SUPPORT_NUMBER = "2348065136221";
  const defaultMessage = "Hello VaultPay Support, I need help with my account.";

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <div 
      onClick={handleOpenWhatsApp}
      className="zoom-slow"
      style={{ 
        position: "fixed", 
        bottom: 104, // Positioned slightly above the AI Chatbot (which is at bottom: 24, height: 64, so 24+64+16=104)
        right: 24, 
        zIndex: 10000,
        width: 64, height: 64, borderRadius: "50%", 
        background: "#25D366", 
        boxShadow: "0 10px 30px rgba(37,211,102,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", border: "2px solid rgba(255,255,255,0.2)"
      }}
      title="Chat with Support on WhatsApp"
    >
      <MessageCircle size={32} color="#fff" />
    </div>
  );
}
