"use client";

import React, { useState, useEffect } from "react";
import { Zap, ChevronRight, Star } from "lucide-react";

export default function WelcomeScreen({ onGetStarted, onLogin, isMobile }: any) {
  const [slide, setSlide] = useState(0);
  const slides = [
    {
      title: "Fastest VTU Delivery",
      desc: "Buy airtime and data in seconds with 99.9% uptime guaranteed.",
      image: "/images/welcome1.png",
      color: "#00D4AA"
    },
    {
      title: "Secure Wallet System",
      desc: "Fund your wallet instantly via multiple channels and track every Kobo.",
      image: "/images/welcome2.jpg",
      color: "#3B82F6"
    },
    {
      title: "Affordable Pricing",
      desc: "Get the best rates on all networks. Save more on every transaction.",
      image: "/images/welcome3.jpg",
      color: "#F59E0B"
    },
    {
      title: "Built for Everyone",
      desc: "Seamless experience for both mobile and desktop users.",
      image: "/images/welcome4.jpg",
      color: "#a78bfa"
    }
  ];

  useEffect(() => {
    const iv = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(iv);
  }, [slides.length]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Background Glow */}
      <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: `radial-gradient(circle, ${slides[slide].color}10 0%, transparent 70%)`, transition: "background 1.5s ease", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, background: `radial-gradient(circle, ${slides[slide].color}05 0%, transparent 70%)`, transition: "background 1.5s ease", filter: "blur(40px)" }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        {/* Animated Carousel */}
        <div style={{ width: "100%", maxWidth: 440, position: "relative", marginBottom: 32 }}>
          <div key={slide} className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: isMobile ? "min(300px, 75vw)" : 300, aspectRatio: "9/14", borderRadius: 32, overflow: "hidden", border: "1px solid var(--border)", boxShadow: `0 40px 100px rgba(0,0,0,0.4), 0 0 40px ${slides[slide].color}15`, marginBottom: 32, position: "relative", background: "var(--bg-card)" }}>
              <img src={slides[slide].image} alt={slides[slide].title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 10s linear" }} className="zoom-slow" />
            </div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: isMobile ? 28 : 34, color: "var(--text)", marginBottom: 12, lineHeight: 1.1, letterSpacing: "-.5px" }}>{slides[slide].title}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.5, maxWidth: 320 }}>{slides[slide].desc}</p>
          </div>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => setSlide(i)} style={{ width: slide === i ? 24 : 8, height: 8, borderRadius: 4, background: slide === i ? slides[i].color : "var(--border)", cursor: "pointer", transition: "all 0.3s" }} />
            ))}
          </div>
        </div>

        {/* Logo and Brand */}
        <div style={{ position: "absolute", top: isMobile ? 40 : 60, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: slides[slide].color, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 1s ease" }}>
            <Zap size={18} color="#000" fill="#000" />
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--text)", letterSpacing: -0.5 }}>VaultPay</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 440, margin: "0 auto 40px" }}>
        <button onClick={onGetStarted} style={{ width: "100%", padding: "16px 0", borderRadius: 16, border: "none", background: "linear-gradient(135deg,var(--primary),var(--primary-hover))", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Get Started <ChevronRight size={18} />
        </button>
        <button onClick={onLogin} style={{ width: "100%", padding: "16px 0", borderRadius: 16, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
          I already have an account
        </button>
      </div>

      {/* Floating Trust Indicator */}
      <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 6, opacity: 0.5 }}>
        <Star size={12} color="var(--accent)" fill="var(--accent)" />
        <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>TRUSTED BY 10,000+ USERS</span>
      </div>
    </div>
  );
}
