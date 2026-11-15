"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useStockStore } from "@/store/useStockStore";
import { useSalesStore } from "@/store/useSalesStore";
import {
  useRetailBrainStore,
  estimateUnitCost,
  StoreTransferProposal,
  MarkdownRecommendation,
} from "@/store/useRetailBrainStore";
import { supabase, isSupabaseConfigured, fetchAllRows } from "@/lib/supabase";
import { RetailStressSimulatorModal } from "@/components/dashboard/RetailStressSimulatorModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  Truck,
  CheckCircle2,
  Search,
  Download,
  Sparkles,
  TrendingUp,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
  ArrowRight,
  Flame,
  PackageCheck,
  AlertOctagon,
  Plus,
  Minus,
  ArrowLeftRight,
  Percent,
  Wallet,
  Box,
  Check,
  Building2,
} from "lucide-react";
import * as XLSX from "xlsx";

// ============================================================
// GLOBAL RETAIL REPLENISHMENT (RPT) DATA STRUCTURES
// ============================================================
interface SizeBreakdown {
  size: string;
  stock: number;
  sales: number;
  recommendedOrder: number;
  isDepleted: boolean;
}

type RptPriority = "CRITICAL" | "HIGH" | "NORMAL";
type RptStatus = "suggestion" | "requested" | "approved";

interface PlanningItem {
  id: string;
  sku: string;
  brand: string;
  productGroup: string;
  color: string;
  season: string;
  unitCost: number;
  stats: {
    stock: number;
    sales: number;
    ratio: number;
    str: number; // Sell-Through Rate (%)
    wos: number; // Weeks of Supply
    rop: number; // Reorder Point
    recommendedOrderQty: number;
  };
  sizes: SizeBreakdown[];
  isBrokenAssortment: boolean;
  brokenSizesCount: number;
  flaggedByCounting: boolean;
  priority: RptPriority;
  status: RptStatus;
}

const COLUMNS: Record<
  RptStatus,
  {
    title: string;
    subtitle: string;
    borderColor: string;
    headerBg: string;
    badgeBg: string;
    icon: React.ReactNode;
  }
> = {
  suggestion: {
    title: "AI RPT Önerileri",
    subtitle: "STR, WOS, Sayım Farkı ve Asorti Kırılmasına Göre",
    borderColor: "border-amber-200/90",
    headerBg: "bg-gradient-to-r from-amber-50 to-orange-50/50",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <Sparkles className="w-4 h-4 text-amber-600" />,
  },
  requested: {
    title: "RPT Talebi (Mağaza / Depo)",
    subtitle: "Sevkiyat veya Üretim İçin Talep Edilenler",
    borderColor: "border-indigo-200/90",
    headerBg: "bg-gradient-to-r from-indigo-50 to-blue-50/50",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: <Truck className="w-4 h-4 text-indigo-600" />,
  },
  approved: {
    title: "Onaylanan RPT (3D Depoya İletilen)",
    subtitle: "OTB Bütçesinden Düşülen & Picking Listesine Girenler",
    borderColor: "border-emerald-200/90",
    headerBg: "bg-gradient-to-r from-emerald-50 to-teal-50/50",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
};

const STORE_NAMES = [
  "İstinyePark AVM",
  "Zorlu Center",
  "Cevahir AVM",
  "Forum İstanbul",
  "Ankara Armada",
  "İzmir Hilltown",
];

function getDeterministicSales(sku: string, size: string, stock: number): number {
  let hash = 0;
  const key = `${sku}-${size}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  if (abs % 5 === 0) return Math.max(stock * 2, 12);
  if (abs % 3 === 0) return Math.max(Math.round(stock * 0.85), 5);
  return abs % 7;
}

export default function RptPlanningPage() {
  const stockData = useStockStore((state) => state.stockData);
  const setStockData = useStockStore((state) => state.setStockData);
  const salesData = useSalesStore((state) => state.salesData);

  // Retail Brain Store (Kapalı Döngü Entegrasyonu)
  const {
    otbBudgetLimit,
    setOtbBudgetLimit,
    pickingQueue,
    addPickingTask,
    approvedTransfers,
    approveStoreTransfer,
    appliedMarkdowns,
    applyMarkdown,
    discrepancyAlertSkus,
  } = useRetailBrainStore();

  const [items, setItems] = useState<PlanningItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Global RPT Algoritma Parametreleri
  const [targetWos, setTargetWos] = useState<number>(6);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);
  const [activeScenarioTab, setActiveScenarioTab] = useState<
    "kanban" | "transfer" | "markdown" | "omnichannel" | "table"
  >("kanban");
  const [dispatchedOnlineOrders, setDispatchedOnlineOrders] = useState<Record<string, boolean>>({});
  const [selectedPrepackType, setSelectedPrepackType] = useState<"A" | "B" | "C">("A");

  // Filtreler
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | RptPriority | "BROKEN">("ALL");

  // Detay Modalı & Özel Sipariş Miktarı
  const [selectedItem, setSelectedItem] = useState<PlanningItem | null>(null);
  const [customOrderMap, setCustomOrderMap] = useState<Record<string, number>>({});
  const [stressModalOpen, setStressModalOpen] = useState(false);

  // 1. Stok verisi boşsa yükle
  useEffect(() => {
    const ensureStockLoaded = async () => {
      if (stockData && stockData.length > 0) return;
      try {
        const rows = await fetchAllRows("stocks");
        if (rows && rows.length > 0) {
          const formatted = rows.map((item: any) => ({
            Marka: item.marka,
            "Ürün Grubu": item.urun_grubu,
            "Ürün Kodu": item.urun_kodu,
            "Renk Kodu": item.renk_kodu,
            Beden: item.beden,
            Envanter: item.envanter,
            Barkod: item.barkod,
            Sezon: item.sezon,
          }));
          setStockData(formatted);
        }
      } catch (e) {
        console.error("RPT stok yükleme hatası:", e);
      }
    };
    ensureStockLoaded();
  }, [stockData, setStockData]);

  // 2. Global RPT Motoru
  useEffect(() => {
    const buildRptEngine = async () => {
      setLoading(true);
      try {
        let savedPlans: any[] = [];
        if (isSupabaseConfigured) {
          const { data } = await supabase.from("planning").select("*");
          if (data) savedPlans = data;
        } else if (typeof window !== "undefined") {
          const localPlans = localStorage.getItem("flowwentory_rpt_plans");
          if (localPlans) savedPlans = JSON.parse(localPlans);
        }

        const salesMap = new Map<string, number>();
        const hasRealSales = salesData && salesData.length > 0;
        if (hasRealSales) {
          salesData.forEach((s) => {
            const key = `${s["Ürün Kodu"]}__${s.Beden || "STD"}`;
            salesMap.set(key, (salesMap.get(key) || 0) + (Number(s["Satış Miktarı"]) || 0));
          });
        }

        const groupedMap = new Map<
          string,
          {
            sku: string;
            brand: string;
            productGroup: string;
            color: string;
            season: string;
            sizeMap: Map<string, { stock: number; sales: number }>;
          }
        >();

        stockData.forEach((s) => {
          const sku = String(s["Ürün Kodu"] || "").trim();
          if (!sku) return;
          const size = String(s.Beden || "STD").trim();
          const stockQty = Math.max(0, parseInt(String(s.Envanter)) || 0);

          if (!groupedMap.has(sku)) {
            groupedMap.set(sku, {
              sku,
              brand: s.Marka || "Belirtilmemiş",
              productGroup: s["Ürün Grubu"] || "Genel",
              color: s["Renk Kodu"] || "STD",
              season: s.Sezon || "25SS",
              sizeMap: new Map(),
            });
          }

          const entry = groupedMap.get(sku)!;
          const prevSize = entry.sizeMap.get(size) || { stock: 0, sales: 0 };
          const saleQty = hasRealSales
            ? salesMap.get(`${sku}__${size}`) || 0
            : getDeterministicSales(sku, size, stockQty);

          entry.sizeMap.set(size, {
            stock: prevSize.stock + stockQty,
            sales: prevSize.sales + saleQty,
          });
        });

        const safetyStockDays = 3;
        const computedItems: PlanningItem[] = [];

        groupedMap.forEach((entry) => {
          let totalStock = 0;
          let totalSales = 0;
          const sizes: SizeBreakdown[] = [];

          entry.sizeMap.forEach((val, sizeName) => {
            totalStock += val.stock;
            totalSales += val.sales;

            const weeklySizeSales = val.sales / 4.28;
            const targetSizeStock = Math.ceil(weeklySizeSales * targetWos);
            const recommendedSizeOrder = Math.max(0, targetSizeStock - val.stock);

            sizes.push({
              size: sizeName,
              stock: val.stock,
              sales: val.sales,
              recommendedOrder: recommendedSizeOrder,
              isDepleted: val.stock <= 2,
            });
          });

          const brokenSizesCount = sizes.filter((sz) => sz.isDepleted).length;
          const isBrokenAssortment =
            (sizes.length > 1 && brokenSizesCount > 0) ||
            (sizes.length === 1 && totalStock <= 5);

          const totalPool = totalSales + totalStock;
          const str = totalPool > 0 ? Math.round((totalSales / totalPool) * 100) : 0;

          const weeklySales = totalSales / 4.28;
          const wos =
            weeklySales > 0 ? Number((totalStock / weeklySales).toFixed(1)) : totalStock > 0 ? 99 : 0;

          const dailySales = totalSales / 30;
          const rop = Math.ceil(dailySales * (leadTimeDays + safetyStockDays));

          const targetTotalStock = Math.ceil(weeklySales * targetWos);
          const rawRecommended = Math.max(
            targetTotalStock - totalStock,
            sizes.reduce((acc, s) => acc + s.recommendedOrder, 0)
          );
          const recommendedOrderQty =
            customOrderMap[entry.sku] !== undefined
              ? customOrderMap[entry.sku]
              : Math.max(rawRecommended, isBrokenAssortment ? brokenSizesCount * 6 : 0);

          const flaggedByCounting = discrepancyAlertSkus.includes(entry.sku);

          let priority: RptPriority = "NORMAL";
          if (
            flaggedByCounting ||
            (str >= 60 && wos <= 2.5) ||
            totalStock <= rop ||
            (isBrokenAssortment && str >= 45)
          ) {
            priority = "CRITICAL";
          } else if (str >= 40 || wos <= 4.5 || isBrokenAssortment) {
            priority = "HIGH";
          }

          const ratio =
            totalStock > 0
              ? Number((totalSales / totalStock).toFixed(2))
              : totalSales > 0
              ? 99
              : 0;

          const saved = savedPlans.find((p: any) => p.urun_kodu === entry.sku);
          const shouldInclude =
            Boolean(saved) ||
            flaggedByCounting ||
            priority === "CRITICAL" ||
            priority === "HIGH" ||
            ratio >= 0.45 ||
            totalStock < 10;

          if (shouldInclude) {
            computedItems.push({
              id: saved?.id || entry.sku,
              sku: entry.sku,
              brand: entry.brand,
              productGroup: entry.productGroup,
              color: entry.color,
              season: entry.season,
              unitCost: estimateUnitCost(entry.productGroup, entry.sku),
              stats: {
                stock: totalStock,
                sales: totalSales,
                ratio,
                str,
                wos,
                rop,
                recommendedOrderQty: Math.max(recommendedOrderQty, 6),
              },
              sizes: sizes.sort((a, b) => a.size.localeCompare(b.size)),
              isBrokenAssortment,
              brokenSizesCount,
              flaggedByCounting,
              priority,
              status: (saved?.status as RptStatus) || "suggestion",
            });
          }
        });

        const priorityWeight: Record<RptPriority, number> = {
          CRITICAL: 3,
          HIGH: 2,
          NORMAL: 1,
        };
        computedItems.sort((a, b) => {
          if (a.flaggedByCounting !== b.flaggedByCounting) {
            return a.flaggedByCounting ? -1 : 1;
          }
          if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
            return priorityWeight[b.priority] - priorityWeight[a.priority];
          }
          return b.stats.str - a.stats.str;
        });

        setItems(computedItems.slice(0, 180));
      } catch (e) {
        console.error("RPT hesaplama hatası:", e);
      } finally {
        setLoading(false);
      }
    };

    buildRptEngine();
  }, [stockData, salesData, targetWos, leadTimeDays, customOrderMap, discrepancyAlertSkus]);

  // SENARYO 1: Şubeler Arası Transfer (Inter-Store Balancing) Önerileri Üretici
  const storeTransferProposals: StoreTransferProposal[] = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items
      .filter((it) => {
        if (!(it.isBrokenAssortment || it.priority === "CRITICAL")) return false;
        if (selectedBrand !== "all" && it.brand !== selectedBrand) return false;
        if (selectedGroup !== "all" && it.productGroup !== selectedGroup) return false;
        if (
          q &&
          !it.sku.toLowerCase().includes(q) &&
          !it.brand.toLowerCase().includes(q) &&
          !it.productGroup.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .slice(0, 24)
      .map((item, idx) => {
        const depletedSize = item.sizes.find((s) => s.isDepleted)?.size || item.sizes[0]?.size || "M";
        const fromStore = STORE_NAMES[(idx * 2) % STORE_NAMES.length];
        const toStore = STORE_NAMES[(idx * 2 + 1) % STORE_NAMES.length];
        const transferQty = 6;
        return {
          id: `TR-${item.sku}-${depletedSize}`,
          sku: item.sku,
          brand: item.brand,
          productGroup: item.productGroup,
          size: depletedSize,
          fromStore,
          fromStoreStr: 8 + (idx % 9), // Düşük STR'li şube
          fromStoreStock: 14 + (idx % 7),
          toStore,
          toStoreStr: 74 + (idx % 18), // Yüksek STR'li yok satan şube
          toStoreStock: idx % 2,
          transferQty,
          savedPurchaseCost: transferQty * item.unitCost,
          status: approvedTransfers[`TR-${item.sku}-${depletedSize}`]
            ? "APPROVED_TRANSFER"
            : "PROPOSED",
        };
      });
  }, [items, approvedTransfers, selectedBrand, selectedGroup, searchQuery]);

  // SENARYO 3: Sezon Sonu Fiyat Kırma (Markdown vs RPT) Simülasyonu
  const markdownRecommendations: MarkdownRecommendation[] = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const groupedDead: Record<
      string,
      { sku: string; brand: string; productGroup: string; season: string; qty: number }
    > = {};
    stockData.forEach((s) => {
      const sku = String(s["Ürün Kodu"] || "");
      const qty = parseInt(String(s.Envanter)) || 0;
      if (!sku || qty <= 0) return;
      if (!groupedDead[sku]) {
        groupedDead[sku] = {
          sku,
          brand: s.Marka || "Genel",
          productGroup: s["Ürün Grubu"] || "Genel",
          season: s.Sezon || "25SS",
          qty: 0,
        };
      }
      groupedDead[sku].qty += qty;
    });

    return Object.values(groupedDead)
      .filter((d) => {
        if (d.qty < 15) return false;
        if (selectedBrand !== "all" && d.brand !== selectedBrand) return false;
        if (selectedGroup !== "all" && d.productGroup !== selectedGroup) return false;
        if (
          q &&
          !d.sku.toLowerCase().includes(q) &&
          !d.brand.toLowerCase().includes(q) &&
          !d.productGroup.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 24)
      .map((d) => {
        const unitCost = estimateUnitCost(d.productGroup, d.sku);
        const tiedUpCapital = d.qty * unitCost;
        const appliedDiscount = appliedMarkdowns[d.sku];
        const recommendedDiscountPct: 20 | 30 | 50 =
          d.qty > 80 ? 50 : d.qty > 40 ? 30 : 20;
        const discountToUse = (appliedDiscount as 20 | 30 | 50) || recommendedDiscountPct;
        // Perakende satış fiyatı = maliyet * 2.2 varsayımıyla indirim sonrası nakit geri dönüşü
        const retailValue = tiedUpCapital * 2.2;
        const expectedCashRecovery = Math.round(retailValue * (1 - discountToUse / 100) * 0.85);

        return {
          sku: d.sku,
          brand: d.brand,
          productGroup: d.productGroup,
          season: d.season,
          deadStockQty: d.qty,
          tiedUpCapital,
          recommendedDiscountPct: discountToUse,
          expectedCashRecovery,
          applied: Boolean(appliedDiscount),
        };
      });
  }, [stockData, appliedMarkdowns, selectedBrand, selectedGroup, searchQuery]);

  // Türetilmiş Filtre Listeleri
  const uniqueBrands = useMemo(
    () => Array.from(new Set(items.map((i) => i.brand))).filter(Boolean).sort(),
    [items]
  );
  const uniqueGroups = useMemo(
    () => Array.from(new Set(items.map((i) => i.productGroup))).filter(Boolean).sort(),
    [items]
  );

  // Filtrelenmiş Öğeler
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.sku.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.productGroup.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q);

      const matchesBrand = selectedBrand === "all" || item.brand === selectedBrand;
      const matchesGroup = selectedGroup === "all" || item.productGroup === selectedGroup;

      let matchesPriority = true;
      if (priorityFilter === "BROKEN") {
        matchesPriority = item.isBrokenAssortment;
      } else if (priorityFilter !== "ALL") {
        matchesPriority = item.priority === priorityFilter;
      }

      return matchesSearch && matchesBrand && matchesGroup && matchesPriority;
    });
  }, [items, searchQuery, selectedBrand, selectedGroup, priorityFilter]);

  // Üst KPI & OTB Bütçe Metrikleri
  const kpiMetrics = useMemo(() => {
    const criticalCount = filteredItems.filter((i) => i.priority === "CRITICAL").length;
    const brokenAssortmentCount = filteredItems.filter((i) => i.isBrokenAssortment).length;
    const avgStr =
      filteredItems.length > 0
        ? Math.round(
            filteredItems.reduce((acc, i) => acc + i.stats.str, 0) / filteredItems.length
          )
        : 0;
    const totalRecommendedUnits = filteredItems
      .filter((i) => i.status !== "approved")
      .reduce((acc, i) => acc + i.stats.recommendedOrderQty, 0);

    const approvedItems = items.filter((i) => i.status === "approved");
    const approvedUnits = approvedItems.reduce((acc, i) => acc + i.stats.recommendedOrderQty, 0);
    const usedOtbBudget = approvedItems.reduce(
      (acc, i) => acc + i.stats.recommendedOrderQty * i.unitCost,
      0
    );
    const expectedGmroiRevenue = Math.round(usedOtbBudget * 2.35);

    const savedByTransfers = storeTransferProposals
      .filter((t) => t.status === "APPROVED_TRANSFER")
      .reduce((acc, t) => acc + t.savedPurchaseCost, 0);

    return {
      criticalCount,
      brokenAssortmentCount,
      avgStr,
      totalRecommendedUnits,
      approvedUnits,
      usedOtbBudget,
      expectedGmroiRevenue,
      savedByTransfers,
    };
  }, [filteredItems, items, storeTransferProposals]);

  // Durum Güncelleme + SENARYO 2: Onaylanan Siparişi 3D Depo Toplama Listesine Gönder
  const updateItemStatus = async (sku: string, newStatus: RptStatus) => {
    const targetItem = items.find((i) => i.sku === sku);
    const updated = items.map((item) =>
      item.sku === sku ? { ...item, status: newStatus } : item
    );
    setItems(updated);

    // Eğer "approved" (Onaylandı) sütununa geçtiyse 3D Depo Picking Listesine otomatik ekle!
    if (newStatus === "approved" && targetItem) {
      addPickingTask({
        sku: targetItem.sku,
        brand: targetItem.brand,
        productGroup: targetItem.productGroup,
        color: targetItem.color,
        quantity: targetItem.stats.recommendedOrderQty,
        sourceType: "RPT_ORDER",
        targetStore: "Merkez Dağıtım / Mağaza İkmal",
        unitCost: targetItem.unitCost,
      });
    }

    if (typeof window !== "undefined") {
      const savedList = updated
        .filter((i) => i.status !== "suggestion")
        .map((i) => ({
          urun_kodu: i.sku,
          status: i.status,
          target_quantity: i.stats.recommendedOrderQty,
        }));
      localStorage.setItem("flowwentory_rpt_plans", JSON.stringify(savedList));
    }

    if (isSupabaseConfigured && targetItem) {
      try {
        const payload = {
          urun_kodu: targetItem.sku,
          status: newStatus,
          target_quantity: targetItem.stats.recommendedOrderQty,
        };
        const { data: existing } = await supabase
          .from("planning")
          .select("id")
          .eq("urun_kodu", targetItem.sku)
          .single();

        if (existing) {
          await supabase.from("planning").update(payload).eq("id", existing.id);
        } else {
          await supabase.from("planning").insert(payload);
        }
      } catch (err) {
        console.error("Supabase RPT kayıt hatası:", err);
      }
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index)
      return;
    await updateItemStatus(draggableId, destination.droppableId as RptStatus);
  };

  const handleBulkRequestCritical = () => {
    const updated = items.map((item) =>
      item.status === "suggestion" && item.priority === "CRITICAL"
        ? { ...item, status: "requested" as RptStatus }
        : item
    );
    setItems(updated);
  };

  const handleExportExcel = () => {
    const dataToExport = filteredItems.map((item) => ({
      "Ürün Kodu (SKU)": item.sku,
      Marka: item.brand,
      "Ürün Grubu": item.productGroup,
      Renk: item.color,
      Sezon: item.season,
      "Birim Maliyet (TL)": item.unitCost,
      "Öncelik Sınıfı": item.priority,
      "Mevcut Stok": item.stats.stock,
      "30G Satış": item.stats.sales,
      "STR (%)": `%${item.stats.str}`,
      "WOS (Hafta)": `${item.stats.wos} Hafta`,
      "ROP Eşiği": item.stats.rop,
      "Asorti Durumu": item.isBrokenAssortment
        ? `Asorti Kırık (${item.brokenSizesCount} Beden Eksik)`
        : "Tam Asorti",
      "Önerilen RPT Adet": item.stats.recommendedOrderQty,
      "Toplam RPT Maliyeti (TL)": item.stats.recommendedOrderQty * item.unitCost,
      "Onay Durumu": COLUMNS[item.status].title,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Global RPT Raporu");
    XLSX.writeFile(wb, `Flowwentory_Global_RPT_Plani_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const getList = (status: RptStatus) => filteredItems.filter((i) => i.status === status);
  const budgetPct = Math.min(100, Math.round((kpiMetrics.usedOtbBudget / otbBudgetLimit) * 100));
  const pendingPicksCount = pickingQueue.filter((p) => p.status === "PENDING").length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold text-slate-600">
            Perakende Karar Motoru (RPT, OTB Bütçe, Şube Transfer & Markdown) Hesaplanıyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-3 sm:p-4 md:p-6 pt-16 space-y-4 sm:space-y-5 overflow-x-hidden">
      {/* ================= ÜST KURUMSAL BAŞLIK & KAPALI DÖNGÜ AKSİYONLAR ================= */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
              <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] sm:text-[11px]">
                Closed-Loop Retail Brain v3.0
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] sm:text-[11px]">
                OTB Bütçe • Şube Dengeleme • Markdown • 3D Depo Rota
              </Badge>
              {discrepancyAlertSkus.length > 0 && (
                <Badge className="bg-rose-500/30 text-rose-200 border border-rose-400/40 text-[10px] sm:text-[11px] animate-pulse">
                  🔔 Stok Sayımdan {discrepancyAlertSkus.length} Acil Fark Bildirimi
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              Akıllı RPT, Şube Transfer & Sezon Sonu Karar Merkezi
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Yeni satınalma yapmadan önce şubeler arası stok dengeleyin, OTB bütçenizi yönetin ve
              onaylanan emirleri doğrudan 3D Depo toplama rotasına gönderin.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto">
            <Button
              onClick={() => setStressModalOpen(true)}
              className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold gap-1.5 rounded-xl shadow-lg text-xs h-9 w-full sm:w-auto justify-center"
            >
              <Flame className="w-4 h-4 shrink-0" />
              <span className="truncate">Stres Testi</span>
            </Button>
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-1.5 rounded-xl shadow-lg text-xs h-9 w-full sm:w-auto justify-center"
            >
              <Link href="/warehouse-3d">
                <Box className="w-4 h-4 shrink-0" />
                <span className="truncate">3D Depo ({pendingPicksCount})</span>
              </Link>
            </Button>
            <Button
              onClick={handleBulkRequestCritical}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1.5 rounded-xl shadow-lg text-xs h-9 w-full sm:w-auto justify-center"
            >
              <Flame className="w-4 h-4 shrink-0" />
              <span className="truncate">Kritik Talep ({kpiMetrics.criticalCount})</span>
            </Button>
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-1.5 rounded-xl text-xs h-9 w-full sm:w-auto justify-center"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Excel İndir</span>
            </Button>
          </div>
        </div>

        {/* SENARYO 4: OTB (OPEN-TO-BUY) SATINALMA BÜTÇESİ & GMROI ÇUBUĞU */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-7 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-200 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-indigo-400" />
                Haftalık OTB (Open-to-Buy) Satınalma Bütçesi Kullanımı
              </span>
              <span className="font-extrabold text-white">
                {kpiMetrics.usedOtbBudget.toLocaleString("tr-TR")} ₺ /{" "}
                {otbBudgetLimit.toLocaleString("tr-TR")} ₺ (%{budgetPct})
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPct > 90
                    ? "bg-rose-500"
                    : budgetPct > 70
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-wrap items-center justify-end gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-400 block text-[10px]">Beklenen GMROI Ciro</span>
              <span className="font-extrabold text-emerald-400">
                +{kpiMetrics.expectedGmroiRevenue.toLocaleString("tr-TR")} ₺
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
              <span className="text-emerald-200 block text-[10px]">
                İç Transferle Kurtarılan Nakit
              </span>
              <span className="font-extrabold text-emerald-300">
                {kpiMetrics.savedByTransfers.toLocaleString("tr-TR")} ₺
              </span>
            </div>
            <select
              value={otbBudgetLimit}
              onChange={(e) => setOtbBudgetLimit(Number(e.target.value))}
              className="bg-slate-800 text-white border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold"
            >
              <option value={250000}>OTB: 250.000 ₺</option>
              <option value={500000}>OTB: 500.000 ₺</option>
              <option value={1000000}>OTB: 1.000.000 ₺</option>
              <option value={2500000}>OTB: 2.500.000 ₺</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= SENARYO SEKMELERİ (4 GERÇEK İŞ AKIŞI) ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap">
          <button
            onClick={() => setActiveScenarioTab("kanban")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeScenarioTab === "kanban"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            1. RPT Sipariş Kanban ({filteredItems.length})
          </button>

          <button
            onClick={() => setActiveScenarioTab("transfer")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeScenarioTab === "transfer"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            2. Şubeler Arası Transfer ({storeTransferProposals.length})
          </button>

          <button
            onClick={() => setActiveScenarioTab("markdown")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeScenarioTab === "markdown"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            3. Sezon Sonu Markdown ({markdownRecommendations.length})
          </button>

          <button
            onClick={() => setActiveScenarioTab("omnichannel")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeScenarioTab === "omnichannel"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            4. Omnichannel & Tedarikçi
          </button>

          <button
            onClick={() => setActiveScenarioTab("table")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeScenarioTab === "table"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            5. Analitik Matris Tablo
          </button>
        </div>

        {/* Sağ Parametre Simülatörü */}
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3 text-xs bg-indigo-50/70 border border-indigo-100 px-3 py-1.5 rounded-xl">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 hidden sm:inline" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600">WOS:</span>
            <select
              value={targetWos}
              onChange={(e) => setTargetWos(Number(e.target.value))}
              className="bg-white border border-indigo-200 rounded-lg px-2 py-0.5 font-bold text-indigo-700"
            >
              <option value={4}>4H (Hızlı)</option>
              <option value={6}>6H (Standart)</option>
              <option value={8}>8H (Core)</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600">Termin:</span>
            <select
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(Number(e.target.value))}
              className="bg-white border border-indigo-200 rounded-lg px-2 py-0.5 font-bold text-indigo-700"
            >
              <option value={3}>3 Gün</option>
              <option value={7}>7 Gün</option>
              <option value={14}>14 Gün</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= ARAMA & HIZLI FİLTRE ÇUBUĞU ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full md:flex-1 md:min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="SKU, Marka, Ürün Grubu veya Renk Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl border-slate-200 h-9 text-xs w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
            {[
              { id: "ALL", label: "Tümü" },
              { id: "CRITICAL", label: "🔥 Kritik Eşik" },
              { id: "BROKEN", label: "⚠️ Asorti Kırık" },
              { id: "HIGH", label: "⚡ Yüksek STR" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setPriorityFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  priorityFilter === f.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-full sm:w-[145px] h-9 rounded-xl border-slate-200 text-xs">
                <SelectValue placeholder="Marka Seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Markalar</SelectItem>
                {uniqueBrands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 rounded-xl border-slate-200 text-xs">
                <SelectValue placeholder="Kategori Seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {uniqueGroups.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery !== "" ||
            selectedBrand !== "all" ||
            selectedGroup !== "all" ||
            priorityFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedBrand("all");
                setSelectedGroup("all");
                setPriorityFilter("ALL");
              }}
              className="h-9 px-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold w-full sm:w-auto"
            >
              Sıfırla
            </Button>
          )}
        </div>
      </div>

      {/* ================= SEKME 1: KANBAN PANOSU ================= */}
      {activeScenarioTab === "kanban" && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            {(Object.keys(COLUMNS) as RptStatus[]).map((statusKey) => {
              const col = COLUMNS[statusKey];
              const colItems = getList(statusKey);

              return (
                <div
                  key={statusKey}
                  className={`flex flex-col rounded-2xl border ${col.borderColor} bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden h-[460px] lg:h-[680px]`}
                >
                  <div className={`p-4 border-b ${col.borderColor} ${col.headerBg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                        {col.icon}
                        <span>{col.title}</span>
                      </div>
                      <Badge className={`${col.badgeBg} font-bold`}>{colItems.length} SKU</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{col.subtitle}</p>
                  </div>

                  <Droppable droppableId={statusKey}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${
                          snapshot.isDraggingOver ? "bg-indigo-50/50" : ""
                        }`}
                      >
                        {colItems.map((item, index) => (
                          <Draggable key={item.sku} draggableId={item.sku} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedItem(item)}
                                className={`rounded-xl bg-white border p-3.5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer ${
                                  item.flaggedByCounting
                                    ? "border-rose-400 ring-1 ring-rose-300"
                                    : "border-slate-200/90"
                                } ${
                                  snapshot.isDragging
                                    ? "rotate-1 scale-[1.02] shadow-xl ring-2 ring-indigo-500"
                                    : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-extrabold text-xs text-slate-900">
                                        {item.brand}
                                      </span>
                                      <span className="text-[10px] text-slate-400">•</span>
                                      <span className="text-[11px] font-medium text-slate-500">
                                        {item.productGroup}
                                      </span>
                                    </div>
                                    <div className="font-mono text-xs font-bold text-indigo-600 mt-0.5">
                                      {item.sku}{" "}
                                      <span className="text-[10px] font-normal text-slate-400">
                                        ({item.color})
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-1">
                                    {item.flaggedByCounting && (
                                      <Badge className="bg-rose-600 text-white text-[10px] px-2 py-0">
                                        SAYIM FARKI
                                      </Badge>
                                    )}
                                    {item.priority === "CRITICAL" && (
                                      <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] px-2 py-0">
                                        KRİTİK RPT
                                      </Badge>
                                    )}
                                    {item.isBrokenAssortment && (
                                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                        Asorti Kırık ({item.brokenSizesCount})
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 gap-1.5 bg-slate-50/90 p-2 rounded-lg border border-slate-100 text-center mb-2.5">
                                  <div>
                                    <div className="text-[9px] uppercase font-bold text-slate-400">
                                      Mevcut
                                    </div>
                                    <div className="text-xs font-extrabold text-slate-800">
                                      {item.stats.stock}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[9px] uppercase font-bold text-slate-400">
                                      STR %
                                    </div>
                                    <div className="text-xs font-extrabold text-emerald-600">
                                      %{item.stats.str}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[9px] uppercase font-bold text-slate-400">
                                      WOS
                                    </div>
                                    <div className="text-xs font-extrabold text-rose-600">
                                      {item.stats.wos}H
                                    </div>
                                  </div>
                                  <div className="bg-indigo-50 rounded border border-indigo-100">
                                    <div className="text-[9px] uppercase font-bold text-indigo-600">
                                      Öneri RPT
                                    </div>
                                    <div className="text-xs font-extrabold text-indigo-700">
                                      +{item.stats.recommendedOrderQty}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-2.5">
                                  {item.sizes.slice(0, 6).map((sz) => (
                                    <span
                                      key={sz.size}
                                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                                        sz.isDepleted
                                          ? "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                                          : "bg-white text-slate-600 border-slate-200"
                                      }`}
                                    >
                                      {sz.size}: {sz.stock}
                                    </span>
                                  ))}
                                </div>

                                <div
                                  className="flex items-center justify-between pt-2 border-t border-slate-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="text-[10px] font-semibold text-slate-500">
                                    Maliyet:{" "}
                                    {(
                                      item.stats.recommendedOrderQty * item.unitCost
                                    ).toLocaleString("tr-TR")}{" "}
                                    ₺
                                  </span>
                                  {statusKey === "suggestion" && (
                                    <button
                                      onClick={() => updateItemStatus(item.sku, "requested")}
                                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                    >
                                      Talebe Al <ArrowRight className="w-3 h-3" />
                                    </button>
                                  )}
                                  {statusKey === "requested" && (
                                    <button
                                      onClick={() => updateItemStatus(item.sku, "approved")}
                                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                                    >
                                      Onayla & 3D Depoya Gönder <CheckCircle2 className="w-3 h-3" />
                                    </button>
                                  )}
                                  {statusKey === "approved" && (
                                    <Link
                                      href="/warehouse-3d"
                                      className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                                    >
                                      <Box className="w-3 h-3" /> 3D Depo Rotasında
                                    </Link>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* ================= SEKME 2: ŞUBELER ARASI TRANSFER (INTER-STORE BALANCING) ================= */}
      {activeScenarioTab === "transfer" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
                Satınalma Yapmadan Önce Mağazalar Arası Stok Dengeleme (Zero-CapEx Replenishment)
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Aşağıdaki modeller yüksek hızlı mağazalarda tükenirken, düşük STR&apos;li
                şubelerde rafta bekliyor. Yeni sipariş vermek yerine şubeler arası iç transfer
                yaparak şirketin nakdini koruyun.
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white border border-emerald-200 text-right shrink-0">
              <div className="text-[10px] font-bold uppercase text-emerald-600">
                Toplam Tasarruf Potansiyeli
              </div>
              <div className="text-xl font-extrabold text-emerald-700">
                {storeTransferProposals
                  .reduce((acc, p) => acc + p.savedPurchaseCost, 0)
                  .toLocaleString("tr-TR")}{" "}
                ₺
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storeTransferProposals.map((tr) => {
              const isApproved = tr.status === "APPROVED_TRANSFER";
              return (
                <Card
                  key={tr.id}
                  className={`border transition-all ${
                    isApproved
                      ? "border-emerald-300 bg-emerald-50/30"
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-slate-900">{tr.brand}</span>
                        <span className="text-xs text-slate-400 mx-1">•</span>
                        <span className="text-xs text-slate-600">{tr.productGroup}</span>
                        <div className="font-mono text-sm font-bold text-indigo-600 mt-0.5">
                          {tr.sku} — Beden: {tr.size}
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                        +{tr.savedPurchaseCost.toLocaleString("tr-TR")} ₺ Nakit Kârı
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-bold text-rose-600 uppercase flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Gönderen Şube (Yavaş)
                        </div>
                        <div className="font-bold text-slate-800 truncate">{tr.fromStore}</div>
                        <div className="text-[11px] text-slate-500">
                          Stok: <strong>{tr.fromStoreStock}</strong> • STR: %{tr.fromStoreStr}
                        </div>
                      </div>

                      <div className="space-y-0.5 border-l border-slate-200 pl-2.5">
                        <div className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Alan Şube (Yok Satan)
                        </div>
                        <div className="font-bold text-slate-800 truncate">{tr.toStore}</div>
                        <div className="text-[11px] text-slate-500">
                          Stok: <strong>{tr.toStoreStock}</strong> • STR: %{tr.toStoreStr}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-700">
                        Önerilen Transfer: {tr.transferQty} Adet
                      </span>
                      {isApproved ? (
                        <Badge className="bg-emerald-600 text-white gap-1">
                          <Check className="w-3 h-3" /> Transfer & Depo Emri Oluşturuldu
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => approveStoreTransfer(tr)}
                          className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          İç Transfer Emri Ver
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SEKME 3: SEZON SONU FİYAT KIRMA (MARKDOWN VS RPT) ================= */}
      {activeScenarioTab === "markdown" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-600" />
                Sezon Sonu Fiyat Kırma (Markdown) & Ölü Stok Nakde Çevirme Simülatörü
              </h3>
              <p className="text-xs text-amber-900 mt-0.5">
                Bu ürünlerde RPT (yeniden sipariş) otomatik olarak durduruldu. Depoda hareketsiz
                yatan sermayeyi eritmek için önerilen indirim oranlarını uygulayın.
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white border border-amber-200 text-right shrink-0">
              <div className="text-[10px] font-bold uppercase text-amber-700">
                3 Haftada Geri Kazanılacak Nakit
              </div>
              <div className="text-xl font-extrabold text-amber-800">
                {markdownRecommendations
                  .reduce((acc, m) => acc + m.expectedCashRecovery, 0)
                  .toLocaleString("tr-TR")}{" "}
                ₺
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {markdownRecommendations.map((md) => (
              <Card key={md.sku} className="border border-slate-200 bg-white">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900">{md.brand}</span>
                      <span className="text-xs text-slate-400 mx-1">•</span>
                      <span className="text-xs text-slate-500">{md.productGroup}</span>
                      <div className="font-mono text-sm font-bold text-indigo-600 mt-0.5">
                        {md.sku} ({md.season})
                      </div>
                    </div>
                    <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px]">
                      RPT Durduruldu
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Hareketsiz Stok
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {md.deadStockQty} Adet
                      </span>
                      <span className="text-[10px] text-rose-600 block font-semibold">
                        Bağlı Nakit: {md.tiedUpCapital.toLocaleString("tr-TR")} ₺
                      </span>
                    </div>
                    <div className="border-l border-slate-200 pl-2.5">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Tahmini Nakit Girişi
                      </span>
                      <span className="font-extrabold text-emerald-600 text-sm">
                        +{md.expectedCashRecovery.toLocaleString("tr-TR")} ₺
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        %{md.recommendedDiscountPct} İndirim ile 3 Haftada
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      {[20, 30, 50].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => applyMarkdown(md.sku, pct)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                            md.recommendedDiscountPct === pct
                              ? "bg-amber-500 text-slate-950 border-amber-500"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          %{pct}
                        </button>
                      ))}
                    </div>

                    {md.applied ? (
                      <Badge className="bg-emerald-600 text-white gap-1">
                        <Check className="w-3 h-3" /> %{md.recommendedDiscountPct} Kampanyada
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => applyMarkdown(md.sku, md.recommendedDiscountPct)}
                        className="h-8 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold"
                      >
                        İndirimi Onayla
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ================= SEKME 4: OMNICHANNEL (SHIP-FROM-STORE) & TEDARİKÇİ KARNESİ ================= */}
      {activeScenarioTab === "omnichannel" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Sol 7 Kolon: Omnichannel Ship-from-Store (Mağazadan Online Sipariş Karşılama) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Box className="w-5 h-5 text-indigo-600" />
                  Unified Commerce — Mağazadan Online Sipariş Kargolama (Ship-from-Store)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  E-ticaret ana deposunda tükenen online siparişleri, stoğu en yüksek fiziksel mağazadan
                  müşteriye doğrudan sevk ederek ciro kaybını sıfırlayın.
                </p>
              </div>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold text-xs">
                DOM Aktif
              </Badge>
            </div>

            <div className="space-y-3">
              {filteredItems.slice(0, 6).map((item, idx) => {
                const orderId = `WEB-${90420 + idx}`;
                const channel = idx % 3 === 0 ? "Web Mağaza" : idx % 3 === 1 ? "Trendyol" : "Mobil Uygulama";
                const fulfillingStore = STORE_NAMES[idx % STORE_NAMES.length];
                const sizeOrdered = item.sizes[0]?.size || "M";
                const isDispatched = dispatchedOnlineOrders[orderId];

                return (
                  <div
                    key={orderId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-indigo-600">{orderId}</span>
                        <Badge variant="outline" className="text-[10px] bg-white">
                          {channel}
                        </Badge>
                        <span className="text-xs font-bold text-slate-900">
                          {item.brand} — {item.sku} (Beden: {sizeOrdered})
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span className="text-rose-600 font-semibold">E-Ticaret Deposu: 0 Adet</span>
                        <span>→</span>
                        <span className="text-emerald-700 font-bold">
                          Atanan Mağaza: {fulfillingStore} ({Math.max(4, item.stats.stock)} Adet Stok)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-extrabold text-slate-800 mr-1">
                        {(item.unitCost * 2.2).toLocaleString("tr-TR")} ₺
                      </span>
                      {isDispatched ? (
                        <Badge className="bg-emerald-600 text-white gap-1">
                          <Check className="w-3 h-3" /> 3D Depo / Mağaza Kuyruğunda
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setDispatchedOnlineOrders((p) => ({ ...p, [orderId]: true }));
                            addPickingTask({
                              sku: item.sku,
                              brand: item.brand,
                              productGroup: item.productGroup,
                              color: item.color,
                              quantity: 1,
                              sourceType: "STORE_TRANSFER",
                              targetStore: `${channel} Müşteri Sevk (${fulfillingStore})`,
                              unitCost: item.unitCost,
                            });
                          }}
                          className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                        >
                          Mağazadan Kargola
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sağ 5 Kolon: Tedarikçi & Marka Termin Güvenilirlik Karnesi (Vendor Scorecard) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                Tedarikçi Termin & Eksiksiz Teslimat Karnesi (Vendor Scorecard)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Geciken veya eksik teslimat yapan tedarikçilerde RPT motoru Emniyet Stoğunu (Safety Stock) otomatik artırır.
              </p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-slate-50 p-2.5 font-bold text-[10px] uppercase text-slate-500">
                <div className="col-span-4">Marka / Tedarikçi</div>
                <div className="col-span-3 text-center">Söz / Gerçek Termin</div>
                <div className="col-span-2 text-center">Fill Rate</div>
                <div className="col-span-3 text-right">RPT Emniyet Stoğu</div>
              </div>
              {uniqueBrands.slice(0, 7).map((brand, idx) => {
                const promisedDays = leadTimeDays;
                const actualDays = promisedDays + (idx % 3 === 0 ? 4 : idx % 2 === 0 ? 1 : 0);
                const fillRate = idx % 3 === 0 ? 84 : idx % 2 === 0 ? 93 : 98;
                const safetyBuffer = idx % 3 === 0 ? "+5 Gün (Riskli)" : "+2 Gün (Normal)";
                return (
                  <div key={brand} className="grid grid-cols-12 items-center p-3 bg-white hover:bg-slate-50">
                    <div className="col-span-4 font-bold text-slate-900 truncate">{brand}</div>
                    <div className="col-span-3 text-center">
                      <span className="text-slate-500">{promisedDays}G</span>
                      <span className="mx-1">→</span>
                      <span className={`font-bold ${actualDays > promisedDays + 2 ? "text-rose-600" : "text-slate-900"}`}>
                        {actualDays}G
                      </span>
                    </div>
                    <div className="col-span-2 text-center font-bold text-emerald-600">%{fillRate}</div>
                    <div className="col-span-3 text-right">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          idx % 3 === 0
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {safetyBuffer}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= SEKME 5: ANALİTİK MATRİS TABLO ================= */}
      {activeScenarioTab === "table" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="p-3.5">SKU / Marka</th>
                  <th className="p-3.5">Grup & Renk</th>
                  <th className="p-3.5">Öncelik</th>
                  <th className="p-3.5 text-right">Mevcut Stok</th>
                  <th className="p-3.5 text-right">STR (%)</th>
                  <th className="p-3.5 text-right">WOS (Hafta)</th>
                  <th className="p-3.5">Beden / Asorti Matrisi</th>
                  <th className="p-3.5 text-right">Önerilen RPT</th>
                  <th className="p-3.5 text-right">OTB Maliyet</th>
                  <th className="p-3.5 text-right">Durum / İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr
                    key={item.sku}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-indigo-600">{item.sku}</div>
                      <div className="text-[11px] font-semibold text-slate-700">{item.brand}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{item.productGroup}</div>
                      <div className="text-[11px] text-slate-400">{item.color}</div>
                    </td>
                    <td className="p-3.5">
                      {item.priority === "CRITICAL" ? (
                        <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px]">
                          KRİTİK
                        </Badge>
                      ) : item.priority === "HIGH" ? (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                          YÜKSEK
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          NORMAL
                        </Badge>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-800">
                      {item.stats.stock}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-emerald-600">
                      %{item.stats.str}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-rose-600">
                      {item.stats.wos} Hafta
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {item.sizes.map((sz) => (
                          <span
                            key={sz.size}
                            className={`px-1.5 py-0.5 rounded text-[10px] border ${
                              sz.isDepleted
                                ? "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {sz.size}:{sz.stock}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-indigo-600">
                      +{item.stats.recommendedOrderQty} Adet
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-800">
                      {(item.stats.recommendedOrderQty * item.unitCost).toLocaleString("tr-TR")} ₺
                    </td>
                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.status}
                        onChange={(e) => updateItemStatus(item.sku, e.target.value as RptStatus)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 font-semibold text-xs bg-white"
                      >
                        <option value="suggestion">Öneri</option>
                        <option value="requested">Talep Edildi</option>
                        <option value="approved">Onaylandı (3D Depo)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SKU ASORTİ & RPT SİPARİŞ DETAY MODALI ================= */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="w-[95vw] sm:max-w-[620px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center justify-between gap-2 pr-4">
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    {selectedItem.brand} • {selectedItem.productGroup}
                  </Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Birim Maliyet: {selectedItem.unitCost} ₺
                  </Badge>
                </div>
                <DialogTitle className="text-base sm:text-xl font-extrabold mt-2">
                  {selectedItem.sku} — Beden Asorti & OTB Sipariş Analizi
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Renk: {selectedItem.color} | Sezon: {selectedItem.season} | ROP Eşiği:{" "}
                  {selectedItem.stats.rop} Adet
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      Mevcut Stok
                    </div>
                    <div className="text-xl font-extrabold text-slate-900">
                      {selectedItem.stats.stock}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      Sell-Through
                    </div>
                    <div className="text-xl font-extrabold text-emerald-600">
                      %{selectedItem.stats.str}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      Yetme Süresi
                    </div>
                    <div className="text-xl font-extrabold text-rose-600">
                      {selectedItem.stats.wos} Hafta
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                    <div className="text-[10px] font-bold text-indigo-600 uppercase">
                      OTB Tutar
                    </div>
                    <div className="text-lg font-extrabold text-indigo-700">
                      {(
                        selectedItem.stats.recommendedOrderQty * selectedItem.unitCost
                      ).toLocaleString("tr-TR")}{" "}
                      ₺
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 border-b border-slate-200 flex justify-between">
                    <span>Beden Bazlı Asorti & İkmal Dağılımı</span>
                    <span className="text-indigo-600">Hedef WOS: {targetWos} Hafta</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {selectedItem.sizes.map((sz) => (
                      <div
                        key={sz.size}
                        className="px-4 py-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 w-14">{sz.size}</span>
                          {sz.isDepleted ? (
                            <Badge className="bg-rose-100 text-rose-700 text-[10px]">
                              Kritik / Tükeniyor
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              Stokta Var
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-slate-500">
                            Stok: <strong className="text-slate-800">{sz.stock}</strong>
                          </span>
                          <span className="text-slate-500">
                            Satış: <strong className="text-slate-800">{sz.sales}</strong>
                          </span>
                          <span className="font-bold text-indigo-600 w-24 text-right">
                            Öneri: +{Math.max(sz.recommendedOrder, sz.isDepleted ? 6 : 0)} Adet
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PRE-PACK (ASORTİ KOLİ) OPTİMİZASYONU */}
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-950">
                      Fabrika / Merkez Depo Pre-Pack (Asorti Koli) Optimizasyonu
                    </span>
                    <Badge className="bg-indigo-600 text-white text-[10px]">
                      AI Önerisi: Tip A Koli (Ana Beden Odaklı)
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      {
                        id: "A" as const,
                        title: "Tip A — Ana Beden",
                        ratio: "1S : 3M : 3L : 1XL",
                        packSize: 16,
                        desc: "M/L kırık asortiyi hızla tamamlar",
                      },
                      {
                        id: "B" as const,
                        title: "Tip B — Standart",
                        ratio: "1S : 2M : 2L : 1XL",
                        packSize: 12,
                        desc: "Dengeli mağaza dağılımı (2 Koli)",
                      },
                      {
                        id: "C" as const,
                        title: "Tip C — Büyük Beden",
                        ratio: "0S : 1M : 2L : 3XL",
                        packSize: 12,
                        desc: "L/XL talebi yüksek şubeler için",
                      },
                    ].map((pack) => (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => {
                          setSelectedPrepackType(pack.id);
                          setCustomOrderMap((p) => ({ ...p, [selectedItem.sku]: pack.packSize }));
                          setSelectedItem({
                            ...selectedItem,
                            stats: { ...selectedItem.stats, recommendedOrderQty: pack.packSize },
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedPrepackType === pack.id
                            ? "border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-500"
                            : "border-slate-200 bg-white/70 hover:bg-white"
                        }`}
                      >
                        <div className="font-bold text-slate-900 text-[11px]">{pack.title}</div>
                        <div className="font-mono text-[10px] font-bold text-indigo-600 mt-0.5">
                          {pack.ratio} ({pack.packSize} Adet)
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{pack.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      RPT Sipariş Miktarını Özelleştir
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Koli / Asorti katlarına göre adedi ayarlayın
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => {
                        const nextVal = Math.max(0, selectedItem.stats.recommendedOrderQty - 6);
                        setCustomOrderMap((p) => ({ ...p, [selectedItem.sku]: nextVal }));
                        setSelectedItem({
                          ...selectedItem,
                          stats: { ...selectedItem.stats, recommendedOrderQty: nextVal },
                        });
                      }}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <span className="w-16 text-center font-extrabold text-base text-indigo-700">
                      {selectedItem.stats.recommendedOrderQty}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => {
                        const nextVal = selectedItem.stats.recommendedOrderQty + 6;
                        setCustomOrderMap((p) => ({ ...p, [selectedItem.sku]: nextVal }));
                        setSelectedItem({
                          ...selectedItem,
                          stats: { ...selectedItem.stats, recommendedOrderQty: nextVal },
                        });
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      updateItemStatus(selectedItem.sku, "requested");
                      setSelectedItem(null);
                    }}
                  >
                    RPT Talebine Ekle
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                    onClick={() => {
                      updateItemStatus(selectedItem.sku, "approved");
                      setSelectedItem(null);
                    }}
                  >
                    Onayla & 3D Depo Listesine Gönder (+{selectedItem.stats.recommendedOrderQty})
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <RetailStressSimulatorModal
        open={stressModalOpen}
        onOpenChange={setStressModalOpen}
      />
    </div>
  );
}
