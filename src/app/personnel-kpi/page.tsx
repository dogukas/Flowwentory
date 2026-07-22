"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Database, Table as TableIcon, Tags, Users, Calendar, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { useStockStore } from "@/store/useStockStore";
import { fetchAllRows } from "@/lib/supabase";

export default function DataScalingPage() {
  const { stockData, setStockData } = useStockStore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load from Supabase if empty
  useEffect(() => {
    const fetchStocks = async () => {
      if (stockData.length > 0) return;
      setIsLoading(true);
      try {
        const stocks = await fetchAllRows('stocks');
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
      } catch (error) {
        console.error("Supabase error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStocks();
  }, [stockData.length, setStockData]);

  // Derived Data calculations
  const filteredData = useMemo(() => {
    if (!searchQuery) return stockData;
    const q = searchQuery.toLowerCase();
    return stockData.filter(item => 
      (item.Marka && item.Marka.toLowerCase().includes(q)) ||
      (item["Ürün Grubu"] && item["Ürün Grubu"].toLowerCase().includes(q)) ||
      (item.Sezon && item.Sezon.toLowerCase().includes(q))
    );
  }, [stockData, searchQuery]);

  // Group by Brand
  const brandData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach(item => {
      const brand = item.Marka || "Belirsiz";
      groups[brand] = (groups[brand] || 0) + (parseInt(item.Envanter) || 0);
    });
    return Object.entries(groups).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [filteredData]);

  // Group by Category (Ürün Grubu)
  const categoryData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach(item => {
      let cat = item["Ürün Grubu"] || "Belirsiz";
      groups[cat] = (groups[cat] || 0) + (parseInt(item.Envanter) || 0);
    });
    return Object.entries(groups).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [filteredData]);

  // Group by Gender (Cinsiyet)
  const genderData = useMemo(() => {
    const groups: Record<string, number> = { "Kadın": 0, "Erkek": 0, "Çocuk": 0, "Unisex": 0, "Belirsiz": 0 };
    filteredData.forEach(item => {
      const groupStr = (item["Ürün Grubu"] || "").toLowerCase();
      const envanter = parseInt(item.Envanter) || 0;
      
      if (groupStr.includes("kadın") || groupStr.includes("kadin") || groupStr.includes("bayan")) {
        groups["Kadın"] += envanter;
      } else if (groupStr.includes("erkek") || groupStr.includes("bay")) {
        groups["Erkek"] += envanter;
      } else if (groupStr.includes("çocuk") || groupStr.includes("cocuk") || groupStr.includes("kız") || groupStr.includes("erkek çocuk")) {
        groups["Çocuk"] += envanter;
      } else if (groupStr.includes("unisex")) {
        groups["Unisex"] += envanter;
      } else {
        groups["Belirsiz"] += envanter;
      }
    });
    return Object.entries(groups).filter(g => g[1] > 0).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [filteredData]);

  // Group by Season
  const seasonData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach(item => {
      const season = item.Sezon || "Belirsiz";
      groups[season] = (groups[season] || 0) + (parseInt(item.Envanter) || 0);
    });
    return Object.entries(groups).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [filteredData]);

  // Max values for visual progress bars
  const maxBrand = Math.max(...brandData.map(d => d.count), 1);
  const maxCategory = Math.max(...categoryData.map(d => d.count), 1);
  const maxGender = Math.max(...genderData.map(d => d.count), 1);
  const maxSeason = Math.max(...seasonData.map(d => d.count), 1);

  // Total stock calculated from filtered data
  const totalStock = filteredData.reduce((acc, item) => acc + (parseInt(item.Envanter) || 0), 0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 overflow-x-hidden pb-8">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-300/15 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-emerald-300/15 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-teal-300/15 blur-[120px]" />
      </div>

      <motion.div 
        className="container mx-auto p-4 md:p-6 pt-20"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <TableIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Stok Kırılım Analizi
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Filtrelenen toplam stok: <span className="font-bold text-slate-700 dark:text-slate-300">{new Intl.NumberFormat('tr-TR').format(totalStock)}</span> adet
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Marka, Kategori veya Sezon ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl focus-visible:ring-indigo-500"
            />
          </div>
        </motion.div>

        {stockData.length === 0 ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center h-64 bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Database className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500">Gösterilecek stok verisi bulunamadı.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Marka Tablosu */}
            <motion.div variants={itemVariants}>
              <Card className="h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden flex flex-col">
                <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 py-4 border-b border-blue-100 dark:border-blue-900/30">
                  <CardTitle className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <Tags className="w-4 h-4" />
                    MARKA BAZLI DAĞILIM
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-auto max-h-[500px]">
                  <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
                      <TableRow className="border-slate-100 dark:border-slate-800">
                        <TableHead className="font-bold text-slate-500 w-[60px]">S.N</TableHead>
                        <TableHead className="font-bold text-slate-500">Marka Adı</TableHead>
                        <TableHead className="font-bold text-slate-500 text-right pr-6">Stok Adedi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brandData.map((item, index) => (
                        <TableRow key={item.name} className="border-slate-100 dark:border-slate-800/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors">
                          <TableCell className="py-3 text-slate-400 text-xs font-medium">{index + 1}</TableCell>
                          <TableCell className="py-3 font-medium text-slate-700 dark:text-slate-300">{item.name}</TableCell>
                          <TableCell className="py-3 text-right pr-6">
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                                {new Intl.NumberFormat('tr-TR').format(item.count)}
                              </span>
                              <div className="h-1.5 w-24 bg-blue-100 dark:bg-blue-950 rounded-full overflow-hidden flex justify-end">
                                <div 
                                  className="h-full bg-blue-500 dark:bg-blue-400 rounded-full" 
                                  style={{ width: `${(item.count / maxBrand) * 100}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>

            {/* Kategori Tablosu */}
            <motion.div variants={itemVariants}>
              <Card className="h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden flex flex-col">
                <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/10 py-4 border-b border-emerald-100 dark:border-emerald-900/30">
                  <CardTitle className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    KATEGORİ (ÜRÜN GRUBU) BAZLI
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-auto max-h-[500px]">
                  <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
                      <TableRow className="border-slate-100 dark:border-slate-800">
                        <TableHead className="font-bold text-slate-500 w-[60px]">S.N</TableHead>
                        <TableHead className="font-bold text-slate-500">Kategori</TableHead>
                        <TableHead className="font-bold text-slate-500 text-right pr-6">Stok Adedi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryData.map((item, index) => (
                        <TableRow key={item.name} className="border-slate-100 dark:border-slate-800/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-colors">
                          <TableCell className="py-3 text-slate-400 text-xs font-medium">{index + 1}</TableCell>
                          <TableCell className="py-3 font-medium text-slate-700 dark:text-slate-300">{item.name}</TableCell>
                          <TableCell className="py-3 text-right pr-6">
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                {new Intl.NumberFormat('tr-TR').format(item.count)}
                              </span>
                              <div className="h-1.5 w-24 bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden flex justify-end">
                                <div 
                                  className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full" 
                                  style={{ width: `${(item.count / maxCategory) * 100}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>

            {/* Cinsiyet Tablosu */}
            <motion.div variants={itemVariants}>
              <Card className="h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden flex flex-col">
                <CardHeader className="bg-purple-50/50 dark:bg-purple-900/10 py-4 border-b border-purple-100 dark:border-purple-900/30">
                  <CardTitle className="text-sm font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    CİNSİYET BAZLI DAĞILIM
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-auto max-h-[500px]">
                  <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
                      <TableRow className="border-slate-100 dark:border-slate-800">
                        <TableHead className="font-bold text-slate-500 w-[60px]">S.N</TableHead>
                        <TableHead className="font-bold text-slate-500">Cinsiyet</TableHead>
                        <TableHead className="font-bold text-slate-500 text-right pr-6">Stok Adedi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {genderData.map((item, index) => (
                        <TableRow key={item.name} className="border-slate-100 dark:border-slate-800/50 hover:bg-purple-50/30 dark:hover:bg-purple-900/20 transition-colors">
                          <TableCell className="py-3 text-slate-400 text-xs font-medium">{index + 1}</TableCell>
                          <TableCell className="py-3 font-medium text-slate-700 dark:text-slate-300">{item.name}</TableCell>
                          <TableCell className="py-3 text-right pr-6">
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">
                                {new Intl.NumberFormat('tr-TR').format(item.count)}
                              </span>
                              <div className="h-1.5 w-24 bg-purple-100 dark:bg-purple-950 rounded-full overflow-hidden flex justify-end">
                                <div 
                                  className="h-full bg-purple-500 dark:bg-purple-400 rounded-full" 
                                  style={{ width: `${(item.count / maxGender) * 100}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sezon Tablosu */}
            <motion.div variants={itemVariants}>
              <Card className="h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden flex flex-col">
                <CardHeader className="bg-amber-50/50 dark:bg-amber-900/10 py-4 border-b border-amber-100 dark:border-amber-900/30">
                  <CardTitle className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    SEZON BAZLI DAĞILIM
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-auto max-h-[500px]">
                  <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
                      <TableRow className="border-slate-100 dark:border-slate-800">
                        <TableHead className="font-bold text-slate-500 w-[60px]">S.N</TableHead>
                        <TableHead className="font-bold text-slate-500">Sezon</TableHead>
                        <TableHead className="font-bold text-slate-500 text-right pr-6">Stok Adedi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seasonData.map((item, index) => (
                        <TableRow key={item.name} className="border-slate-100 dark:border-slate-800/50 hover:bg-amber-50/30 dark:hover:bg-amber-900/20 transition-colors">
                          <TableCell className="py-3 text-slate-400 text-xs font-medium">{index + 1}</TableCell>
                          <TableCell className="py-3 font-medium text-slate-700 dark:text-slate-300">{item.name}</TableCell>
                          <TableCell className="py-3 text-right pr-6">
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                                {new Intl.NumberFormat('tr-TR').format(item.count)}
                              </span>
                              <div className="h-1.5 w-24 bg-amber-100 dark:bg-amber-950 rounded-full overflow-hidden flex justify-end">
                                <div 
                                  className="h-full bg-amber-500 dark:bg-amber-400 rounded-full" 
                                  style={{ width: `${(item.count / maxSeason) * 100}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        )}
      </motion.div>
    </div>
  );
}