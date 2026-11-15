"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, AlertCircle, FileDown, Users, Filter, Sparkles, Box, RotateCcw, Zap } from "lucide-react";
import { useTranslation } from "@/lib/i18n/DictionaryProvider";
import { useTenantStore } from "@/store/useTenantStore";
import { useRetailBrainStore } from "@/store/useRetailBrainStore";
import { TeamManagementDialog } from "@/components/dashboard/TeamManagementDialog";
import { RetailStressSimulatorModal } from "@/components/dashboard/RetailStressSimulatorModal";

interface DashboardHeaderProps {
  totalCategorizedStock: number;
  totalInventory: number;
  uniqueProducts: number;
  uniqueBrandsCount: number;
  exportBrandMetrics: () => void;
  globalBrandFilter?: string;
  setGlobalBrandFilter?: (val: string) => void;
  globalSeasonFilter?: string;
  setGlobalSeasonFilter?: (val: string) => void;
  globalGroupFilter?: string;
  setGlobalGroupFilter?: (val: string) => void;
  globalUniqueBrands?: string[];
  globalUniqueSeasons?: string[];
  globalUniqueGroups?: string[];
}

export function DashboardHeader({
  totalCategorizedStock,
  totalInventory,
  exportBrandMetrics,
  globalBrandFilter = "all",
  setGlobalBrandFilter,
  globalSeasonFilter = "all",
  setGlobalSeasonFilter,
  globalGroupFilter = "all",
  setGlobalGroupFilter,
  globalUniqueBrands = [],
  globalUniqueSeasons = [],
  globalUniqueGroups = [],
}: DashboardHeaderProps) {
  const { t } = useTranslation();
  const { userRole } = useTenantStore();
  const pickingQueue = useRetailBrainStore(s => s.pickingQueue);
  const pendingPicksCount = pickingQueue.filter(p => p.status === 'PENDING').length;

  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [stressModalOpen, setStressModalOpen] = useState(false);
  const isAdmin = userRole === "admin";
  const hasActiveFilter =
    globalBrandFilter !== "all" ||
    globalSeasonFilter !== "all" ||
    globalGroupFilter !== "all";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 md:p-5 shadow-sm">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 sm:gap-4">
        {/* Sol: Başlık ve Durum Rozetleri */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Image
              src="/logo-flow.png?v=3"
              alt="Flowwentory Logo"
              width={26}
              height={26}
              className="object-contain brightness-0 invert"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {t("dashboard.title")}
              </h1>
              {totalCategorizedStock === totalInventory ? (
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5">
                  <Check className="h-3 w-3" /> Envanter Doğrulandı
                </Badge>
              ) : (
                <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50 gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5">
                  <AlertCircle className="h-3 w-3" /> Fark: {totalInventory - totalCategorizedStock}
                </Badge>
              )}
            </div>
            <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 sm:line-clamp-none">
              Gerçek zamanlı envanter sermayesi, stok sağlığı spektrumu ve marka/sezon performans merkezi
            </p>
          </div>
        </div>

        {/* Sağ: Entegre Filtreler + Hızlı Aksiyonlar (Mobil Uyumlu Izgara & Esnek Yapı) */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 w-full xl:w-auto">
          {/* Global Marka, Sezon & Kategori Filtresi */}
          {setGlobalBrandFilter && setGlobalSeasonFilter && (
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 bg-slate-50 dark:bg-slate-800/70 p-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700 w-full sm:w-auto">
              <div className="hidden sm:flex items-center gap-1.5 pl-2 pr-1 text-slate-500 text-xs font-semibold">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filtre:</span>
              </div>

              <Select value={globalBrandFilter} onValueChange={setGlobalBrandFilter}>
                <SelectTrigger className="w-full sm:w-[138px] h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium">
                  <SelectValue placeholder="Tüm Markalar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Tüm Markalar</SelectItem>
                  {globalUniqueBrands.map(brand => (
                    <SelectItem key={brand} value={brand} className="text-xs">{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={globalSeasonFilter} onValueChange={setGlobalSeasonFilter}>
                <SelectTrigger className="w-full sm:w-[125px] h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium">
                  <SelectValue placeholder="Tüm Sezonlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Tüm Sezonlar</SelectItem>
                  {globalUniqueSeasons.map(season => (
                    <SelectItem key={season} value={season} className="text-xs">{season}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {setGlobalGroupFilter && (
                <div className={hasActiveFilter ? "col-span-1" : "col-span-2 sm:col-span-1"}>
                  <Select value={globalGroupFilter} onValueChange={setGlobalGroupFilter}>
                    <SelectTrigger className="w-full sm:w-[138px] h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium">
                      <SelectValue placeholder="Tüm Kategoriler" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">Tüm Kategoriler</SelectItem>
                      {globalUniqueGroups.map(grp => (
                        <SelectItem key={grp} value={grp} className="text-xs">{grp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {hasActiveFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setGlobalBrandFilter("all");
                    setGlobalSeasonFilter("all");
                    setGlobalGroupFilter?.("all");
                  }}
                  className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg gap-1 w-full sm:w-auto justify-center"
                  title="Filtreleri Sıfırla"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </Button>
              )}
            </div>
          )}

          {/* Hızlı Aksiyon Butonları (Mobilde 2 Kolonlu Kompakt Izgara, Masaüstünde Yan Yana) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Canlı Stres Testi & Senaryo Simülatörü Butonu */}
            <Button
              size="sm"
              onClick={() => setStressModalOpen(true)}
              className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-extrabold shadow-sm w-full sm:w-auto justify-center"
            >
              <Zap className="h-3.5 w-3.5 fill-current shrink-0" />
              <span className="truncate">Stres Testi</span>
            </Button>

            {/* Kapalı Döngü Kısayolları */}
            <Link href="/operations/planning" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-xl border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold w-full sm:w-auto justify-center"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">RPT & OTB</span>
              </Button>
            </Link>

            <Link href="/warehouse-3d" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold relative w-full sm:w-auto justify-center"
              >
                <Box className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                <span className="truncate">3D Depo</span>
                {pendingPicksCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                    {pendingPicksCount}
                  </span>
                )}
              </Button>
            </Link>

            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold w-full sm:w-auto justify-center"
                onClick={() => setTeamDialogOpen(true)}
              >
                <Users className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>Ekip</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-xl border-emerald-200 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold w-full sm:w-auto justify-center"
              onClick={exportBrandMetrics}
            >
              <FileDown className="h-3.5 w-3.5 shrink-0" />
              <span>Excel İndir</span>
            </Button>
          </div>
        </div>
      </div>

      {isAdmin && (
        <TeamManagementDialog
          open={teamDialogOpen}
          onOpenChange={setTeamDialogOpen}
        />
      )}

      <RetailStressSimulatorModal
        open={stressModalOpen}
        onOpenChange={setStressModalOpen}
      />
    </div>
  );
}
