"use client";
import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import React from "react";
import {
  Wallet, Zap, LogOut, Bell, Shield, TrendingUp, Users,
  ChevronRight, CheckCircle2, XCircle, Clock, RefreshCw, Download,
  Eye, EyeOff, Phone, X, ArrowUpRight, ArrowDownLeft, Copy,
  Search, ChevronDown, Home, CreditCard, Activity, Lock, Wifi,
  Plus, Minus, Check, Info, Globe, History, Menu,
} from "lucide-react";

// ─── Responsive hook ─────────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

// ─── Constants ────────────────────────────────────────────────────────────
const BRAND = "VaultPay"; // ← Change your brand name here

const NETWORKS = [
  { id: "mtn",     name: "MTN",     color: "#FFCC00", bg: "#1a1600", logo: "MTN" },
  { id: "airtel",  name: "Airtel",  color: "#FF0000", bg: "#1a0000", logo: "AIR" },
  { id: "glo",     name: "Glo",     color: "#00A651", bg: "#001a0d", logo: "GLO" },
  { id: "9mobile", name: "9mobile", color: "#00b350", bg: "#001a0d", logo: "9MB" },
];

const DATA_BUNDLES: Record<string, { id: string; name: string; validity: string; price: number }[]> = {
  mtn:     [{ id:"d1",name:"100MB",validity:"Daily",price:100},{id:"d2",name:"500MB",validity:"7 Days",price:400},{id:"d3",name:"1GB",validity:"30 Days",price:800},{id:"d4",name:"2GB",validity:"30 Days",price:1500},{id:"d5",name:"5GB",validity:"30 Days",price:3500},{id:"d6",name:"10GB",validity:"30 Days",price:6000}],
  airtel:  [{ id:"d1",name:"200MB",validity:"Daily",price:150},{id:"d2",name:"1GB",validity:"14 Days",price:750},{id:"d3",name:"2GB",validity:"30 Days",price:1400},{id:"d4",name:"3GB",validity:"30 Days",price:2000},{id:"d5",name:"5GB",validity:"30 Days",price:3200},{id:"d6",name:"10GB",validity:"30 Days",price:5500}],
  glo:     [{ id:"d1",name:"200MB",validity:"Daily",price:100},{id:"d2",name:"1GB",validity:"14 Days",price:600},{id:"d3",name:"2GB",validity:"30 Days",price:1200},{id:"d4",name:"5GB",validity:"30 Days",price:2800},{id:"d5",name:"10GB",validity:"30 Days",price:5000},{id:"d6",name:"15GB",validity:"30 Days",price:7000}],
  "9mobile":[{id:"d1",name:"150MB",validity:"Daily",price:100},{id:"d2",name:"500MB",validity:"7 Days",price:450},{id:"d3",name:"1.5GB",validity:"30 Days",price:1000},{id:"d4",name:"3GB",validity:"30 Days",price:1800},{id:"d5",name:"5GB",validity:"30 Days",price:3000},{id:"d6",name:"11.5GB",validity:"30 Days",price:6500}],
};

const generateTxId = () => "VTU" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,6).toUpperCase();

const MOCK_TRANSACTIONS = [
  { id:"VTU1A2B3C", type:"credit", service:"Wallet Funding",      amount:10000, status:"success", date:"2025-03-25 14:32", phone:null,         network:null,    ref:"PSK_A1B2C3" },
  { id:"VTU2D3E4F", type:"debit",  service:"MTN Airtime",         amount:500,   status:"success", date:"2025-03-25 13:15", phone:"0801234567", network:"MTN",   ref:generateTxId() },
  { id:"VTU5G6H7I", type:"debit",  service:"Airtel Data – 1GB",   amount:750,   status:"success", date:"2025-03-24 10:02", phone:"0901234567", network:"Airtel",ref:generateTxId() },
  { id:"VTU8J9K0L", type:"debit",  service:"Glo Data – 2GB",      amount:1200,  status:"failed",  date:"2025-03-23 18:45", phone:"0811234567", network:"Glo",   ref:generateTxId() },
  { id:"VTUM1N2O3", type:"credit", service:"Wallet Funding",      amount:5000,  status:"success", date:"2025-03-22 09:20", phone:null,         network:null,    ref:"PSK_D4E5F6" },
  { id:"VTUP4Q5R6", type:"debit",  service:"MTN Data – 5GB",      amount:3500,  status:"success", date:"2025-03-21 16:10", phone:"0801234567", network:"MTN",   ref:generateTxId() },
  { id:"VTUS7T8U9", type:"debit",  service:"9mobile Airtime",     amount:200,   status:"pending", date:"2025-03-21 11:30", phone:"0817234567", network:"9mobile",ref:generateTxId() },
  { id:"VTUV0W1X2", type:"credit", service:"Wallet Funding",      amount:20000, status:"success", date:"2025-03-20 08:00", phone:null,         network:null,    ref:"PSK_G7H8I9" },
];

const MOCK_USERS = [
  { id:"u1", name:"Adaeze Okonkwo",  email:"adaeze@email.com",  balance:12450, status:"active",    joined:"2025-01-10", txCount:34 },
  { id:"u2", name:"Emeka Nwosu",     email:"emeka@email.com",   balance:3200,  status:"active",    joined:"2025-02-05", txCount:12 },
  { id:"u3", name:"Fatima Abubakar", email:"fatima@email.com",  balance:8750,  status:"suspended", joined:"2024-12-20", txCount:28 },
  { id:"u4", name:"Tunde Adeyemi",   email:"tunde@email.com",   balance:500,   status:"active",    joined:"2025-03-01", txCount:5  },
  { id:"u5", name:"Chisom Eze",      email:"chisom@email.com",  balance:22100, status:"active",    joined:"2024-11-15", txCount:67 },
];

// ─── Utils ────────────────────────────────────────────────────────────────
const fmtN = (n: number) => "₦" + n.toLocaleString("en-NG");
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── Styles injected once ─────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @keyframes fadeUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes bounceIn    { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
    @keyframes toastSlide  { from{transform:translateX(120%);opacity:0} to{transform:translateX(0);opacity:1} }
    @keyframes spin        { to{transform:rotate(360deg)} }
    @keyframes shimmer     { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes pulseRing   { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.08);opacity:.3} }
    @keyframes splashIn    { 0%{opacity:0;transform:scale(.6) translateY(10px)} 60%{transform:scale(1.08) translateY(-2px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes splashText  { 0%{opacity:0;transform:translateY(14px);letter-spacing:6px} 100%{opacity:1;transform:translateY(0);letter-spacing:-.5px} }
    @keyframes splashTag   { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes splashExit  { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.04)} }
    @keyframes splashDot   { 0%,80%,100%{transform:scale(.6);opacity:.3} 40%{transform:scale(1);opacity:1} }
    @keyframes orbit       { from{transform:rotate(0deg) translateX(52px) rotate(0deg)} to{transform:rotate(360deg) translateX(52px) rotate(-360deg)} }
    @keyframes orbit2      { from{transform:rotate(120deg) translateX(38px) rotate(-120deg)} to{transform:rotate(480deg) translateX(38px) rotate(-480deg)} }
    @keyframes orbit3      { from{transform:rotate(240deg) translateX(66px) rotate(-240deg)} to{transform:rotate(600deg) translateX(66px) rotate(-600deg)} }
    @keyframes glowPulse   { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
    @keyframes ringExpand  { 0%{transform:scale(.8);opacity:.6} 100%{transform:scale(1.6);opacity:0} }
    @keyframes drawerIn    { from{transform:translateX(-100%)} to{transform:translateX(0)} }
    @keyframes drawerOut   { from{transform:translateX(0)} to{transform:translateX(-100%)} }
    .fade-up    { animation: fadeUp .5s ease forwards; }
    .bounce-in  { animation: bounceIn .4s cubic-bezier(.34,1.56,.64,1) forwards; }
    .toast-slide{ animation: toastSlide .4s cubic-bezier(.34,1.56,.64,1) forwards; }
    .spin       { animation: spin 1s linear infinite; }
    .shimmer-bg { background:linear-gradient(90deg,#0D1426 25%,#1a2540 50%,#0D1426 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
    .splash-in  { animation: splashIn .7s cubic-bezier(.34,1.56,.64,1) forwards; }
    .splash-txt { animation: splashText .6s cubic-bezier(.22,1,.36,1) .35s both; }
    .splash-tag { animation: splashTag .5s ease .7s both; }
    .splash-exit{ animation: splashExit .5s cubic-bezier(.4,0,1,1) forwards; }
    .pulse-ring { animation: pulseRing 2s ease-in-out infinite; }
    .glass      { background:rgba(13,20,38,.85); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,.06); }
    .btn-p      { transition:all .2s ease; position:relative; overflow:hidden; }
    .btn-p:active{ transform:scale(.98); }
    .tx-row     { transition:background .15s; }
    .tx-row:hover{ background:rgba(255,255,255,.03); }
    .net-btn    { transition:all .2s ease; }
    .net-btn:hover{ transform:scale(1.04); }
    .net-btn.sel{ box-shadow:0 0 0 2px #00D4AA,0 8px 24px rgba(0,212,170,.2); }
    .inp        { transition:border-color .2s,box-shadow .2s; }
    .inp:focus  { border-color:#00D4AA!important; box-shadow:0 0 0 3px rgba(0,212,170,.15); outline:none; }
    .sl-link    { transition:all .2s ease; position:relative; }
    .sl-link::before{ content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:0; background:#00D4AA; border-radius:0 3px 3px 0; transition:height .2s ease; }
    .sl-link.act::before{ height:60%; }
    .hover-lift { transition:transform .2s ease,box-shadow .2s ease; }
    .hover-lift:hover{ transform:translateY(-2px); box-shadow:0 12px 40px rgba(0,212,170,.15); }
    .modal-wrap { animation: fadeUp .2s ease; }
    .modal-box  { animation: bounceIn .35s cubic-bezier(.34,1.56,.64,1); }
    .drawer     { animation: drawerIn .3s cubic-bezier(.4,0,.2,1) forwards; }
    /* Mobile bottom safe area */
    @supports (padding-bottom: env(safe-area-inset-bottom)) {
      .bottom-nav { padding-bottom: calc(8px + env(safe-area-inset-bottom)); }
    }
  `}</style>
);

// ─── Toast ────────────────────────────────────────────────────────────────
type Toast = { id: number; type: "success"|"error"|"info"; title: string; msg?: string };

const Toasts = ({ toasts }: { toasts: Toast[] }) => (
  <div style={{ position:"fixed", top:16, right:16, zIndex:9999, display:"flex", flexDirection:"column", gap:10, maxWidth:"calc(100vw - 32px)" }}>
    {toasts.map(t => (
      <div key={t.id} className="toast-slide" style={{
        background: t.type==="success"?"linear-gradient(135deg,#0a2e1a,#0d3a22)":t.type==="error"?"linear-gradient(135deg,#2e0a0a,#3a0d0d)":"linear-gradient(135deg,#0a1a2e,#0d2240)",
        border:`1px solid ${t.type==="success"?"#00D4AA30":t.type==="error"?"#ff444430":"#3B82F630"}`,
        borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:10,
        minWidth:260, maxWidth:340, boxShadow:"0 8px 32px rgba(0,0,0,.4)",
      }}>
        {t.type==="success"?<CheckCircle2 size={18} color="#00D4AA"/>:t.type==="error"?<XCircle size={18} color="#ff4444"/>:<Info size={18} color="#3B82F6"/>}
        <div>
          <div style={{color:"#fff",fontSize:13,fontWeight:600}}>{t.title}</div>
          {t.msg&&<div style={{color:"#94a3b8",fontSize:12,marginTop:2}}>{t.msg}</div>}
        </div>
      </div>
    ))}
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────
const Skel = ({ w="100%", h=16, r=8 }: { w?: string|number; h?: number; r?: number }) => (
  <div className="shimmer-bg" style={{ width:w, height:h, borderRadius:r }} />
);

// ─── StatusBadge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const c = { success:{bg:"rgba(0,212,170,.12)",color:"#00D4AA",icon:<CheckCircle2 size={11}/>}, failed:{bg:"rgba(255,68,68,.12)",color:"#ff4444",icon:<XCircle size={11}/>}, pending:{bg:"rgba(245,158,11,.12)",color:"#F59E0B",icon:<Clock size={11}/>} }[status] ?? {bg:"rgba(100,100,100,.2)",color:"#888",icon:null};
  return <span style={{background:c.bg,color:c.color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}}>{c.icon}{status.charAt(0).toUpperCase()+status.slice(1)}</span>;
};

// ─── InputField ───────────────────────────────────────────────────────────
const InputField = memo(({ label, type="text", placeholder, value, onChange, icon, error, suffix }: any) => (
  <div>
    <label style={{display:"block",color:"#94a3b8",fontSize:12,fontWeight:600,marginBottom:6}}>{label}</label>
    <div style={{position:"relative",display:"flex",alignItems:"center"}}>
      {icon && <span style={{position:"absolute",left:13,color:"#64748b"}}>{icon}</span>}
      <input type={type} placeholder={placeholder} value={value} onChange={(e:any)=>onChange(e.target.value)} className="inp" style={{
        width:"100%", background:"#080C14", border:`1px solid ${error?"#ff444450":"#1E2D4A"}`,
        borderRadius:10, padding:`12px ${suffix?"42px":"14px"} 12px ${icon?"38px":"14px"}`,
        color:"#e2e8f0", fontSize:14,
      }}/>
      {suffix && <span style={{position:"absolute",right:13}}>{suffix}</span>}
    </div>
    {error && <p style={{color:"#ff4444",fontSize:11,marginTop:4}}>{error}</p>}
  </div>
));

// ─── NetworkSelector ──────────────────────────────────────────────────────
const NetworkSelector = memo(({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) => (
  <div>
    <label style={{display:"block",color:"#94a3b8",fontSize:12,fontWeight:600,marginBottom:10}}>Select Network</label>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
      {NETWORKS.map(n=>(
        <button key={n.id} onClick={()=>onSelect(n.id)} className={`net-btn ${selected===n.id?"sel":""}`} style={{padding:"12px 8px",borderRadius:12,border:`1px solid ${selected===n.id?n.color+"60":"#1E2D4A"}`,background:selected===n.id?n.bg:"#080C14",cursor:"pointer",textAlign:"center"}}>
          <div style={{width:32,height:32,borderRadius:10,background:n.color+"20",margin:"0 auto 6px",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${n.color}30`}}>
            <span style={{color:n.color,fontWeight:800,fontSize:9}}>{n.logo}</span>
          </div>
          <p style={{color:selected===n.id?n.color:"#64748b",fontSize:11,fontWeight:600}}>{n.name}</p>
        </button>
      ))}
    </div>
  </div>
));

// ─── Modal wrapper ────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, isMobile }: any) => (
  <div className="modal-wrap" style={{position:"fixed",inset:0,background:"rgba(8,12,20,.88)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",padding:isMobile?0:20}}>
    <div className="modal-box" style={{background:"#0D1426",borderRadius:isMobile?"20px 20px 0 0":"20px",width:"100%",maxWidth:isMobile?"100%":"460px",border:"1px solid rgba(255,255,255,.08)",boxShadow:"0 40px 80px rgba(0,0,0,.6)",maxHeight:isMobile?"90vh":"88vh",overflowY:"auto"}}>
      {isMobile && <div style={{width:36,height:4,background:"rgba(255,255,255,.15)",borderRadius:2,margin:"12px auto 0"}}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <h3 style={{fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:18,color:"#fff"}}>{title}</h3>
        <button onClick={onClose} style={{width:30,height:30,borderRadius:8,background:"rgba(255,255,255,.06)",border:"none",cursor:"pointer",color:"#64748b",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={16}/></button>
      </div>
      <div style={{padding:"20px 22px 24px"}}>{children}</div>
    </div>
  </div>
);

// ─── SPLASH SCREEN ────────────────────────────────────────────────────────
const SPLASH_STEPS = ["Initialising secure environment...","Connecting to payment gateway...","Loading VTU services...","Almost ready..."];

const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += 1.4;
      setProgress(Math.min(p,100));
      setStepIdx(Math.min(Math.floor((p/100)*SPLASH_STEPS.length), SPLASH_STEPS.length-1));
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => { setExiting(true); setTimeout(onDone, 520); }, 300);
      }
    }, 42);
    return () => clearInterval(iv);
  }, [onDone]);

  return (
    <div className={exiting?"splash-exit":""} style={{position:"fixed",inset:0,zIndex:9999,background:"#080C14",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
      {/* Background */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
        <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,212,170,.07) 0%,transparent 65%)",top:-280,right:-280}}/>
        <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,158,11,.05) 0%,transparent 70%)",bottom:-200,left:-160}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,212,170,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,170,.025) 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>
      </div>
      {/* Rings */}
      {[0,.6,1.2].map((d,i)=>(
        <div key={i} style={{position:"absolute",width:160,height:160,borderRadius:"50%",border:"1px solid rgba(0,212,170,.18)",animation:`ringExpand 2.4s ${d}s ease-out infinite`,pointerEvents:"none"}}/>
      ))}
      {/* Orbit dots */}
      <div style={{position:"absolute",width:160,height:160,pointerEvents:"none"}}>
        {[{color:"#00D4AA",size:8,anim:"orbit"},{color:"#F59E0B",size:6,anim:"orbit2"},{color:"#3B82F6",size:7,anim:"orbit3"}].map((p,i)=>(
          <div key={i} style={{position:"absolute",top:"50%",left:"50%",width:p.size,height:p.size,borderRadius:"50%",background:p.color,marginLeft:-p.size/2,marginTop:-p.size/2,boxShadow:`0 0 10px 2px ${p.color}`,animation:`${p.anim} ${2.8+i*.5}s linear infinite`}}/>
        ))}
      </div>
      {/* Logo */}
      <div className="splash-in" style={{position:"relative",zIndex:2,marginBottom:28}}>
        <div style={{width:80,height:80,borderRadius:24,background:"linear-gradient(135deg,#00D4AA,#00a888)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 0 12px rgba(0,212,170,.08),0 20px 60px rgba(0,212,170,.35)",animation:"glowPulse 2s ease-in-out infinite"}}>
          <Zap size={40} color="#fff" fill="#fff" strokeWidth={1.5}/>
        </div>
      </div>
      <h1 className="splash-txt" style={{fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:"clamp(32px,8vw,44px)",color:"#fff",letterSpacing:"-.5px",lineHeight:1,marginBottom:10}}>{BRAND}</h1>
      <p className="splash-tag" style={{color:"#475569",fontSize:14,marginBottom:52}}>Nigeria's fastest VTU platform</p>
      {/* Progress */}
      <div style={{width:"min(320px,82vw)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          <span key={stepIdx} className="splash-tag" style={{color:"#64748b",fontSize:12}}>{SPLASH_STEPS[stepIdx]}</span>
          <span style={{color:"#00D4AA",fontSize:12,fontFamily:"Syne,sans-serif",fontWeight:700}}>{Math.round(progress)}%</span>
        </div>
        <div style={{width:"100%",height:3,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:3,background:"linear-gradient(90deg,#00D4AA,#3B82F6)",width:`${progress}%`,transition:"width .04s linear",boxShadow:"0 0 10px rgba(0,212,170,.6)"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:7,marginTop:24}}>
          {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#00D4AA",animation:`splashDot 1.2s ${i*.2}s ease-in-out infinite`}}/>)}
        </div>
      </div>
      <div style={{position:"absolute",bottom:28,display:"flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:20,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)"}}>
        <Shield size={12} color="#475569"/>
        <span style={{color:"#475569",fontSize:11}}>256-bit SSL · PCI-DSS Compliant</span>
      </div>
    </div>
  );
};

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }: { onLogin: (u: any) => void }) => {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<"login"|"register">("login");
  const [showPass, setShowPass] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({name:"",email:"",phone:"",password:"",otp:""});
  const [errors, setErrors] = useState<Record<string,string>>({});

  const set = (k: string) => (v: string) => setForm(p=>({...p,[k]:v}));

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.email.includes("@")) e.email="Valid email required";
    if (!otpMode && form.password.length < 6) e.password="Min 6 characters";
    if (mode==="register" && form.name.length < 2) e.name="Name required";
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); await sleep(1400); setLoading(false);
    onLogin({ name: form.name||"Felix Adeyemi", email: form.email, isAdmin: form.email.includes("admin") });
  };

  const handleSendOtp = async () => {
    if (!form.phone || form.phone.length < 11) { setErrors({phone:"Valid phone required"}); return; }
    setLoading(true); await sleep(1200); setLoading(false); setOtpSent(true);
  };

  return (
    <div style={{minHeight:"100vh",background:"#080C14",display:"flex",alignItems:"center",justifyContent:"center",padding:isMobile?"16px":"20px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,212,170,.06) 0%,transparent 70%)",top:-200,right:-200,pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,158,11,.04) 0%,transparent 70%)",bottom:-200,left:-200,pointerEvents:"none"}}/>
      <div className="fade-up" style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#00D4AA,#00a888)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 24px rgba(0,212,170,.3)"}}>
              <Zap size={22} color="#fff" fill="#fff"/>
            </div>
            <span style={{fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:26,color:"#fff",letterSpacing:"-.5px"}}>{BRAND}</span>
          </div>
          <p style={{color:"#64748b",fontSize:13}}>Nigeria's fastest VTU platform</p>
        </div>

        <div style={{background:"#0D1426",borderRadius:20,padding:isMobile?"20px":"28px",border:"1px solid rgba(255,255,255,.06)",boxShadow:"0 24px 60px rgba(0,0,0,.5)"}}>
          {/* Tab */}
          <div style={{display:"flex",background:"#080C14",borderRadius:10,padding:4,marginBottom:24,gap:4}}>
            {(["login","register"] as const).map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErrors({});}} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,background:mode===m?"#00D4AA":"transparent",color:mode===m?"#000":"#64748b",transition:"all .2s"}}>{m==="login"?"Sign In":"Sign Up"}</button>
            ))}
          </div>
          {/* OTP toggle */}
          {mode==="login"&&(
            <div style={{display:"flex",gap:8,marginBottom:18}}>
              {["password","otp"].map(t=>(
                <button key={t} onClick={()=>{setOtpMode(t==="otp");setErrors({});setOtpSent(false);}} style={{flex:1,padding:"8px 0",borderRadius:8,border:`1px solid ${(t==="otp")===otpMode?"#00D4AA50":"#1E2D4A"}`,background:(t==="otp")===otpMode?"rgba(0,212,170,.08)":"transparent",color:(t==="otp")===otpMode?"#00D4AA":"#64748b",cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .2s"}}>
                  {t==="password"?<><Lock size={13}/>Password</>:<><Phone size={13}/>OTP</>}
                </button>
              ))}
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {mode==="register"&&<InputField label="Full Name" placeholder="Adaeze Okonkwo" value={form.name} onChange={set("name")} icon={<Users size={15}/>} error={errors.name}/>}
            {!otpMode?(
              <>
                <InputField label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} icon={<Globe size={15}/>} error={errors.email}/>
                <InputField label="Password" type={showPass?"text":"password"} placeholder="••••••••" value={form.password} onChange={set("password")} icon={<Lock size={15}/>} error={errors.password} suffix={<button onClick={()=>setShowPass(!showPass)} style={{background:"none",border:"none",cursor:"pointer",color:"#64748b",display:"flex"}}>{showPass?<EyeOff size={15}/>:<Eye size={15}/>}</button>}/>
              </>
            ):(
              <>
                <InputField label="Phone Number" placeholder="08012345678" value={form.phone} onChange={set("phone")} icon={<Phone size={15}/>} error={errors.phone} suffix={!otpSent&&<button onClick={handleSendOtp} style={{background:"none",border:"none",cursor:"pointer",color:"#00D4AA",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>Send OTP</button>}/>
                {otpSent&&<InputField label="Enter OTP" placeholder="123456" value={form.otp} onChange={set("otp")} icon={<Shield size={15}/>}/>}
              </>
            )}
          </div>
          {mode==="login"&&<div style={{textAlign:"right",marginTop:8}}><span style={{color:"#00D4AA",fontSize:12,cursor:"pointer",fontWeight:600}}>Forgot password?</span></div>}
          <button onClick={handleSubmit} disabled={loading} className="btn-p" style={{width:"100%",padding:"14px 0",marginTop:22,borderRadius:12,border:"none",cursor:loading?"not-allowed":"pointer",background:loading?"#1E2D4A":"linear-gradient(135deg,#00D4AA,#00b896)",color:loading?"#64748b":"#000",fontWeight:700,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?<div className="spin" style={{width:20,height:20,border:"2px solid #64748b",borderTopColor:"#00D4AA",borderRadius:"50%"}}/>:mode==="login"?"Sign In →":"Create Account →"}
          </button>
          <div style={{marginTop:18,paddingTop:14,borderTop:"1px solid rgba(255,255,255,.05)",textAlign:"center"}}>
            <p style={{color:"#64748b",fontSize:12}}>🔒 256-bit SSL · PCI-DSS compliant</p>
          </div>
          <div style={{marginTop:10,padding:"10px 14px",background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",borderRadius:10}}>
            <p style={{color:"#F59E0B",fontSize:12,textAlign:"center"}}><strong>Demo:</strong> any email+pass · add "admin" for admin panel</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SIDEBAR (desktop) ────────────────────────────────────────────────────
const NAV_LINKS = (isAdmin: boolean) => [
  {id:"dashboard",label:"Dashboard",icon:<Home size={18}/>},
  {id:"airtime",  label:"Buy Airtime",icon:<Phone size={18}/>},
  {id:"data",     label:"Buy Data",   icon:<Wifi size={18}/>},
  {id:"fund",     label:"Fund Wallet",icon:<CreditCard size={18}/>},
  {id:"transactions",label:"Transactions",icon:<History size={18}/>},
  ...(isAdmin?[{id:"admin",label:"Admin Panel",icon:<Shield size={18}/>}]:[]),
];

const Sidebar = ({ active, onNav, user, onLogout, collapsed, setCollapsed }: any) => {
  const links = NAV_LINKS(user?.isAdmin);
  return (
    <div className="glass" style={{width:collapsed?68:230,minHeight:"100vh",display:"flex",flexDirection:"column",borderRight:"1px solid rgba(255,255,255,.06)",transition:"width .3s cubic-bezier(.4,0,.2,1)",position:"relative",flexShrink:0}}>
      <div style={{padding:collapsed?"20px 16px":"22px 20px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#00D4AA,#00a888)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 14px rgba(0,212,170,.3)"}}>
          <Zap size={18} color="#fff" fill="#fff"/>
        </div>
        {!collapsed&&<span style={{fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:19,color:"#fff",letterSpacing:"-.5px"}}>{BRAND}</span>}
      </div>
      <nav style={{flex:1,padding:"14px 8px",display:"flex",flexDirection:"column",gap:3}}>
        {links.map(l=>(
          <button key={l.id} onClick={()=>onNav(l.id)} className={`sl-link ${active===l.id?"act":""}`} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 12px",borderRadius:10,border:"none",cursor:"pointer",textAlign:"left",justifyContent:collapsed?"center":"flex-start",background:active===l.id?"rgba(0,212,170,.1)":"transparent",color:active===l.id?"#00D4AA":"#64748b",fontWeight:active===l.id?600:500,fontSize:14,transition:"all .2s"}}>
            <span style={{flexShrink:0,color:active===l.id?"#00D4AA":"#475569"}}>{l.icon}</span>
            {!collapsed&&<span>{l.label}</span>}
            {!collapsed&&active===l.id&&<ChevronRight size={13} style={{marginLeft:"auto"}}/>}
          </button>
        ))}
      </nav>
      {!collapsed&&(
        <div style={{padding:"14px 12px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#1E2D4A,#2d3f6a)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{color:"#00D4AA",fontWeight:700,fontSize:13,fontFamily:"Syne, sans-serif"}}>{user?.name?.charAt(0)}</span>
            </div>
            <div style={{overflow:"hidden"}}>
              <p style={{color:"#e2e8f0",fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user?.name}</p>
              <p style={{color:"#475569",fontSize:11}}>{user?.isAdmin?"Administrator":"User"}</p>
            </div>
          </div>
          <button onClick={onLogout} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:"1px solid rgba(255,68,68,.2)",background:"rgba(255,68,68,.06)",color:"#ff6b6b",cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6,justifyContent:"center",transition:"all .2s"}}>
            <LogOut size={13}/>Logout
          </button>
        </div>
      )}
      <button onClick={()=>setCollapsed(!collapsed)} style={{position:"absolute",top:26,right:-14,width:28,height:28,borderRadius:8,border:"1px solid rgba(255,255,255,.08)",background:"#0D1426",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b",zIndex:10,transition:"all .2s"}}>
        <ChevronDown size={14} style={{transform:collapsed?"rotate(-90deg)":"rotate(90deg)",transition:"transform .3s"}}/>
      </button>
    </div>
  );
};

// ─── MOBILE DRAWER ────────────────────────────────────────────────────────
const MobileDrawer = ({ active, onNav, user, onLogout, open, onClose }: any) => {
  if (!open) return null;
  const links = NAV_LINKS(user?.isAdmin);
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(8,12,20,.7)",backdropFilter:"blur(4px)",zIndex:500}}/>
      <div className="drawer glass" style={{position:"fixed",left:0,top:0,bottom:0,width:272,zIndex:501,display:"flex",flexDirection:"column",borderRight:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{padding:"20px 20px 16px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#00D4AA,#00a888)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(0,212,170,.3)"}}>
              <Zap size={18} color="#fff" fill="#fff"/>
            </div>
            <span style={{fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:19,color:"#fff"}}>{BRAND}</span>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,background:"rgba(255,255,255,.06)",border:"none",cursor:"pointer",color:"#64748b",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={16}/></button>
        </div>
        <nav style={{flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:3}}>
          {links.map(l=>(
            <button key={l.id} onClick={()=>{onNav(l.id);onClose();}} className={`sl-link ${active===l.id?"act":""}`} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 14px",borderRadius:10,border:"none",cursor:"pointer",textAlign:"left",background:active===l.id?"rgba(0,212,170,.1)":"transparent",color:active===l.id?"#00D4AA":"#64748b",fontWeight:active===l.id?600:500,fontSize:15,transition:"all .2s"}}>
              <span style={{color:active===l.id?"#00D4AA":"#475569"}}>{l.icon}</span>
              <span>{l.label}</span>
              {active===l.id&&<ChevronRight size={13} style={{marginLeft:"auto"}}/>}
            </button>
          ))}
        </nav>
        <div style={{padding:"14px 14px 28px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#1E2D4A,#2d3f6a)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#00D4AA",fontWeight:700,fontSize:15,fontFamily:"Syne,sans-serif"}}>{user?.name?.charAt(0)}</span>
            </div>
            <div>
              <p style={{color:"#e2e8f0",fontSize:14,fontWeight:600}}>{user?.name}</p>
              <p style={{color:"#475569",fontSize:12}}>{user?.email}</p>
            </div>
          </div>
          <button onClick={onLogout} style={{width:"100%",padding:"11px",borderRadius:10,border:"1px solid rgba(255,68,68,.2)",background:"rgba(255,68,68,.06)",color:"#ff6b6b",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:7,justifyContent:"center"}}>
            <LogOut size={15}/>Logout
          </button>
        </div>
      </div>
    </>
  );
};

// ─── BOTTOM NAV (mobile) ──────────────────────────────────────────────────
const BottomNav = ({ active, onNav, onOpenDrawer }: any) => {
  const tabs = [
    {id:"dashboard",label:"Home",icon:<Home size={20}/>},
    {id:"airtime",  label:"Airtime",icon:<Phone size={20}/>},
    {id:"fund",     label:"Fund",   icon:<Plus size={20}/>},
    {id:"data",     label:"Data",   icon:<Wifi size={20}/>},
    {id:"more",     label:"More",   icon:<Menu size={20}/>},
  ];
  return (
    <div className="glass bottom-nav" style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",alignItems:"center",padding:"8px 0 8px"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>t.id==="more"?onOpenDrawer():onNav(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,border:"none",background:"transparent",cursor:"pointer",padding:"4px 0",color:active===t.id?"#00D4AA":"#475569",transition:"color .2s"}}>
          {t.id==="fund"?(
            <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#00D4AA,#00b896)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,212,170,.4)",marginTop:-20}}>
              <Plus size={22} color="#000"/>
            </div>
          ):t.icon}
          <span style={{fontSize:10,fontWeight:active===t.id?700:500}}>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

// ─── WALLET CARD ──────────────────────────────────────────────────────────
const WalletCard = ({ balance, loading, onFund, isMobile }: any) => {
  const [hidden, setHidden] = useState(false);
  return (
    <div className="hover-lift" style={{borderRadius:20,padding:isMobile?"22px 20px":"28px",position:"relative",overflow:"hidden",background:"linear-gradient(135deg,#0a2e26 0%,#0d3a30 40%,#0a2040 100%)",border:"1px solid rgba(0,212,170,.15)",boxShadow:"0 20px 60px rgba(0,212,170,.1),0 4px 20px rgba(0,0,0,.4)",minHeight:150}}>
      <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",border:"1px solid rgba(0,212,170,.08)",top:-80,right:-60,pointerEvents:"none"}} className="pulse-ring"/>
      <div style={{position:"absolute",top:0,right:0,width:120,height:120,background:"radial-gradient(circle,rgba(0,212,170,.1),transparent)",pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <p style={{color:"rgba(255,255,255,.5)",fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>Available Balance</p>
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:6}}>
            {loading?<Skel w={180} h={36} r={8}/>:(
              <h2 style={{fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:isMobile?"28px":"34px",color:"#fff",letterSpacing:"-1px"}}>
                {hidden?"₦ ••••••":fmtN(balance)}
              </h2>
            )}
            <button onClick={()=>setHidden(!hidden)} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,padding:6,cursor:"pointer",color:"rgba(255,255,255,.6)",display:"flex",alignItems:"center"}}>
              {hidden?<Eye size={14}/>:<EyeOff size={14}/>}
            </button>
          </div>
        </div>
        <div style={{width:42,height:42,borderRadius:12,background:"rgba(0,212,170,.15)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(0,212,170,.2)"}}>
          <Wallet size={20} color="#00D4AA"/>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <button onClick={onFund} className="btn-p" style={{padding:"9px 18px",borderRadius:10,border:"none",cursor:"pointer",background:"#00D4AA",color:"#000",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6}}>
          <Plus size={14}/>Fund Wallet
        </button>
        <div style={{display:"flex",gap:isMobile?8:14,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <ArrowDownLeft size={13} color="#00D4AA"/>
            <span style={{color:"rgba(255,255,255,.45)",fontSize:12}}>Credit: <span style={{color:"#00D4AA",fontWeight:600}}>₦35,000</span></span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <ArrowUpRight size={13} color="#F59E0B"/>
            <span style={{color:"rgba(255,255,255,.45)",fontSize:12}}>Debit: <span style={{color:"#F59E0B",fontWeight:600}}>₦5,950</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── QUICK STATS ──────────────────────────────────────────────────────────
const QuickStats = memo(({ transactions }: { transactions: any[] }) => {
  const stats = useMemo(() => {
    const success = transactions.filter(t => t.status === "success" && t.type === "debit").length;
    const total = transactions.filter(t => t.type === "debit").length;
    const spent = transactions.filter(t => t.type === "debit" && t.status === "success").reduce((s, t) => s + t.amount, 0);
    const pending = transactions.filter(t => t.status === "pending").length;

    return [
      { label: "Transactions", value: total, color: "#3B82F6", icon: <Activity size={16} /> },
      { label: "Successful", value: success, color: "#00D4AA", icon: <CheckCircle2 size={16} /> },
      { label: "Total Spent", value: fmtN(spent), color: "#F59E0B", icon: <TrendingUp size={16} /> },
      { label: "Pending", value: pending, color: "#a78bfa", icon: <Clock size={16} /> },
    ];
  }, [transactions]);
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
      {stats.map((s,i)=>(
        <div key={i} className="fade-up" style={{animationDelay:`${i*70}ms`,background:"#0D1426",borderRadius:14,padding:"16px",border:"1px solid rgba(255,255,255,.05)"}}>
          <div style={{width:34,height:34,borderRadius:10,background:s.color+"15",display:"flex",alignItems:"center",justifyContent:"center",color:s.color,marginBottom:10}}>{s.icon}</div>
          <p style={{fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:20,color:"#fff"}}>{s.value}</p>
          <p style={{color:"#64748b",fontSize:12,marginTop:2}}>{s.label}</p>
        </div>
      ))}
    </div>
  );
});

// ─── QUICK ACTIONS ────────────────────────────────────────────────────────
const QuickActions = memo(({ onAction, isMobile }: any) => {
  const actions = [
    {id:"airtime",label:"Buy Airtime",icon:<Phone size={isMobile?20:22}/>,color:"#F59E0B",desc:"Instant top-up"},
    {id:"data",   label:"Buy Data",   icon:<Wifi size={isMobile?20:22}/>,  color:"#3B82F6",desc:"All networks"},
    {id:"fund",   label:"Fund Wallet",icon:<CreditCard size={isMobile?20:22}/>,color:"#00D4AA",desc:"Via Paystack"},
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
      {actions.map((a)=>(
        <button key={a.id} onClick={()=>onAction(a.id)} className="hover-lift" style={{background:"#0D1426",borderRadius:14,padding:isMobile?"14px 10px":"18px 12px",border:`1px solid ${a.color}20`,cursor:"pointer",textAlign:"center",transition:"all .2s"}}
          onMouseEnter={e=>{(e.currentTarget as any).style.background=a.color+"10";(e.currentTarget as any).style.borderColor=a.color+"40";}}
          onMouseLeave={e=>{(e.currentTarget as any).style.background="#0D1426";(e.currentTarget as any).style.borderColor=a.color+"20";}}>
          <div style={{width:isMobile?40:46,height:isMobile?40:46,borderRadius:14,background:a.color+"15",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",color:a.color,border:`1px solid ${a.color}25`}}>{a.icon}</div>
          <p style={{color:"#e2e8f0",fontWeight:600,fontSize:isMobile?12:13}}>{a.label}</p>
          <p style={{color:"#475569",fontSize:10,marginTop:3}}>{a.desc}</p>
        </button>
      ))}
    </div>
  );
});

// ─── TRANSACTION TABLE ────────────────────────────────────────────────────
const TxTable = memo(({ transactions, limit, onDownload, onRetry, showFilters=false, isMobile }: any) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState<string|null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((t: any) => {
      const ms = t.service.toLowerCase().includes(search.toLowerCase()) || 
                 t.id.toLowerCase().includes(search.toLowerCase()) || 
                 (t.phone && t.phone.includes(search));
      const mf = filter === "all" || 
                 t.status === filter || 
                 (filter === "credit" && t.type === "credit") || 
                 (filter === "debit" && t.type === "debit");
      return ms && mf;
    }).slice(0, limit || 999);
  }, [transactions, search, filter, limit]);

  const copyId = (id: string) => {
    navigator.clipboard?.writeText(id).catch(()=>{});
    setCopied(id); setTimeout(()=>setCopied(null),1500);
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div>
        {showFilters&&(
          <div style={{marginBottom:14}}>
            <div style={{position:"relative",marginBottom:10}}>
              <Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#475569"}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="inp" style={{width:"100%",background:"#080C14",border:"1px solid #1E2D4A",borderRadius:10,padding:"10px 14px 10px 34px",color:"#e2e8f0",fontSize:14}}/>
            </div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
              {["all","success","pending","failed"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{padding:"7px 12px",borderRadius:8,border:`1px solid ${filter===f?"#00D4AA50":"#1E2D4A"}`,background:filter===f?"rgba(0,212,170,.1)":"#0D1426",color:filter===f?"#00D4AA":"#64748b",cursor:"pointer",fontSize:12,fontWeight:600,whiteSpace:"nowrap",transition:"all .2s",flexShrink:0,textTransform:"capitalize"}}>{f}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.length===0&&<p style={{color:"#475569",textAlign:"center",padding:"30px 0",fontSize:14}}>No transactions found</p>}
          {filtered.map((t: any)=>(
            <div key={t.id} style={{background:"#0D1426",borderRadius:14,padding:"14px 16px",border:"1px solid rgba(255,255,255,.05)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:t.type==="credit"?"rgba(0,212,170,.1)":"rgba(245,158,11,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {t.type==="credit"?<ArrowDownLeft size={16} color="#00D4AA"/>:<ArrowUpRight size={16} color="#F59E0B"/>}
                  </div>
                  <div>
                    <p style={{color:"#e2e8f0",fontSize:13,fontWeight:600}}>{t.service}</p>
                    {t.phone&&<p style={{color:"#475569",fontSize:11,marginTop:2}}>{t.phone} · {t.network}</p>}
                  </div>
                </div>
                <span style={{fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:15,color:t.type==="credit"?"#00D4AA":"#e2e8f0"}}>{t.type==="credit"?"+":"-"}{fmtN(t.amount)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <StatusBadge status={t.status}/>
                  <span style={{color:"#475569",fontSize:11}}>{t.date}</span>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {t.status==="success"&&<button onClick={()=>onDownload(t)} style={{width:28,height:28,borderRadius:8,background:"rgba(0,212,170,.1)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#00D4AA"}}><Download size={13}/></button>}
                  {t.status==="failed"&&<button onClick={()=>onRetry(t)} style={{width:28,height:28,borderRadius:8,background:"rgba(245,158,11,.1)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#F59E0B"}}><RefreshCw size={13}/></button>}
                  <button onClick={()=>copyId(t.id)} style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,.05)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b"}}>
                    {copied===t.id?<Check size={12} color="#00D4AA"/>:<Copy size={12}/>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop table view
  return (
    <div>
      {showFilters&&(
        <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:180}}>
            <Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#475569"}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search transactions..." className="inp" style={{width:"100%",background:"#080C14",border:"1px solid #1E2D4A",borderRadius:10,padding:"9px 14px 9px 34px",color:"#e2e8f0",fontSize:13}}/>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["all","success","pending","failed","credit","debit"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${filter===f?"#00D4AA50":"#1E2D4A"}`,background:filter===f?"rgba(0,212,170,.1)":"#0D1426",color:filter===f?"#00D4AA":"#64748b",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .2s",textTransform:"capitalize"}}>{f}</button>
            ))}
          </div>
        </div>
      )}
      <div style={{background:"#0D1426",borderRadius:14,border:"1px solid rgba(255,255,255,.05)",overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                {["Transaction","Service","Amount","Status","Date","Actions"].map(h=>(
                  <th key={h} style={{padding:"12px 16px",textAlign:"left",color:"#475569",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={6} style={{padding:"36px 16px",textAlign:"center",color:"#475569",fontSize:14}}>No transactions found</td></tr>}
              {filtered.map((t: any)=>(
                <tr key={t.id} className="tx-row" style={{borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                  <td style={{padding:"12px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:32,height:32,borderRadius:10,background:t.type==="credit"?"rgba(0,212,170,.1)":"rgba(245,158,11,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {t.type==="credit"?<ArrowDownLeft size={14} color="#00D4AA"/>:<ArrowUpRight size={14} color="#F59E0B"/>}
                      </div>
                      <div>
                        <button onClick={()=>copyId(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#e2e8f0",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4,padding:0}}>
                          {t.id.slice(0,10)}… {copied===t.id?<Check size={11} color="#00D4AA"/>:<Copy size={11} color="#475569"/>}
                        </button>
                        {t.phone&&<p style={{color:"#475569",fontSize:11}}>{t.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{padding:"12px 16px"}}><span style={{color:"#94a3b8",fontSize:13}}>{t.service}</span></td>
                  <td style={{padding:"12px 16px"}}><span style={{fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:14,color:t.type==="credit"?"#00D4AA":"#e2e8f0"}}>{t.type==="credit"?"+":"-"}{fmtN(t.amount)}</span></td>
                  <td style={{padding:"12px 16px"}}><StatusBadge status={t.status}/></td>
                  <td style={{padding:"12px 16px"}}><span style={{color:"#475569",fontSize:12,whiteSpace:"nowrap"}}>{t.date}</span></td>
                  <td style={{padding:"12px 16px"}}>
                    <div style={{display:"flex",gap:6}}>
                      {t.status==="success"&&<button onClick={()=>onDownload(t)} title="Receipt" style={{width:28,height:28,borderRadius:8,background:"rgba(0,212,170,.1)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#00D4AA"}}><Download size={13}/></button>}
                      {t.status==="failed"&&<button onClick={()=>onRetry(t)} title="Retry" style={{width:28,height:28,borderRadius:8,background:"rgba(245,158,11,.1)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#F59E0B"}}><RefreshCw size={13}/></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── AIRTIME MODAL ────────────────────────────────────────────────────────
const AirtimeModal = ({ onClose, balance, onSubmit, isMobile }: any) => {
  const [network, setNetwork] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(1);
  const [txResult, setTxResult] = useState<any>(null);
  const presets = [50,100,200,500,1000,2000];

  const handleBuy = async () => {
    setStep(3); await sleep(2200);
    const ok = Math.random()>.2;
    const tx = {id:generateTxId(),type:"debit",service:`${NETWORKS.find(n=>n.id===network)?.name} Airtime`,amount:+amount,status:ok?"success":"failed",date:new Date().toLocaleString("en-NG"),phone,network:NETWORKS.find(n=>n.id===network)?.name,ref:generateTxId()};
    setTxResult(tx); setStep(4); onSubmit(tx);
  };

  return (
    <Modal title="Buy Airtime" onClose={onClose} isMobile={isMobile}>
      {step===1&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <NetworkSelector selected={network} onSelect={setNetwork}/>
          <InputField label="Phone Number" placeholder="08012345678" value={phone} onChange={setPhone} icon={<Phone size={15}/>}/>
          <div>
            <label style={{display:"block",color:"#94a3b8",fontSize:12,fontWeight:600,marginBottom:8}}>Amount (₦)</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
              {presets.map(p=><button key={p} onClick={()=>setAmount(String(p))} style={{padding:"9px 0",borderRadius:8,border:`1px solid ${amount===String(p)?"#00D4AA50":"#1E2D4A"}`,background:amount===String(p)?"rgba(0,212,170,.1)":"#080C14",color:amount===String(p)?"#00D4AA":"#64748b",cursor:"pointer",fontSize:13,fontWeight:600,transition:"all .2s"}}>₦{p}</button>)}
            </div>
            <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Custom amount" className="inp" style={{width:"100%",background:"#080C14",border:"1px solid #1E2D4A",borderRadius:10,padding:"11px 14px",color:"#e2e8f0",fontSize:14}}/>
          </div>
          <div style={{background:"rgba(0,212,170,.06)",borderRadius:10,padding:"11px 14px",border:"1px solid rgba(0,212,170,.1)"}}>
            <p style={{color:"#64748b",fontSize:12}}>Balance: <span style={{color:"#00D4AA",fontWeight:700}}>{fmtN(balance)}</span></p>
          </div>
          <button onClick={()=>{if(phone.length>=11&&+amount>=50)setStep(2);}} style={{width:"100%",padding:"13px 0",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#00D4AA,#00b896)",color:"#000",fontWeight:700,fontSize:15}}>Continue →</button>
        </div>
      )}
      {step===2&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"#080C14",borderRadius:14,padding:18}}>
            {[["Network",NETWORKS.find(n=>n.id===network)?.name],["Phone",phone],["Amount",fmtN(+amount)]].map(([k,v])=>(
              <div key={k as string} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{color:"#64748b",fontSize:13}}>{k}</span>
                <span style={{color:"#e2e8f0",fontSize:13,fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <button onClick={()=>setStep(1)} style={{padding:"12px 0",borderRadius:12,border:"1px solid #1E2D4A",background:"transparent",color:"#94a3b8",cursor:"pointer",fontWeight:600}}>← Back</button>
            <button onClick={handleBuy} style={{padding:"12px 0",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#00D4AA,#00b896)",color:"#000",fontWeight:700}}>Confirm</button>
          </div>
        </div>
      )}
      {step===3&&(
        <div style={{textAlign:"center",padding:"30px 0"}}>
          <div className="spin" style={{width:52,height:52,border:"3px solid #1E2D4A",borderTopColor:"#00D4AA",borderRadius:"50%",margin:"0 auto 18px"}}/>
          <p style={{color:"#e2e8f0",fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:18}}>Processing...</p>
          <p style={{color:"#64748b",fontSize:13,marginTop:6}}>Contacting VTU provider</p>
        </div>
      )}
      {step===4&&txResult&&(
        <div style={{textAlign:"center"}}>
          <div className="bounce-in" style={{width:64,height:64,borderRadius:"50%",background:txResult.status==="success"?"rgba(0,212,170,.15)":"rgba(255,68,68,.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",border:`2px solid ${txResult.status==="success"?"#00D4AA40":"#ff444440"}`}}>
            {txResult.status==="success"?<CheckCircle2 size={32} color="#00D4AA"/>:<XCircle size={32} color="#ff4444"/>}
          </div>
          <h3 style={{fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:20,color:"#fff",marginBottom:6}}>{txResult.status==="success"?"Airtime Sent!":"Transaction Failed"}</h3>
          <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>{txResult.status==="success"?`₦${amount} sent to ${phone}`:"Wallet refunded automatically"}</p>
          <button onClick={onClose} style={{width:"100%",padding:"12px 0",borderRadius:12,border:"none",cursor:"pointer",background:"#1E2D4A",color:"#e2e8f0",fontWeight:600}}>Close</button>
        </div>
      )}
    </Modal>
  );
};

// ─── DATA MODAL ───────────────────────────────────────────────────────────
const DataModal = ({ onClose, balance, onSubmit, isMobile }: any) => {
  const [network, setNetwork] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [bundle, setBundle] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [txResult, setTxResult] = useState<any>(null);
  const bundles = DATA_BUNDLES[network]||[];

  const handleBuy = async () => {
    setStep(3); await sleep(2500);
    const ok = Math.random()>.15;
    const tx = {id:generateTxId(),type:"debit",service:`${NETWORKS.find(n=>n.id===network)?.name} Data – ${bundle?.name}`,amount:bundle?.price,status:ok?"success":"failed",date:new Date().toLocaleString("en-NG"),phone,network:NETWORKS.find(n=>n.id===network)?.name,ref:generateTxId()};
    setTxResult(tx); setStep(4); onSubmit(tx);
  };

  return (
    <Modal title="Buy Data Bundle" onClose={onClose} isMobile={isMobile}>
      {step===1&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <NetworkSelector selected={network} onSelect={n=>{setNetwork(n);setBundle(null);}}/>
          <InputField label="Phone Number" placeholder="08012345678" value={phone} onChange={setPhone} icon={<Phone size={15}/>}/>
          <div>
            <label style={{display:"block",color:"#94a3b8",fontSize:12,fontWeight:600,marginBottom:10}}>Select Bundle</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {bundles.map((b: any)=>(
                <button key={b.id} onClick={()=>setBundle(b)} style={{padding:12,borderRadius:12,border:`1px solid ${bundle?.id===b.id?"#3B82F650":"#1E2D4A"}`,background:bundle?.id===b.id?"rgba(59,130,246,.1)":"#080C14",cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
                  <p style={{color:bundle?.id===b.id?"#3B82F6":"#e2e8f0",fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:15}}>{b.name}</p>
                  <p style={{color:"#64748b",fontSize:11}}>{b.validity}</p>
                  <p style={{color:"#F59E0B",fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:14,marginTop:4}}>₦{b.price}</p>
                </button>
              ))}
            </div>
          </div>
          <button onClick={()=>{if(phone.length>=11&&bundle)setStep(2);}} style={{width:"100%",padding:"13px 0",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#3B82F6,#2563eb)",color:"#fff",fontWeight:700,fontSize:15}}>Continue →</button>
        </div>
      )}
      {step===2&&bundle&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"#080C14",borderRadius:14,padding:18}}>
            {[["Network",NETWORKS.find(n=>n.id===network)?.name],["Bundle",`${bundle.name} (${bundle.validity})`],["Phone",phone],["Cost",fmtN(bundle.price)]].map(([k,v])=>(
              <div key={k as string} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{color:"#64748b",fontSize:13}}>{k}</span>
                <span style={{color:"#e2e8f0",fontSize:13,fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <button onClick={()=>setStep(1)} style={{padding:"12px 0",borderRadius:12,border:"1px solid #1E2D4A",background:"transparent",color:"#94a3b8",cursor:"pointer",fontWeight:600}}>← Back</button>
            <button onClick={handleBuy} style={{padding:"12px 0",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#3B82F6,#2563eb)",color:"#fff",fontWeight:700}}>Confirm</button>
          </div>
        </div>
      )}
      {step===3&&(
        <div style={{textAlign:"center",padding:"30px 0"}}>
          <div className="spin" style={{width:52,height:52,border:"3px solid #1E2D4A",borderTopColor:"#3B82F6",borderRadius:"50%",margin:"0 auto 18px"}}/>
          <p style={{color:"#e2e8f0",fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:18}}>Activating Bundle...</p>
          <p style={{color:"#64748b",fontSize:13,marginTop:6}}>Please wait</p>
        </div>
      )}
      {step===4&&txResult&&(
        <div style={{textAlign:"center"}}>
          <div className="bounce-in" style={{width:64,height:64,borderRadius:"50%",background:txResult.status==="success"?"rgba(59,130,246,.15)":"rgba(255,68,68,.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",border:`2px solid ${txResult.status==="success"?"#3B82F640":"#ff444440"}`}}>
            {txResult.status==="success"?<CheckCircle2 size={32} color="#3B82F6"/>:<XCircle size={32} color="#ff4444"/>}
          </div>
          <h3 style={{fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:20,color:"#fff",marginBottom:6}}>{txResult.status==="success"?"Data Activated!":"Activation Failed"}</h3>
          <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>{txResult.status==="success"?`${bundle?.name} activated on ${phone}`:"Wallet refunded"}</p>
          <button onClick={onClose} style={{width:"100%",padding:"12px 0",borderRadius:12,border:"none",cursor:"pointer",background:"#1E2D4A",color:"#e2e8f0",fontWeight:600}}>Close</button>
        </div>
      )}
    </Modal>
  );
};

// ─── FUND MODAL ───────────────────────────────────────────────────────────
const FundModal = ({ onClose, onSubmit, isMobile }: any) => {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(1);
  const presets = [1000,2000,5000,10000,20000,50000];

  const handlePay = async () => {
    if (+amount<100) return;
    setStep(2); await sleep(3000);
    const tx = {id:generateTxId(),type:"credit",service:"Wallet Funding",amount:+amount,status:"success",date:new Date().toLocaleString("en-NG"),phone:null,network:null,ref:"PSK_"+Math.random().toString(36).slice(2,8).toUpperCase()};
    onSubmit(tx); setStep(3);
  };

  return (
    <Modal title="Fund Wallet" onClose={onClose} isMobile={isMobile}>
      {step===1&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:"rgba(0,212,170,.06)",borderRadius:12,padding:"13px 16px",border:"1px solid rgba(0,212,170,.1)",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:48,height:22,background:"#fff",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontWeight:900,fontSize:7,color:"#00c2a8",letterSpacing:-0.5}}>PAYSTACK</span>
            </div>
            <p style={{color:"#64748b",fontSize:12}}>Secured by Paystack · Cards, Bank Transfer, USSD</p>
          </div>
          <div>
            <label style={{display:"block",color:"#94a3b8",fontSize:12,fontWeight:600,marginBottom:8}}>Amount to Fund (₦)</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
              {presets.map(p=><button key={p} onClick={()=>setAmount(String(p))} style={{padding:"9px 0",borderRadius:8,border:`1px solid ${amount===String(p)?"#00D4AA50":"#1E2D4A"}`,background:amount===String(p)?"rgba(0,212,170,.1)":"#080C14",color:amount===String(p)?"#00D4AA":"#64748b",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .2s"}}>₦{p.toLocaleString()}</button>)}
            </div>
            <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Custom amount" type="number" className="inp" style={{width:"100%",background:"#080C14",border:"1px solid #1E2D4A",borderRadius:10,padding:"11px 14px",color:"#e2e8f0",fontSize:14}}/>
          </div>
          <button onClick={()=>{if(+amount>=100)handlePay();}} style={{width:"100%",padding:"13px 0",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#00D4AA,#00b896)",color:"#000",fontWeight:700,fontSize:15}}>
            Pay {amount?fmtN(+amount):"Now"} via Paystack →
          </button>
          <p style={{color:"#475569",fontSize:11,textAlign:"center"}}>Min: ₦100 · Instant credit · No extra charges</p>
        </div>
      )}
      {step===2&&(
        <div style={{textAlign:"center",padding:"30px 0"}}>
          <div style={{background:"#fff",borderRadius:16,padding:24,marginBottom:16}}>
            <div style={{fontWeight:900,fontSize:15,color:"#00c2a8",letterSpacing:-0.5,marginBottom:16}}>PAYSTACK</div>
            <div style={{background:"#f8f9fa",borderRadius:10,padding:14,marginBottom:14}}>
              <p style={{fontSize:12,color:"#666"}}>Total amount</p>
              <p style={{fontWeight:800,fontSize:24,color:"#111",fontFamily:"Syne, sans-serif"}}>₦{(+amount).toLocaleString()}.00</p>
            </div>
            <div className="spin" style={{width:40,height:40,border:"3px solid #eee",borderTopColor:"#00c2a8",borderRadius:"50%",margin:"0 auto 12px"}}/>
            <p style={{color:"#888",fontSize:13}}>Processing payment...</p>
          </div>
          <p style={{color:"#475569",fontSize:12}}>Do not close this window</p>
        </div>
      )}
      {step===3&&(
        <div style={{textAlign:"center"}}>
          <div className="bounce-in" style={{width:64,height:64,borderRadius:"50%",background:"rgba(0,212,170,.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",border:"2px solid #00D4AA40"}}>
            <CheckCircle2 size={32} color="#00D4AA"/>
          </div>
          <h3 style={{fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:20,color:"#fff",marginBottom:6}}>Wallet Funded!</h3>
          <p style={{color:"#64748b",fontSize:13,marginBottom:20}}>{fmtN(+amount)} added to your wallet</p>
          <button onClick={onClose} style={{width:"100%",padding:"12px 0",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#00D4AA,#00b896)",color:"#000",fontWeight:700}}>Back to Dashboard</button>
        </div>
      )}
    </Modal>
  );
};

// ─── RECEIPT GENERATOR ────────────────────────────────────────────────────
const downloadReceipt = (tx: any) => {
  const html = `<!DOCTYPE html><html><head><title>${BRAND} Receipt</title>
<style>body{font-family:Arial,sans-serif;max-width:420px;margin:40px auto;color:#111}
.hd{text-align:center;border-bottom:2px solid #00D4AA;padding-bottom:16px;margin-bottom:20px}
.logo{color:#00D4AA;font-size:22px;font-weight:900}.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0}
.amt{font-size:28px;font-weight:900;color:#00D4AA;text-align:center;margin:16px 0}
.badge{display:inline-block;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700;margin:12px 0}
.success{background:#d1fae5;color:#065f46}.failed{background:#fee2e2;color:#991b1b}
.ft{text-align:center;color:#999;font-size:11px;margin-top:20px;padding-top:14px;border-top:1px solid #eee}
</style></head><body>
<div class="hd"><div class="logo">⚡ ${BRAND}</div><div style="color:#555;font-size:13px;margin-top:4px">Transaction Receipt</div></div>
<div style="text-align:center"><span class="badge ${tx.status}">${tx.status.toUpperCase()}</span></div>
<div class="amt">${tx.type==="credit"?"+":"-"}₦${tx.amount.toLocaleString("en-NG")}</div>
<div class="row"><span style="color:#666;font-size:13px">Transaction ID</span><span style="font-weight:600;font-size:13px">${tx.id}</span></div>
<div class="row"><span style="color:#666;font-size:13px">Service</span><span style="font-weight:600;font-size:13px">${tx.service}</span></div>
${tx.phone?`<div class="row"><span style="color:#666;font-size:13px">Recipient</span><span style="font-weight:600;font-size:13px">${tx.phone}</span></div>`:""}
${tx.network?`<div class="row"><span style="color:#666;font-size:13px">Network</span><span style="font-weight:600;font-size:13px">${tx.network}</span></div>`:""}
<div class="row"><span style="color:#666;font-size:13px">Reference</span><span style="font-weight:600;font-size:13px">${tx.ref}</span></div>
<div class="row"><span style="color:#666;font-size:13px">Date & Time</span><span style="font-weight:600;font-size:13px">${tx.date}</span></div>
<div class="ft"><p>${BRAND} Nigeria · Powered by VTU.ng & Paystack</p><p style="margin-top:6px;color:#ccc">Official transaction receipt</p></div>
</body></html>`;
  const a = document.createElement("a");
  a.href = "data:text/html;charset=utf-8," + encodeURIComponent(html);
  a.download = `${BRAND}_Receipt_${tx.id}.html`;
  a.click();
};

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────
const AdminPanel = ({ isMobile }: { isMobile: boolean }) => {
  const [tab, setTab] = useState<"users"|"transactions"|"pricing">("users");
  const [markup, setMarkup] = useState({airtime:3,data:5});
  const total = MOCK_USERS.reduce((s,u)=>s+u.balance,0);

  return (
    <div>
      <div style={{marginBottom:22}}>
        <h1 style={{fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:isMobile?22:26,color:"#fff",letterSpacing:"-.5px"}}>Admin Panel</h1>
        <p style={{color:"#64748b",fontSize:13,marginTop:4}}>Users, transactions & system settings</p>
      </div>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {[{l:"Total Users",v:MOCK_USERS.length,c:"#3B82F6"},{l:"Total Wallets",v:fmtN(total),c:"#00D4AA"},{l:"Transactions",v:MOCK_TRANSACTIONS.length,c:"#F59E0B"},{l:"Success Rate",v:"87%",c:"#a78bfa"}].map((s,i)=>(
          <div key={i} style={{background:"#0D1426",borderRadius:14,padding:16,border:"1px solid rgba(255,255,255,.05)"}}>
            <p style={{fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:isMobile?18:20,color:s.c}}>{s.v}</p>
            <p style={{color:"#64748b",fontSize:12,marginTop:2}}>{s.l}</p>
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:18,background:"#080C14",padding:4,borderRadius:12,width:"fit-content",overflowX:"auto"}}>
        {(["users","transactions","pricing"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",background:tab===t?"#0D1426":"transparent",color:tab===t?"#00D4AA":"#64748b",fontWeight:600,fontSize:13,transition:"all .2s",whiteSpace:"nowrap",textTransform:"capitalize"}}>{t}</button>
        ))}
      </div>

      {tab==="users"&&(
        <div style={{background:"#0D1426",borderRadius:14,border:"1px solid rgba(255,255,255,.05)",overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:560}}>
              <thead>
                <tr style={{borderBottom:"1px solid rgba(255,255,255,.06)"}}>
                  {["User","Balance","Transactions","Status"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:"left",color:"#475569",fontSize:11,fontWeight:700,textTransform:"uppercase"}}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map(u=>(
                  <tr key={u.id} className="tx-row" style={{borderBottom:"1px solid rgba(255,255,255,.03)"}}>
                    <td style={{padding:"12px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#1E2D4A,#2d3f6a)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <span style={{color:"#00D4AA",fontWeight:700,fontSize:13}}>{u.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p style={{color:"#e2e8f0",fontSize:13,fontWeight:600}}>{u.name}</p>
                          <p style={{color:"#475569",fontSize:11}}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"12px 16px"}}><span style={{color:"#00D4AA",fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:13}}>{fmtN(u.balance)}</span></td>
                    <td style={{padding:"12px 16px"}}><span style={{color:"#94a3b8",fontSize:13}}>{u.txCount}</span></td>
                    <td style={{padding:"12px 16px"}}><span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:u.status==="active"?"rgba(0,212,170,.12)":"rgba(255,68,68,.12)",color:u.status==="active"?"#00D4AA":"#ff4444"}}>{u.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab==="transactions"&&<TxTable transactions={MOCK_TRANSACTIONS} showFilters onDownload={downloadReceipt} onRetry={()=>{}} isMobile={isMobile}/>}
      {tab==="pricing"&&(
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(2,1fr)",gap:14}}>
          {([{key:"airtime",label:"Airtime Markup",color:"#F59E0B"},{key:"data",label:"Data Bundle Markup",color:"#3B82F6"}] as any[]).map(({key,label,color})=>(
            <div key={key} style={{background:"#0D1426",borderRadius:16,padding:20,border:"1px solid rgba(255,255,255,.05)"}}>
              <h4 style={{fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:16,color:"#fff",marginBottom:16}}>{label}</h4>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <button onClick={()=>setMarkup(m=>({...m,[key]:Math.max(0,m[key as keyof typeof m]-.5)}))} style={{width:34,height:34,borderRadius:9,background:"#1E2D4A",border:"none",cursor:"pointer",color:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center"}}><Minus size={14}/></button>
                <div style={{flex:1,background:"#080C14",borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
                  <span style={{fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:22,color}}>{markup[key as keyof typeof markup]}%</span>
                </div>
                <button onClick={()=>setMarkup(m=>({...m,[key]:Math.min(20,m[key as keyof typeof m]+.5)}))} style={{width:34,height:34,borderRadius:9,background:"#1E2D4A",border:"none",cursor:"pointer",color:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center"}}><Plus size={14}/></button>
              </div>
              <button style={{width:"100%",padding:"10px 0",borderRadius:10,border:`1px solid ${color}30`,cursor:"pointer",background:color+"18",color,fontWeight:600,fontSize:13}}>Save Markup</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────
export default function VaultPay() {
  const isMobile = useIsMobile();
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState<string|null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [balance, setBalance] = useState(29050);
  const [loadingDash, setLoadingDash] = useState(false);
  const toastId = useRef(0);

  const addToast = useCallback((type: Toast["type"], title: string, msg?: string) => {
    const id = ++toastId.current;
    setToasts(p=>[...p,{id,type,title,msg}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4000);
  },[]);

  const handleLogin = (u: any) => {
    setLoadingDash(true); setUser(u);
    setTimeout(()=>setLoadingDash(false),1200);
  };

  const handleLogout = () => { setUser(null); setActivePage("dashboard"); setModal(null); };

  const handleTransaction = (tx: any) => {
    setTransactions(p=>[tx,...p]);
    if (tx.type==="credit") { setBalance(b=>b+tx.amount); addToast("success","Wallet Funded!",`${fmtN(tx.amount)} added to wallet`); }
    else if (tx.status==="success") { setBalance(b=>b-tx.amount); addToast("success","Transaction Successful!",tx.service); }
    else { addToast("error","Transaction Failed","Wallet refunded automatically"); }
    setModal(null);
  };

  const handleRetry = async (tx: any) => {
    addToast("info","Retrying...",`Retrying ${tx.service}`);
    await sleep(2000);
    setTransactions(p=>p.map(t=>t.id===tx.id?{...t,status:Math.random()>.4?"success":"failed"}:t));
    addToast("success","Retry Complete",tx.service);
  };

  const handleNav = (page: string) => {
    if (["airtime","data","fund"].includes(page)) { setModal(page); return; }
    setActivePage(page);
  };

  const pageTitle: Record<string,string> = { dashboard:"Dashboard", transactions:"Transactions", admin:"Admin Panel" };

  if (showSplash) return <><GlobalStyles/><SplashScreen onDone={()=>setShowSplash(false)}/></>;
  if (!user) return <><GlobalStyles/><AuthScreen onLogin={handleLogin}/></>;

  return (
    <>
      <GlobalStyles/>
      <Toasts toasts={toasts}/>

      {modal==="airtime"&&<AirtimeModal onClose={()=>setModal(null)} balance={balance} onSubmit={handleTransaction} isMobile={isMobile}/>}
      {modal==="data"&&<DataModal onClose={()=>setModal(null)} balance={balance} onSubmit={handleTransaction} isMobile={isMobile}/>}
      {modal==="fund"&&<FundModal onClose={()=>setModal(null)} onSubmit={handleTransaction} isMobile={isMobile}/>}

      {/* Mobile drawer */}
      {isMobile&&<MobileDrawer active={activePage} onNav={handleNav} user={user} onLogout={handleLogout} open={drawerOpen} onClose={()=>setDrawerOpen(false)}/>}

      <div style={{display:"flex",minHeight:"100vh",background:"#080C14"}}>
        {/* Desktop sidebar only */}
        {!isMobile&&<Sidebar active={activePage} onNav={handleNav} user={user} onLogout={handleLogout} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed}/>}

        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"auto",paddingBottom:isMobile?80:0}}>
          {/* Top bar */}
          <div className="glass" style={{position:"sticky",top:0,zIndex:100,padding:isMobile?"12px 16px":"14px 28px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:isMobile?10:0}}>
              {isMobile&&(
                <button onClick={()=>setDrawerOpen(true)} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.06)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",marginRight:4}}>
                  <Menu size={18}/>
                </button>
              )}
              <div>
                <h2 style={{fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:isMobile?16:18,color:"#fff",letterSpacing:"-.3px"}}>{pageTitle[activePage]||"Dashboard"}</h2>
                {!isMobile&&<p style={{color:"#475569",fontSize:12}}>{new Date().toLocaleDateString("en-NG",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{position:"relative"}}>
                <button style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.06)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b"}}>
                  <Bell size={16}/>
                </button>
                <span style={{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:"#00D4AA",border:"2px solid #080C14"}}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"rgba(255,255,255,.04)",borderRadius:10,border:"1px solid rgba(255,255,255,.06)"}}>
                <div style={{width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,rgba(0,212,170,.2),rgba(0,212,170,.4))",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:"#00D4AA",fontWeight:700,fontSize:11,fontFamily:"Syne, sans-serif"}}>{user?.name?.charAt(0)}</span>
                </div>
                {!isMobile&&<span style={{color:"#94a3b8",fontSize:13,fontWeight:600}}>{user?.name?.split(" ")[0]}</span>}
              </div>
            </div>
          </div>

          {/* Page content */}
          <div style={{flex:1,padding:isMobile?"16px":"28px",maxWidth:1100,width:"100%"}}>

            {activePage==="dashboard"&&(
              <div style={{display:"flex",flexDirection:"column",gap:isMobile?16:22}} className="fade-up">
                <WalletCard balance={balance} loading={loadingDash} onFund={()=>setModal("fund")} isMobile={isMobile}/>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?16:20}}>
                  <div>
                    <p style={{color:"#64748b",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Quick Actions</p>
                    <QuickActions onAction={(id: string)=>setModal(id)} isMobile={isMobile}/>
                  </div>
                  <div>
                    <p style={{color:"#64748b",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Overview</p>
                    <QuickStats transactions={transactions}/>
                  </div>
                </div>
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <h3 style={{fontFamily:"Syne, sans-serif",fontWeight:700,fontSize:16,color:"#fff"}}>Recent Transactions</h3>
                    <button onClick={()=>setActivePage("transactions")} style={{color:"#00D4AA",background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>View All<ChevronRight size={14}/></button>
                  </div>
                  <TxTable transactions={transactions} limit={5} onDownload={downloadReceipt} onRetry={handleRetry} isMobile={isMobile}/>
                </div>
              </div>
            )}

            {activePage==="transactions"&&(
              <div className="fade-up">
                <div style={{marginBottom:20}}>
                  <h1 style={{fontFamily:"Syne, sans-serif",fontWeight:800,fontSize:isMobile?22:26,color:"#fff",letterSpacing:"-.5px"}}>Transaction History</h1>
                  <p style={{color:"#64748b",fontSize:13,marginTop:4}}>{transactions.length} total transactions</p>
                </div>
                <div style={{marginBottom:18}}><QuickStats transactions={transactions}/></div>
                <TxTable transactions={transactions} onDownload={downloadReceipt} onRetry={handleRetry} showFilters isMobile={isMobile}/>
              </div>
            )}

            {activePage==="admin"&&user?.isAdmin&&(
              <div className="fade-up"><AdminPanel isMobile={isMobile}/></div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      {isMobile&&<BottomNav active={activePage} onNav={handleNav} onOpenDrawer={()=>setDrawerOpen(true)}/>}
    </>
  );
}
