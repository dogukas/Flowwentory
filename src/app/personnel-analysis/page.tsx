"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ResponsivePie } from "@nivo/pie";
import { Package2, Upload, Loader2, Database, Check, TrendingUp, Users, ShoppingBag } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import * as XLSX from 'xlsx';
import { supabase } from "@/lib/supabase";
import { TopProductsList } from "./top-products";
import { motion } from "framer-motion";

interface SalesData {
  personelAdi: string;
  marka: string;
  urunKodu: string;
  renkKodu: string;
  satisAdeti: number;
  satisFiyati: number;
}

interface ExcelRow {
  personelAdi: string | number;
  marka: string | number;
  urunKodu: string | number;
  renkKodu: string | number;
  satisAdeti: string | number;
  satisFiyati: string | number;
}

export default function PersonnelAnalysisPage() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Supabase'den veri çekme ve Local Storage eşitleme
  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        const { fetchAllRows } = await import('@/lib/supabase');
        const cloudData = await fetchAllRows('personnel_sales');
        
        if (cloudData && cloudData.length > 0) {
          const formatted = cloudData.map((row: any) => ({
            personelAdi: row.personel_adi || '',
            marka: row.marka || '',
            urunKodu: row.urun_kodu || '',
            renkKodu: row.renk_kodu || '',
            satisAdeti: row.satis_adeti || 0,
            satisFiyati: row.satis_fiyati || 0
          }));
          setSalesData(formatted);
          if (typeof window !== 'undefined') {
            localStorage.setItem('salesData', JSON.stringify(formatted));
          }
        } else if (cloudData && cloudData.length === 0) {
          setSalesData([]);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('salesData');
          }
        }
      } catch (error) {
        console.error("Supabase veri çekme hatası, yerel veriye dönülüyor:", error);
        const savedData = localStorage.getItem('salesData');
        if (savedData) {
          setSalesData(JSON.parse(savedData));
        }
      }
    };

    fetchCloudData();
  }, []);

  const updateSalesData = (newData: SalesData[]) => {
    setSalesData(newData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('salesData', JSON.stringify(newData));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];

        const formattedData = rawData.map(row => ({
          personelAdi: String(row.personelAdi || ''),
          marka: String(row.marka || ''),
          urunKodu: String(row.urunKodu || ''),
          renkKodu: String(row.renkKodu || ''),
          satisAdeti: Number(row.satisAdeti) || 0,
          satisFiyati: Number(row.satisFiyati) || 0
        }));

        updateSalesData(formattedData);
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Tüm veriler silinecek. Emin misiniz?')) {
      updateSalesData([]);
    }
  };

  const chunkArray = (arr: any[], size: number) => Array.from(
    { length: Math.ceil(arr.length / size) }, 
    (v, i) => arr.slice(i * size, i * size + size)
  );

  const handlePersonnelSync = async () => {
    if (salesData.length === 0) return;
    setIsSyncing(true);
    setSyncStatus('idle');

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.user) throw new Error("Lütfen giriş yapın.");
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .single();
      
      if (profileError || !profile?.company_id) throw new Error("Kayıtlı bir şirket bulunamadı.");
      const companyId = profile.company_id;

      await supabase.from('personnel_sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const dataChunks = chunkArray(salesData, 100);
      for (const chunk of dataChunks) {
        const payload = chunk.map(item => ({
          personel_adi: item.personelAdi,
          marka: item.marka,
          urun_kodu: item.urunKodu,
          renk_kodu: item.renkKodu,
          satis_adeti: item.satisAdeti,
          satis_fiyati: item.satisFiyati,
          company_id: companyId
        }));
        const { error } = await supabase.from('personnel_sales').insert(payload);
        if (error) throw error;
      }

      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error: any) {
      console.error("Yedekleme hatası:", error);
      alert("Senkronizasyon hatası: " + (error?.message || "Tablo eksik olabilir."));
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const statistics = {
    totalSales: salesData.reduce((sum, item) => sum + (Number(item.satisFiyati) || 0), 0),
    totalQuantity: salesData.reduce((sum, item) => sum + (Number(item.satisAdeti) || 0), 0),
    topBrand: (() => {
      const brandCounts = salesData.reduce((acc, item) => {
        const count = Number(item.satisAdeti) || 0;
        acc[item.marka] = (acc[item.marka] || 0) + count;
        return acc;
      }, {} as Record<string, number>);
      return Object.entries(brandCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '-';
    })(),
  };

  const brandDistribution = salesData.reduce((acc, item) => {
    acc[item.marka] = (acc[item.marka] || 0) + item.satisAdeti;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(brandDistribution)
    .filter(([brand, count]) => brand && count > 0)
    .map(([brand, count]) => ({
      id: brand,
      label: brand,
      value: count
    }));

  const personnelPerformance = salesData.reduce((acc, item) => {
    const personelAdi = item.personelAdi;
    if (!acc[personelAdi]) {
      acc[personelAdi] = { totalSales: 0, totalQuantity: 0 };
    }
    acc[personelAdi].totalSales += Number(item.satisFiyati) || 0;
    acc[personelAdi].totalQuantity += Number(item.satisAdeti) || 0;
    return acc;
  }, {} as Record<string, { totalSales: number; totalQuantity: number }>);

  const performanceBarData = Object.entries(personnelPerformance)
    .filter(([name, data]) => name && (data.totalSales > 0 || data.totalQuantity > 0))
    .map(([name, data]) => ({
      name,
      "Satış Tutarı": Math.round(data.totalSales * 100) / 100,
      "Satış Adedi": data.totalQuantity
    }));

  const { topBrands, totalBrandRevenue } = useMemo(() => {
    const brandSalesAmount = salesData.reduce((acc, item) => {
      const brand = item.marka;
      if (!acc[brand]) acc[brand] = { totalAmount: 0, totalQuantity: 0 };
      acc[brand].totalAmount += Number(item.satisFiyati) || 0;
      acc[brand].totalQuantity += Number(item.satisAdeti) || 0;
      return acc;
    }, {} as Record<string, { totalAmount: number; totalQuantity: number }>);

    const sortedBrands = Object.entries(brandSalesAmount)
      .sort(([, a], [, b]) => b.totalAmount - a.totalAmount)
      .slice(0, 3);
    const totalRevenue = Object.values(brandSalesAmount).reduce((sum, data) => sum + data.totalAmount, 0);
    return { topBrands: sortedBrands, totalBrandRevenue: totalRevenue };
  }, [salesData]);

  const sortedBrandsByCiroDetail = useMemo(() => {
    const brandSalesRevenue = salesData.reduce((acc, sale) => {
      const brand = sale.marka;
      if (!acc[brand]) acc[brand] = { quantity: 0, revenue: 0 };
      acc[brand].quantity += sale.satisAdeti;
      acc[brand].revenue += sale.satisFiyati;
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number }>);

    return Object.entries(brandSalesRevenue)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([brand, data]) => {
        const totalRevenue = Object.values(brandSalesRevenue).reduce((sum, brand) => sum + brand.revenue, 0);
        const percentage = (data.revenue / totalRevenue) * 100;
        const personelData = salesData
          .filter(sale => sale.marka === brand)
          .reduce((acc, sale) => {
            if (!acc[sale.personelAdi]) acc[sale.personelAdi] = { quantity: 0, revenue: 0 };
            acc[sale.personelAdi].quantity += sale.satisAdeti;
            acc[sale.personelAdi].revenue += sale.satisFiyati;
            return acc;
          }, {} as Record<string, { quantity: number; revenue: number }>);
        const topSeller = Object.entries(personelData).sort(([, a], [, b]) => b.quantity - a.quantity)[0];
        return { brand, data, percentage, topSeller };
      });
  }, [salesData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 overflow-x-hidden pb-8">
      {/* Soft Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-300/15 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-blue-300/15 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-violet-300/15 blur-[120px]" />
      </div>

      <motion.div 
        className="container mx-auto p-4 md:p-6 pt-20"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Personel Performans Analizi</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Satış ekiplerinin performans verilerini analiz edin.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => document.getElementById('fileInput')?.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
              <Upload className="mr-2 h-4 w-4" />
              Excel Yükle
            </Button>
            <input
              id="fileInput"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileUpload}
            />
            {salesData.length > 0 && (
              <>
                <Button variant="outline" onClick={handleClearData} className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl dark:border-rose-900/50 dark:hover:bg-rose-950/30">
                  <Package2 className="mr-2 h-4 w-4" />
                  Temizle
                </Button>
                <Button
                  onClick={handlePersonnelSync}
                  disabled={isSyncing}
                  variant={syncStatus === 'error' ? "destructive" : "outline"}
                  className={`gap-2 relative overflow-hidden rounded-xl transition-all ${syncStatus !== 'error' ? 'text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/30' : ''}`}
                >
                  {isSyncing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor...</>
                  ) : syncStatus === 'success' ? (
                    <><Check className="h-4 w-4 text-emerald-600" /> <span className="text-emerald-600">Yüklendi</span></>
                  ) : (
                    <><Database className="h-4 w-4" /> Buluta Yedekle</>
                  )}
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* İstatistik Kartları */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="dashboard-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-slate-800 dark:text-slate-200">Toplam Ciro</div>
                  <div className="text-xs font-normal text-slate-500">Tüm satışların değeri</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 pt-2">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(statistics.totalSales)}
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-slate-800 dark:text-slate-200">Toplam Adet</div>
                  <div className="text-xs font-normal text-slate-500">Satılan ürün sayısı</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 pt-2">
                {new Intl.NumberFormat('tr-TR').format(statistics.totalQuantity)}
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-slate-800 dark:text-slate-200">En Çok Satan Markalar</div>
                  <div className="text-xs font-normal text-slate-500">Ciro bazlı ilk 3</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 pt-1">
                {topBrands.map(([brand, data], index) => {
                  const percentage = (data.totalAmount / totalBrandRevenue) * 100;
                  return (
                    <div key={brand} className="flex items-center gap-3">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold text-white ${index === 0 ? 'bg-purple-600' : index === 1 ? 'bg-purple-500' : 'bg-purple-400'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{brand}</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(data.totalAmount)}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-1 mt-1 bg-purple-100 dark:bg-purple-900/30 [&>div]:bg-purple-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grafikler */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <Card className="dashboard-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">Personel Ciro Dağılımı</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-3">
                  {performanceBarData
                    .sort((a, b) => b["Satış Tutarı"] - a["Satış Tutarı"])
                    .map((item, index) => {
                      const totalAmount = performanceBarData.reduce((sum, item) => sum + item["Satış Tutarı"], 0);
                      const percentage = (item["Satış Tutarı"] / totalAmount) * 100;
                      return (
                        <div key={index} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</h3>
                                <div className="text-xs text-slate-500">{new Intl.NumberFormat('tr-TR').format(item["Satış Adedi"])} adet satış</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(item["Satış Tutarı"])}
                              </div>
                              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{percentage.toFixed(1)}% pazar payı</div>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-1.5 bg-indigo-50 dark:bg-indigo-950 [&>div]:bg-indigo-500" />
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="dashboard-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">Marka Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {pieData.length > 0 ? (
                  <ResponsivePie
                    data={pieData}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.6}
                    padAngle={1}
                    cornerRadius={4}
                    activeOuterRadiusOffset={8}
                    colors={{ scheme: 'set3' }}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    enableArcLinkLabels={true}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#64748b"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                    theme={{ tooltip: { container: { background: '#fff', color: '#333', fontSize: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } } }}
                    tooltip={({ datum }) => {
                      const brandSales = salesData.filter(i => i.marka === datum.label).reduce((t, i) => t + i.satisFiyati, 0);
                      return (
                        <div className="bg-white dark:bg-slate-800 p-3 shadow-xl rounded-xl border border-slate-100 dark:border-slate-700">
                          <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">{datum.label}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Adet: {new Intl.NumberFormat('tr-TR').format(datum.value)}</div>
                          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Ciro: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(brandSales)}</div>
                        </div>
                      )
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">Veri yüklenmedi</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <Card className="dashboard-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ciro Bazında Marka Analizi (Top 5)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {sortedBrandsByCiroDetail.map(({ brand, data, percentage, topSeller }, index) => (
                  <div key={brand} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs">{index + 1}</div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate">{brand}</h3>
                      </div>
                      <div className="text-xl font-bold text-slate-700 dark:text-slate-100 mb-1">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(data.revenue)}
                      </div>
                      <div className="flex items-center justify-between mb-3 text-xs">
                        <span className="text-slate-500">{new Intl.NumberFormat('tr-TR').format(data.quantity)} Adet</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">%{percentage.toFixed(1)}</span>
                      </div>
                      <Progress value={percentage} className="h-1.5 mb-4 bg-indigo-50 dark:bg-indigo-950 [&>div]:bg-indigo-500" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">En İyi Satıcı</div>
                      <div className="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate">{topSeller[0]}</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(topSeller[1].revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <TopProductsList />
        </motion.div>
      </motion.div>
    </div>
  );
}