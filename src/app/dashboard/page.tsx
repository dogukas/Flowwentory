/**
 * Dashboard Page
 * Ana kontrol paneli - stok, satış ve marka analizleri
 */
"use client";

// ==========================================
// REACT & HOOKS
// ==========================================
import { useState, useLayoutEffect, useRef, useEffect, useMemo } from "react";

// ==========================================
// EXTERNAL LIBRARIES
// ==========================================
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import gsap from "gsap";
import * as XLSX from 'xlsx';

// ==========================================
// UI COMPONENTS
// ==========================================
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ==========================================
// ICONS
// ==========================================
import {
  Package2,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Filter,
  Search,
  FileDown,
  Loader2,
  Database,
  Check
} from "lucide-react";

// ==========================================
// INTERNAL COMPONENTS & UTILITIES
// ==========================================
import { LowStockItem, MediumStockItem, HighStockItem } from "@/components/dashboard";
import { useStockStore } from "@/store/useStockStore";
import { useSalesStore } from "@/store/useSalesStore";
import { supabase, fetchAllRows } from "@/lib/supabase";

// ==========================================
// TYPES
// ==========================================
import type { StockItem, GroupedStockItem } from "@/types/stock";

// ==========================================
// CONSTANTS
// ==========================================
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DashboardPage() {
  const stockData: StockItem[] = useStockStore((state) => state.stockData);
  const setStockData = useStockStore((state) => state.setStockData);
  const salesData = useSalesStore((state) => state.salesData);

  // Supabase'den TÜM verileri çek (sayfalama ile 1000 satır limitini aşar)
  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const stocks = await fetchAllRows('stocks');
        const sales = await fetchAllRows('sales');

        if (stocks && stocks.length > 0) {
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

        if (sales && sales.length > 0) {
          const formattedSales = sales.map((item: any) => ({
            Marka: item.marka,
            "Ürün Grubu": item.urun_grubu,
            "Ürün Kodu": item.urun_kodu,
            "Renk Kodu": item.renk_kodu,
            Beden: item.beden,
            Envanter: item.envanter,
            Sezon: item.sezon,
            "Satış Miktarı": item.satis_miktari,
            "Satış (VD)": item.satis_vd
          }));
          useSalesStore.getState().setSalesData(formattedSales);
        }

      } catch (error) {
        console.error("Veri çekme hatası:", error);
      }
    };

    fetchSharedData();
  }, [setStockData]);

  const [isSyncing, setIsSyncing] = useState(false); // Legacy state kept to avoid breaking remaining references if any, but unused logic removed
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');




  // GSAP Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".dashboard-header", {
        y: -30,
        // opacity: 0, // removed to fix blank screen
        duration: 1,
        ease: "power3.out"
      });

      // Cards Stagger Animation
      gsap.from(".dashboard-card", {
        y: 40,
        scale: 0.98,
        // opacity: 0, // removed to fix blank screen
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.3
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);



  // Düşük Stok Filtreleme state'leri
  const [brandFilter, setBrandFilter] = useState("");
  const [productCodeFilter, setProductCodeFilter] = useState("");
  const [productGroupFilter, setProductGroupFilter] = useState("");
  const [colorCodeFilter, setColorCodeFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [showLowStockFilter, setShowLowStockFilter] = useState(false);

  // Yüksek Stok Filtreleme state'leri
  const [highStockBrandFilter, setHighStockBrandFilter] = useState("");
  const [highStockProductCodeFilter, setHighStockProductCodeFilter] = useState("");
  const [highStockProductGroupFilter, setHighStockProductGroupFilter] = useState("");
  const [highStockColorCodeFilter, setHighStockColorCodeFilter] = useState("");
  const [highStockSizeFilter, setHighStockSizeFilter] = useState("");
  const [showHighStockFilter, setShowHighStockFilter] = useState(false);

  // Orta Adetli Stok Filtreleme state'leri
  const [mediumStockBrandFilter, setMediumStockBrandFilter] = useState("");
  const [mediumStockProductCodeFilter, setMediumStockProductCodeFilter] = useState("");
  const [mediumStockProductGroupFilter, setMediumStockProductGroupFilter] = useState("");
  const [mediumStockColorCodeFilter, setMediumStockColorCodeFilter] = useState("");
  const [mediumStockSizeFilter, setMediumStockSizeFilter] = useState("");
  const [showMediumStockFilter, setShowMediumStockFilter] = useState(false);

  // Diğer state'ler
  const [showProductGroupFilter, setShowProductGroupFilter] = useState(false);
  const [productGroupNameFilter, setProductGroupNameFilter] = useState("");

  // Brand Details Enhancements States
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [brandSortOption, setBrandSortOption] = useState<'stock' | 'sales' | 'turnover'>('stock');

  // Defensive check: Ensure data arrays exist (Component Level)
  const safeStockData = useMemo(() => Array.isArray(stockData) ? stockData : [], [stockData]);
  const safeSalesData = useMemo(() => Array.isArray(salesData) ? salesData : [], [salesData]);

  // Stok verisi hesaplamaları (Memoized)
  const {
    brandInventory,
    uniqueBrands,
    uniqueProductGroups,
    uniqueColorCodes,
    uniqueSizes,
    totalProducts,
    totalInventory,
    uniqueProducts,
    lowStock,
    mediumStock,
    highStock,
    lowStockCount,
    mediumStockCount,
    highStockCount,
    lowStockPercentage,
    mediumStockPercentage,
    highStockPercentage,
    totalCategorizedStock,
    allCategoriesPercentage,
    pieChartData,
    seasonChartData,
    seasonGroupChartData,
    productGroupPieData,
    brandMetrics // New comprehensive data
  } = useMemo(() => {
    // Benzersiz markaları, ürün gruplarını ve renk kodlarını elde etme
    const uniqueBrands = [...new Set(safeStockData.map(item => item.Marka))].sort();
    const uniqueProductGroups = [...new Set(safeStockData.map(item => item["Ürün Grubu"]))].sort();
    const uniqueColorCodes = [...new Set(safeStockData.map(item => item["Renk Kodu"]))].sort();
    const uniqueSizes = [...new Set(safeStockData.map(item => item.Beden))].sort();

    // Toplam stok ve benzersiz ürün sayıları
    const totalProducts = safeStockData.length;
    const totalInventory = safeStockData.reduce((sum, item) => sum + (parseInt(item.Envanter) || 0), 0);
    const uniqueProducts = new Set(safeStockData.map(item => `${item["Ürün Kodu"]}-${item["Renk Kodu"]}`)).size;

    // Stok durumu analizleri
    const lowStock = safeStockData.filter(item => {
      const stock = parseInt(item.Envanter) || 0;
      return stock >= 0 && stock <= 3;
    });

    const mediumStock = safeStockData.filter(item => {
      const stock = parseInt(item.Envanter) || 0;
      return stock >= 4 && stock <= 6;
    });

    const highStock = safeStockData.filter(item => {
      const stock = parseInt(item.Envanter) || 0;
      return stock >= 7;
    });

    // Kategorizasyon toplamları
    const lowStockCount = lowStock.reduce((sum, item) => sum + (parseInt(item.Envanter) || 0), 0);
    const mediumStockCount = mediumStock.reduce((sum, item) => sum + (parseInt(item.Envanter) || 0), 0);
    const highStockCount = highStock.reduce((sum, item) => sum + (parseInt(item.Envanter) || 0), 0);

    // Yüzdelik paylar
    const lowStockPercentage = totalInventory > 0 ? ((lowStockCount / totalInventory) * 100).toFixed(1) : "0";
    const mediumStockPercentage = totalInventory > 0 ? ((mediumStockCount / totalInventory) * 100).toFixed(1) : "0";
    const highStockPercentage = totalInventory > 0 ? ((highStockCount / totalInventory) * 100).toFixed(1) : "0";

    // Toplam kontrolü
    const totalCategorizedStock = lowStockCount + mediumStockCount + highStockCount;
    const allCategoriesPercentage = totalInventory > 0 ? (totalCategorizedStock / totalInventory * 100).toFixed(1) : "0";

    // Marka bazında envanter dağılımı
    const brandInventory = safeStockData.reduce((acc, item) => {
      const brand = item.Marka;
      const inventory = parseInt(item.Envanter) || 0;
      acc[brand] = (acc[brand] || 0) + inventory;
      return acc;
    }, {} as Record<string, number>);

    const pieChartData = Object.entries(brandInventory).map(([brand, total]) => ({
      id: brand,
      label: brand,
      value: total
    }));

    // Sezon bazında dağılım analizi
    const seasonData = safeStockData.reduce((acc, item) => {
      const season = item.Sezon || 'Belirtilmemiş';
      if (!acc[season]) {
        acc[season] = {
          total: 0,
          brands: {}
        };
      }
      const inventory = parseInt(item.Envanter) || 0;
      acc[season].total += inventory;

      const brand = item.Marka;
      if (!acc[season].brands[brand]) {
        acc[season].brands[brand] = {
          total: 0,
          uniqueProducts: new Set(),
          count: 0
        };
      }
      acc[season].brands[brand].total += inventory;
      acc[season].brands[brand].uniqueProducts.add(item["Ürün Kodu"]);
      acc[season].brands[brand].count = acc[season].brands[brand].uniqueProducts.size;

      return acc;
    }, {} as Record<string, {
      total: number;
      brands: Record<string, {
        total: number;
        uniqueProducts: Set<string>;
        count: number;
      }>;
    }>);

    const seasonChartData = Object.entries(seasonData)
      .filter(([season]) => season !== 'Belirtilmemiş')
      .map(([season, data]) => ({
        id: season,
        label: season,
        value: data.total,
        brands: data.brands,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      }));

    // Sezon bazında ürün grubu dağılımı
    const seasonGroupData = safeStockData.reduce((acc, item) => {
      const season = item.Sezon || 'Belirtilmemiş';
      const group = item["Ürün Grubu"] || 'Belirtilmemiş';

      if (!acc[season]) {
        acc[season] = {
          total: 0,
          groups: {}
        };
      }

      if (!acc[season].groups[group]) {
        acc[season].groups[group] = {
          total: 0,
          uniqueProducts: new Set(),
          count: 0
        };
      }

      const inventory = parseInt(item.Envanter) || 0;
      acc[season].total += inventory;
      acc[season].groups[group].total += inventory;
      acc[season].groups[group].uniqueProducts.add(item["Ürün Kodu"]);
      acc[season].groups[group].count = acc[season].groups[group].uniqueProducts.size;

      return acc;
    }, {} as Record<string, {
      total: number;
      groups: Record<string, {
        total: number;
        uniqueProducts: Set<string>;
        count: number;
      }>;
    }>);

    const seasonGroupChartData = Object.entries(seasonGroupData)
      .filter(([season]) => season !== 'Belirtilmemiş')
      .map(([season, data]) => ({
        id: season,
        label: season,
        value: data.total,
        groups: data.groups,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      }));

    // Ürün grubu bazında envanter dağılımı
    const productGroupInventory = safeStockData.reduce((acc, item) => {
      const group = item["Ürün Grubu"] || 'Belirtilmemiş';
      const inventory = parseInt(item.Envanter) || 0;

      if (!acc[group]) {
        acc[group] = {
          total: 0,
          uniqueProducts: new Set()
        };
      }

      acc[group].total += inventory;
      acc[group].uniqueProducts.add(item["Ürün Kodu"]);

      return acc;
    }, {} as Record<string, {
      total: number;
      uniqueProducts: Set<string>;
    }>);

    const productGroupPieData = Object.entries(productGroupInventory).map(([group, data]) => ({
      id: group,
      label: group,
      value: data.total,
      uniqueProducts: data.uniqueProducts.size
    }));





    // Brand Metrics Calculation (Stock + Sales + Turnover)
    const brandMetrics = Object.entries(brandInventory || {}).map(([brand, stock]) => {
      // Calculate total sales for this brand from safeSalesData
      const brandSales = (safeSalesData || [])
        .filter(sale => sale.Marka === brand)
        .reduce((sum, sale) => sum + (Number(sale["Satış Miktarı"]) || 0), 0);

      const turnoverRate = stock > 0 ? (brandSales / stock).toFixed(2) : "0.00";

      return {
        brand,
        stock,
        sales: brandSales,
        turnoverRate: parseFloat(turnoverRate)
      };
    });

    return {
      brandInventory,
      uniqueBrands,
      uniqueProductGroups,
      uniqueColorCodes,
      uniqueSizes,
      totalProducts,
      totalInventory,
      uniqueProducts,
      lowStock,
      mediumStock,
      highStock,
      lowStockCount,
      mediumStockCount,
      highStockCount,
      lowStockPercentage,
      mediumStockPercentage,
      highStockPercentage,
      totalCategorizedStock,
      allCategoriesPercentage,
      pieChartData,
      seasonChartData,
      seasonGroupChartData,
      productGroupPieData,
      brandMetrics
    };
  }, [safeStockData, safeSalesData]);

  // Satış analizi hesaplamaları (Memoized)
  const {
    brandSalesData,
    brandSalesQuantityData,
    brandSalesPieData,
    seasonSalesData,
    seasonSalesQuantityData,
    productGroupSalesData,
    productGroupSalesQuantityData
  } = useMemo(() => {
    // Marka bazında satış dağılımı analizi
    const brandSalesData = safeSalesData.reduce((acc, item) => {
      const brand = item.Marka;
      let salesAmount = 0;

      try {
        const val = item["Satış (VD)"];
        if (typeof val === 'string') {
          salesAmount = parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;
        } else if (typeof val === 'number') {
          salesAmount = val;
        }
      } catch (error) {
        console.error("Satış verisi dönüştürülemedi:", item["Satış (VD)"]);
      }

      acc[brand] = (acc[brand] || 0) + salesAmount;
      return acc;
    }, {} as Record<string, number>);

    // Marka bazında satış adedi dağılımı analizi
    const brandSalesQuantityData = safeSalesData.reduce((acc, item) => {
      const brand = item.Marka;
      const salesQuantity = Number(item["Satış Miktarı"]) || 0;
      acc[brand] = (acc[brand] || 0) + salesQuantity;
      return acc;
    }, {} as Record<string, number>);

    // Marka bazında satış dağılımı için Nivo formatı
    const brandSalesPieData = Object.entries(brandSalesData).map(([brand, total]) => ({
      id: brand,
      label: brand,
      value: parseFloat(total.toFixed(2))
    }));

    // Sezon bazında satış dağılımı analizi
    const seasonSalesData = safeSalesData.reduce((acc, item) => {
      const season = item.Sezon || 'Belirtilmemiş';
      let salesAmount = 0;

      try {
        const val = item["Satış (VD)"];
        if (typeof val === 'string') {
          salesAmount = parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;
        } else if (typeof val === 'number') {
          salesAmount = val;
        }
      } catch (error) {
        console.error("Satış verisi dönüştürülemedi:", item["Satış (VD)"]);
      }

      acc[season] = (acc[season] || 0) + salesAmount;
      return acc;
    }, {} as Record<string, number>);

    // Sezon bazında satış adedi dağılımı analizi
    const seasonSalesQuantityData = safeSalesData.reduce((acc, item) => {
      const season = item.Sezon || 'Belirtilmemiş';
      const salesQuantity = Number(item["Satış Miktarı"]) || 0;
      acc[season] = (acc[season] || 0) + salesQuantity;
      return acc;
    }, {} as Record<string, number>);

    // Ürün grubu bazında satış dağılımı analizi
    const productGroupSalesData = safeSalesData.reduce((acc, item) => {
      const group = item["Ürün Grubu"] || 'Belirtilmemiş';
      let salesAmount = 0;

      try {
        const val = item["Satış (VD)"];
        if (typeof val === 'string') {
          salesAmount = parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;
        } else if (typeof val === 'number') {
          salesAmount = val;
        }
      } catch (error) {
        console.error("Satış verisi dönüştürülemedi:", item["Satış (VD)"]);
      }

      acc[group] = (acc[group] || 0) + salesAmount;
      return acc;
    }, {} as Record<string, number>);

    // Ürün grubu bazında satış adedi dağılımı analizi
    const productGroupSalesQuantityData = safeSalesData.reduce((acc, item) => {
      const group = item["Ürün Grubu"] || 'Belirtilmemiş';
      const salesQuantity = Number(item["Satış Miktarı"]) || 0;
      acc[group] = (acc[group] || 0) + salesQuantity;
      return acc;
    }, {} as Record<string, number>);

    return {
      brandSalesData,
      brandSalesQuantityData,
      brandSalesPieData,
      seasonSalesData,
      seasonSalesQuantityData,
      productGroupSalesData,
      productGroupSalesQuantityData
    };
  }, [safeSalesData]);

  // Excel Export Handler
  const exportBrandMetrics = () => {
    const dataToExport = brandMetrics.map(item => ({
      Marka: item.brand,
      'Stok Adedi': item.stock,
      'Satış Adedi': item.sales,
      'Devir Hızı': item.turnoverRate,
      'Performans': item.turnoverRate > 1.0 ? 'A Grubu' : item.turnoverRate > 0.5 ? 'B Grubu' : 'C Grubu'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marka Analizi");
    XLSX.writeFile(wb, "Floper_Marka_Analizi.xlsx");
  };

  return (
    <div ref={containerRef} className="dashboard-container relative min-h-screen bg-[#f8fafc] pb-20 overflow-x-hidden text-slate-900">
      {/* 🔮 Soft Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-300/20 blur-[100px]" />
        <div className="absolute top-[20%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-blue-300/20 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-violet-300/20 blur-[100px]" />
      </div>
      {/* Decorative background blobs */}
      

      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 relative z-10">
        <div className="dashboard-header flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-slate-900">Stok Yönetim Paneli</h1>
            <p className="text-slate-500 mt-2">Güncel stok durumları ve analiz raporları</p>
          </div>
        </div>

        {/* Ana Metrikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
          <Card className="dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Toplam Stok</CardTitle>
              <Package2 className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-3xl font-light text-slate-800">{totalInventory}</div>
                <p className="text-xs text-slate-500 mt-1">Tüm ürünlerin toplamı</p>
              </div>
              <div>
                <p className="text-xs mt-2">
                  {totalCategorizedStock === totalInventory ? (
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Doğrulandı</span>
                  ) : (
                    <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">⚠ Fark: {totalInventory - totalCategorizedStock}</span>
                  )}
                </p>
                <div className="w-full h-1.5 mt-3"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">SKU (Çeşit)</CardTitle>
              <Filter className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-3xl font-light text-slate-800">{uniqueProducts}</div>
                <p className="text-xs text-slate-500 mt-1">Farklı ürün sayısı (Varyantlı)</p>
              </div>
              <div className="w-full h-1.5 mt-3"></div>
            </CardContent>
          </Card>

          <Card className="dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Düşük Stok (0-3)</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-3xl font-light text-orange-700">{lowStockCount}</div>
                <p className="text-xs text-orange-600 mt-1">Toplamın %{lowStockPercentage}'i</p>
              </div>
              <div className="w-full bg-orange-100 h-1.5 mt-3 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${lowStockPercentage}%` }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600">Yüksek Stok (7+)</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-3xl font-light text-emerald-700">{highStockCount}</div>
                <p className="text-xs text-emerald-600 mt-1">Toplamın %{highStockPercentage}'i</p>
              </div>
              <div className="w-full bg-emerald-100 h-1.5 mt-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${highStockPercentage}%` }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-sky-600">Orta Stok (4-6)</CardTitle>
              <Package2 className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-3xl font-light text-sky-700">{mediumStockCount}</div>
                <p className="text-xs text-sky-600 mt-1">Toplamın %{mediumStockPercentage}'i</p>
              </div>
              <div className="w-full bg-sky-100 h-1.5 mt-3 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${mediumStockPercentage}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </div>





        {/* Stok Durumu Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 dashboard-card h-full flex flex-col bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  Düşük Stok Uyarısı
                </CardTitle>
                <button
                  onClick={() => setShowLowStockFilter(!showLowStockFilter)}
                  className="p-2 hover:bg-orange-100 rounded-full transition-colors"
                >
                  <Filter className={`h-4 w-4 ${showLowStockFilter ? 'text-orange-600' : 'text-slate-400'}`} />
                </button>
              </div>
              {showLowStockFilter && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Marka</label>
                      <select
                        className="w-full h-8 text-sm rounded-md border border-gray-300 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        {uniqueBrands.map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Ürün Grubu</label>
                      <select
                        className="w-full h-8 text-sm rounded-md border border-gray-300 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        value={productGroupFilter}
                        onChange={(e) => setProductGroupFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        {uniqueProductGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Renk Kodu</label>
                      <select
                        className="w-full h-8 text-sm rounded-md border border-gray-300 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        value={colorCodeFilter}
                        onChange={(e) => setColorCodeFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        {uniqueColorCodes.map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Beden</label>
                      <select
                        className="w-full h-8 text-sm rounded-md border border-gray-300 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        value={sizeFilter}
                        onChange={(e) => setSizeFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        {uniqueSizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Ürün Kodu</label>
                    <Input
                      placeholder="Ürün kodu ara..."
                      value={productCodeFilter}
                      onChange={(e) => setProductCodeFilter(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-full pr-4">
                <div className="space-y-2">
                  {(() => {
                    // SKU bazında birleştirme - GroupedStockItem tipini kullanır

                    const skuGroups = lowStock.reduce((acc: Record<string, GroupedStockItem>, item) => {
                      // Sadece 0-3 adet arasındaki ürünleri dahil et
                      const envanter = parseInt(item.Envanter) || 0;
                      if (envanter < 0 || envanter > 3) return acc;

                      const key = `${item.Marka}-${item["Ürün Kodu"]}-${item["Ürün Grubu"]}-${item["Renk Kodu"]}`;
                      if (!acc[key]) {
                        acc[key] = {
                          Marka: item.Marka,
                          "Ürün Kodu": item["Ürün Kodu"],
                          "Ürün Grubu": item["Ürün Grubu"],
                          "Renk Kodu": item["Renk Kodu"],
                          bedenler: [],
                          totalEnvanter: 0
                        };
                      }
                      acc[key].bedenler.push({ beden: item.Beden, envanter: envanter });
                      acc[key].totalEnvanter += envanter;
                      return acc;
                    }, {});

                    return Object.values(skuGroups)
                      .filter(item => {
                        // Toplam envanteri 0-3 arası olan ürünler için tekrar kontrol
                        if (item.totalEnvanter < 0 || item.totalEnvanter > 3) return false;

                        // Marka filtresi
                        const brandMatch = !brandFilter ||
                          item.Marka === brandFilter;

                        // Ürün kodu filtresi
                        const productCodeMatch = !productCodeFilter ||
                          (item["Ürün Kodu"]?.toString().toLowerCase() || "").includes(productCodeFilter.toLowerCase());

                        // Ürün grubu filtresi
                        const productGroupMatch = !productGroupFilter ||
                          item["Ürün Grubu"] === productGroupFilter;

                        // Renk kodu filtresi
                        const colorCodeMatch = !colorCodeFilter ||
                          item["Renk Kodu"] === colorCodeFilter;

                        // Beden filtresi
                        const sizeMatch = !sizeFilter ||
                          item.bedenler.some(b => b.beden === sizeFilter);

                        return brandMatch && productCodeMatch && productGroupMatch && colorCodeMatch && sizeMatch;
                      })
                      .map((item, index) => (
                        <LowStockItem key={index} item={item} index={index} />
                      ));
                  })()}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="col-span-1 dashboard-card h-full flex flex-col bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Yüksek Stok Bildirimi
                </CardTitle>
                <button
                  onClick={() => setShowHighStockFilter(!showHighStockFilter)}
                  className="p-2 hover:bg-green-100 rounded-full transition-colors"
                >
                  <Filter className={`h-4 w-4 ${showHighStockFilter ? 'text-green-600' : 'text-slate-400'}`} />
                </button>
              </div>
              {showHighStockFilter && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Marka</label>
                      <select
                        className="w-full h-8 text-sm rounded-md border border-gray-300 focus:border-green-400 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        value={highStockBrandFilter}
                        onChange={(e) => setHighStockBrandFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        {uniqueBrands.map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Ürün Grubu</label>
                      <select
                        className="w-full h-8 text-sm rounded-md border border-gray-300 focus:border-green-400 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        value={highStockProductGroupFilter}
                        onChange={(e) => setHighStockProductGroupFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        {uniqueProductGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Renk Kodu</label>
                      <select
                        className="w-full h-8 text-sm rounded-md border border-gray-300 focus:border-green-400 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        value={highStockColorCodeFilter}
                        onChange={(e) => setHighStockColorCodeFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        {uniqueColorCodes.map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Beden</label>
                      <select
                        className="w-full h-8 text-sm rounded-md border border-gray-300 focus:border-green-400 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        value={highStockSizeFilter}
                        onChange={(e) => setHighStockSizeFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        {uniqueSizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Ürün Kodu</label>
                    <Input
                      placeholder="Ürün kodu ara..."
                      value={highStockProductCodeFilter}
                      onChange={(e) => setHighStockProductCodeFilter(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-full pr-4">
                <div className="space-y-2">
                  {(() => {
                    // SKU bazında birleştirme - GroupedStockItem tipini kullanır

                    const skuGroups = highStock.reduce((acc: Record<string, GroupedStockItem>, item) => {
                      // Sadece 7 ve üzeri ürünleri dahil et
                      const envanter = parseInt(item.Envanter) || 0;
                      if (envanter < 7) return acc;

                      const key = `${item.Marka}-${item["Ürün Kodu"]}-${item["Ürün Grubu"]}-${item["Renk Kodu"]}`;
                      if (!acc[key]) {
                        acc[key] = {
                          Marka: item.Marka,
                          "Ürün Kodu": item["Ürün Kodu"],
                          "Ürün Grubu": item["Ürün Grubu"],
                          "Renk Kodu": item["Renk Kodu"],
                          bedenler: [],
                          totalEnvanter: 0
                        };
                      }
                      acc[key].bedenler.push({ beden: item.Beden, envanter: envanter });
                      acc[key].totalEnvanter += envanter;
                      return acc;
                    }, {});

                    return Object.values(skuGroups)
                      .filter(item => {
                        // Toplam envanteri 7 ve üzerinde olan ürünler için tekrar kontrol
                        if (item.totalEnvanter < 7) return false;

                        // Marka filtresi
                        const brandMatch = !highStockBrandFilter ||
                          item.Marka === highStockBrandFilter;

                        // Ürün kodu filtresi
                        const productCodeMatch = !highStockProductCodeFilter ||
                          (item["Ürün Kodu"]?.toString().toLowerCase() || "").includes(highStockProductCodeFilter.toLowerCase());

                        // Ürün grubu filtresi
                        const productGroupMatch = !highStockProductGroupFilter ||
                          item["Ürün Grubu"] === highStockProductGroupFilter;

                        // Renk kodu filtresi
                        const colorCodeMatch = !highStockColorCodeFilter ||
                          item["Renk Kodu"] === highStockColorCodeFilter;

                        // Beden filtresi
                        const sizeMatch = !highStockSizeFilter ||
                          item.bedenler.some(b => b.beden === highStockSizeFilter);

                        return brandMatch && productCodeMatch && productGroupMatch && colorCodeMatch && sizeMatch;
                      })
                      .map((item, index) => (
                        <HighStockItem key={index} item={item} index={index} />
                      ));
                  })()}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="col-span-1 dashboard-card h-full flex flex-col bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package2 className="h-5 w-5 text-blue-600" />
                  Orta Adetli Stok Listesi
                </CardTitle>
                <button
                  onClick={() => setShowMediumStockFilter(!showMediumStockFilter)}
                  className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <Filter className={`h-4 w-4 ${showMediumStockFilter ? 'text-blue-600' : 'text-slate-400'}`} />
                </button>
              </div>
              {showMediumStockFilter && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Marka</label>
                      <select
                        className="w-full h-8 text-sm rounded-md border border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        value={mediumStockBrandFilter}
                        onChange={(e) => setMediumStockBrandFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        {uniqueBrands.map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Ürün Grubu</label>
                      <select
                        className="w-full h-8 text-sm rounded-md border border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        value={mediumStockProductGroupFilter}
                        onChange={(e) => setMediumStockProductGroupFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        {uniqueProductGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Renk Kodu</label>
                      <select
                        className="w-full h-8 text-sm rounded-md border border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        value={mediumStockColorCodeFilter}
                        onChange={(e) => setMediumStockColorCodeFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        {uniqueColorCodes.map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Beden</label>
                      <select
                        className="w-full h-8 text-sm rounded-md border border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        value={mediumStockSizeFilter}
                        onChange={(e) => setMediumStockSizeFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        {uniqueSizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Ürün Kodu</label>
                    <Input
                      placeholder="Ürün kodu ara..."
                      value={mediumStockProductCodeFilter}
                      onChange={(e) => setMediumStockProductCodeFilter(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-full pr-4">
                <div className="space-y-2">
                  {(() => {
                    // SKU bazında birleştirme - GroupedStockItem tipini kullanır

                    const skuGroups = mediumStock.reduce((acc: Record<string, GroupedStockItem>, item) => {
                      // Sadece 4-6 adet arasındaki ürünleri dahil et
                      const envanter = parseInt(item.Envanter) || 0;
                      if (envanter < 4 || envanter > 6) return acc;

                      const key = `${item.Marka}-${item["Ürün Kodu"]}-${item["Ürün Grubu"]}-${item["Renk Kodu"]}`;
                      if (!acc[key]) {
                        acc[key] = {
                          Marka: item.Marka,
                          "Ürün Kodu": item["Ürün Kodu"],
                          "Ürün Grubu": item["Ürün Grubu"],
                          "Renk Kodu": item["Renk Kodu"],
                          bedenler: [],
                          totalEnvanter: 0
                        };
                      }
                      acc[key].bedenler.push({ beden: item.Beden, envanter: envanter });
                      acc[key].totalEnvanter += envanter;
                      return acc;
                    }, {});

                    return Object.values(skuGroups)
                      .filter(item => {
                        // Toplam envanteri 4-6 arası olan ürünler için tekrar kontrol
                        if (item.totalEnvanter < 4 || item.totalEnvanter > 6) return false;

                        // Marka filtresi
                        const brandMatch = !mediumStockBrandFilter ||
                          item.Marka === mediumStockBrandFilter;

                        // Ürün kodu filtresi
                        const productCodeMatch = !mediumStockProductCodeFilter ||
                          (item["Ürün Kodu"]?.toString().toLowerCase() || "").includes(mediumStockProductCodeFilter.toLowerCase());

                        // Ürün grubu filtresi
                        const productGroupMatch = !mediumStockProductGroupFilter ||
                          item["Ürün Grubu"] === mediumStockProductGroupFilter;

                        // Renk kodu filtresi
                        const colorCodeMatch = !mediumStockColorCodeFilter ||
                          item["Renk Kodu"] === mediumStockColorCodeFilter;

                        // Beden filtresi
                        const sizeMatch = !mediumStockSizeFilter ||
                          item.bedenler.some(b => b.beden === mediumStockSizeFilter);

                        return brandMatch && productCodeMatch && productGroupMatch && colorCodeMatch && sizeMatch;
                      })
                      .map((item, index) => (
                        <MediumStockItem key={index} item={item} index={index} />
                      ));
                  })()}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Grafikler */}
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400">
              <CardHeader>
                <CardTitle>Marka Bazında Satış Dağılımı</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Markaların toplam satış tutarı içindeki payları
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full pr-4">
                  <div className="space-y-2">
                    {Object.entries(brandSalesData)
                      .sort(([, a], [, b]) => b - a)
                      .map(([brand, total], index) => {
                        const totalSales = Object.values(brandSalesData).reduce((sum, val) => sum + val, 0);
                        const percentage = ((total / totalSales) * 100).toFixed(1);

                        return (
                          <div key={index} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors bg-blue-50 rounded-lg border border-blue-100">
                            <div>
                              <p className="font-medium text-blue-900">{brand}</p>
                              <div className="flex gap-2 text-sm text-blue-600">
                                <span>{total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                              </div>
                              <div className="flex justify-center items-center text-xs text-blue-600 mt-1 w-full">
                                {brandSalesQuantityData[brand]?.toLocaleString('tr-TR') || '0'} adet satış
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">
                              %{percentage}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400">
              <CardHeader>
                <CardTitle>Sezon Bazında Satış Dağılımı</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sezonların toplam satış tutarı içindeki payları
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full pr-4">
                  <div className="space-y-2">
                    {Object.entries(seasonSalesData)
                      .sort(([, a], [, b]) => b - a)
                      .map(([season, total], index) => {
                        const totalSales = Object.values(seasonSalesData).reduce((sum, val) => sum + val, 0);
                        const percentage = ((total / totalSales) * 100).toFixed(1);

                        return (
                          <div key={index} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors bg-green-50 rounded-lg border border-green-100">
                            <div>
                              <p className="font-medium text-green-900">{season}</p>
                              <div className="flex gap-2 text-sm text-green-600">
                                <span>{total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                              </div>
                              <div className="flex justify-center items-center text-xs text-green-600 mt-1 w-full">
                                {seasonSalesQuantityData[season]?.toLocaleString('tr-TR') || '0'} adet satış
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              %{percentage}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400">
              <CardHeader>
                <CardTitle>Ürün Grubu Bazında Satış Dağılımı</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ürün gruplarının toplam satış tutarı içindeki payları
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full pr-4">
                  <div className="space-y-2">
                    {Object.entries(productGroupSalesData)
                      .sort(([, a], [, b]) => b - a)
                      .map(([group, total], index) => {
                        const totalSales = Object.values(productGroupSalesData).reduce((sum, val) => sum + val, 0);
                        const percentage = ((total / totalSales) * 100).toFixed(1);

                        return (
                          <div key={index} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors bg-purple-50 rounded-lg border border-purple-100">
                            <div>
                              <p className="font-medium text-purple-900">{group}</p>
                              <div className="flex gap-2 text-sm text-purple-600">
                                <span>{total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                              </div>
                              <div className="flex justify-center items-center text-xs text-purple-600 mt-1 w-full">
                                {productGroupSalesQuantityData[group]?.toLocaleString('tr-TR') || '0'} adet satış
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-purple-100 text-purple-700">
                              %{percentage}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400">
              <CardHeader>
                <CardTitle>Marka Bazında Stok Dağılımı</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Markaların toplam stok içindeki payları
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsivePie
                    data={pieChartData}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.6}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={{ scheme: 'nivo' }}
                    borderWidth={1}
                    borderColor={{
                      from: 'color',
                      modifiers: [['darker', 0.2]]
                    }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{
                      from: 'color',
                      modifiers: [['darker', 2]]
                    }}
                    tooltip={({ datum }) => {
                      const brandProducts = stockData.filter(item => item.Marka === datum.id);
                      const productGroups = brandProducts.reduce((acc, item) => {
                        const group = item["Ürün Grubu"];
                        if (!acc[group]) {
                          acc[group] = {
                            total: 0,
                            uniqueProducts: new Set(),
                            count: 0
                          };
                        }
                        acc[group].total += parseInt(item.Envanter) || 0;
                        acc[group].uniqueProducts.add(item["Ürün Kodu"]);
                        acc[group].count = acc[group].uniqueProducts.size;
                        return acc;
                      }, {} as Record<string, {
                        total: number;
                        uniqueProducts: Set<string>;
                        count: number;
                      }>);

                      // Toplam ürün çeşidi sayısını hesaplama
                      const totalUniqueProducts = new Set(brandProducts.map(item => item["Ürün Kodu"])).size;

                      return (
                        <div className="bg-white p-4 rounded-lg shadow-lg border">
                          <p className="font-medium text-gray-900 mb-2">{datum.id}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: datum.color }} />
                              <span className="text-sm text-gray-600">Toplam Stok:</span>
                              <span className="text-sm font-medium">{datum.value} adet</span>
                            </div>
                            <div className="flex items-center gap-2 ml-5">
                              <span className="text-sm text-gray-600">Toplam Çeşit:</span>
                              <span className="text-sm font-medium">{totalUniqueProducts} ürün</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-2 border-t pt-2">
                              <p className="font-medium mb-1">Ürün Grubu Dağılımı:</p>
                              <div className="space-y-1">
                                {Object.entries(productGroups)
                                  .sort(([, a], [, b]) => b.total - a.total)
                                  .map(([group, data], index) => {
                                    const percentage = ((data.total / datum.value) * 100).toFixed(1);
                                    return (
                                      <div key={index} className="flex items-center justify-between">
                                        <span>{group}:</span>
                                        <div className="flex gap-2 items-center">
                                          <span className="text-gray-900">{data.total} adet</span>
                                          <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs py-0 h-4">
                                            %{percentage}
                                          </Badge>
                                          <span className="text-gray-500">({data.count} çeşit)</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                    legends={[
                      {
                        anchor: 'bottom',
                        direction: 'row',
                        justify: false,
                        translateY: 56,
                        itemsSpacing: 0,
                        itemWidth: 100,
                        itemHeight: 18,
                        itemTextColor: '#999',
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 18,
                        symbolShape: 'circle'
                      }
                    ]}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400">
              <CardHeader>
                <CardTitle>Sezon Bazında Stok Dağılımı</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sezonlara göre stok dağılımı
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsivePie
                    data={seasonChartData}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    theme={{
                      textColor: '#94a3b8',
                      tooltip: {
                        container: {
                          background: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: 12,
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }
                      }
                    }}

                    colors={{ scheme: 'category10' }}
                    borderWidth={1}
                    borderColor={{
                      from: 'color',
                      modifiers: [['darker', 0.2]]
                    }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{
                      from: 'color',
                      modifiers: [['darker', 2]]
                    }}
                    legends={[
                      {
                        anchor: 'bottom',
                        direction: 'row',
                        justify: false,
                        translateX: 0,
                        translateY: 56,
                        itemsSpacing: 0,
                        itemWidth: 100,
                        itemHeight: 18,
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 18,
                        symbolShape: 'circle'
                      }
                    ]}
                    tooltip={({ datum }: { datum: any }) => {
                      const brands = datum.data?.brands || {};
                      const totalProducts = Object.entries(brands).reduce((sum, [_, brand]) => sum + (brand as any).count, 0);

                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border min-w-[280px]">
                          {/* Başlık ve Toplam Bilgiler */}
                          <div className="border-b pb-2 mb-2">
                            <p className="font-medium text-gray-900">{datum.id} Sezonu</p>
                            <div className="flex items-center gap-4 text-sm mt-1">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: datum.color }} />
                                <span className="text-gray-600">{datum.value} adet</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                <span className="text-gray-600">{totalProducts} çeşit</span>
                              </div>
                            </div>
                          </div>

                          {/* Marka Dağılımı - Kompakt Liste */}
                          <div className="text-sm space-y-1">
                            {Object.entries(brands)
                              .sort(([, a]: [string, any], [, b]: [string, any]) => b.total - a.total)
                              .map(([brand, data]: [string, any], index) => {
                                const percentage = (data.total / datum.value * 100).toFixed(1);
                                return (
                                  <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900">{brand}</span>
                                      <span className="text-xs text-gray-500">({data.count} çeşit)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-900">{data.total} adet</span>
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs py-0 h-4">
                                        %{percentage}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-card h-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-400">
              <CardHeader>
                <CardTitle>Sezon Bazında Grup Dağılımı</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sezonlara göre ürün grubu dağılımı
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsivePie
                    data={seasonGroupChartData}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    theme={{
                      textColor: '#94a3b8',
                      tooltip: {
                        container: {
                          background: '#1e293b',
                          color: '#f1f5f9',
                          fontSize: 12,
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }
                      }
                    }}

                    colors={{ scheme: 'category10' }}
                    borderWidth={1}
                    borderColor={{
                      from: 'color',
                      modifiers: [['darker', 0.2]]
                    }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{
                      from: 'color',
                      modifiers: [['darker', 2]]
                    }}
                    legends={[
                      {
                        anchor: 'bottom',
                        direction: 'row',
                        justify: false,
                        translateX: 0,
                        translateY: 56,
                        itemsSpacing: 0,
                        itemWidth: 100,
                        itemHeight: 18,
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 18,
                        symbolShape: 'circle'
                      }
                    ]}
                    tooltip={({ datum }: { datum: any }) => {
                      const groups = datum.data?.groups || {};
                      const totalProducts = Object.entries(groups).reduce((sum, [_, group]) => sum + (group as any).count, 0);

                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border min-w-[280px]">
                          {/* Başlık ve Toplam Bilgiler */}
                          <div className="border-b pb-2 mb-2">
                            <p className="font-medium text-gray-900">{datum.id} Sezonu</p>
                            <div className="flex items-center gap-4 text-sm mt-1">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: datum.color }} />
                                <span className="text-gray-600">{datum.value} adet</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                <span className="text-gray-600">{totalProducts} çeşit</span>
                              </div>
                            </div>
                          </div>

                          {/* Grup Dağılımı - Kompakt Liste */}
                          <div className="text-sm space-y-1">
                            {Object.entries(groups)
                              .sort(([, a]: [string, any], [, b]: [string, any]) => b.total - a.total)
                              .map(([group, data]: [string, any], index) => {
                                const percentage = (data.total / datum.value * 100).toFixed(1);
                                return (
                                  <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900">{group}</span>
                                      <span className="text-xs text-gray-500">({data.count} çeşit)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-900">{data.total} adet</span>
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs py-0 h-4">
                                        %{percentage}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 dashboard-card h-full flex flex-col bg-white border-slate-100 shadow-sm rounded-2xl hover:shadow-md shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package2 className="h-5 w-5 text-purple-600" />
                    Ürün Grubu Bazında Stok Listesi
                  </CardTitle>
                  <button
                    onClick={() => setShowProductGroupFilter(!showProductGroupFilter)}
                    className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                  >
                    <Filter className={`h-4 w-4 ${showProductGroupFilter ? 'text-purple-600' : 'text-slate-400'}`} />
                  </button>
                </div>
                {showProductGroupFilter && (
                  <div className="mt-2 space-y-2">
                    <Input
                      placeholder="Ürün grubu ara..."
                      value={productGroupNameFilter}
                      onChange={(e) => setProductGroupNameFilter(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full pr-4">
                  <div className="space-y-2">
                    {productGroupPieData
                      .filter(group => {
                        const nameMatch = !productGroupNameFilter ||
                          group.id.toLowerCase().includes(productGroupNameFilter.toLowerCase());
                        return nameMatch;
                      })
                      .sort((a, b) => b.value - a.value)
                      .map((group, index) => (
                        <div key={index} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors bg-purple-50 rounded-lg border border-purple-100">
                          <div>
                            <p className="font-medium text-purple-900">{group.id}</p>
                            <div className="flex gap-2 text-sm text-purple-600">
                              <span>{group.value} adet stok</span>
                              <span>•</span>
                              <span>{group.uniqueProducts} çeşit ürün</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-purple-100 text-purple-700">
                            %{((group.value / stockData.reduce((sum, item) => sum + (parseInt(item.Envanter) || 0), 0)) * 100).toFixed(1)}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Marka Stok Detayları - Kaydırılabilir Liste */}
        <div className="mt-8">
          <Card className="w-full dashboard-card bg-white border border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-all duration-300">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Marka Stok & Satış Analizi</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Marka bazlı stok, satış ve devir hızı performansı
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                    onClick={exportBrandMetrics}
                  >
                    <FileDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Excel'e Aktar</span>
                  </Button>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Marka ara..."
                      value={brandSearchTerm}
                      onChange={(e) => setBrandSearchTerm(e.target.value)}
                      className="pl-8 h-9 w-[200px]"
                    />
                  </div>
                  <Select value={brandSortOption} onValueChange={(val: any) => setBrandSortOption(val)}>
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue placeholder="Sıralama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stok Miktarı</SelectItem>
                      <SelectItem value="sales">Satış Miktarı</SelectItem>
                      <SelectItem value="turnover">Devir Hızı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full pr-4">
                <div className="space-y-3">
                  {brandMetrics
                    .filter(metric => metric.brand.toLowerCase().includes(brandSearchTerm.toLowerCase()))
                    .sort((a: any, b: any) => {
                      if (brandSortOption === 'sales') return b.sales - a.sales;
                      if (brandSortOption === 'turnover') return b.turnoverRate - a.turnoverRate;
                      return b.stock - a.stock;
                    })
                    .map((metric, index) => {
                      const maxStock = Math.max(...brandMetrics.map(m => m.stock));
                      const maxSales = Math.max(...brandMetrics.map(m => m.sales));

                      return (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors gap-4">
                          {/* Brand Info & Stock */}
                          <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-900">{metric.brand}</span>
                              <span className="text-sm font-bold text-blue-600">{metric.stock} Stok</span>
                            </div>
                            <Progress value={(metric.stock / maxStock) * 100} className="h-2 bg-blue-100" />
                          </div>

                          {/* Sales Info */}
                          <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-500">Satış</span>
                              <span className="text-sm font-bold text-green-600">{metric.sales} Adet</span>
                            </div>
                            <Progress value={(metric.sales / maxSales) * 100} className="h-2 bg-green-100" />
                          </div>

                          {/* Turnover Rate */}
                          <div className="flex items-center gap-4 min-w-[120px] justify-end">
                            <div className="text-right">
                              <span className="block text-xs text-muted-foreground">Devir Hızı</span>
                              <Badge variant={metric.turnoverRate > 0.5 ? "default" : "secondary"}
                                className={`${metric.turnoverRate > 1.0 ? "bg-green-500 hover:bg-green-600" : metric.turnoverRate > 0.5 ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                {metric.turnoverRate}x
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  );
} 