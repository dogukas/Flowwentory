"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import {
  Eye, EyeOff, ArrowRight, Lock,
  Loader2, AlertCircle, CheckCircle2
} from "lucide-react";

function LogoRing() {
  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <div className="absolute inset-0 rounded-full border border-indigo-500/30" style={{ animation: "pulse-ring 3s ease-out infinite" }} />
      <div className="absolute inset-0 rounded-full border border-indigo-500/20" style={{ animation: "pulse-ring 3s ease-out infinite 1s" }} />
      <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, transparent 75%, rgba(99,102,241,0.6) 100%)", animation: "spin-slow 4s linear infinite" }} />
      <div className="absolute rounded-full" style={{ inset: 4, background: "conic-gradient(from 0deg, transparent 60%, rgba(139,92,246,0.5) 100%)", animation: "counter-spin 6s linear infinite" }} />
      <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 flex items-center justify-center shadow-xl">
        <Image src="/icon.png" alt="Flowventory" width={22} height={22} className="object-contain" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    gsap.set(cardRef.current, { opacity: 0, scale: 0.95, y: 20 });
    gsap.set(".form-item", { opacity: 0, y: 15 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(cardRef.current, { y: 0, opacity: 1, scale: 1, duration: 0.8 })
      .to(".form-item", { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 }, "-=0.5");
    return () => { tl.kill(); };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message.includes("Invalid login") ? "E-posta veya şifre hatalı." : error.message);
        gsap.fromTo(cardRef.current, { x: -8 }, { x: 0, duration: 0.45, ease: "elastic.out(1, 0.3)" });
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get("redirect") || "/dashboard";
        window.location.href = redirectUrl;
      }
    } catch {
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = email.length > 0 && password.length > 0;

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center overflow-hidden relative px-4" style={{ background: "#07070f" }}>

      {/* ── Global CSS ── */}
      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,30px) scale(0.95)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-40px,-30px) scale(1.08)} }
        @keyframes pulse-ring { 0%{transform:scale(0.8);opacity:0.8} 100%{transform:scale(1.6);opacity:0} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes counter-spin { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .shimmer-text {
          background: linear-gradient(90deg,#818cf8,#a78bfa,#c084fc,#a78bfa,#818cf8);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .grid-pattern {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .input-glow:focus-within {
          box-shadow: 0 0 0 2px rgba(99,102,241,0.25), 0 0 20px rgba(99,102,241,0.1);
        }
      `}</style>

      {/* ── Background Elements ── */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" aria-hidden="true" />
      <div className="absolute rounded-full pointer-events-none" style={{ width:600, height:600, top:"-10%", left:"-10%", background:"radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)", filter:"blur(80px)", animation:"float1 14s ease-in-out infinite" }} />
      <div className="absolute rounded-full pointer-events-none" style={{ width:500, height:500, bottom:"-10%", right:"-5%", background:"radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)", filter:"blur(90px)", animation:"float2 16s ease-in-out infinite" }} />
      <div className="absolute rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 800, height: 800, background: "radial-gradient(circle,rgba(99,102,241,0.03) 0%,transparent 60%)", filter: "blur(100px)" }} />

      {/* ── Login Card ── */}
      <div 
        ref={cardRef}
        className="relative z-10 w-full max-w-[420px] rounded-[2rem] p-8 sm:p-10 border border-white/10"
        style={{ 
          background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", 
          backdropFilter: "blur(24px)",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
        }}
      >
        <div className="form-item flex flex-col items-center justify-center text-center mb-8">
          <LogoRing />
          <h1 className="text-2xl sm:text-[1.75rem] font-bold text-white tracking-tight mt-6 mb-2">
            Flowventory <span className="shimmer-text">ERP</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Lütfen yetkili hesap bilgilerinizle giriş yapın.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="form-item">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
              E-posta Adresi
            </label>
            <div className={`relative rounded-2xl transition-all duration-300 input-glow ${emailFocused ? "bg-white/[0.06] border border-indigo-500/50" : "bg-white/[0.04] border border-white/8 hover:border-white/15"}`}>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="ornek@firma.com"
                required
                autoComplete="email"
                className="w-full bg-transparent text-white placeholder:text-slate-600 rounded-2xl px-4 py-3.5 text-sm outline-none"
              />
              {email && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <CheckCircle2 size={15} className="text-indigo-400/70" />
                </div>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="form-item">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Şifre</label>
            </div>
            <div className={`relative rounded-2xl transition-all duration-300 input-glow ${passwordFocused ? "bg-white/[0.06] border border-indigo-500/50" : "bg-white/[0.04] border border-white/8 hover:border-white/15"}`}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-transparent text-white placeholder:text-slate-600 rounded-2xl px-4 py-3.5 pr-12 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                style={{ minHeight: "auto", minWidth: "auto" }}
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="form-item flex items-center gap-2.5 text-rose-400 bg-rose-500/8 border border-rose-500/20 rounded-2xl px-4 py-3 text-sm">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <div className="form-item pt-2">
            <button
              id="login-submit"
              type="submit"
              disabled={loading || !isFormFilled}
              className="relative w-full overflow-hidden rounded-2xl py-3.5 px-6 font-semibold text-sm text-white flex items-center justify-center gap-2.5 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isFormFilled && !loading ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "linear-gradient(135deg,#3730a3,#5b21b6)",
                boxShadow: isFormFilled && !loading ? "0 8px 32px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              {loading ? (
                <><Loader2 size={16} className="animate-spin shrink-0" /><span>Giriş yapılıyor…</span></>
              ) : (
                <><span>Giriş Yap</span><ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </div>
        </form>

        {/* Security notice */}
        <div className="form-item mt-6 flex items-start gap-2.5 text-xs text-slate-500 bg-white/[0.02] border border-white/5 rounded-xl px-3.5 py-3 justify-center text-center">
          <Lock size={12} className="mt-0.5 shrink-0 text-slate-600" />
          <span className="leading-relaxed">Sistem sadece yönetici tarafından yetkilendirilmiş hesaplara açıktır.</span>
        </div>
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10 pointer-events-none">
        <p className="text-[11px] text-slate-600">© 2026 Flowventory Enterprise · Tüm Hakları Saklıdır.</p>
      </div>

    </div>
  );
}
