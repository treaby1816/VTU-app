"use client";

import React, { useState, useEffect } from "react";
import { Zap, ChevronRight, Star } from "lucide-react";

export default function WelcomeScreen({ onGetStarted, onLogin, isMobile }: any) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { title: "Instant Top-Up", desc: "Recharge airtime and data for any network in seconds.", image: "/images/welcome1.png" },
    { title: "All Networks", desc: "MTN, Airtel, Glo, 9mobile — every major network supported.", image: "/images/welcome2.jpg" },
    { title: "Fund Your Wallet", desc: "Add money instantly via card, transfer, or USSD.", image: "/images/welcome3.jpg" },
    { title: "Track Everything", desc: "Full transaction history with real-time status updates.", image: "/images/welcome4.jpg" },
  ];

  useEffect(() => {
    const iv = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(iv);
  }, [slides.length]);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>

      {/* Full-screen background image */}
      {slides.map((s, i) => (
        <div key={i} style={{
          position: "absolute", inset: 0,
          opacity: slide === i ? 1 : 0,
          transition: "opacity 1.2s ease-in-out",
          zIndex: 0
        }}>
          <img
            src={s.image} alt={s.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ))}

      {/* Dark gradient overlay — bottom-heavy for text readability */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0.95) 100%)"
      }} />

      {/* Content layer */}
      <div style={{
        position: "relative", zIndex: 2,
        height: "100%", display: "flex", flexDirection: "column"
      }}>

        {/* Top — Logo */}
        <div style={{
          padding: isMobile ? "20px 20px" : "28px 32px",
          display: "flex", alignItems: "center", gap: 10
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "rgba(0,212,170,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)"
          }}>
            <Zap size={18} color="#000" fill="#000" />
          </div>
          <span style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18,
            color: "#fff", letterSpacing: -0.5,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)"
          }}>VaultPay</span>
        </div>

        {/* Spacer — pushes content to bottom */}
        <div style={{ flex: 1 }} />

        {/* Bottom content — Text + Dots + Buttons */}
        <div style={{
          padding: isMobile ? "0 24px 28px" : "0 40px 48px",
          maxWidth: 480, width: "100%",
          margin: isMobile ? "0" : "0 auto"
        }}>
          {/* Slide text */}
          <div key={slide} className="fade-up" style={{ marginBottom: isMobile ? 20 : 28 }}>
            <h2 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800,
              fontSize: isMobile ? 30 : 40,
              color: "#fff", marginBottom: 10,
              lineHeight: 1.05, letterSpacing: "-1px",
              textShadow: "0 4px 20px rgba(0,0,0,0.6)"
            }}>
              {slides[slide].title}
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: isMobile ? 15 : 17,
              lineHeight: 1.5, maxWidth: 340,
              textShadow: "0 2px 10px rgba(0,0,0,0.5)"
            }}>
              {slides[slide].desc}
            </p>
          </div>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: isMobile ? 24 : 32 }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => setSlide(i)} style={{
                width: slide === i ? 28 : 8, height: 8, borderRadius: 4,
                background: slide === i ? "#00D4AA" : "rgba(255,255,255,0.3)",
                cursor: "pointer", transition: "all 0.3s"
              }} />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={onGetStarted} style={{
              width: "100%", padding: "16px 0", borderRadius: 16, border: "none",
              background: "linear-gradient(135deg,#00D4AA,#00b896)",
              color: "#000", fontWeight: 700, fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 10px 30px rgba(0,212,170,0.3)"
            }}>
              Get Started <ChevronRight size={18} />
            </button>
            <button onClick={onLogin} style={{
              width: "100%", padding: "16px 0", borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)",
              color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer"
            }}>
              I already have an account
            </button>
          </div>

          {/* Trust */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, marginTop: 16, opacity: 0.5
          }}>
            <Star size={12} color="#00D4AA" fill="#00D4AA" />
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>
              TRUSTED BY 10,000+ USERS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
