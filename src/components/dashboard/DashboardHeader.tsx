import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, FileDown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/DictionaryProvider";

interface DashboardHeaderProps {
  totalCategorizedStock: number;
  totalInventory: number;
  uniqueProducts: number;
  uniqueBrandsCount: number;
  exportBrandMetrics: () => void;
}

export function DashboardHeader({
  totalCategorizedStock,
  totalInventory,
  uniqueProducts,
  uniqueBrandsCount,
  exportBrandMetrics
}: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="relative z-0 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 p-6 md:p-8 shadow-[0_8px_30px_rgba(99,102,241,0.25)]">
      {/* Animated wave shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-[60%] h-[200%] rounded-full bg-white/5 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-0 right-0 w-[40%] h-[150%] rounded-full bg-violet-400/10 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute -bottom-1/2 left-1/3 w-[50%] h-[200%] rounded-full bg-blue-400/10 blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        {/* Decorative curves */}
        <svg className="absolute bottom-0 left-0 w-full h-24 opacity-10" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z" fill="white" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-16 opacity-5" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="white" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
              <Image 
                src="/logo-flow.png?v=3" 
                alt="Flowventory Logo" 
                width={36} 
                height={36} 
                className="object-contain drop-shadow-md"
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t('dashboard.title')}</h2>
            {totalCategorizedStock === totalInventory ? (
              <Badge className="bg-white/20 text-white border border-white/30 gap-1 text-[10px] backdrop-blur-sm"><Check className="h-3 w-3" /> Doğrulandı</Badge>
            ) : (
              <Badge className="bg-amber-400/20 text-amber-100 border border-amber-300/30 gap-1 text-[10px] backdrop-blur-sm"><AlertCircle className="h-3 w-3" /> Fark: {totalInventory - totalCategorizedStock}</Badge>
            )}
          </div>
          <p className="text-indigo-100/80 text-sm md:text-base ml-[52px]">Modern Envanter & Stok Yönetim Platformu</p>
        </div>
        <div className="flex items-center gap-3 ml-[52px] md:ml-0">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm" onClick={exportBrandMetrics}>
            <FileDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Excel</span>
          </Button>
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <p className="text-[10px] text-indigo-200 uppercase font-semibold tracking-wider">Toplam SKU</p>
            <p className="text-lg font-bold text-white">{uniqueProducts.toLocaleString('tr-TR')}</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <p className="text-[10px] text-indigo-200 uppercase font-semibold tracking-wider">Aktif Marka</p>
            <p className="text-lg font-bold text-white">{uniqueBrandsCount}</p>
          </div>
          <div className="hidden sm:block px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <p className="text-[10px] text-indigo-200 uppercase font-semibold tracking-wider">Stok Adedi</p>
            <p className="text-lg font-bold text-white">{totalInventory.toLocaleString('tr-TR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
