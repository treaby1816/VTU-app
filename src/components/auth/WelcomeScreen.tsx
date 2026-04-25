"use client";

import React, { useState, useEffect } from "react";
import { Zap, ChevronRight, Star } from "lucide-react";

export default function WelcomeScreen({ onGetStarted, onLogin, isMobile }: any) {
  const [slide, setSlide] = useState(0);
  const slides = [
    {
      title: "Instant Top-Up",
      desc: "Recharge airtime and data for any network in seconds.",
      image: "/images/welcome1.png",
      color: "#00D4AA"
    },
    {
      title: "All Networks",
      desc: "MTN, Airtel, Glo, 9mobile — we support every major network.",
      image: "/images/welcome2.jpg",
      color: "#3B82F6"
    },
    {
      title: "Fund Your Wallet",
      desc: "Add money instantly via card, transfer, or USSD.",
      image: "/images/welcome3.jpg",
      color: "#F59E0B"
    },
    {
      title: "Track Everything",
      desc: "Full transaction history with real-time status updates.",
      image: "/images/welcome4.jpg",
      color: "#8B5CF6"
    }
  ];

  useEffect(() => {
    const iv = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(iv);
  }, [slides.length]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--bg)",
      display: "flex", flexDirection: "column", overflow: "hidden"
    }}>
      {/* Background Glow */}
      <div style={{
        position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
        width: 500, height: 500,
        background: `radial-gradient(circle, ${slides[slide].color}15 0%, transparent 70%)`,
        transition: "background 1.5s ease", filter: "blur(40px)"
      }} />

      {/* Top Bar — Logo */}
      <div style={{
        padding: isMobile ? "16px 20px" : "24px 32px",
        display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 5
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: slides[slide].color,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 1s ease"
        }}>
          <Zap size={18} color="#000" fill="#000" />
        </div>
        <span style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18,
          color: "var(--text)", letterSpacing: -0.5
        }}>VaultPay</span>
      </div>

      {/* Middle — Carousel (flex: 1 so it takes remaining space) */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: isMobile ? "0 20px" : "0 32px",
        textAlign: "center", minHeight: 0, overflow: "hidden"
      }}>
        <div key={slide} className="fade-up" style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          width: "100%", maxWidth: 400
        }}>
          {/* Image — constrained to available space */}
          <div style={{
            width: isMobile ? "60vw" : 240,
            height: isMobile ? "40vh" : 300,
            maxHeight: isMobile ? 280 : 340,
            borderRadius: 24, overflow: "hidden",
            border: "1px solid var(--border)",
            boxShadow: `0 30px 60px rgba(0,0,0,0.3), 0 0 30px ${slides[slide].color}15`,
            marginBottom: isMobile ? 16 : 24,
            background: "var(--bg-card)", flexShrink: 0
          }}>
            <img
              src={slides[slide].image}
              alt={slides[slide].title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              className="zoom-slow"
            />
          </div>

          {/* Text */}
          <h2 style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: isMobile ? 24 : 32,
            color: "var(--text)", marginBottom: 8,
            lineHeight: 1.1, letterSpacing: "-.5px"
          }}>
            {slides[slide].title}
          </h2>
          <p style={{
            color: "var(--text-muted)", fontSize: isMobile ? 14 : 16,
            lineHeight: 1.5, maxWidth: 300, margin: "0 auto"
          }}>
            {slides[slide].desc}
          </p>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: isMobile ? 16 : 24 }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => setSlide(i)} style={{
                width: slide === i ? 24 : 8, height: 8, borderRadius: 4,
                background: slide === i ? slides[i].color : "var(--border)",
                cursor: "pointer", transition: "all 0.3s"
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom — Buttons (always visible, pinned to bottom) */}
      <div style={{
        padding: isMobile ? "12px 20px 24px" : "16px 32px 40px",
        display: "flex", flexDirection: "column", gap: 10,
        width: "100%", maxWidth: 440, margin: "0 auto",
        position: "relative", zIndex: 10, flexShrink: 0
      }}>
        <button onClick={onGetStarted} style={{
          width: "100%", padding: isMobile ? "14px 0" : "16px 0",
          borderRadius: 16, border: "none",
          background: "linear-gradient(135deg,var(--primary),var(--primary-hover))",
          color: "#000", fontWeight: 700, fontSize: 15, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 10px 20px rgba(0,212,170,0.2)"
        }}>
          Get Started <ChevronRight size={18} />
        </button>
        <button onClick={onLogin} style={{
          width: "100%", padding: isMobile ? "14px 0" : "16px 0",
          borderRadius: 16, border: "1px solid var(--border)",
          background: "transparent", color: "var(--text)",
          fontWeight: 600, fontSize: 14, cursor: "pointer"
        }}>
          I already have an account
        </button>

        {/* Trust Badge */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, marginTop: 8, opacity: 0.5
        }}>
          <Star size={12} color="var(--accent)" fill="var(--accent)" />
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>
            TRUSTED BY 10,000+ USERS
          </span>
        </div>
      </div>
    </div>
  );
}
