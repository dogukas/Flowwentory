"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

import { useStockStore } from '@/store/useStockStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { BrandPieChart } from '@/components/dashboard/BrandPieChart';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { StockAlertCards } from '@/components/dashboard/StockAlertCards';
import { SeasonDonutChart } from '@/components/dashboard/SeasonDonutChart';
import { GaugeMetrics } from '@/components/dashboard/GaugeMetrics';
import { CompactInventoryTable } from '@/components/dashboard/CompactInventoryTable';
import { CategoryBarChart } from '@/components/dashboard/CategoryBarChart';
import { StockTreeMap } from '@/components/dashboard/StockTreeMap';
import { DetailedBrandTable } from '@/components/dashboard/DetailedBrandTable';
import { SalesHeatmap } from '@/components/dashboard/SalesHeatmap';
import { StockAlertsDialogs } from '@/components/dashboard/StockAlertsDialogs';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Store Data
  const stockData = useStockStore(state => state.stockData) || [];
  const salesData = useSalesStore(state => state.salesData) || [];

  // Global Filters State
  const [globalBrandFilter, setGlobalBrandFilter] = useState<string>("all");
  const [globalSeasonFilter, setGlobalSeasonFilter] = useState<string>("all");

  // Load custom hook
  const metrics = useDashboardMetrics(
    stockData,
    salesData,
    globalBrandFilter,
    globalSeasonFilter
  );

  // Sayfa açıldığında Supabase'den güncel verileri çek ve local store'u güncelle
  const setStockData = useStockStore(state => state.setStockData);
  const setSalesData = useSalesStore(state => state.setSalesData);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const { fetchAllRows } = await import('@/lib/supabase');
        
        // Fetch Stocks
        const stocks = await fetchAllRows('stocks');
        if (stocks) {
          const formattedStocks = stocks.map((item: any) => ({
            Marka: item.marka,
            "Ürün Grubu": item.urun_grubu,
            "Ürün Kodu": item.urun_kodu,
            "Renk Kodu": item.renk_kodu,
            Beden: item.beden,
            Envanter: item.envanter,
            Barkod: item.barkod,
            Sezon: item.sezon
          }));
          setStockData(formattedStocks);
        }

        // Fetch Sales
        const sales = await fetchAllRows('sales');
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
            Sezon: item.sezon
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
      'Stok Adedi': item.stock,
      'Satış Adedi': item.sales,
      'Devir Hızı': item.turnoverRate,
      'Performans': item.turnoverRate > 1.0 ? 'A Grubu' : item.turnoverRate > 0.5 ? 'B Grubu' : 'C Grubu'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marka Analizi");
    XLSX.writeFile(wb, "Flowwentory_Marka_Analizi.xlsx");
  };

  const maxStock = Math.max(...metrics.brandMetrics.map(m => m.stock), 1);
  const maxSales = Math.max(...metrics.brandMetrics.map(m => m.sales), 1);
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      ref={containerRef} 
      className="dashboard-container relative min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] pb-8 overflow-x-hidden text-slate-900 dark:text-slate-100"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Soft Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-300/15 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-blue-300/15 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-violet-300/15 blur-[120px]" />
      </div>

      <div className="container mx-auto p-4 md:p-5 lg:p-6 pt-16 space-y-4 relative z-10">
        <DashboardHeader 
          totalCategorizedStock={metrics.totalCategorizedStock}
          totalInventory={metrics.totalInventory}
          uniqueProducts={metrics.uniqueProducts}
          uniqueBrandsCount={metrics.uniqueBrands.length}
          exportBrandMetrics={exportBrandMetrics}
        />

        <DashboardFilters 
          globalBrandFilter={globalBrandFilter}
          setGlobalBrandFilter={setGlobalBrandFilter}
          globalSeasonFilter={globalSeasonFilter}
          setGlobalSeasonFilter={setGlobalSeasonFilter}
          globalUniqueBrands={metrics.globalUniqueBrands}
          globalUniqueSeasons={metrics.globalUniqueSeasons}
        />

        {/* ========== TOP SECTION: Donut + Metrics + Alerts ========== */}
        <div className="grid grid-cols-12 gap-4">
          <BrandPieChart 
            totalInventory={metrics.totalInventory}
            pieChartData={metrics.pieChartData}
            brandTooltipData={metrics.brandTooltipData}
            setSelectedBrand={setSelectedBrand}
          />
          
          <MetricCards 
            totalInventory={metrics.totalInventory}
            uniqueProducts={metrics.uniqueProducts}
            uniqueBrandsCount={metrics.uniqueBrands.length}
            uniqueProductGroupsCount={metrics.uniqueProductGroups.length}
            totalProductsCount={metrics.totalProducts}
            allCategoriesPercentage={metrics.allCategoriesPercentage}
            totalCategorizedStock={metrics.totalCategorizedStock}
          />

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
        </div>

        {/* ========== MID SECTION: Sales + Charts ========== */}
        <div className="grid grid-cols-1 gap-6 mt-4">
          <div className="grid grid-cols-12 gap-4 items-start">
            <SeasonDonutChart seasonData={metrics.seasonChartData} totalInventory={metrics.totalInventory} />
            <GaugeMetrics totalTurnoverRate={metrics.totalTurnoverRate} />
            <CompactInventoryTable 
              brandMetrics={metrics.brandMetrics} 
              brandTooltipData={metrics.brandTooltipData} 
              totalInventory={metrics.totalInventory} 
            />
          </div>
        </div>

        {/* ========== CATEGORY PERFORMANCE ========== */}
        <div className="grid grid-cols-1 gap-6 mt-4">
          <CategoryBarChart categoryBarData={metrics.categoryBarData} />
        </div>

        {/* ========== FINANCIAL TREEMAP ========== */}
        <StockTreeMap treemapData={metrics.treemapData} />

        {/* ========== BOTTOM SECTION: Detailed Brand Analytics ========== */}
        <DetailedBrandTable 
          brandMetrics={metrics.brandMetrics}
          maxStock={maxStock}
          maxSales={maxSales}
          exportBrandMetrics={exportBrandMetrics}
          brandTooltipData={metrics.brandTooltipData}
          heatmapData={metrics.heatmapData}
        />

        {/* ========== SALES HEATMAP ========== */}
        <div className="mt-4">
          <SalesHeatmap heatmapData={metrics.heatmapData} />
        </div>

        {/* ========== BRAND DETAIL DIALOG ========== */}
        <Dialog open={!!selectedBrand} onOpenChange={() => setSelectedBrand(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package2 className="h-5 w-5 text-indigo-600" />
                {selectedBrand} — Ürün Grubu Dağılımı
              </DialogTitle>
            </DialogHeader>
            {selectedBrand && (() => {
              const tooltipInfo = metrics.brandTooltipData[selectedBrand];
              const productGroups = tooltipInfo?.productGroups || {};
              const totalUniqueProducts = tooltipInfo?.totalUniqueProducts || 0;
              const brandStock = metrics.brandInventory[selectedBrand] || 0;
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-6 p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{brandStock.toLocaleString('tr-TR')}</p>
                      <p className="text-xs text-slate-500">Toplam Stok</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">{totalUniqueProducts}</p>
                      <p className="text-xs text-slate-500">Toplam Çeşit</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-violet-600">{Object.keys(productGroups).length}</p>
                      <p className="text-xs text-slate-500">Ürün Grubu</p>
                    </div>
                  </div>
                  <ScrollArea className="h-[500px] pr-2">
                    <div className="space-y-2">
                      {Object.entries(productGroups)
                        .sort(([, a]: any, [, b]: any) => b.total - a.total)
                        .map(([group, data]: any, index) => {
                          const percentage = ((data.total / brandStock) * 100).toFixed(1);
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                              <div>
                                <p className="font-medium text-slate-800">{group}</p>
                                <p className="text-xs text-slate-500">{data.count} çeşit ürün</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-slate-700">{data.total} adet</span>
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
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

        {/* ========== STOCK ALERT DIALOGS ========== */}
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
    </motion.div>
  );
}