"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Package2, DollarSign } from "lucide-react";

interface SalesDataItem {
  personelAdi: string;
  marka: string;
  urunKodu: string;
  renkKodu: string;
  satisAdeti: number;
  satisFiyati: number;
  urunAdi?: string;
  urunGrubu?: string;
}

interface ProductSummary {
  sira: number;
  marka: string;
  urunKodu: string;
  renkKodu: string;
  urunAdi: string;
  toplamAdet: number;
  toplamTutar: number;
  urunGrubu?: string;
}

// Updated component to accept salesData directly via props instead of localStorage
export function TopProductsList() {
  const [topShoesByQuantity, setTopShoesByQuantity] = useState<ProductSummary[]>([]);
  const [topShoesByRevenue, setTopShoesByRevenue] = useState<ProductSummary[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Read from localStorage periodically to detect changes from parent
    const checkData = () => {
      const savedData = localStorage.getItem('salesData');
      if (savedData) {
        try {
          const salesData = JSON.parse(savedData) as SalesDataItem[];
          if (salesData && salesData.length > 0) {
            processExcelData(salesData);
            setDataLoaded(true);
            return;
          }
        } catch (e) {
          // ignore
        }
      }
      setDataLoaded(false);
    };

    checkData();
    // Re-check every second just in case parent updates it via supabase
    const interval = setInterval(checkData, 1000);
    return () => clearInterval(interval);
  }, []);

  const processExcelData = (salesData: SalesDataItem[]) => {
    const shoeMarks = [
      'ADIDAS', 'NIKE', 'NEW BALANCE', 'CONVERSE', 'PUMA',
      'REEBOK', 'VANS', 'ASICS', 'UNDER ARMOUR', 'SKECHERS'
    ];

    const processedData = salesData.map(item => {
      const newItem = { ...item };
      if ((!newItem.urunGrubu || newItem.urunGrubu.trim() === '') &&
        shoeMarks.some(mark => newItem.marka.toUpperCase().includes(mark))) {
        newItem.urunGrubu = 'Ayakkabı';
      }
      return newItem;
    });

    const productsBySku: Record<string, ProductSummary> = {};

    processedData.forEach(item => {
      const key = `${item.urunKodu}-${item.renkKodu}`;
      if (!productsBySku[key]) {
        productsBySku[key] = {
          sira: 0,
          marka: item.marka,
          urunKodu: item.urunKodu,
          renkKodu: item.renkKodu || "-",
          urunAdi: item.urunAdi || `${item.marka} - ${item.urunKodu}`,
          toplamAdet: 0,
          toplamTutar: 0,
          urunGrubu: item.urunGrubu || ""
        };
      }
      productsBySku[key].toplamAdet += item.satisAdeti;
      productsBySku[key].toplamTutar += item.satisAdeti * item.satisFiyati;
    });

    const allProducts = Object.values(productsBySku);

    const isShoe = (marka: string, urunKodu: string, urunGrubu: string): boolean => {
      if (urunGrubu && (
        urunGrubu.toLowerCase().includes('ayakkabı') ||
        urunGrubu.toLowerCase().includes('ayakkabi') ||
        urunGrubu.toLowerCase().includes('shoe') ||
        urunGrubu.toLowerCase().includes('sneak') ||
        urunGrubu.toLowerCase().includes('bot') ||
        urunGrubu.toLowerCase().includes('boot') ||
        urunGrubu.toLowerCase().includes('foot')
      )) {
        return true;
      }
      return shoeMarks.some(mark => marka.toUpperCase().includes(mark)) ||
        urunKodu.toUpperCase().includes('SHOE') ||
        urunKodu.toUpperCase().includes('AYAKKABI') ||
        urunKodu.toUpperCase().includes('BOT') ||
        urunKodu.toUpperCase().includes('BOOT') ||
        urunKodu.toUpperCase().includes('SNEAK');
    };

    let shoes = allProducts.filter(product => isShoe(product.marka, product.urunKodu, product.urunGrubu || ""));

    if (shoes.length === 0) {
      shoes = allProducts.filter(product => shoeMarks.some(mark => product.marka.toUpperCase().includes(mark)));
    }

    const sortedShoesByQuantity = [...shoes]
      .sort((a, b) => b.toplamAdet - a.toplamAdet)
      .slice(0, 10)
      .map((item, index) => ({ ...item, sira: index + 1 }));

    const sortedShoesByRevenue = [...shoes]
      .sort((a, b) => b.toplamTutar - a.toplamTutar)
      .slice(0, 10)
      .map((item, index) => ({ ...item, sira: index + 1 }));

    setTopShoesByQuantity(sortedShoesByQuantity);
    setTopShoesByRevenue(sortedShoesByRevenue);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Package2 className="text-blue-600 dark:text-blue-400 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Ayakkabı Top 10 Listeleri
            </h2>
            <p className="text-sm text-slate-500">En iyi performans gösteren ayakkabı modelleri</p>
          </div>
        </div>

        {dataLoaded ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Adet Bazında Top 10 */}
            <Card className="dashboard-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/10 py-4 border-b border-emerald-100 dark:border-emerald-900/30">
                <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-sm md:text-base font-bold">
                  <Package2 className="w-4 h-4" />
                  ADET BAZINDA TOP 10
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {topShoesByQuantity.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                        <TableRow className="border-slate-100 dark:border-slate-800">
                          <TableHead className="w-[40px] font-bold text-slate-500">#</TableHead>
                          <TableHead className="font-bold text-slate-500">Marka</TableHead>
                          <TableHead className="font-bold text-slate-500">Ürün Kodu</TableHead>
                          <TableHead className="font-bold text-slate-500 text-center">Adet</TableHead>
                          <TableHead className="text-right font-bold text-slate-500">Tutar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topShoesByQuantity.map((item, index) => (
                          <TableRow key={`sq-${item.sira}`} className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell className="py-2">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                                index === 0 ? 'bg-amber-100 text-amber-700' :
                                index === 1 ? 'bg-slate-200 text-slate-700' :
                                index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {item.sira}
                              </span>
                            </TableCell>
                            <TableCell className="py-2 font-medium text-slate-700 dark:text-slate-300">{item.marka}</TableCell>
                            <TableCell className="py-2 text-slate-500 dark:text-slate-400 text-sm">{item.urunKodu}</TableCell>
                            <TableCell className="py-2 font-bold text-emerald-600 dark:text-emerald-400 text-center">
                              {item.toplamAdet}
                            </TableCell>
                            <TableCell className="py-2 text-right font-medium text-slate-700 dark:text-slate-300">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(item.toplamTutar)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 border-0">
                          <TableCell colSpan={3} className="text-right py-3 font-bold text-emerald-800 dark:text-emerald-300">GENEL TOPLAM</TableCell>
                          <TableCell className="py-3 font-bold text-emerald-600 dark:text-emerald-400 text-center text-lg">
                            {topShoesByQuantity.reduce((sum, item) => sum + item.toplamAdet, 0)}
                          </TableCell>
                          <TableCell className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(topShoesByQuantity.reduce((sum, item) => sum + item.toplamTutar, 0))}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Ayakkabı ürünü bulunamadı</div>
                )}
              </CardContent>
            </Card>

            {/* Ciro Bazında Top 10 */}
            <Card className="dashboard-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 py-4 border-b border-blue-100 dark:border-blue-900/30">
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300 text-sm md:text-base font-bold">
                  <DollarSign className="w-4 h-4" />
                  CİRO BAZINDA TOP 10
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {topShoesByRevenue.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                        <TableRow className="border-slate-100 dark:border-slate-800">
                          <TableHead className="w-[40px] font-bold text-slate-500">#</TableHead>
                          <TableHead className="font-bold text-slate-500">Marka</TableHead>
                          <TableHead className="font-bold text-slate-500">Ürün Kodu</TableHead>
                          <TableHead className="font-bold text-slate-500 text-center">Adet</TableHead>
                          <TableHead className="text-right font-bold text-slate-500">Tutar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topShoesByRevenue.map((item, index) => (
                          <TableRow key={`sr-${item.sira}`} className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell className="py-2">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                                index === 0 ? 'bg-amber-100 text-amber-700' :
                                index === 1 ? 'bg-slate-200 text-slate-700' :
                                index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {item.sira}
                              </span>
                            </TableCell>
                            <TableCell className="py-2 font-medium text-slate-700 dark:text-slate-300">{item.marka}</TableCell>
                            <TableCell className="py-2 text-slate-500 dark:text-slate-400 text-sm">{item.urunKodu}</TableCell>
                            <TableCell className="py-2 text-center text-slate-600 dark:text-slate-400">
                              {item.toplamAdet}
                            </TableCell>
                            <TableCell className="py-2 text-right font-bold text-blue-600 dark:text-blue-400">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(item.toplamTutar)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 border-0">
                          <TableCell colSpan={3} className="text-right py-3 font-bold text-blue-800 dark:text-blue-300">GENEL TOPLAM</TableCell>
                          <TableCell className="py-3 font-bold text-blue-600 dark:text-blue-400 text-center text-lg">
                            {topShoesByRevenue.reduce((sum, item) => sum + item.toplamAdet, 0)}
                          </TableCell>
                          <TableCell className="py-3 text-right font-bold text-blue-600 dark:text-blue-400 text-lg">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(topShoesByRevenue.reduce((sum, item) => sum + item.toplamTutar, 0))}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Ayakkabı ürünü bulunamadı</div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
            <Package2 className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">Henüz veri yüklenmedi.</p>
          </div>
        )}
      </div>
    </div>
  );
}