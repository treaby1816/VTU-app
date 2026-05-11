"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Sparkles, Wifi } from "lucide-react"

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
  const [isHovered, setIsHovered] = useState(false)

  // Handle mouse movement for 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = (y - centerY) / 10
    const rotateY = -(x - centerX) / 10
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
    
    // Update glare position
    const glare = cardRef.current.querySelector('.card-glare') as HTMLDivElement
    if (glare) {
      glare.style.opacity = '1'
      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.3) 0%, transparent 80%)`
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (!cardRef.current) return
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    const glare = cardRef.current.querySelector('.card-glare') as HTMLDivElement
    if (glare) glare.style.opacity = '0'
  }

  return (
    <div 
      className={`relative ${className}`}
      style={{ width, height, perspective: "1000px" }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className={`card-body relative w-full h-full rounded-[24px] cursor-pointer transition-all duration-500 ease-out preserve-3d ${!isHovered ? 'animate-wander' : ''}`}
        style={{
          background: "#050A18",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: `0 20px 50px -10px ${theme.glowColor}`,
          overflow: "hidden",
        }}
      >
        {/* Animated Background Layers */}
        <div className="absolute inset-0 nebula-bg" />
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0 card-glare pointer-events-none transition-opacity duration-300 opacity-0" />
        
        {/* Star Field */}
        <div className="absolute inset-0 stars-container">
           <div className="star s1" />
           <div className="star s2" />
           <div className="star s3" />
        </div>

        {/* Content */}
        <div className="relative h-full w-full p-8 flex flex-col justify-between z-10">
          {/* Top Row */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4AA] to-[#00b896] flex items-center justify-center shadow-lg">
                <Sparkles size={24} color="#000" fill="#000" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white leading-none tracking-tighter">{logoText.topText}</span>
                <span className="text-[10px] font-bold text-[#00D4AA] tracking-[0.3em] leading-none">{logoText.bottomText}</span>
              </div>
            </div>
            <Wifi className="text-white/40 rotate-90" size={24} />
          </div>

          {/* Chip */}
          <div className="w-14 h-10 rounded-lg bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 p-[1px] relative">
            <div className="w-full h-full rounded-[7px] bg-[#222] opacity-20 border border-black/20" />
            <div className="absolute inset-0 grid grid-cols-3 gap-[1px] p-2 opacity-40">
               {Array.from({length: 6}).map((_, i) => <div key={i} className="border-t border-r border-black" />)}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] font-bold text-white/40 tracking-[0.2em] mb-1">CARDHOLDER</p>
              <p className="text-sm font-bold text-white tracking-widest uppercase">{cardholderName}</p>
            </div>
            <div className="flex -space-x-4">
              <div className="w-10 h-10 rounded-full bg-[#ff4b2b] opacity-80" />
              <div className="w-10 h-10 rounded-full bg-[#ffb400] opacity-80" />
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .preserve-3d {
          transform-style: preserve-3d;
        }
        
        @keyframes wander {
          0% { transform: perspective(1000px) rotateX(10deg) rotateY(15deg) rotateZ(2deg); }
          25% { transform: perspective(1000px) rotateX(-5deg) rotateY(10deg) rotateZ(-1deg); }
          50% { transform: perspective(1000px) rotateX(10deg) rotateY(-10deg) rotateZ(2deg); }
          75% { transform: perspective(1000px) rotateX(-5deg) rotateY(-15deg) rotateZ(-2deg); }
          100% { transform: perspective(1000px) rotateX(10deg) rotateY(15deg) rotateZ(2deg); }
        }

        .animate-wander {
          animation: wander 12s ease-in-out infinite;
        }

        .nebula-bg {
          background: 
            radial-gradient(circle at 20% 30%, rgba(0, 212, 170, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(0, 150, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(128, 0, 255, 0.05) 0%, transparent 70%);
          filter: blur(40px);
          animation: nebula-drift 20s linear infinite alternate;
        }

        @keyframes nebula-drift {
          from { transform: scale(1); }
          to { transform: scale(1.2) translate(5%, 5%); }
        }

        .aurora-bg {
          background: linear-gradient(135deg, rgba(0, 212, 170, 0.05) 0%, transparent 40%, rgba(0, 150, 255, 0.05) 100%);
          mix-blend-mode: overlay;
          animation: aurora-pulse 10s ease-in-out infinite alternate;
        }

        @keyframes aurora-pulse {
          from { opacity: 0.2; }
          to { opacity: 0.6; }
        }

        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          opacity: 0.3;
        }
        
        .s1 { width: 1px; height: 1px; top: 20%; left: 30%; box-shadow: 0 0 5px white; }
        .s2 { width: 2px; height: 2px; top: 60%; left: 80%; box-shadow: 0 0 8px white; animation: twinkle 3s infinite; }
        .s3 { width: 1px; height: 1px; top: 10%; left: 70%; }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      ` }} />
    </div>
  )
}

export default CosmicNebulaMastercard
