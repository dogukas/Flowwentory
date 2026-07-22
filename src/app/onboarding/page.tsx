"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, Building, Globe, Database } from "lucide-react";
import { supabase } from "@/lib/supabase";

const STEPS = [
  { id: 1, title: "Şirket Profili", icon: Building },
  { id: 2, title: "Bölgesel Ayarlar", icon: Globe },
  { id: 3, title: "Veri Aktarımı", icon: Database },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [currency, setCurrency] = useState("TRY");
  const [timezone, setTimezone] = useState("Europe/Istanbul");

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Lütfen önce giriş yapın.");
      }

      // 1. Şirketi oluştur
      const slug = companyName.toLowerCase().replace(/[^a-z0-9ğüşöçı]/g, '-') + '-' + Math.floor(Math.random() * 1000);
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{ name: companyName, slug }])
        .select('id')
        .single();
      
      if (companyError) throw companyError;

      // 2. Kullanıcı profilini güncelle (Şirketi bağla)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ company_id: company.id })
        .eq('id', user.id);

      if (profileError) throw profileError;

      console.log("Onboarding completed for:", companyName, currency, timezone);
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Onboarding hatası:", error);
      alert("Şirket oluşturulurken bir hata meydana geldi: " + (error.message || "Bilinmeyen hata"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-3xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header / Stepper */}
        <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Flowwentory'ye Hoş Geldiniz</h1>
            <p className="text-indigo-200 mt-1">Sistemi şirketinize özel hale getirelim.</p>
          </div>
        </div>

        <div className="flex px-8 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${isActive ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-slate-400'}`}>
                  {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={14} />}
                </div>
                <span className={`ml-3 text-sm font-medium ${isActive ? 'text-indigo-600' : isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  {s.title}
                </span>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-8 min-h-[300px]">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Şirketinizin Adı Nedir?</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Firma Adı</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                  placeholder="Örn: Acme Tekstil Ltd. Şti."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Bölgesel Tercihler</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Para Birimi</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="TRY">Türk Lirası (₺)</option>
                  <option value="USD">Amerikan Doları ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">İngiliz Sterlini (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Saat Dilimi</label>
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                  <option value="Europe/London">Londra (UTC+0)</option>
                  <option value="America/New_York">New York (UTC-5)</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Harika! Her Şey Hazır.</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                {companyName} firması için hesabınız oluşturuldu. {currency} para birimi ile çalışacaksınız.
                Dashboard'a giderek ilk stok verilerinizi (Excel) yükleyebilirsiniz.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
          {step < 3 ? (
            <Button onClick={handleNext} disabled={step === 1 && !companyName.trim()} className="gap-2">
              İleri <ChevronRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? "Kaydediliyor..." : "Dashboard'a Git"}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
