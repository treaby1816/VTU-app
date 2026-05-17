"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Zap, Wifi } from "lucide-react"

interface CosmicNebulaMastercardProps {
  cardholderName?: string
  className?: string
  theme?: {
    primaryColor?: string
    secondaryColor?: string
    glowColor?: string
  }
  logoText?: {
    topText?: string
    bottomText?: string
  }
  height?: string | number
  width?: string | number
}

const CosmicNebulaMastercard: React.FC<CosmicNebulaMastercardProps> = ({
  cardholderName = "CARDHOLDER NAME",
  className = "",
  theme = {
    primaryColor: "#00D4AA",
    secondaryColor: "#0D1426",
    glowColor: "rgba(0, 212, 170, 0.4)",
  },
  logoText = { topText: "VAULT", bottomText: "PAY" },
  height = "240px",
  width = "380px",
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const mousePos = useRef({ x: 0, y: 0 })
  const frameRef = useRef<number>()

  // Lerp value states for seamless, physics-based movement transitions
  const currentRotX = useRef(0)
  const currentRotY = useRef(0)
  const currentScale = useRef(1)

  useEffect(() => {
    let startTime = Date.now()

    const updateCard = () => {
      if (!cardRef.current) {
        frameRef.current = requestAnimationFrame(updateCard)
        return
      }

      let targetRotX = 0
      let targetRotY = 0
      let targetScale = 1

      if (isHovered) {
        const rect = cardRef.current.getBoundingClientRect()
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        
        targetRotX = (mousePos.current.y - centerY) / 8
        targetRotY = -(mousePos.current.x - centerX) / 8
        targetScale = 1.05
      } else {
        // Gentle cosmic 3D floating animation when not hovered
        const time = (Date.now() - startTime) / 1000
        targetRotX = Math.sin(time * 0.8) * 8
        targetRotY = Math.cos(time * 0.6) * 12
        targetScale = 1.0
      }

      // Physics interpolation (lerp)
      const lerpFactor = 0.08
      currentRotX.current += (targetRotX - currentRotX.current) * lerpFactor
      currentRotY.current += (targetRotY - currentRotY.current) * lerpFactor
      currentScale.current += (targetScale - currentScale.current) * lerpFactor

      // Apply transforms directly — NO CSS transition on transform
      cardRef.current.style.transform = `perspective(1000px) rotateX(${currentRotX.current}deg) rotateY(${currentRotY.current}deg) scale3d(${currentScale.current}, ${currentScale.current}, ${currentScale.current})`

      frameRef.current = requestAnimationFrame(updateCard)
    }

    frameRef.current = requestAnimationFrame(updateCard)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [isHovered])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    mousePos.current = { x, y }
    
    if (glareRef.current) {
      glareRef.current.style.opacity = '1'
      glareRef.current.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.25) 0%, transparent 80%)`
    }
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    if (glareRef.current) glareRef.current.style.opacity = '0'
  }

  return (
    <div style={{ width, height, perspective: "1000px", position: "relative" }} className={className}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 24,
          cursor: "pointer",
          transformStyle: "preserve-3d",
          willChange: "transform",
          background: "#050A18",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: `0 20px 50px -10px ${theme.glowColor}`,
          overflow: "hidden",
        }}
      >
        {/* Animated Background Layers */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 20% 30%, rgba(0, 212, 170, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0, 150, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(128, 0, 255, 0.05) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "nebula-drift 20s linear infinite alternate",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(0, 212, 170, 0.05) 0%, transparent 40%, rgba(0, 150, 255, 0.05) 100%)",
          mixBlendMode: "overlay",
          animation: "aurora-pulse 10s ease-in-out infinite alternate",
        }} />
        <div ref={glareRef} style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          transition: "opacity 0.3s", opacity: 0,
        }} />
        
        {/* Star Field */}
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", background: "white", borderRadius: "50%", opacity: 0.3, width: 1, height: 1, top: "20%", left: "30%", boxShadow: "0 0 5px white" }} />
          <div style={{ position: "absolute", background: "white", borderRadius: "50%", opacity: 0.3, width: 2, height: 2, top: "60%", left: "80%", boxShadow: "0 0 8px white", animation: "twinkle 3s infinite" }} />
          <div style={{ position: "absolute", background: "white", borderRadius: "50%", opacity: 0.3, width: 1, height: 1, top: "10%", left: "70%" }} />
        </div>

        {/* Content — ALL inline styles, no Tailwind classes */}
        <div style={{
          position: "relative", height: "100%", width: "100%",
          padding: "24px 28px", display: "flex", flexDirection: "column",
          justifyContent: "space-between", zIndex: 10,
        }}>
          {/* Top Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img 
                src="/images/vaultpay_logo.png" 
                alt="VaultPay Logo" 
                style={{ width: 48, height: 48, objectFit: "contain" }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.05em" }}>{logoText.topText}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#00D4AA", letterSpacing: "0.3em", lineHeight: 1 }}>{logoText.bottomText}</span>
              </div>
            </div>
            <Wifi style={{ color: "rgba(255,255,255,0.4)", transform: "rotate(90deg)" }} size={24} />
          </div>

          {/* Chip */}
          <div style={{
            width: 56, height: 40, borderRadius: 8,
            background: "linear-gradient(to bottom right, #fde68a, #facc15, #ca8a04)",
            padding: 1, position: "relative",
          }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 7, background: "#222", opacity: 0.2, border: "1px solid rgba(0,0,0,0.2)" }} />
            <div style={{
              position: "absolute", inset: 0,
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, padding: 8, opacity: 0.4,
            }}>
              {Array.from({length: 6}).map((_, i) => <div key={i} style={{ borderTop: "1px solid black", borderRight: "1px solid black" }} />)}
            </div>
          </div>

          {/* Bottom Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginBottom: 4 }}>CARDHOLDER</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>{cardholderName}</p>
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#ff4b2b", opacity: 0.8 }} />
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#ffb400", opacity: 0.8, marginLeft: -16 }} />
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nebula-drift {
          from { transform: scale(1); }
          to { transform: scale(1.2) translate(5%, 5%); }
        }
        @keyframes aurora-pulse {
          from { opacity: 0.2; }
          to { opacity: 0.6; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      ` }} />
    </div>
  )
}

export default CosmicNebulaMastercard
