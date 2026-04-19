"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart as ChartBar, Upload, Download, RefreshCcw, Search, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';

// KPI verisi için tip tanımı
interface KpiData {
  adSoyad: string;
  personelHedefi: number;
  satisVH: number;
  satisMiktari: number;
  ortBirimFiyat: number;
  faturaSayisi: number;
  ortSatisTutariVH: number;
  ortSatisAdedi: number;
  oran: number;
  satisMiktariYuzdesi: number;
}

// Excel row tipi
interface ExcelRow {
  "Adı-Soyadı": string | number;
  "Personel %100 Hedef": string | number;
  "Satış (VH)": string | number;
  "Satış Miktarı": string | number;
  "Ortalama Birim Fiyat": string | number;
  "Satış Faturası Sayısı": string | number;
  "Ortalama Satış Tutarı (VH)": string | number;
  "Ortalama Satış Adedi": string | number;
  "Oran": string | number;
  "Satış Miktarı Yüzdesi": string | number;
}

export default function PersonnelKpiPage() {
  // State with initial empty array
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [sortField, setSortField] = useState<string>('satisMiktariYuzdesi');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Use effect to load data from localStorage only on client side
  useEffect(() => {
    const savedData = localStorage.getItem('kpiData');
    if (savedData) {
      setKpiData(JSON.parse(savedData));
    } else {
      // Gerçek veriler
      const realData: KpiData[] = [
        { adSoyad: "ASLIHAN BİLGİN", personelHedefi: 1129655.17, satisVH: 839974.48, satisMiktari: 299, ortBirimFiyat: 2809.28, faturaSayisi: 196, ortSatisTutariVH: 4285.58, ortSatisAdedi: 1.53, oran: 74.36, satisMiktariYuzdesi: 21 },
        { adSoyad: "MUSTAFA MEMÜK", personelHedefi: 1129655.17, satisVH: 771974.11, satisMiktari: 309, ortBirimFiyat: 2498.30, faturaSayisi: 196, ortSatisTutariVH: 3938.64, ortSatisAdedi: 1.58, oran: 68.34, satisMiktariYuzdesi: 22 },
        { adSoyad: "Yıldız Duran", personelHedefi: 1129655.17, satisVH: 628720.25, satisMiktari: 197, ortBirimFiyat: 3191.47, faturaSayisi: 159, ortSatisTutariVH: 3954.22, ortSatisAdedi: 1.24, oran: 55.66, satisMiktariYuzdesi: 14 },
        { adSoyad: "Tugay Çubukçu", personelHedefi: 1129655.17, satisVH: 598789.80, satisMiktari: 196, ortBirimFiyat: 3055.05, faturaSayisi: 158, ortSatisTutariVH: 3789.81, ortSatisAdedi: 1.24, oran: 53.01, satisMiktariYuzdesi: 14 },
        { adSoyad: "BÜŞRA YILMAZ", personelHedefi: 1129655.17, satisVH: 565301.83, satisMiktari: 209, ortBirimFiyat: 2704.79, faturaSayisi: 151, ortSatisTutariVH: 3743.72, ortSatisAdedi: 1.38, oran: 50.04, satisMiktariYuzdesi: 15 },
        { adSoyad: "Burak Özdemir", personelHedefi: 651724.17, satisVH: 538556.07, satisMiktari: 170, ortBirimFiyat: 3167.98, faturaSayisi: 131, ortSatisTutariVH: 4111.12, ortSatisAdedi: 1.30, oran: 82.64, satisMiktariYuzdesi: 12 },
        { adSoyad: "Samsun Piazza", personelHedefi: 0, satisVH: -38097.75, satisMiktari: 18, ortBirimFiyat: -2116.54, faturaSayisi: 32, ortSatisTutariVH: -1190.55, ortSatisAdedi: 0.56, oran: 0, satisMiktariYuzdesi: 1 },
        { adSoyad: "Mağaza", personelHedefi: 6300000, satisVH: 3905218.79, satisMiktari: 1398, ortBirimFiyat: 2793.43, faturaSayisi: 1023, ortSatisTutariVH: 3817.42, ortSatisAdedi: 1.37, oran: 61.99, satisMiktariYuzdesi: 99 }
      ];
      setKpiData(realData);
      localStorage.setItem('kpiData', JSON.stringify(realData));
    }
  }, []);

  // Verileri localStorage'a kaydet
  const updateKpiData = (newData: KpiData[]) => {
    setKpiData(newData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kpiData', JSON.stringify(newData));
    }
  };

  // Excel dosyasını işleme fonksiyonu
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
        
        // Verileri doğru formata dönüştür
        const formattedData = rawData.map(row => {
          // Yüzde değerlerini düzgün işle
          let oranValue = 0;
          if (typeof row["Oran"] === 'string') {
            // Yüzde işaretini kaldır ve virgülü noktayla değiştir
            const oranStr = row["Oran"].toString().replace(/%/g, '').replace(/,/g, '.');
            oranValue = parseFloat(oranStr) || 0;
          } else {
            oranValue = Number(row["Oran"]) || 0;
          }

          // Satış miktarı yüzdesi
          let salesPercentValue = 0;
          if (typeof row["Satış Miktarı Yüzdesi"] === 'string') {
            const salesPercentStr = row["Satış Miktarı Yüzdesi"].toString().replace(/%/g, '').replace(/,/g, '.');
            salesPercentValue = parseFloat(salesPercentStr) || 0;
          } else {
            salesPercentValue = Number(row["Satış Miktarı Yüzdesi"]) || 0;
          }

          // Ortalama satış adedi
          let ortSatisAdediValue = 0;
          if (typeof row["Ortalama Satış Adedi"] === 'string') {
            const ortSatisAdediStr = row["Ortalama Satış Adedi"].toString().replace(/,/g, '.');
            ortSatisAdediValue = parseFloat(ortSatisAdediStr) || 0;
          } else {
            ortSatisAdediValue = Number(row["Ortalama Satış Adedi"]) || 0;
          }

          // Diğer sayısal veriler
          const personelHedefi = Number(row["Personel %100 Hedef"]) || 0;
          const satisVH = Number(row["Satış (VH)"]) || 0;
          const satisMiktari = Number(row["Satış Miktarı"]) || 0;
          const ortBirimFiyat = Number(row["Ortalama Birim Fiyat"]) || 0;
          const faturaSayisi = Number(row["Satış Faturası Sayısı"]) || 0;
          const ortSatisTutariVH = Number(row["Ortalama Satış Tutarı (VH)"]) || 0;

          return {
            adSoyad: String(row["Adı-Soyadı"] || ''),
            personelHedefi,
            satisVH,
            satisMiktari,
            ortBirimFiyat,
            faturaSayisi,
            ortSatisTutariVH,
            ortSatisAdedi: ortSatisAdediValue,
            oran: oranValue,
            satisMiktariYuzdesi: salesPercentValue
          };
        });

        updateKpiData(formattedData);
      };
      reader.readAsBinaryString(file);
    }
  };

  // Verileri temizleme fonksiyonu
  const handleClearData = () => {
    if (window.confirm('Tüm veriler silinecek. Emin misiniz?')) {
      updateKpiData([]);
    }
  };

  // Excel olarak dışa aktarma
  const exportToExcel = () => {
    // Veriyi Excel formatına dönüştür
    const excelData = kpiData.map(item => ({
      "Adı-Soyadı": item.adSoyad,
      "Personel %100 Hedef": item.personelHedefi,
      "Satış (VH)": item.satisVH,
      "Satış Miktarı": item.satisMiktari,
      "Ortalama Birim Fiyat": item.ortBirimFiyat,
      "Satış Faturası Sayısı": item.faturaSayisi,
      "Ortalama Satış Tutarı (VH)": item.ortSatisTutariVH,
      "Ortalama Satış Adedi": item.ortSatisAdedi,
      "Oran": item.oran,
      "Satış Miktarı Yüzdesi": item.satisMiktariYuzdesi
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Personel Satış Raporu");
    XLSX.writeFile(workbook, "Personel_Satis_Raporu.xlsx");
  };

  // Sıralama işlevi
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Yeni bir alana göre sıralama yapılırken varsayılan olarak azalan sıralama
    }
  };

  // Filtreleme işlevi
  const filteredData = kpiData.filter(item => 
    item.adSoyad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sıralama işlevi
  const sortedData = [...filteredData].sort((a, b) => {
    const fieldA = a[sortField as keyof KpiData];
    const fieldB = b[sortField as keyof KpiData];
    
    if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    }
    
    // Karşılaştırılamaz değerler için varsayılan sıralama
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Oran değerlendirmesi için renk kodu
  const getPerformanceColor = (oran: number) => {
    if (oran >= 100) return "bg-green-100 text-green-800";
    if (oran >= 85) return "bg-blue-100 text-blue-800";
    if (oran >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Negatif değerler için renk
  const getValueColor = (value: number) => {
    return value < 0 ? "text-red-600" : "";
  };

  // Sayıları Türkçe formatında göstermek için fonksiyon
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  // Ondalık formatı için fonksiyon - ondalık sayıları tam olarak istenen şekilde biçimlendirme
  const formatDecimal = (value: number) => {
    // Önce sayıyı string'e çevirelim
    const numStr = value.toString();
    // Eğer tam sayı ise, direkt döndürelim
    if (!numStr.includes('.')) {
      return numStr;
    }
    // Ondalık kısım varsa, virgül ile gösterelim ve 2 basamak sabit tutalım
    return value.toFixed(2).replace('.', ',');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0 text-center md:text-left">Personel Satış ve Performans Raporu</h1>
        <div className="flex flex-wrap gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Personel ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button onClick={() => document.getElementById('kpiFileInput')?.click()} className="bg-blue-600 hover:bg-blue-700">
            <Upload className="mr-2 h-4 w-4" />
            Excel Yükle
          </Button>
          <input
            id="kpiFileInput"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
          />
          {kpiData.length > 0 && (
            <>
              <Button variant="outline" onClick={exportToExcel} className="border-blue-500 text-blue-500 hover:bg-blue-50">
                <Download className="mr-2 h-4 w-4" />
                Excel İndir
              </Button>
              <Button variant="destructive" onClick={handleClearData} className="hover:bg-red-700">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Verileri Temizle
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Personel Satış Tablosu */}
      <Card className="hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="h-5 w-5" />
            Personel Satış Performans Tablosu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleSort('adSoyad')}
                >
                  Adı-Soyadı
                  {sortField === 'adSoyad' && (
                    <ChevronDown 
                      className={`ml-1 h-4 w-4 inline-block ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`}
                    />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-blue-600 transition-colors text-right"
                  onClick={() => handleSort('personelHedefi')}
                >
                  Personel %100 Hedef
                  {sortField === 'personelHedefi' && (
                    <ChevronDown 
                      className={`ml-1 h-4 w-4 inline-block ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`}
                    />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-blue-600 transition-colors text-right"
                  onClick={() => handleSort('satisVH')}
                >
                  Satış (VH)
                  {sortField === 'satisVH' && (
                    <ChevronDown 
                      className={`ml-1 h-4 w-4 inline-block ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`}
                    />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-blue-600 transition-colors text-right"
                  onClick={() => handleSort('satisMiktari')}
                >
                  Satış Miktarı
                  {sortField === 'satisMiktari' && (
                    <ChevronDown 
                      className={`ml-1 h-4 w-4 inline-block ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`}
                    />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-blue-600 transition-colors text-right"
                  onClick={() => handleSort('ortBirimFiyat')}
                >
                  Ort. Birim Fiyat
                  {sortField === 'ortBirimFiyat' && (
                    <ChevronDown 
                      className={`ml-1 h-4 w-4 inline-block ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`}
                    />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-blue-600 transition-colors text-right"
                  onClick={() => handleSort('faturaSayisi')}
                >
                  Fatura Sayısı
                  {sortField === 'faturaSayisi' && (
                    <ChevronDown 
                      className={`ml-1 h-4 w-4 inline-block ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`}
                    />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-blue-600 transition-colors text-right"
                  onClick={() => handleSort('ortSatisTutariVH')}
                >
                  Ort. Satış Tutarı
                  {sortField === 'ortSatisTutariVH' && (
                    <ChevronDown 
                      className={`ml-1 h-4 w-4 inline-block ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`}
                    />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-blue-600 transition-colors text-right"
                  onClick={() => handleSort('ortSatisAdedi')}
                >
                  Ort. Satış Adedi
                  {sortField === 'ortSatisAdedi' && (
                    <ChevronDown 
                      className={`ml-1 h-4 w-4 inline-block ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`}
                    />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-blue-600 transition-colors text-right"
                  onClick={() => handleSort('oran')}
                >
                  Oran
                  {sortField === 'oran' && (
                    <ChevronDown 
                      className={`ml-1 h-4 w-4 inline-block ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`}
                    />
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-blue-600 transition-colors text-right"
                  onClick={() => handleSort('satisMiktariYuzdesi')}
                >
                  Satış Miktar %
                  {sortField === 'satisMiktariYuzdesi' && (
                    <ChevronDown 
                      className={`ml-1 h-4 w-4 inline-block ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`}
                    />
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length > 0 ? (
                sortedData.map((item, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{item.adSoyad}</TableCell>
                    <TableCell className={`text-right ${getValueColor(item.personelHedefi)}`}>
                      {formatCurrency(item.personelHedefi)}
                    </TableCell>
                    <TableCell className={`text-right ${getValueColor(item.satisVH)}`}>
                      {formatCurrency(item.satisVH)}
                    </TableCell>
                    <TableCell className={`text-right ${getValueColor(item.satisMiktari)}`}>
                      {item.satisMiktari}
                    </TableCell>
                    <TableCell className={`text-right ${getValueColor(item.ortBirimFiyat)}`}>
                      {formatCurrency(item.ortBirimFiyat)}
                    </TableCell>
                    <TableCell className={`text-right ${getValueColor(item.faturaSayisi)}`}>
                      {item.faturaSayisi}
                    </TableCell>
                    <TableCell className={`text-right ${getValueColor(item.ortSatisTutariVH)}`}>
                      {formatCurrency(item.ortSatisTutariVH)}
                    </TableCell>
                    <TableCell className={`text-right ${getValueColor(item.ortSatisAdedi)}`}>
                      {formatDecimal(item.ortSatisAdedi)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.personelHedefi === 0 ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full font-medium text-xs bg-gray-100 text-gray-800">
                          -
                        </span>
                      ) : (
                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full font-medium text-xs ${getPerformanceColor(item.oran)}`}>
                          {item.oran.toString().replace('.', ',')}%
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.satisMiktariYuzdesi.toString().replace('.', ',')}%
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    Veri bulunamadı. Lütfen Excel dosyası yükleyin veya veri ekleyin.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 