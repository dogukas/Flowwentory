"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Ana Sayfaya Dön
        </Link>
        
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-6">
          <p>Son Güncelleme: 11 Temmuz 2026</p>
          
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">1. Veri Güvenliği ve İzolasyon</h2>
          <p>
            Flowwentory SaaS platformu olarak, verilerinizin güvenliği bizim için en önemli önceliktir. 
            Müşterilerimize (Şirketlere) ait tüm stok, personel ve satış verileri Row Level Security (RLS) ile tamamen izole edilmiş olup, şirket yöneticileri dışında (sistem yöneticilerimiz dahil) erişime kapalıdır.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">2. Hangi Verileri Topluyoruz?</h2>
          <p>Sistemi kullanabilmeniz için aşağıdaki veriler toplanmaktadır:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Şirket Bilgileri:</strong> Şirket unvanı, fatura adresi, vergi numarası.</li>
            <li><strong>Kullanıcı Bilgileri:</strong> İsim, e-posta adresi, şifre (kriptolanmış olarak).</li>
            <li><strong>İşletme Verileri:</strong> Platforma kendi rızanızla yüklediğiniz stok kayıtları, satış verileri ve personel KPI verileri.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">3. Ödeme Verileri (Stripe)</h2>
          <p>
            Flowwentory üzerinden gerçekleştirdiğiniz ödemeler (Pro/Enterprise planları) global ödeme kuruluşu Stripe üzerinden işlenir. 
            Flowwentory hiçbir şekilde kredi kartı numaranızı, CVC veya son kullanma tarihi bilgilerinizi sunucularında saklamaz.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">4. İletişim</h2>
          <p>
            KVKK haklarınızla ilgili bilgi almak, verilerinizin silinmesini (Unutulma Hakkı) talep etmek veya sistemdeki verilerinizi dışa aktarmak için 
            <a href="mailto:privacy@flowwentory.com" className="text-indigo-600 ml-1">privacy@flowwentory.com</a> adresi üzerinden veri sorumlumuz ile iletişime geçebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
