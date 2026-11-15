"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Box,
  BarChart3,
  Shield,
  Globe,
  Zap,
  Users,
  CheckCircle2,
  ScanBarcode,
  Layers,
  Sparkles,
  TrendingUp,
  Warehouse,
  FileSpreadsheet,
  ArrowUpRight,
  Play,
  Activity,
  AlertTriangle,
} from "lucide-react";

const LandingHero3D = dynamic(() => import("@/components/canvas/LandingHero3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[460px] md:h-[540px] flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center animate-pulse">
          <Box className="w-8 h-8 text-indigo-600 animate-bounce" />
        </div>
        <span className="text-xs font-medium text-slate-400">3D Akıllı Depo Sahnesi Yükleniyor...</span>
      </div>
    </div>
  ),
});

// ============================================================
// 3D TILT EFEKTLİ BENTO KART BİLEŞENİ
// ============================================================
function TiltBentoCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.12 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: "transform 0.18s ease-out",
      }}
      className={`relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] hover:border-indigo-200/80 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(99,102,241,0.5), transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}

// ============================================================
// ANA TANITIM SAYFASI (LANDING PAGE)
// ============================================================
export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "warehouse" | "counting" | "planning">(
    "dashboard"
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-500/20 overflow-x-hidden">
      {/* Arka Plan Kurumsal Işık Dokusu */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(#cbd5e1 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[130px]" />
        <div className="absolute top-1/4 -right-40 w-[550px] h-[550px] rounded-full bg-violet-400/10 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] rounded-full bg-sky-400/10 blur-[130px]" />
      </div>

      {/* ================= NAVBAR ================= */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
          {/* Sol: Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform">
              <Image
                src="/logo-flow.png?v=3"
                alt="Flowwentory Logo"
                width={22}
                height={22}
                className="brightness-0 invert object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[17px] tracking-tight text-slate-900 leading-none">
                Flowwentory
              </span>
              <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase mt-1">
                Enterprise ERP
              </span>
            </div>
          </Link>

          {/* Orta: Hap (Pill) Navigasyon Menüsü */}
          <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-slate-100/80 border border-slate-200/70">
            <Link
              href="#showcase"
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm transition-all"
            >
              Canlı Vitrin
            </Link>
            <Link
              href="#features"
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm transition-all"
            >
              Özellikler
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm transition-all"
            >
              Dashboard
            </Link>
            <Link
              href="/warehouse-3d"
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100 transition-all flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <span>3D Dijital Depo</span>
            </Link>
          </nav>

          {/* Sağ: Aksiyon Butonları */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors"
            >
              Giriş Yap
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-indigo-600 text-white shadow-md shadow-slate-900/10 hover:shadow-indigo-600/25 transition-all flex items-center gap-1.5"
            >
              <span>Panele Geç</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobil Menü Butonları */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 bg-white"
            >
              Giriş
            </Link>
            <Link
              href="/dashboard"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white"
            >
              Panel
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION (SOL METİN + SAĞ THREE.JS SAHNESİ) ================= */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-6 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          {/* Sol Sütun: Başlık & CTA */}
          <div className="lg:col-span-6 text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 text-indigo-600 text-xs font-semibold border border-indigo-200/70 shadow-sm">
                <Sparkles size={14} className="text-indigo-500" />
                Flowwentory 2.0 • Three.js 3D Depo & Akıllı ERP
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]"
            >
              Tekstil ve Perakende İçin{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500">
                Akıllı Envanter
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="text-lg text-slate-600 leading-relaxed max-w-xl"
            >
              Stoklarınızı, barkodlu sayımlarınızı, RPT sipariş planlamasını ve 3 boyutlu depo
              ikizinizi tek bir platformdan yönetin. Küresel markalar için çok dilli, çok
              kullanıcılı kurumsal SaaS çözümü.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 h-13 text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02]"
              >
                <Link href="/register">
                  Hemen Başlayın <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-7 h-13 text-base bg-white/90 hover:bg-slate-100 border-slate-200 text-slate-800 shadow-sm"
              >
                <Link href="/login">Sisteme Giriş</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="rounded-full px-5 h-13 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-2"
              >
                <Link href="/warehouse-3d">
                  <Play className="w-4 h-4 fill-indigo-600" /> 3D Depoyu Dene
                </Link>
              </Button>
            </motion.div>

            {/* Hızlı Güven & Özellik Rozetleri */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80"
            >
              <div>
                <div className="text-2xl font-extrabold text-slate-900">100K+</div>
                <div className="text-xs text-slate-500 font-medium">Anlık SKU & Varyant</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-indigo-600">%99.8</div>
                <div className="text-xs text-slate-500 font-medium">Barkod Sayım Doğruluğu</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">KVKK</div>
                <div className="text-xs text-slate-500 font-medium">Multi-Tenant RLS İzole</div>
              </div>
            </motion.div>
          </div>

          {/* Sağ Sütun: İnteraktif Three.js Akıllı Depo & Veri Küpü */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 relative"
          >
            <LandingHero3D />
          </motion.div>
        </div>
      </section>

      {/* ================= CANLI İSTATİSTİK & GÜVEN ŞERİDİ ================= */}
      <section className="py-8 border-y border-slate-200/70 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gerçek Zamanlı ERP Altyapısı
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-8 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Renk / Beden / Sezon Matrisi
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Tek Tıkla Excel & Bulut Senkron
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Kamera ile Canlı Barkod Okuma
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Three.js 3B Depo Simülasyonu
            </span>
          </div>
        </div>
      </section>

      {/* ================= İNTERAKTİF ÜRÜN & MODÜL VİTRİNİ ================= */}
      <section id="showcase" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="bg-indigo-50 text-indigo-600 border-indigo-200 mb-3 px-3 py-1">
              İnteraktif Modül Vitrini
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tüm Operasyonunuz Tek Bir Ekranda
            </h2>
            <p className="mt-3 text-slate-600">
              Flowwentory&apos;nin güçlü modüllerini aşağıdan seçerek canlı çalışma mantığını
              inceleyin.
            </p>
          </div>

          {/* Sekme Butonları */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              {
                id: "dashboard",
                label: "Canlı Dashboard & Analitik",
                icon: BarChart3,
              },
              {
                id: "warehouse",
                label: "3D Dijital İkiz Depo",
                icon: Warehouse,
              },
              {
                id: "counting",
                label: "Barkodlu Stok Sayım",
                icon: ScanBarcode,
              },
              {
                id: "planning",
                label: "RPT Sipariş & Kanban",
                icon: Layers,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Vitrin İçeriği */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-indigo-950/5 p-6 md:p-10">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-5 space-y-5">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Gerçek Zamanlı Karar Destek
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                      Düşük Stok, Ölü Stok ve Devir Hızını Anında Yakalayın
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Nivo grafikleri, Treemap ciro haritaları ve otomatik stok uyarı kartları ile
                      hangi markanın veya sezonun ne kadar sattığını saniyeler içinde analiz edin.
                    </p>
                    <ul className="space-y-2.5 text-sm text-slate-700">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        15 gün içinde tükenecek kritik SKU&apos;lar için erken uyarı
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        Hiç satmayan (Dead Stock) ürünleri beden bazında listeleme
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        Tek tıkla Marka Performans Excel raporu indirme
                      </li>
                    </ul>
                    <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                      <Link href="/dashboard">
                        Dashboard&apos;u Aç <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Canlı Simüle Dashboard Önizleme Kartı */}
                  <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-sm">
                        <div className="text-xs text-slate-400 font-medium">Toplam Envanter</div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-1">48.920</div>
                        <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                          +14.2% bu sezon
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-sm">
                        <div className="text-xs text-slate-400 font-medium">Stok Devir Hızı</div>
                        <div className="text-2xl font-extrabold text-indigo-600 mt-1">2.45x</div>
                        <div className="text-[11px] text-indigo-600 font-semibold mt-1">
                          A Grubu Performans
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/70 shadow-sm">
                        <div className="text-xs text-rose-600 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Kritik Stok
                        </div>
                        <div className="text-2xl font-extrabold text-rose-700 mt-1">18 SKU</div>
                        <div className="text-[11px] text-rose-600 font-semibold mt-1">
                          Acil RPT Önerisi
                        </div>
                      </div>
                    </div>

                    {/* Marka Performans Bar Simülasyonu */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200/70 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span>Marka & Sezon Dağılımı (Canlı Önizleme)</span>
                        <span className="text-indigo-600">2026 İlkbahar/Yaz</span>
                      </div>
                      {[
                        { name: "Indigo Denim Co.", pct: 84, stock: "18.400 Adet", color: "bg-indigo-600" },
                        { name: "Aurora Knitwear", pct: 66, stock: "14.210 Adet", color: "bg-violet-500" },
                        { name: "Nova Streetwear", pct: 48, stock: "9.850 Adet", color: "bg-sky-500" },
                        { name: "basics & Co.", pct: 32, stock: "6.460 Adet", color: "bg-emerald-500" },
                      ].map((b, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-700">{b.name}</span>
                            <span className="text-slate-500">{b.stock}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${b.pct}%` }}
                              transition={{ duration: 0.7, delay: i * 0.1 }}
                              className={`h-full rounded-full ${b.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "warehouse" && (
                <motion.div
                  key="warehouse"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-5 space-y-5">
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                      Three.js & WebGL Teknolojisi
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                      Deponuzu 3 Boyutlu Uzayda Gezin ve Isı Haritasını Görün
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Klasik tablolardan sıkıldınız mı? Three.js tabanlı 3B Depo modülüyle her
                      markanın rafını üç boyutlu görün, FPS (Birinci Şahıs) modunda koridorlarda
                      yürüyün ve ABC/Isı haritası modlarıyla yoğunluğu anında tespit edin.
                    </p>
                    <ul className="space-y-2.5 text-sm text-slate-700">
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        Stok yoğunluğuna göre Kırmızı / Sarı / Yeşil 3D Isı Haritası (Heatmap)
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        Aranan ürünü 3B sahnede spot ışığıyla parlatma
                      </li>
                      <li className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        WASD tuşlarıyla depo içinde serbest gezinme modu
                      </li>
                    </ul>
                    <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                      <Link href="/warehouse-3d">
                        3D Depoyu Başlat <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden min-h-[300px] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-5 h-5 text-indigo-400" />
                        <span className="font-bold text-sm">3D Warehouse Digital Twin</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[11px]">
                          Isı Haritası: Aktif
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/30 border border-indigo-400/30 text-[11px]">
                          60 FPS WebGL
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 my-6">
                      {[
                        { code: "RAF A-01", status: "Dolu (%92)", col: "from-emerald-500 to-teal-600" },
                        { code: "RAF A-02", status: "Kritik (%14)", col: "from-rose-500 to-red-600" },
                        { code: "RAF B-01", status: "Dengeli (%64)", col: "from-indigo-500 to-violet-600" },
                        { code: "RAF B-02", status: "A Sınıfı Hızlı", col: "from-amber-500 to-orange-600" },
                      ].map((r, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:scale-105 transition-transform"
                        >
                          <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${r.col} mb-2 shadow-inner`} />
                          <div className="text-xs font-bold">{r.code}</div>
                          <div className="text-[10px] text-slate-300">{r.status}</div>
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-indigo-200 flex items-center justify-between border-t border-white/10 pt-3">
                      <span>Kutulara tıkladığınızda barkod, beden ve envanter kartı açılır.</span>
                      <Link href="/warehouse-3d" className="underline font-semibold text-white">
                        Canlı Sahneye Git →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "counting" && (
                <motion.div
                  key="counting"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-5 space-y-5">
                    <Badge className="bg-violet-50 text-violet-700 border-violet-200">
                      Sıfır Hatalı Envanter
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                      Kamera veya El Terminali ile Saniyeler İçinde Sayım
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Tam sayım, döngüsel (ABC) sayım veya anlık spot sayım etkinlikleri oluşturun.
                      Sistem stoğu ile fiziksel sayım arasındaki farkları otomatik hesaplayın ve
                      yönetici onayına sunun.
                    </p>
                    <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                      <Link href="/stock-counting">
                        Stok Sayım Modülüne Git <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3">
                    {[
                      {
                        sku: "FW-DNM-042 • Mavi • 32/32",
                        sys: 45,
                        cnt: 45,
                        diff: "0 (Tam Uyum)",
                        badge: "bg-emerald-100 text-emerald-700",
                      },
                      {
                        sku: "FW-KNT-108 • Ekru • M",
                        sys: 30,
                        cnt: 28,
                        diff: "-2 Eksik (Onay Bekliyor)",
                        badge: "bg-amber-100 text-amber-700",
                      },
                      {
                        sku: "FW-JKT-019 • Siyah • L",
                        sys: 12,
                        cnt: 14,
                        diff: "+2 Fazla (Bulundu)",
                        badge: "bg-indigo-100 text-indigo-700",
                      },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-sm text-slate-900">{row.sku}</div>
                          <div className="text-xs text-slate-500">
                            Sistem: {row.sys} Adet • Sayılan: {row.cnt} Adet
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.badge}`}>
                          {row.diff}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "planning" && (
                <motion.div
                  key="planning"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="grid lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-5 space-y-5">
                    <Badge className="bg-sky-50 text-sky-700 border-sky-200">
                      Global Retail Replenishment (STR • WOS • ROP)
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                      Asorti Kırılmalarını ve Stok Yetme Süresini (WOS) Otomatik Hesaplayın
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Global perakende standartlarındaki RPT motorumuz; Sell-Through Rate (STR %),
                      Weeks of Supply (WOS), Reorder Point (ROP) ve ana bedenlerdeki asorti
                      kırılmalarını (Broken Size Curve) hesaplayarak ideal sipariş miktarını önerir.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                        S, M, L gibi ana bedenler tükendiğinde otomatik &ldquo;Asorti Kırık&rdquo; uyarısı
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                        Hedef WOS (4-12 Hafta) ve Tedarik Süresine (Lead Time) göre dinamik sipariş adedi
                      </li>
                    </ul>
                    <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                      <Link href="/operations/planning">
                        RPT Planlama Merkezini Aç <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-3 gap-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                    {[
                      {
                        title: "AI RPT Önerileri",
                        color: "border-amber-300 bg-amber-50/50",
                        items: [
                          "FW-TSH-01 • STR: %74 • WOS: 1.8H (+36 Adet)",
                          "FW-DNM-09 • Asorti Kırık (M,L Yok) (+24 Adet)",
                        ],
                      },
                      {
                        title: "Mağaza / Depo Talebi",
                        color: "border-blue-300 bg-blue-50/50",
                        items: ["FW-KNT-44 • STR: %68 • ROP Altı (+48 Adet)"],
                      },
                      {
                        title: "Onaylanan RPT Emri",
                        color: "border-emerald-300 bg-emerald-50/50",
                        items: [
                          "FW-BLZ-12 • +150 Adet (Üretimde)",
                          "FW-PNT-05 • +80 Adet (Transfer)",
                        ],
                      },
                    ].map((col, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border ${col.color} space-y-2`}>
                        <div className="text-xs font-bold text-slate-800">{col.title}</div>
                        {col.items.map((it, k) => (
                          <div
                            key={k}
                            className="p-2.5 rounded-lg bg-white shadow-sm border border-slate-200/60 text-xs font-medium text-slate-700"
                          >
                            {it}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ================= 3D TILT BENTO ÖZELLİK KARTLARI ================= */}
      <section id="features" className="py-20 px-6 bg-white/60 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <Badge className="bg-indigo-50 text-indigo-600 border-indigo-200 mb-3">
              Kurumsal Yetenekler
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              İşletmenizi Büyütmek İçin Tasarlandı
            </h2>
            <p className="mt-4 text-slate-600">
              Karmaşık stok, satış ve ekip süreçlerini basit, hızlı ve güvenli bir şekilde yönetin.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-7">
            <TiltBentoCard className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-6">
                <Box size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Gelişmiş Varyant & Stok</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Renk, beden, sezon ve marka bazında detaylı varyasyon takibi. Binlerce ürünü
                saniyeler içinde arayın, filtreleyin ve Excel ile toplu aktarın.
              </p>
            </TiltBentoCard>

            <TiltBentoCard className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Kapsamlı Ciro & Devir Analizi</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Hangi ürün çok satıyor, hangi sezonda en çok ciro yapıldı? Nivo Treemap, Heatmap ve
                Donut grafikleriyle verilerinizi görselleştirin.
              </p>
            </TiltBentoCard>

            <TiltBentoCard className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">KVKK & Multi-Tenant İzolasyon</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Her şirketin verisi PostgreSQL Row Level Security (RLS) ile tamamen izole tutulur.
                Admin, Kullanıcı ve İzleyici rolleriyle ekibinizi güvenle yönetin.
              </p>
            </TiltBentoCard>

            <TiltBentoCard className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-6">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Global Uyum (TR / EN)</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Türkçe ve İngilizce dil desteği, çoklu para birimi formatlama ve uluslararası
                ekipler için anlık dil değiştirme altyapısı.
              </p>
            </TiltBentoCard>

            <TiltBentoCard className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Personel KPI & Veri Ölçekleme</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Mağaza çalışanlarınızın satış katkılarını, en çok satan Top 10 ürünleri ve kadın /
                erkek / çocuk kategori dağılımlarını tek ekrandan ölçün.
              </p>
            </TiltBentoCard>

            <TiltBentoCard className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-6">
                <ScanBarcode size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3D Depo & Hızlı Barkod Sayımı</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Kamera ile barkod okutarak mağaza/depo sayımlarını yapın, fark onaylarını yönetin ve
                Three.js 3B depo sahnesinde raflarınızı canlı izleyin.
              </p>
            </TiltBentoCard>
          </div>
        </div>
      </section>

      {/* ================= ALT CTA BANNER ================= */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-10 md:p-16 text-white shadow-2xl shadow-indigo-600/25 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl space-y-3 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Envanterinizi Geleceğe Taşımaya Hazır mısınız?
              </h2>
              <p className="text-indigo-100 text-base">
                Şirket hesabınızı saniyeler içinde oluşturun, Excel verilerinizi yükleyin ve 3D
                destekli analizlere hemen başlayın.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 h-13 shadow-lg"
              >
                <Link href="/register">
                  Ücretsiz Şirket Hesabı Aç <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 px-7 h-13"
              >
                <Link href="/login">Giriş Yap</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center p-1">
              <Image
                src="/logo-flow.png?v=3"
                alt="Logo"
                width={18}
                height={18}
                className="brightness-0 invert"
              />
            </div>
            <span className="font-bold text-white">Flowwentory</span>
            <span className="text-xs text-slate-500">v2.0 Enterprise</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Gizlilik Politikası & KVKK
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Kullanım Koşulları
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Yönetim Paneli
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 Flowwentory SaaS Platform. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
