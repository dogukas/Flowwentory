"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";

// Excel'den gelen veri tipi
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

// Ürün özeti tipi
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

export function TopProductsList() {
  const [topShoesByQuantity, setTopShoesByQuantity] = useState<ProductSummary[]>([]);
  const [topShoesByRevenue, setTopShoesByRevenue] = useState<ProductSummary[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // localStorage'dan verileri al
    const savedData = localStorage.getItem('salesData');
    if (savedData) {
      const salesData = JSON.parse(savedData) as SalesDataItem[];

      // Verileri işle
      processExcelData(salesData);
      setDataLoaded(true);
    }
  }, []);

  // Excel verilerini işleme fonksiyonu
  const processExcelData = (salesData: SalesDataItem[]) => {
    // Log ekleyelim
    console.log(`Toplam veri sayısı: ${salesData.length}`);

    // Ayakkabı markalarını tanımla
    const shoeMarks = [
      'ADIDAS', 'NIKE', 'NEW BALANCE', 'CONVERSE', 'PUMA',
      'REEBOK', 'VANS', 'ASICS', 'UNDER ARMOUR', 'SKECHERS'
    ];

    // Önişleme: Tüm verilerde, eğer ürün grubu belirtilmemiş ama marka ayakkabı markasıysa,
    // o ürünü "Ayakkabı" olarak etiketle
    const processedData = salesData.map(item => {
      const newItem = { ...item };

      // Ürün grubu yoksa veya boşsa ve marka ayakkabı markasıysa
      if ((!newItem.urunGrubu || newItem.urunGrubu.trim() === '') &&
        shoeMarks.some(mark => newItem.marka.toUpperCase().includes(mark))) {
        newItem.urunGrubu = 'Ayakkabı';
      }
      return newItem;
    });

    // Ürünleri kodlarına göre gruplandır
    const productsBySku: Record<string, ProductSummary> = {};

    // Tüm ürünleri birleştir
    processedData.forEach(item => {
      const key = `${item.urunKodu}-${item.renkKodu}`;

      // Eğer ürün daha önce eklenmemişse, ekle
      if (!productsBySku[key]) {
        productsBySku[key] = {
          sira: 0, // Sonra sıralanacak
          marka: item.marka,
          urunKodu: item.urunKodu,
          renkKodu: item.renkKodu || "-",
          urunAdi: item.urunAdi || `${item.marka} - ${item.urunKodu}`,
          toplamAdet: 0,
          toplamTutar: 0,
          urunGrubu: item.urunGrubu || ""
        };
      }

      // Satış miktarını ve tutarını ekle
      productsBySku[key].toplamAdet += item.satisAdeti;
      productsBySku[key].toplamTutar += item.satisAdeti * item.satisFiyati;
    });

    // Tüm ürünleri diziye dönüştür
    const allProducts = Object.values(productsBySku);
    // Convert to array

    // Ayakkabı ürünlerini filtrele
    const shoes = allProducts.filter(product => {
      const isShoeProduct = isShoe(product.marka, product.urunKodu, product.urunGrubu || "");

      // Debug - ayakkabı olarak belirlenen ürünleri kontrol et
      if (isShoeProduct) {
        console.log(`Ayakkabı olarak belirlenen: ${product.marka} - ${product.urunKodu} - Grup: ${product.urunGrubu}`);
      }

      return isShoeProduct;
    });

    // Filter complete

    // Hiç ayakkabı bulunamadıysa, bilinen ayakkabı markalarına ait ürünleri de dahil et
    if (shoes.length === 0) {
      console.log("Hiç ayakkabı bulunamadı, ayakkabı markaları kullanılarak yeniden filtreleniyor");

      const shoesByBrand = allProducts.filter(product =>
        shoeMarks.some(mark => product.marka.toUpperCase().includes(mark))
      );

      if (shoesByBrand.length > 0) {
        console.log(`Marka bazlı ${shoesByBrand.length} ayakkabı bulundu`);

        // Adet bazında sırala ve ilk 10'u al
        const sortedShoesByQuantity = [...shoesByBrand]
          .sort((a, b) => b.toplamAdet - a.toplamAdet)
          .slice(0, 10)
          .map((item, index) => ({ ...item, sira: index + 1 }));

        // Ciro bazında sırala ve ilk 10'u al
        const sortedShoesByRevenue = [...shoesByBrand]
          .sort((a, b) => b.toplamTutar - a.toplamTutar)
          .slice(0, 10)
          .map((item, index) => ({ ...item, sira: index + 1 }));

        // State'i güncelle
        setTopShoesByQuantity(sortedShoesByQuantity);
        setTopShoesByRevenue(sortedShoesByRevenue);
        return;
      }
    }

    // Adet bazında sırala ve ilk 10'u al
    const sortedShoesByQuantity = [...shoes]
      .sort((a, b) => b.toplamAdet - a.toplamAdet)
      .slice(0, 10)
      .map((item, index) => ({ ...item, sira: index + 1 }));

    // Ciro bazında sırala ve ilk 10'u al
    const sortedShoesByRevenue = [...shoes]
      .sort((a, b) => b.toplamTutar - a.toplamTutar)
      .slice(0, 10)
      .map((item, index) => ({ ...item, sira: index + 1 }));

    // State'i güncelle
    setTopShoesByQuantity(sortedShoesByQuantity);
    setTopShoesByRevenue(sortedShoesByRevenue);
  };

  // Ayakkabı olup olmadığını kontrol eden yardımcı fonksiyon
  const isShoe = (marka: string, urunKodu: string, urunGrubu: string): boolean => {
    const shoeMarks = [
      'ADIDAS', 'NIKE', 'NEW BALANCE', 'CONVERSE', 'PUMA',
      'REEBOK', 'VANS', 'ASICS', 'UNDER ARMOUR', 'SKECHERS'
    ];

    // Ürün grubu kontrol (öncelikli kriter)
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

    // Marka ayakkabı markası ise veya ürün kodu ayakkabı koşullarını sağlıyorsa
    return shoeMarks.some(mark => marka.toUpperCase().includes(mark)) ||
      urunKodu.toUpperCase().includes('SHOE') ||
      urunKodu.toUpperCase().includes('AYAKKABI') ||
      urunKodu.toUpperCase().includes('BOT') ||
      urunKodu.toUpperCase().includes('BOOT') ||
      urunKodu.toUpperCase().includes('SNEAK');
  };

  return (
    <div className="space-y-8 mt-8">
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
              <path d="M16.21 9.42H7.79a1 1 0 0 0-.79 1.58l3 4.5a1 1 0 0 0 1.58 0l3-4.5a1 1 0 0 0-.79-1.58Z" fill="currentColor" opacity=".5" />
              <path d="m12 3-9 5.25V20h18V8.25L12 3Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Ayakkabı Top 10 Listeleri</h2>
        </div>

        {dataLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Adet Bazında Top 10 */}
            <Card className="border-t-4 border-green-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 py-3">
                <CardTitle className="flex items-center gap-2 text-green-800 text-sm md:text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  ADET BAZINDA TOP 10
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {topShoesByQuantity.length > 0 ? (
                  <div className="rounded-md border overflow-hidden overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-green-50">
                        <TableRow>
                          <TableHead className="w-[40px] font-bold">S.N</TableHead>
                          <TableHead className="font-bold">Marka</TableHead>
                          <TableHead className="font-bold">Ürün Kodu</TableHead>
                          <TableHead className="font-bold">Adet</TableHead>
                          <TableHead className="text-right font-bold">Tutar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topShoesByQuantity.map((item, index) => (
                          <TableRow key={`sq-${item.sira}`} className={index % 2 === 0 ? 'bg-white' : 'bg-green-50/30'}>
                            <TableCell className="py-1 font-medium">{item.sira}</TableCell>
                            <TableCell className="py-1 font-medium">{item.marka}</TableCell>
                            <TableCell className="py-1">{item.urunKodu}</TableCell>
                            <TableCell className="py-1 font-bold text-green-700">
                              {item.toplamAdet}
                            </TableCell>
                            <TableCell className="py-1 text-right">
                              {new Intl.NumberFormat('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                                maximumFractionDigits: 0
                              }).format(item.toplamTutar)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-green-100">
                          <TableCell colSpan={3} className="text-right py-1 font-medium">TOPLAM</TableCell>
                          <TableCell className="py-1 font-bold text-green-900">
                            {topShoesByQuantity.reduce((sum, item) => sum + item.toplamAdet, 0)}
                          </TableCell>
                          <TableCell className="py-1 text-right font-bold text-green-900">
                            {new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0
                            }).format(topShoesByQuantity.reduce((sum, item) => sum + item.toplamTutar, 0))}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 bg-muted/10 rounded-md">
                    <p className="text-muted-foreground text-center text-sm">
                      Ayakkabı ürünü bulunamadı
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ciro Bazında Top 10 */}
            <Card className="border-t-4 border-blue-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 py-3">
                <CardTitle className="flex items-center gap-2 text-blue-800 text-sm md:text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  CİRO BAZINDA TOP 10
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {topShoesByRevenue.length > 0 ? (
                  <div className="rounded-md border overflow-hidden overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-blue-50">
                        <TableRow>
                          <TableHead className="w-[40px] font-bold">S.N</TableHead>
                          <TableHead className="font-bold">Marka</TableHead>
                          <TableHead className="font-bold">Ürün Kodu</TableHead>
                          <TableHead className="text-right font-bold">Tutar</TableHead>
                          <TableHead className="font-bold">Adet</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topShoesByRevenue.map((item, index) => (
                          <TableRow key={`sr-${item.sira}`} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}>
                            <TableCell className="py-1 font-medium">{item.sira}</TableCell>
                            <TableCell className="py-1 font-medium">{item.marka}</TableCell>
                            <TableCell className="py-1">{item.urunKodu}</TableCell>
                            <TableCell className="py-1 text-right font-bold text-blue-700">
                              {new Intl.NumberFormat('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                                maximumFractionDigits: 0
                              }).format(item.toplamTutar)}
                            </TableCell>
                            <TableCell className="py-1">
                              {item.toplamAdet}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-blue-100">
                          <TableCell colSpan={3} className="text-right py-1 font-medium">TOPLAM</TableCell>
                          <TableCell className="py-1 text-right font-bold text-blue-900">
                            {new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0
                            }).format(topShoesByRevenue.reduce((sum, item) => sum + item.toplamTutar, 0))}
                          </TableCell>
                          <TableCell className="py-1 font-bold text-blue-900">
                            {topShoesByRevenue.reduce((sum, item) => sum + item.toplamAdet, 0)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 bg-muted/10 rounded-md">
                    <p className="text-muted-foreground text-center text-sm">
                      Ayakkabı ürünü bulunamadı
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-muted/10 rounded-md">
            <p className="text-muted-foreground text-center">
              Henüz veri yüklenmedi.<br />
              Lütfen ana sayfadaki &quot;Excel Yükle&quot; butonunu kullanarak veri yükleyin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}