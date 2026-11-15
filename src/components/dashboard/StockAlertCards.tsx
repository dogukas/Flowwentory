"use client";

import { Clock, AlertCircle, TrendingDown, Package2, TrendingUp, ChevronRight } from "lucide-react";

interface StockAlertCardsProps {
  stockOutGroupsCount: number;
  stockOutCount: number;
  stockOutPercentage: string;
  setStockOutDialogOpen: (val: boolean) => void;

  deadStockGroupsCount: number;
  deadStockCount: number;
  deadStockPercentage: string;
  setDeadStockDialogOpen: (val: boolean) => void;

  lowStockGroupsCount: number;
  lowStockCount: number;
  lowStockPercentage: string;
  setLowStockDialogOpen: (val: boolean) => void;

  mediumStockGroupsCount: number;
  mediumStockCount: number;
  mediumStockPercentage: string;
  setMediumStockDialogOpen: (val: boolean) => void;

  highStockGroupsCount: number;
  highStockCount: number;
  highStockPercentage: string;
  setHighStockDialogOpen: (val: boolean) => void;
}

export function StockAlertCards({
  stockOutGroupsCount,
  stockOutCount,
  stockOutPercentage,
  setStockOutDialogOpen,
  deadStockGroupsCount,
  deadStockCount,
  deadStockPercentage,
  setDeadStockDialogOpen,
  lowStockGroupsCount,
  lowStockCount,
  lowStockPercentage,
  setLowStockDialogOpen,
  mediumStockGroupsCount,
  mediumStockCount,
  mediumStockPercentage,
  setMediumStockDialogOpen,
  highStockGroupsCount,
  highStockCount,
  highStockPercentage,
  setHighStockDialogOpen,
}: StockAlertCardsProps) {
  const segments = [
    {
      title: "Tükenme Riski (15G)",
      subtitle: `${stockOutGroupsCount} Kritik Model`,
      count: stockOutCount,
      percentage: stockOutPercentage,
      onClick: () => setStockOutDialogOpen(true),
      icon: Clock,
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300",
      iconBg: "bg-purple-100/80 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
      barColor: "bg-purple-500",
      borderHover: "hover:border-purple-300",
    },
    {
      title: "Ölü Stok (0 Satış)",
      subtitle: `${deadStockGroupsCount} Hareketsiz SKU`,
      count: deadStockCount,
      percentage: deadStockPercentage,
      onClick: () => setDeadStockDialogOpen(true),
      icon: AlertCircle,
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300",
      iconBg: "bg-rose-100/80 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
      barColor: "bg-rose-500",
      borderHover: "hover:border-rose-300",
    },
    {
      title: "Düşük Stok (1-3 Adet)",
      subtitle: `${lowStockGroupsCount} Model`,
      count: lowStockCount,
      percentage: lowStockPercentage,
      onClick: () => setLowStockDialogOpen(true),
      icon: TrendingDown,
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300",
      iconBg: "bg-amber-100/80 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      barColor: "bg-amber-500",
      borderHover: "hover:border-amber-300",
    },
    {
      title: "Orta / İdeal Stok (4-6)",
      subtitle: `${mediumStockGroupsCount} Model`,
      count: mediumStockCount,
      percentage: mediumStockPercentage,
      onClick: () => setMediumStockDialogOpen(true),
      icon: Package2,
      badgeBg: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300",
      iconBg: "bg-sky-100/80 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400",
      barColor: "bg-sky-500",
      borderHover: "hover:border-sky-300",
    },
    {
      title: "Yüksek Stok (7+ Adet)",
      subtitle: `${highStockGroupsCount} Model`,
      count: highStockCount,
      percentage: highStockPercentage,
      onClick: () => setHighStockDialogOpen(true),
      icon: TrendingUp,
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300",
      iconBg: "bg-emerald-100/80 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      barColor: "bg-emerald-500",
      borderHover: "hover:border-emerald-300",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm">
      {/* Üst Başlık ve Bütüncül Dağılım Çubuğu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-5 rounded-full bg-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Stok Sağlığı & Dağılım Spektrumu
          </h3>
          <span className="text-xs text-slate-400 hidden md:inline">
            (Detaylı beden ve model listesi için kartlara tıklayın)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Düşük: %{lowStockPercentage}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> Orta: %{mediumStockPercentage}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Yüksek: %{highStockPercentage}
          </span>
        </div>
      </div>

      {/* Oransal Spektrum Barı */}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex mb-4 p-0.5 gap-0.5">
        <div
          className="h-full bg-amber-500 rounded-l-full transition-all duration-500"
          style={{ width: `${Math.max(2, parseFloat(lowStockPercentage) || 0)}%` }}
          title={`Düşük Stok: %${lowStockPercentage}`}
        />
        <div
          className="h-full bg-sky-500 transition-all duration-500"
          style={{ width: `${Math.max(2, parseFloat(mediumStockPercentage) || 0)}%` }}
          title={`Orta Stok: %${mediumStockPercentage}`}
        />
        <div
          className="h-full bg-emerald-500 rounded-r-full transition-all duration-500"
          style={{ width: `${Math.max(2, parseFloat(highStockPercentage) || 0)}%` }}
          title={`Yüksek Stok: %${highStockPercentage}`}
        />
      </div>

      {/* 5 Yatay Etkileşimli Segment Kartı */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {segments.map((seg, idx) => {
          const Icon = seg.icon;
          const isLastOdd = idx === segments.length - 1;
          return (
            <button
              key={idx}
              onClick={seg.onClick}
              className={`group text-left p-3 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 ${seg.borderHover} hover:shadow-sm transition-all flex flex-col justify-between ${
                isLastOdd ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${seg.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${seg.badgeBg}`}>
                  %{seg.percentage}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white flex items-center justify-between">
                  <span className="truncate">{seg.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {seg.count.toLocaleString("tr-TR")}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Adet</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{seg.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
