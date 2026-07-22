"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

import { FileSpreadsheet, Search, Trash2, Database, Loader2, Check } from "lucide-react"
import * as XLSX from 'xlsx'
import { useStockStore } from "@/store/useStockStore"
import { supabase, fetchAllRows } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StockItem } from "@/types/stock"

export default function StockPage() {
  const {
    stockData,
    setStockData,
    clearStockData,
    searchQuery,
    setSearchQuery,
    filterField,
    filterValue,
    setFilter,
    getFilteredData
  } = useStockStore()

  // Sayfa açıldığında Supabase'den TÜM stok verilerini çek
  useEffect(() => {
    const fetchStocksFromSupabase = async () => {
      try {
        const stocks = await fetchAllRows('stocks');
        if (stocks) {
          const formattedStocks: StockItem[] = stocks.map((item: any) => ({
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
        console.error("Supabase stok verisi çekme hatası:", error);
      }
    };

    fetchStocksFromSupabase();
  }, [setStockData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as StockItem[]
        setStockData(jsonData)
      }
      reader.readAsBinaryString(file)
    }
  }

  const handleClearData = async () => {
    if (window.confirm('Tüm stok verilerini silmek istediğinize emin misiniz? Hem yerel hem de bulut (Supabase) verileri silinecektir.')) {
      try {
        const { error } = await supabase.from('stocks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
          console.error('Supabase silme hatası:', error);
          alert('Bulut verileri silinirken bir hata oluştu.');
        } else {
          clearStockData();
          alert('Veriler başarıyla temizlendi.');
        }
      } catch (e) {
        console.error('Silme işlemi hatası:', e);
      }
    }
  }

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleStockSync = async () => {
    if (stockData.length === 0) return;

    setIsSyncing(true);
    setSyncStatus('idle');

    try {
      // Get current logged-in user and company ID
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.user) throw new Error("Lütfen giriş yapın (Oturum bulunamadı).");
      const user = session.user;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !profile?.company_id) {
        throw new Error("Kayıtlı bir şirket profiliniz bulunamadı. Lütfen yeni sekmeden şirket kaydınızı tamamlayın.");
      }

      const companyId = profile.company_id;

      // 1. Önce stocks tablosunu temizle (Sadece kendi şirketinin verilerini siler)
      const { error: error1 } = await supabase.from('stocks').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      if (error1) console.error('Stock delete error:', error1);

      // 2. Stok verilerini parçalar halinde yükle (Batch insert)
      const stockChunks = chunkArray(stockData, 100);
      for (const chunk of stockChunks) {
        const payload = chunk.map(item => ({
          marka: item.Marka,
          urun_grubu: item["Ürün Grubu"],
          urun_kodu: item["Ürün Kodu"],
          renk_kodu: item["Renk Kodu"],
          beden: item.Beden,
          envanter: item.Envanter,
          barkod: item.Barkod,
          sezon: item.Sezon,
          company_id: companyId
        }));
        const { error } = await supabase.from('stocks').insert(payload);
        if (error) throw error;
      }

      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);

    } catch (error: any) {
      console.error("Sync error:", JSON.stringify(error, null, 2), error);
      alert("Senkronizasyon hatası: " + (error?.message || error?.details || "Tablolar eksik olabilir. Lütfen Supabase'de schema.sql'i çalıştırdığınızdan emin olun."));
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper for batching
  const chunkArray = (arr: any[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const filteredData = getFilteredData()

  const filterOptions = [
    { value: 'none', label: 'Filtre Seçin' },
    { value: 'Marka', label: 'Marka' },
    { value: 'Ürün Grubu', label: 'Ürün Grubu' },
    { value: 'Ürün Kodu', label: 'Ürün Kodu' },
    { value: 'Renk Kodu', label: 'Renk Kodu' },
    { value: 'Beden', label: 'Beden' },
    { value: 'Barkod', label: 'Barkod' },
    { value: 'Sezon', label: 'Sezon' },
  ]

  return (
    <div className="container mx-auto py-4 md:py-6 lg:py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stok Sorgula</h1>
        <div className="flex gap-2">
          <input
            type="file"
            id="excel-upload"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
          />
          <label htmlFor="excel-upload">
            <Button variant="outline" className="gap-2" asChild>
              <span>
                <FileSpreadsheet className="h-4 w-4" />
                Excel Dosyası Yükle
              </span>
            </Button>
          </label>
          {stockData.length > 0 && (
            <Button
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={handleClearData}
            >
              <Trash2 className="h-4 w-4" />
              Verileri Temizle
            </Button>
          )}

          <Button
            onClick={handleStockSync}
            disabled={isSyncing || stockData.length === 0}
            variant={syncStatus === 'error' ? "destructive" : "outline"}
            className="gap-2 relative overflow-hidden ml-2"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Yükleniyor...
              </>
            ) : syncStatus === 'success' ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-600">Yüklendi</span>
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Stok Yedekle
              </>
            )}
          </Button>
        </div>
      </div>

      {stockData.length > 0 && (
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tüm alanlarda ara..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={filterField || 'none'}
              onValueChange={(value: string) => setFilter(value === 'none' ? '' : value as keyof StockItem, filterValue)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtre Seçin" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterField && (
              <Input
                placeholder="Filtre değeri..."
                value={filterValue}
                onChange={(e) => setFilter(filterField, e.target.value)}
                className="w-[200px]"
              />
            )}
          </div>
        </div>
      )}

      <Card className="mt-4">
        <ScrollArea className="h-[600px] rounded-md">
          <div className="relative">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[150px]">Marka</TableHead>
                  <TableHead className="w-[150px]">Ürün Grubu</TableHead>
                  <TableHead className="w-[150px]">Ürün Kodu</TableHead>
                  <TableHead className="w-[150px]">Renk Kodu</TableHead>
                  <TableHead className="w-[100px]">Beden</TableHead>
                  <TableHead className="w-[100px]">Envanter</TableHead>
                  <TableHead className="w-[150px]">Barkod</TableHead>
                  <TableHead className="w-[100px]">Sezon</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{item.Marka}</TableCell>
                    <TableCell>{item["Ürün Grubu"]}</TableCell>
                    <TableCell>{item["Ürün Kodu"]}</TableCell>
                    <TableCell>{item["Renk Kodu"]}</TableCell>
                    <TableCell>{item.Beden}</TableCell>
                    <TableCell>{item.Envanter}</TableCell>
                    <TableCell>{item.Barkod}</TableCell>
                    <TableCell>{item.Sezon}</TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-[450px] text-center text-muted-foreground">
                      {stockData.length === 0
                        ? "Excel dosyası yükleyerek stok verilerini görüntüleyebilirsiniz."
                        : "Arama kriterlerine uygun sonuç bulunamadı."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
} 