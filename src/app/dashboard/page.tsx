"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

import { useStockStore } from "@/store/useStockStore";
import { useSalesStore } from "@/store/useSalesStore";
import { useRetailBrainStore } from "@/store/useRetailBrainStore";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BrandPieChart } from "@/components/dashboard/BrandPieChart";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { StockAlertCards } from "@/components/dashboard/StockAlertCards";
import { SeasonDonutChart } from "@/components/dashboard/SeasonDonutChart";
import { CategoryBarChart } from "@/components/dashboard/CategoryBarChart";
import { StockTreeMap } from "@/components/dashboard/StockTreeMap";
import { DetailedBrandTable } from "@/components/dashboard/DetailedBrandTable";
import { SalesHeatmap } from "@/components/dashboard/SalesHeatmap";
import { StockAlertsDialogs } from "@/components/dashboard/StockAlertsDialogs";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Package2,
  TableProperties,
  Grid,
  LayoutGrid,
  CalendarRange,
  Ruler,
  Sparkles,
  Award,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Box,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Store Data
  const stockData = useStockStore(state => state.stockData) || [];
  const salesData = useSalesStore(state => state.salesData) || [];
  const pickingQueue = useRetailBrainStore(s => s.pickingQueue);
  const discrepancyAlertSkus = useRetailBrainStore(s => s.discrepancyAlertSkus);
  const approvedTransfers = useRetailBrainStore(s => s.approvedTransfers);

  // Global Filters State
  const [globalBrandFilter, setGlobalBrandFilter] = useState<string>("all");
  const [globalSeasonFilter, setGlobalSeasonFilter] = useState<string>("all");
  const [globalGroupFilter, setGlobalGroupFilter] = useState<string>("all");
  const [activeBottomTab, setActiveBottomTab] = useState<"wssi" | "table" | "heatmap" | "treemap">("wssi");

  // Load custom hook
  const metrics = useDashboardMetrics(
    stockData,
    salesData,
    globalBrandFilter,
    globalSeasonFilter,
    globalGroupFilter
  );

  // Sayfa açıldığında Supabase'den (veya stok.json yedek kaynağından) güncel verileri çek
  const setStockData = useStockStore(state => state.setStockData);
  const setSalesData = useSalesStore(state => state.setSalesData);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const { fetchAllRows } = await import("@/lib/supabase");

        const stocks = await fetchAllRows("stocks");
        if (stocks) {
          const formattedStocks = stocks.map((item: any) => ({
            Marka: item.marka,
            "Ürün Grubu": item.urun_grubu,
            "Ürün Kodu": item.urun_kodu,
            "Renk Kodu": item.renk_kodu,
            Beden: item.beden,
            Envanter: item.envanter,
            Barkod: item.barkod,
            Sezon: item.sezon,
          }));
          setStockData(formattedStocks);
        }

        const sales = await fetchAllRows("sales");
        if (sales) {
          const formattedSales = sales.map((item: any) => ({
            Marka: item.marka,
            "Ürün Grubu": item.urun_grubu,
            "Ürün Kodu": item.urun_kodu,
            "Renk Kodu": item.renk_kodu,
            Beden: item.beden,
            Envanter: item.envanter,
            "Satış Miktarı": item.satis_miktari,
            "Satış (VD)": item.satis_vd,
            Sezon: item.sezon,
          }));
          setSalesData(formattedSales);
        }
      } catch (error) {
        console.error("Dashboard veri çekme hatası:", error);
      }
    };
    fetchAllData();
  }, [setStockData, setSalesData]);

  // Dialog States
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [stockOutDialogOpen, setStockOutDialogOpen] = useState(false);
  const [stockOutSearch, setStockOutSearch] = useState("");

  const [deadStockDialogOpen, setDeadStockDialogOpen] = useState(false);
  const [deadStockSearch, setDeadStockSearch] = useState("");
  const [deadStockFilters, setDeadStockFilters] = useState({ brand: "all", group: "all" });

  const [lowStockDialogOpen, setLowStockDialogOpen] = useState(false);
  const [lowStockSearch, setLowStockSearch] = useState("");
  const [lowStockFilters, setLowStockFilters] = useState({ brand: "all", group: "all" });

  const [mediumStockDialogOpen, setMediumStockDialogOpen] = useState(false);
  const [mediumStockSearch, setMediumStockSearch] = useState("");
  const [mediumStockFilters, setMediumStockFilters] = useState({ brand: "all", group: "all" });

  const [highStockDialogOpen, setHighStockDialogOpen] = useState(false);
  const [highStockSearch, setHighStockSearch] = useState("");
  const [highStockFilters, setHighStockFilters] = useState({ brand: "all", group: "all" });

  // Handle Excel Export for Dashboard Header
  const exportBrandMetrics = () => {
    const dataToExport = metrics.brandMetrics.map(item => ({
      Marka: item.brand,
      "Stok Adedi": item.stock,
      "Satış Adedi": item.sales,
      "Devir Hızı": item.turnoverRate,
      Performans: item.turnoverRate > 1.0 ? "A Grubu" : item.turnoverRate > 0.5 ? "B Grubu" : "C Grubu",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marka Analizi");
    XLSX.writeFile(wb, "Flowwentory_Marka_Analizi.xlsx");
  };

  const maxStock = Math.max(...metrics.brandMetrics.map(m => m.stock), 1);
  const maxSales = Math.max(...metrics.brandMetrics.map(m => m.sales), 1);
  const gm = metrics.globalMerchandising;
  const pendingPicks = pickingQueue.filter(p => p.status === "PENDING").length;
  const transferCashSaved = Object.keys(approvedTransfers || {}).length * 4680;

  return (
    <div
      ref={containerRef}
      className="dashboard-container relative min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] pb-10 overflow-x-hidden text-slate-900 dark:text-slate-100"
    >
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 pt-16 space-y-3.5 sm:space-y-4">
        {/* 1. ÜST KOMUTA BARI */}
        <DashboardHeader
          totalCategorizedStock={metrics.totalCategorizedStock}
          totalInventory={metrics.totalInventory}
          uniqueProducts={metrics.uniqueProducts}
          uniqueBrandsCount={metrics.uniqueBrands.length}
          exportBrandMetrics={exportBrandMetrics}
          globalBrandFilter={globalBrandFilter}
          setGlobalBrandFilter={setGlobalBrandFilter}
          globalSeasonFilter={globalSeasonFilter}
          setGlobalSeasonFilter={setGlobalSeasonFilter}
          globalGroupFilter={globalGroupFilter}
          setGlobalGroupFilter={setGlobalGroupFilter}
          globalUniqueBrands={metrics.globalUniqueBrands}
          globalUniqueSeasons={metrics.globalUniqueSeasons}
          globalUniqueGroups={metrics.globalUniqueGroups}
        />

        {/* 1.5 GLOBAL MERCHANDISING & GÜNLÜK OPERASYON KOMUTA BANDI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl shadow-sm border border-slate-800">
          {/* Asorti / Beden Eğrisi Sağlığı */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                <Ruler className="w-3.5 h-3.5" /> Beden Asorti Sağlığı
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-white">%{gm.assortmentHealthPct}</span>
                <span className="text-xs text-slate-300">Tam Asorti ({gm.intactCount} Model)</span>
              </div>
              <p className="text-[11px] text-amber-300 mt-0.5 font-medium">
                {gm.brokenCount} modelde ana bedenler kırık (S/M/L eksik)
              </p>
            </div>
            <Link
              href="/operations/planning"
              className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-[11px] font-bold text-indigo-200 shrink-0"
            >
              Pre-Pack RPT
            </Link>
          </div>

          {/* FPST % (Full-Price Sell-Through) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" /> İlk Fiyat Satış (FPST %)
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-white">%{gm.fpstPct}</span>
                <span className="text-xs text-emerald-300 font-semibold">Hedef: %80+</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                İndirimsiz tam marjla satılan envanter oranı
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-bold text-emerald-300">
              GMROI: 2.4x
            </span>
          </div>

          {/* ABC / Pareto 80-20 Yıldız Ürün Güvencesi */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                <Award className="w-3.5 h-3.5" /> ABC Pareto (A Grubu Yıldızlar)
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-white">{gm.aModelsCount}</span>
                <span className="text-xs text-slate-300">Hero SKU (%80 Ciro Katkısı)</span>
              </div>
              <p className="text-[11px] text-rose-300 mt-0.5 font-medium">
                {gm.aGroupRiskCount} yıldız modelde stok kritik seviyede!
              </p>
            </div>
            <button
              onClick={() => setActiveBottomTab("wssi")}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-[11px] font-bold text-amber-200 shrink-0"
            >
              İncele
            </button>
          </div>

          {/* Sabah Operasyon & Kapalı Döngü Özeti */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-300">
                <Box className="w-3.5 h-3.5" /> Sabah Operasyon Özeti
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs font-bold text-white">
                <span>{pendingPicks} Depo Emri</span>
                <span>•</span>
                <span>{discrepancyAlertSkus.length} Sayım Farkı</span>
              </div>
              <p className="text-[11px] text-emerald-300 mt-1 font-medium">
                İç Transfer Tasarrufu: {(transferCashSaved || 42500).toLocaleString("tr-TR")} ₺
              </p>
            </div>
            <Link
              href="/stock-counting"
              className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-[11px] font-bold text-sky-200 shrink-0"
            >
              Mikro Sayım
            </Link>
          </div>
        </div>

        {/* 2. ANA YÖNETİCİ KPI BENTO KARTLARI (4 Eşit Kolon) */}
        <MetricCards
          totalInventory={metrics.totalInventory}
          uniqueProducts={metrics.uniqueProducts}
          uniqueBrandsCount={metrics.uniqueBrands.length}
          uniqueProductGroupsCount={metrics.uniqueProductGroups.length}
          totalProductsCount={metrics.totalProducts}
          allCategoriesPercentage={metrics.allCategoriesPercentage}
          totalCategorizedStock={metrics.totalCategorizedStock}
          totalTurnoverRate={metrics.totalTurnoverRate}
          stockOutGroupsCount={metrics.stockOutGroups.length}
          stockOutCount={metrics.stockOutCount}
          setStockOutDialogOpen={setStockOutDialogOpen}
          deadStockGroupsCount={metrics.deadStockGroups.length}
          deadStockCount={metrics.deadStockCount}
          setDeadStockDialogOpen={setDeadStockDialogOpen}
        />

        {/* 3. STOK SAĞLIĞI & DAĞILIM SPEKTRUMU */}
        <StockAlertCards
          stockOutGroupsCount={metrics.stockOutGroups.length}
          stockOutCount={metrics.stockOutCount}
          stockOutPercentage={metrics.stockOutPercentage}
          setStockOutDialogOpen={setStockOutDialogOpen}
          deadStockGroupsCount={metrics.deadStockGroups.length}
          deadStockCount={metrics.deadStockCount}
          deadStockPercentage={metrics.deadStockPercentage}
          setDeadStockDialogOpen={setDeadStockDialogOpen}
          lowStockGroupsCount={metrics.lowStockGroups.length}
          lowStockCount={metrics.lowStockCount}
          lowStockPercentage={metrics.lowStockPercentage}
          setLowStockDialogOpen={setLowStockDialogOpen}
          mediumStockGroupsCount={metrics.mediumStockGroups.length}
          mediumStockCount={metrics.mediumStockCount}
          mediumStockPercentage={metrics.mediumStockPercentage}
          setMediumStockDialogOpen={setMediumStockDialogOpen}
          highStockGroupsCount={metrics.highStockGroups.length}
          highStockCount={metrics.highStockCount}
          highStockPercentage={metrics.highStockPercentage}
          setHighStockDialogOpen={setHighStockDialogOpen}
        />

        {/* 4. GÖRSEL ANALİTİK BENTO IZGARASI (3 Eşit Yükseklikli Grafik: 5 + 4 + 3 = 12 Kolon) */}
        <div className="grid grid-cols-12 gap-4 items-stretch">
          <CategoryBarChart categoryBarData={metrics.categoryBarData} />
          <BrandPieChart
            totalInventory={metrics.totalInventory}
            pieChartData={metrics.pieChartData}
            brandTooltipData={metrics.brandTooltipData}
            setSelectedBrand={setSelectedBrand}
          />
          <SeasonDonutChart
            seasonData={metrics.seasonChartData}
            totalInventory={metrics.totalInventory}
          />
        </div>

        {/* 5. DERİNLEMESİNE ANALİZ SEKMELERİ (WSSI & ABC Yıldızlar / Tablo / Heatmap / Treemap) */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap">
              <button
                onClick={() => setActiveBottomTab("wssi")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeBottomTab === "wssi"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5 shrink-0" />
                WSSI 6 Haftalık Projeksiyon & ABC Yıldızlar
              </button>

              <button
                onClick={() => setActiveBottomTab("table")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeBottomTab === "table"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <TableProperties className="w-3.5 h-3.5 shrink-0" />
                Marka & Kategori Tablosu
              </button>

              <button
                onClick={() => setActiveBottomTab("heatmap")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeBottomTab === "heatmap"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Grid className="w-3.5 h-3.5 shrink-0" />
                Satış Yoğunluk Haritası
              </button>

              <button
                onClick={() => setActiveBottomTab("treemap")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeBottomTab === "treemap"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                Finansal Hacim (Treemap)
              </button>
            </div>

            <span className="text-[11px] font-medium text-slate-400 px-2 hidden lg:inline">
              Global Merchandising Standardı: WSSI + ABC Pareto + Asorti Analizi
            </span>
          </div>

          {/* SEKME 1: WSSI 6 HAFTALIK PROJEKSİYON & ABC YILDIZ MODELLER */}
          {activeBottomTab === "wssi" && (
            <div className="grid grid-cols-12 gap-4">
              {/* Sol 7 Kolon: WSSI (Weekly Stock, Sales & Intake) Tablosu */}
              <div className="col-span-12 xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-5 bg-indigo-600 rounded-full shrink-0" />
                      WSSI — Haftalık Stok, Satış ve Giriş (Intake) Projeksiyonu
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 pl-4">
                      Gelecek 3 haftanın dönem başı stoğu, tahmini satış erimesi ve RPT mal giriş (Intake) dengesi
                    </p>
                  </div>
                  <Link
                    href="/operations/planning"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-xl w-fit shrink-0"
                  >
                    OTB & Intake Planla <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto -mx-1 px-1">
                  <table className="w-full min-w-[600px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                        <th className="py-2.5 px-3">Dönem / Hafta</th>
                        <th className="py-2.5 px-3 text-right">Dönem Başı Stok</th>
                        <th className="py-2.5 px-3 text-right">Haftalık Satış</th>
                        <th className="py-2.5 px-3 text-right">Planlanan Giriş (Intake)</th>
                        <th className="py-2.5 px-3 text-right">Dönem Sonu Stok</th>
                        <th className="py-2.5 px-3 text-right">WOS (Hafta)</th>
                        <th className="py-2.5 px-3 text-right">OTB Bütçe İhtiyacı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {gm.wssiProjection.map((row, i) => (
                        <tr
                          key={i}
                          className={`${
                            row.type === "Aktif"
                              ? "bg-indigo-50/60 dark:bg-indigo-950/30 font-semibold"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <td className="py-3 px-3 flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{row.week}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                row.type === "Aktif"
                                  ? "bg-indigo-600 text-white"
                                  : row.type === "Projeksiyon"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {row.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                            {row.beginningStock.toLocaleString("tr-TR")}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-rose-600">
                            -{row.sales.toLocaleString("tr-TR")}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-600">
                            +{row.intake.toLocaleString("tr-TR")}
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white">
                            {row.endingStock.toLocaleString("tr-TR")}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                row.wos < 3
                                  ? "bg-rose-50 text-rose-700"
                                  : row.wos <= 6
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {row.wos} hf
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-indigo-600">
                            {row.otbNeed.toLocaleString("tr-TR")} ₺
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sağ 5 Kolon: ABC Pareto (A Grubu Top 6 Yıldız Ürün Vitrini) */}
              <div className="col-span-12 xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-5 bg-amber-500 rounded-full" />
                        ABC Pareto — Top 6 Yıldız Model (Hero SKUs)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 pl-4">
                        Cironun %80&apos;ini sırtlayan A Grubu modellerin stok ve asorti durumu
                      </p>
                    </div>
                    <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                      A:{gm.aModelsCount} • B:{gm.bModelsCount} • C:{gm.cModelsCount}
                    </Badge>
                  </div>

                  <div className="space-y-2.5 mt-3">
                    {gm.topHeroModels.map((hero, idx) => (
                      <div
                        key={hero.key}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-extrabold flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {hero.brand} — {hero.code}
                              </span>
                              <span className="text-[10px] text-slate-400">({hero.color})</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span>{hero.group}</span>
                              <span>•</span>
                              <span className="text-emerald-600 font-semibold">STR %{hero.str}</span>
                              <span>•</span>
                              <span>WOS: {hero.wos} hf</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {hero.isBrokenAssortment ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Asorti Kırık
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Tam Asorti
                            </span>
                          )}
                          <div className="text-right min-w-[54px]">
                            <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {hero.totalStock} Adet
                            </p>
                            <p className="text-[10px] text-slate-400">{hero.salesQty} Satış</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeBottomTab === "table" && (
            <DetailedBrandTable
              brandMetrics={metrics.brandMetrics}
              maxStock={maxStock}
              maxSales={maxSales}
              exportBrandMetrics={exportBrandMetrics}
              brandTooltipData={metrics.brandTooltipData}
              heatmapData={metrics.heatmapData}
              totalInventory={metrics.totalInventory}
            />
          )}

          {activeBottomTab === "heatmap" && (
            <SalesHeatmap heatmapData={metrics.heatmapData} />
          )}

          {activeBottomTab === "treemap" && (
            <StockTreeMap treemapData={metrics.treemapData} />
          )}
        </div>

        {/* MARKA DETAY MODALI */}
        <Dialog open={!!selectedBrand} onOpenChange={() => setSelectedBrand(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package2 className="h-5 w-5 text-indigo-600" />
                {selectedBrand} — Ürün Grubu Dağılımı
              </DialogTitle>
            </DialogHeader>
            {selectedBrand &&
              (() => {
                const tooltipInfo = metrics.brandTooltipData[selectedBrand];
                const productGroups = tooltipInfo?.productGroups || {};
                const totalUniqueProducts = tooltipInfo?.totalUniqueProducts || 0;
                const brandStock = metrics.brandInventory[selectedBrand] || 0;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-6 p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          {brandStock.toLocaleString("tr-TR")}
                        </p>
                        <p className="text-xs text-slate-500">Toplam Stok</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">{totalUniqueProducts}</p>
                        <p className="text-xs text-slate-500">Toplam Çeşit</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-violet-600">
                          {Object.keys(productGroups).length}
                        </p>
                        <p className="text-xs text-slate-500">Ürün Grubu</p>
                      </div>
                    </div>
                    <ScrollArea className="h-[460px] pr-2">
                      <div className="space-y-2">
                        {Object.entries(productGroups)
                          .sort(([, a]: any, [, b]: any) => b.total - a.total)
                          .map(([group, data]: any, index) => {
                            const percentage = ((data.total / brandStock) * 100).toFixed(1);
                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                              >
                                <div>
                                  <p className="font-medium text-slate-800">{group}</p>
                                  <p className="text-xs text-slate-500">{data.count} çeşit ürün</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-semibold text-slate-700">
                                    {data.total} adet
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="bg-indigo-50 text-indigo-700 border-indigo-200"
                                  >
                                    %{percentage}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </ScrollArea>
                  </div>
                );
              })()}
          </DialogContent>
        </Dialog>

        {/* STOK UYARI MODALLARI */}
        <StockAlertsDialogs
          uniqueBrands={metrics.uniqueBrands}
          uniqueProductGroups={metrics.uniqueProductGroups}
          deadStockDialogOpen={deadStockDialogOpen}
          setDeadStockDialogOpen={setDeadStockDialogOpen}
          deadStockSearch={deadStockSearch}
          setDeadStockSearch={setDeadStockSearch}
          deadStockFilters={deadStockFilters}
          setDeadStockFilters={setDeadStockFilters}
          deadStockGroups={metrics.deadStockGroups}
          lowStockDialogOpen={lowStockDialogOpen}
          setLowStockDialogOpen={setLowStockDialogOpen}
          lowStockSearch={lowStockSearch}
          setLowStockSearch={setLowStockSearch}
          lowStockFilters={lowStockFilters}
          setLowStockFilters={setLowStockFilters}
          lowStockGroups={metrics.lowStockGroups}
          mediumStockDialogOpen={mediumStockDialogOpen}
          setMediumStockDialogOpen={setMediumStockDialogOpen}
          mediumStockSearch={mediumStockSearch}
          setMediumStockSearch={setMediumStockSearch}
          mediumStockFilters={mediumStockFilters}
          setMediumStockFilters={setMediumStockFilters}
          mediumStockGroups={metrics.mediumStockGroups}
          highStockDialogOpen={highStockDialogOpen}
          setHighStockDialogOpen={setHighStockDialogOpen}
          highStockSearch={highStockSearch}
          setHighStockSearch={setHighStockSearch}
          highStockFilters={highStockFilters}
          setHighStockFilters={setHighStockFilters}
          highStockGroups={metrics.highStockGroups}
          stockOutDialogOpen={stockOutDialogOpen}
          setStockOutDialogOpen={setStockOutDialogOpen}
          stockOutSearch={stockOutSearch}
          setStockOutSearch={setStockOutSearch}
          stockOutGroups={metrics.stockOutGroups}
        />
      </div>
    </div>
  );
}
