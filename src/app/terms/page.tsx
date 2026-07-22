"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Ana Sayfaya Dön
        </Link>
        
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Kullanım Koşulları</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-6">
          <p>Son Güncelleme: 11 Temmuz 2026</p>
          
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">1. Hizmetin Tanımı</h2>
          <p>
            Flowwentory, tekstil ve perakende sektörüne yönelik bulut tabanlı bir Kurumsal Kaynak Planlama (ERP) ve Envanter Yönetimi platformudur.
            Bu şartlar, yazılımı bir hizmet olarak (SaaS) kullanımınızı düzenler.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">2. Kullanıcı Sorumlulukları</h2>
          <p>Sistemi kullanan firmalar şunları kabul eder:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Sisteme yüklenen tüm stok, barkod ve ticari verilerin doğruluğu ve yasallığı kullanıcının sorumluluğundadır.</li>
            <li>Hesap şifrelerinin güvenliğinden ve kullanıcı alt hesaplarının (personel) yönetiminden şirket yöneticisi sorumludur.</li>
            <li>Sistemi tersine mühendislik yapmak, kopyalamak veya kötüye kullanmak yasaktır.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8">3. İptal ve İade Koşulları</h2>
          <p>
            Aylık ve yıllık abonelik iptalleri bir sonraki fatura döneminden itibaren geçerli olur. Kullanılan dönem için kısmi iade yapılmamaktadır. 
            Abonelik iptal edildiğinde, şirket verileriniz KVKK kapsamında belirlenen yasal süre boyunca saklanır ve sonrasında kalıcı olarak silinir.
          </p>
        </div>
      </div>
    </div>
  );
}
