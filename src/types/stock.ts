/**
 * Stok ve Satış Veri Tipleri
 * Tüm proje genelinde kullanılan tip tanımlamaları
 */

// ==========================================
// STOK TİPLERİ
// ==========================================

/**
 * Temel stok öğesi
 * Excel'den içe aktarılan ham veri yapısı
 */
export interface StockItem {
  Marka: string;
  "Ürün Grubu": string;
  "Ürün Kodu": string;
  "Renk Kodu": string;
  Beden: string;
  Envanter: string;
  Barkod: string;
  Sezon: string;
}

/**
 * Beden bazlı envanter bilgisi
 */
export interface SizeInventory {
  beden: string;
  envanter: number;
}

/**
 * SKU bazında gruplandırılmış stok öğesi
 * Dashboard'da kullanılır
 */
export interface GroupedStockItem {
  Marka: string;
  "Ürün Kodu": string;
  "Ürün Grubu": string;
  "Renk Kodu": string;
  bedenler: SizeInventory[];
  totalEnvanter: number;
}

/**
 * Stok öğesi bileşen props'u
 */
export interface StockItemProps {
  item: GroupedStockItem;
  index: number;
}

// ==========================================
// SATIŞ TİPLERİ
// ==========================================

/**
 * Temel satış öğesi
 * Excel'den içe aktarılan ham veri yapısı
 */
export interface SalesItem {
  Marka: string;
  "Ürün Grubu": string;
  "Ürün Kodu": string;
  "Renk Kodu": string;
  Beden: string;
  Envanter: string;
  Sezon: string;
  "Satış Miktarı": number;
  "Satış (VD)": string;
}

// ==========================================
// MARKA METRİKLERİ
// ==========================================

/**
 * Marka bazlı performans metrikleri
 */
export interface BrandMetric {
  brand: string;
  stock: number;
  sales: number;
  turnoverRate: number;
}

/**
 * Marka satış özeti
 */
export interface BrandSalesData {
  totalAmount: number;
  totalQuantity: number;
}

// ==========================================
// SEZON VERİLERİ
// ==========================================

/**
 * Sezon bazlı veri yapısı
 */
export interface SeasonData {
  total: number;
  brands: Record<string, {
    total: number;
    uniqueProducts: Set<string>;
    count: number;
  }>;
}

/**
 * Sezon bazlı ürün grubu verisi
 */
export interface SeasonGroupData {
  total: number;
  groups: Record<string, {
    total: number;
    uniqueProducts: Set<string>;
    count: number;
  }>;
}

// ==========================================
// GRAFİK VERİLERİ
// ==========================================

/**
 * Pasta grafik veri yapısı
 */
export interface PieChartDataItem {
  id: string;
  label: string;
  value: number;
}

/**
 * Sezon grafik veri yapısı
 */
export interface SeasonChartDataItem extends PieChartDataItem {
  brands?: Record<string, {
    total: number;
    uniqueProducts: Set<string>;
    count: number;
  }>;
  groups?: Record<string, {
    total: number;
    uniqueProducts: Set<string>;
    count: number;
  }>;
  color: string;
}

/**
 * Ürün grubu pasta grafik verisi
 */
export interface ProductGroupPieDataItem extends PieChartDataItem {
  uniqueProducts: number;
}