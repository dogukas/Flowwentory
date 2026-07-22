"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSpreadsheet, Trash2, Database, Loader2, Check } from "lucide-react";
import * as XLSX from 'xlsx';
import { useSalesStore, SalesItem } from "@/store/useSalesStore";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function SalesPage() {
  const {
    salesData,
    searchQuery,
    filterField,
    filterValue,
    setSalesData,
    clearSalesData,
    setSearchQuery,
    setFilter,
    getFilteredData
  } = useSalesStore();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as SalesItem[];
        setSalesData(jsonData);
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Tüm satış verilerini silmek istediğinize emin misiniz? Hem yerel hem de bulut (Supabase) verileri silinecektir.')) {
      try {
        const { error } = await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
          console.error('Supabase silme hatası:', error);
          alert('Bulut verileri silinirken bir hata oluştu.');
        } else {
          clearSalesData();
          alert('Veriler başarıyla temizlendi.');
        }
      } catch (e) {
        console.error('Silme işlemi hatası:', e);
      }
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSalesSync = async () => {
    if (salesData.length === 0) return;

    setIsSyncing(true);
    setSyncStatus('idle');

    try {
      // 1. Önce sales tablosunu temizle
      const { error: error1 } = await supabase
        .from('sales')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error1) {
        console.error('Sales delete error:', error1.message, error1.details, error1.hint);
      }

      // 2. Satış verilerini parçalar halinde yükle
      const salesChunks = chunkArray(salesData, 100);
      for (const chunk of salesChunks) {
        const payload = chunk.map(item => {
          // satis_miktari: sayıya zorla, boş/geçersiz ise 0 yap
          const rawMiktar = item["Satış Miktarı"];
          const satisMiktari = rawMiktar !== undefined && rawMiktar !== null && rawMiktar !== ''
            ? Number(rawMiktar) || 0
            : 0;

          return {
            marka: item.Marka ?? null,
            urun_grubu: item["Ürün Grubu"] ?? null,
            urun_kodu: item["Ürün Kodu"] ?? null,
            renk_kodu: item["Renk Kodu"] ?? null,
            beden: item.Beden ?? null,
            envanter: item.Envanter ?? null,
            sezon: item.Sezon ?? null,
            satis_miktari: satisMiktari,
            satis_vd: item["Satış (VD)"] ?? null,
          };
        });

        const { error } = await supabase.from('sales').insert(payload);
        if (error) {
          throw new Error(
            `Supabase insert hatası: ${error.message} | Detay: ${error.details ?? '-'} | Hint: ${error.hint ?? '-'} | Kod: ${error.code ?? '-'}`
          );
        }
      }

      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Sync error:", msg);
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

  const filterOptions = [
    { value: 'none', label: 'Filtre Seçin' },
    { value: 'Marka', label: 'Marka' },
    { value: 'Ürün Grubu', label: 'Ürün Grubu' },
    { value: 'Ürün Kodu', label: 'Ürün Kodu' },
    { value: 'Renk Kodu', label: 'Renk Kodu' },
    { value: 'Beden', label: 'Beden' },
    { value: 'Sezon', label: 'Sezon' },
  ];

  const filteredData = getFilteredData();

  return (
    <div className="container mx-auto py-4 md:py-6 lg:py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Satış Analiz</h1>
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
          {salesData.length > 0 && (
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
            onClick={handleSalesSync}
            disabled={isSyncing || salesData.length === 0}
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
                Satışları Yedekle
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Select value={filterField} onValueChange={(value) => setFilter(value, filterValue)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtre seçin" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filterField !== "none" && (
            <Input
              placeholder="Filtre değeri..."
              value={filterValue}
              onChange={(e) => setFilter(filterField, e.target.value)}
              className="w-[200px]"
            />
          )}
        </div>
      </div>

      <Card>
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
                  <TableHead className="w-[100px]">Sezon</TableHead>
                  <TableHead className="w-[120px]">Satış Miktarı</TableHead>
                  <TableHead className="w-[150px]">Satış (VD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.Marka}</TableCell>
                    <TableCell>{item["Ürün Grubu"]}</TableCell>
                    <TableCell>{item["Ürün Kodu"]}</TableCell>
                    <TableCell>{item["Renk Kodu"]}</TableCell>
                    <TableCell>{item.Beden}</TableCell>
                    <TableCell>{item.Envanter}</TableCell>
                    <TableCell>{item.Sezon}</TableCell>
                    <TableCell>{item["Satış Miktarı"]}</TableCell>
                    <TableCell>{item["Satış (VD)"]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
} 