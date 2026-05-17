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

  const [isAIChatOpen, setIsAIChatOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: any) => setIsAIChatOpen(e.detail);
    window.addEventListener('ai-chat-open', handler);
    return () => window.removeEventListener('ai-chat-open', handler);
  }, []);

  if (isAIChatOpen) return null;

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
    >
      <MessageCircle size={32} color="#fff" />
      {/* Custom Tooltip */}
      <div className="wa-tooltip">Chat with us on WhatsApp</div>

      <style dangerouslySetInnerHTML={{ __html: `
        .wa-tooltip {
          position: absolute;
          right: 80px;
          top: 50%;
          transform: translateY(-50%) scale(0.9);
          background: #111827;
          color: #fff;
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .zoom-slow:hover .wa-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%) scale(1);
        }
        .wa-tooltip::after {
          content: "";
          position: absolute;
          top: 50%;
          right: -5px;
          transform: translateY(-50%);
          border-width: 6px 0 6px 6px;
          border-style: solid;
          border-color: transparent transparent transparent #111827;
        }
      `}} />
    </div>
  );
}
