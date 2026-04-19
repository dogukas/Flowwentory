"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { supabase } from "@/lib/supabase";
import {
  Eye, EyeOff, ArrowRight, Building2, Mail,
  Lock, User, Loader2, AlertCircle, CheckCircle2,
  Shield, Zap
} from "lucide-react";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function RegisterPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"form" | "confirm">("form");

  useEffect(() => {
    const tl = gsap.timeline();
    tl.from(formRef.current, { x: -50, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(rightRef.current, { x: 50, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .from(".reg-item", { y: 20, opacity: 0, stagger: 0.07, duration: 0.5, ease: "power2.out" }, "-=0.5");
    return () => { tl.kill(); };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Şifre en az 6 karakter olmalıdır."); return; }
    if (!companyName.trim()) { setError("Şirket adı gereklidir."); return; }

    setLoading(true);
    try {
      // 1. Auth kullanıcısı oluştur
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Bu e-posta adresi zaten kayıtlı.");
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (!authData.user) { setError("Kullanıcı oluşturulamadı."); return; }

      // 2. Şirket oluştur + profili bağla (Supabase RPC)
      const { data: regResult, error: regError } = await supabase.rpc("register_company", {
        p_company_name: companyName.trim(),
        p_company_slug: slugify(companyName),
        p_user_id: authData.user.id,
      });

      if (regError || (regResult as any)?.error) {
        setError((regResult as any)?.error || "Şirket oluşturulurken hata oluştu.");
        return;
      }

      setStep("confirm");
      setSuccess(true);

      // E-posta doğrulama gerekmiyorsa direkt dashboard'a yönlendir
      if (authData.session) {
        setTimeout(() => router.push("/dashboard"), 2000);
      }

    } catch {
      setError("Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#0a0a14]">

      {/* LEFT — KAYIT FORMU */}
      <div ref={formRef} className="relative w-full lg:w-[55%] flex flex-col justify-center px-8 sm:px-14 xl:px-20 py-12 z-10">
        <div className="absolute top-[-10%] left-[-20%] w-96 h-96 rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-72 h-72 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="reg-item flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
            <Image src="/icon.png" alt="Flope" width={24} height={24} />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none">Flope ERP</div>
            <div className="text-slate-500 text-xs mt-0.5">Enterprise Solutions</div>
          </div>
        </div>

        {step === "confirm" ? (
          // Başarı ekranı
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Şirketiniz Oluşturuldu!</h2>
            <p className="text-slate-400 text-sm mb-2">
              <span className="text-white font-semibold">{companyName}</span> başarıyla sisteme eklendi.
            </p>
            <p className="text-slate-500 text-xs">Dashboard&apos;a yönlendiriliyorsunuz...</p>
          </div>
        ) : (
          <>
            <div className="reg-item mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Şirketinizi<br />
                <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Kaydedin
                </span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm">Her şirket kendi izole ortamında çalışır.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 max-w-md">
              {/* Şirket Adı */}
              <div className="reg-item space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-widest">Şirket Adı</label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Tekstil Ltd." required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                </div>
                {companyName && (
                  <p className="text-xs text-slate-500">Slug: <span className="text-violet-400">{slugify(companyName)}</span></p>
                )}
              </div>

              {/* Ad Soyad */}
              <div className="reg-item space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-widest">Ad Soyad (Admin)</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ahmet Yılmaz" required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                </div>
              </div>

              {/* E-posta */}
              <div className="reg-item space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-widest">E-posta</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@sirketiniz.com" required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                </div>
              </div>

              {/* Şifre */}
              <div className="reg-item space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-widest">Şifre</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-600 rounded-xl pl-10 pr-12 py-3 text-sm outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="reg-item flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle size={15} className="shrink-0" />{error}
                </div>
              )}

              <div className="reg-item pt-2">
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all text-sm">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Oluşturuluyor...</> : <>Şirketi Kaydet <ArrowRight size={16} /></>}
                </button>
              </div>

              <p className="reg-item text-center text-xs text-slate-600">
                Zaten hesabınız var mı?{" "}
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Giriş yapın</Link>
              </p>
            </form>
          </>
        )}

        <div className="reg-item mt-8 flex items-start gap-2 text-xs text-slate-600">
          <Shield size={11} className="mt-0.5 shrink-0 text-slate-500" />
          <span>Her şirket verisi birbirinden tamamen izole. KVKK & GDPR uyumlu.</span>
        </div>
      </div>

      {/* RIGHT — MİMARİ AÇIKLAMA */}
      <div ref={rightRef} className="hidden lg:flex flex-1 relative flex-col justify-center px-10 xl:px-14 py-12 border-l border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-[#0a0a14] to-indigo-950/30 pointer-events-none" />

        <div className="relative z-10 max-w-md mx-auto w-full">
          <div className="mb-8">
            <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1.5 w-fit">
              <Building2 size={12} className="text-violet-400" />
              <span className="text-xs text-violet-400 font-medium">Multi-Tenant Mimari</span>
            </div>
            <h2 className="text-white font-bold text-xl mt-4">Nasıl Çalışır?</h2>
          </div>

          {/* Mimari diyagram */}
          <div className="space-y-3">
            {[
              { step: "1", title: "Şirket Kaydı", desc: "Firma adı + admin bilgileri girilir", color: "border-violet-500/30 bg-violet-500/5", accent: "text-violet-400", dot: "bg-violet-500" },
              { step: "2", title: "İzole Ortam", desc: "Şirket ID ile tüm veriler etiketlenir", color: "border-indigo-500/30 bg-indigo-500/5", accent: "text-indigo-400", dot: "bg-indigo-500" },
              { step: "3", title: "RLS Koruması", desc: "Supabase otomatik filtreler — başka şirketi göremez", color: "border-purple-500/30 bg-purple-500/5", accent: "text-purple-400", dot: "bg-purple-500" },
              { step: "4", title: "Kullanıcı Daveti", desc: "Admin, aynı şirkete ek kullanıcı davet eder", color: "border-fuchsia-500/30 bg-fuchsia-500/5", accent: "text-fuchsia-400", dot: "bg-fuchsia-500" },
            ].map((item) => (
              <div key={item.step} className={`flex items-start gap-3 border ${item.color} rounded-2xl p-4`}>
                <div className={`w-6 h-6 rounded-full ${item.dot} flex items-center justify-center shrink-0 mt-0.5`}>
                  <span className="text-white text-xs font-bold">{item.step}</span>
                </div>
                <div>
                  <div className={`text-sm font-semibold ${item.accent}`}>{item.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* DB Diyagramı */}
          <div className="mt-6 bg-white/3 border border-white/8 rounded-2xl p-4">
            <p className="text-xs text-slate-500 font-mono mb-3">Supabase (tek DB)</p>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex gap-2"><span className="text-slate-500">├──</span><span className="text-violet-300">companies</span><span className="text-slate-600">(A, B, C...)</span></div>
              <div className="flex gap-2"><span className="text-slate-500">├──</span><span className="text-indigo-300">profiles</span><span className="text-slate-600">(user→company)</span></div>
              <div className="flex gap-2"><span className="text-slate-500">├──</span><span className="text-purple-300">stocks</span><span className="text-slate-600">+ company_id + RLS</span></div>
              <div className="flex gap-2"><span className="text-slate-500">└──</span><span className="text-fuchsia-300">sales</span><span className="text-slate-600">+ company_id + RLS</span></div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span className="text-xs text-emerald-400">Şirketler birbirini göremez</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 justify-center">
            <Zap size={12} className="text-violet-400" />
            <span className="text-xs text-slate-600">Row Level Security · PostgreSQL · Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
