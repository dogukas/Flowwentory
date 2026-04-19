"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import {
  Eye, EyeOff, ArrowRight, Shield, Lock,
  Loader2, AlertCircle, CheckCircle2,
  BarChart3, Package2, TrendingUp, Users, Zap
} from "lucide-react";

const FEATURES = [
  { icon: Package2, title: "Stok Yönetimi", desc: "Anlık envanter takibi ve ürün analizi", color: "from-indigo-500/20 to-indigo-600/10", accent: "text-indigo-400", bar: 78 },
  { icon: BarChart3, title: "Satış Analizi", desc: "Marka ve sezon bazlı satış raporları", color: "from-violet-500/20 to-violet-600/10", accent: "text-violet-400", bar: 62 },
  { icon: Users, title: "Personel KPI", desc: "Hedef takibi ve performans metrikleri", color: "from-purple-500/20 to-purple-600/10", accent: "text-purple-400", bar: 91 },
  { icon: TrendingUp, title: "Ürün Planlama", desc: "RPT talep ve onay yönetimi", color: "from-fuchsia-500/20 to-fuchsia-600/10", accent: "text-fuchsia-400", bar: 55 },
];

function AnimatedBar({ value, color }: { value: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), 600); return () => clearTimeout(t); }, [value]);
  return (
    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tl = gsap.timeline();
    tl.from(leftRef.current, { x: -60, opacity: 0, duration: 0.9, ease: "power3.out" })
      .from(rightRef.current, { x: 60, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.7")
      .from(".form-item", { y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, "-=0.5")
      .from(".feature-card", { y: 30, opacity: 0, duration: 0.5, stagger: 0.12, ease: "power2.out" }, "-=0.6");
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
        gsap.fromTo(leftRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#0a0a14]">
      {/* LEFT — LOGIN FORM */}
      <div ref={leftRef} className="relative w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-14 xl:px-20 py-12 z-10">
        <div className="absolute top-[-10%] left-[-20%] w-96 h-96 rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 rounded-full bg-violet-600/20 blur-[100px] pointer-events-none" />

        <div className="form-item flex items-center gap-3 mb-14">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
            <Image src="/icon.png" alt="Flope" width={24} height={24} />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none">Flope ERP</div>
            <div className="text-slate-500 text-xs mt-0.5">Enterprise Solutions</div>
          </div>
        </div>

        <div className="form-item mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
            Tekrar<br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">Hoş Geldiniz</span>
          </h1>
          <p className="text-slate-400 mt-3 text-sm leading-relaxed">Hesabınıza giriş yaparak şirketinize özel verilere erişin.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="form-item space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-widest">E-posta</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="kullanici@firma.com" required
              className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200" />
          </div>

          <div className="form-item space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-widest">Şifre</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-600 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200" />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="form-item flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={15} className="shrink-0" />{error}
            </div>
          )}

          <div className="form-item pt-2">
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 px-6 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all duration-200 text-sm">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Giriş yapılıyor...</> : <>Giriş Yap <ArrowRight size={16} /></>}
            </button>
          </div>
        </form>

        <p className="form-item mt-4 text-center text-xs text-slate-600">
          Şirketiniz henüz kayıtlı değil mi?{" "}
          <a href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Şirket Kaydı</a>
        </p>

        <div className="form-item mt-6 flex items-start gap-2 text-xs text-slate-600">
          <Lock size={11} className="mt-0.5 shrink-0 text-slate-500" />
          <span>Verileriniz şifreli olarak saklanır. Her şirket yalnızca kendi verisine erişebilir. KVKK kapsamında korunmaktadır.</span>
        </div>
        <p className="form-item mt-6 text-xs text-slate-700 text-center">© 2026 Doğukan Tevfik Sağıroğlu · Flope ERP v1.0</p>

      </div>

      {/* RIGHT — KVKK UYUMLU PANELİ */}
      <div ref={rightRef} className="hidden lg:flex flex-1 relative flex-col justify-center px-10 xl:px-16 py-12 border-l border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-[#0a0a14] to-violet-950/30 pointer-events-none" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-lg w-full mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5 w-fit">
              <Shield size={12} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">KVKK Uyumlu · Şifreli Veri</span>
            </div>
            <h2 className="text-white font-bold text-2xl mt-4">
              Şirketinize Özel,<br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Güvenli Platform</span>
            </h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Flope ERP&apos;de her şirketin verileri tamamen izole edilmiştir. Sadece yetkili kullanıcılar kendi şirket verilerine erişebilir.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f.title} className={`feature-card bg-gradient-to-r ${f.color} border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-all duration-300 group`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <f.icon size={15} className={f.accent} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-semibold">{f.title}</span>
                      <span className={`text-xs font-bold ${f.accent}`}>{f.bar}%</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5 truncate">{f.desc}</p>
                    <AnimatedBar value={f.bar} color={f.accent.replace("text-", "bg-")} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-white/3 border border-white/8 rounded-2xl p-4 space-y-2">
            {["Şirket verileri birbirinden tamamen izole", "AES-256 şifreleme ile depolama", "Rol bazlı erişim kontrolü (RBAC)", "KVKK & GDPR uyumlu altyapı"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-400">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 justify-center">
            <Zap size={12} className="text-indigo-400" />
            <span className="text-xs text-slate-600">Supabase RLS · Next.js 16 · Multi-tenant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
