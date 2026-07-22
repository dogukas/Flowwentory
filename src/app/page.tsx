"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Box, BarChart3, Shield, Globe, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center p-1.5 shadow-lg shadow-indigo-600/20">
              <Image src="/logo-flow.png?v=3" alt="Logo" width={24} height={24} className="brightness-0 invert" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Flowwentory</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="#features" className="hover:text-indigo-600 transition-colors">Özellikler</Link>
            <Link href="/pricing" className="hover:text-indigo-600 transition-colors">Fiyatlandırma</Link>
            <Link href="/login" className="hover:text-indigo-600 transition-colors">Giriş Yap</Link>
            <Button asChild className="rounded-full px-6">
              <Link href="/pricing">Ücretsiz Başla</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6 border border-indigo-100 dark:border-indigo-500/20">
              <Zap size={14} /> Flowwentory 2.0 Yayında
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight"
          >
            Tekstil ve Perakende İçin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Akıllı Envanter</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Stoklarınızı, satışlarınızı ve ekibinizi tek bir platformdan yönetin. Küresel markalar için çok dilli, çok kullanıcılı SaaS çözümü.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="rounded-full px-8 h-14 text-base w-full sm:w-auto shadow-lg shadow-indigo-600/20">
              <Link href="/pricing">
                Hemen Başlayın <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-14 text-base w-full sm:w-auto bg-white dark:bg-slate-900">
              <Link href="/login">Sisteme Giriş</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">İşletmenizi Büyütmek İçin Tasarlandı</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Karmaşık süreçleri basit, hızlı ve güvenli bir şekilde yönetin.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                <Box size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Gelişmiş Stok Takibi</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Renk, beden, sezon ve marka bazında detaylı varyasyon takibi. Binlerce ürünü saniyeler içinde arayın ve filtreleyin.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Kapsamlı Raporlama</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Hangi ürün çok satıyor, hangi sezonda en çok ciro yapıldı? Akıllı gösterge paneliyle verilerinizi görselleştirin.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">İzole Veri (Multi-tenant)</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Her şirketin verisi KVKK ve GDPR'a uygun olarak ayrı tutulur (Row Level Security). Asla diğer verilerle karışmaz.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Global Uyum (i18n)</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Türkçe ve İngilizce dil desteği, otomatik döviz çevrimi ve ülkeye özel saat dilimi yapılandırmaları.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Personel KPI & Analizi</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Mağaza çalışanlarınızın hedeflerini, ciro katkılarını ve performans metriklerini tek ekrandan ölçün.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                <Box size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Hızlı Stok Sayımı</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Barkod ile saniyeler içinde mağaza/depo sayımlarını yapın. Eksik/fazla tespitlerini otomatik listeyin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-center">
        <p>© 2026 Flowwentory SaaS Platform. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
