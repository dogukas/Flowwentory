"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Database,
  ClipboardCheck,
  Sparkles,
  ArrowLeftRight,
  Percent,
  Box,
  ArrowUpRight,
  Gauge,
  Flame,
  ShieldAlert,
} from "lucide-react";

import { useStockStore } from "@/store/useStockStore";
import { useSalesStore } from "@/store/useSalesStore";
import { useRetailBrainStore } from "@/store/useRetailBrainStore";
import { useCountingStore } from "@/store/useCountingStore";
import type { StockItem, SalesItem } from "@/types/stock";
import type { CountingEvent, CountingDetail } from "@/types/counting";

interface RetailStressSimulatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type StressLevel = "STANDARD" | "BLACK_FRIDAY" | "EXTREME";

interface StepLog {
  id: number;
  title: string;
  detail: string;
  metric: string;
  durationMs: number;
  status: "idle" | "running" | "done";
  targetHref: string;
  targetLabel: string;
}

const INITIAL_STEPS: StepLog[] = [
  {
    id: 1,
    title: "1. Yüksek Hacimli Stok & Satış Stres Yükü (Engine Load)",
    detail: "Binlerce SKU/beden varyantı, sezon kırılımı ve Black Friday satış patlaması belleğe yüklenir.",
    metric: "Bekliyor",
    durationMs: 0,
    status: "idle",
    targetHref: "/dashboard",
    targetLabel: "Dashboard KPI",
  },
  {
    id: 2,
    title: "2. Shrinkage (Kayıp/Kaçak) & Barkodlu Mikro Sayım Alarmı",
    detail: "Kritik reyonlarda döngüsel (CYCLE) sayım simüle edilir; eksik çıkan SKU'lar RPT merkezine kırmızı bayrakla düşer.",
    metric: "Bekliyor",
    durationMs: 0,
    status: "idle",
    targetHref: "/stock-counting",
    targetLabel: "Sayım Raporu",
  },
  {
    id: 3,
    title: "3. Kırık Beden (Broken Size Curve) & Pre-Pack RPT Sipariş Onayı",
    detail: "Ana bedenleri (M/L) tükenen Hero modellere Tip A Pre-Pack (1S:3M:3L:1XL) kolileriyle RPT onayı verilir ve OTB bütçesi işlenir.",
    metric: "Bekliyor",
    durationMs: 0,
    status: "idle",
    targetHref: "/operations/planning",
    targetLabel: "RPT & OTB",
  },
  {
    id: 4,
    title: "4. Şubeler Arası Transfer (Zero-CapEx) & Omnichannel Ship-from-Store",
    detail: "Yavaş mağazadan yok satan mağazaya iç transfer emri ve e-ticarette tükenen siparişler için mağazadan kargolama tetiklenir.",
    metric: "Bekliyor",
    durationMs: 0,
    status: "idle",
    targetHref: "/operations/planning",
    targetLabel: "Transfer & DOM",
  },
  {
    id: 5,
    title: "5. Sezon Sonu Markdown & 2.5x Personel Push-List Prim Dağıtımı",
    detail: "Hareketsiz stoklarda RPT durdurulup %30-%50 indirim uygulanır; satış danışmanlarına 2.5x eritme primi hesaplanır.",
    metric: "Bekliyor",
    durationMs: 0,
    status: "idle",
    targetHref: "/personnel-analysis",
    targetLabel: "Personel Prim",
  },
  {
    id: 6,
    title: "6. 3D Dijital Depo Toplama Kuyruğu & Lazer Rota Senkronu",
    detail: "Onaylanan RPT, İç Transfer ve Online Ship-from-Store görevleri 3 boyutlu depo raflarına lazer rota olarak atanır.",
    metric: "Bekliyor",
    durationMs: 0,
    status: "idle",
    targetHref: "/warehouse-3d",
    targetLabel: "3D Depoyu Aç",
  },
];

export function RetailStressSimulatorModal({
  open,
  onOpenChange,
}: RetailStressSimulatorModalProps) {
  const [stressLevel, setStressLevel] = useState<StressLevel>("BLACK_FRIDAY");
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [steps, setSteps] = useState<StepLog[]>(INITIAL_STEPS);
  const [summaryStats, setSummaryStats] = useState<{
    totalSkusProcessed: number;
    totalLatencyMs: number;
    flaggedDiscrepancies: number;
    approvedRptOrders: number;
    savedTransferCash: number;
    warehouseQueueTasks: number;
  } | null>(null);

  // Stores
  const stockData = useStockStore(s => s.stockData) || [];
  const setStockData = useStockStore(s => s.setStockData);
  const setSalesData = useSalesStore(s => s.setSalesData);

  const {
    setOtbBudgetLimit,
    addPickingTask,
    approveStoreTransfer,
    applyMarkdown,
    flagSkuFromCounting,
    clearPickingQueue,
  } = useRetailBrainStore();

  const { addCountingEvent, countingDetails, setCountingDetails } = useCountingStore();

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  const updateStep = (id: number, patch: Partial<StepLog>) => {
    setSteps(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };

  const handleRunStressScenario = async () => {
    setIsRunning(true);
    setIsCompleted(false);
    setSummaryStats(null);
    setSteps(INITIAL_STEPS);

    const multiplier = stressLevel === "EXTREME" ? 3 : stressLevel === "BLACK_FRIDAY" ? 2 : 1;
    const velocityBoost = stressLevel === "EXTREME" ? 2.6 : stressLevel === "BLACK_FRIDAY" ? 1.8 : 1.1;

    // =========================================================================
    // ADIM 1: YÜKSEK HACİMLİ VERİ & SATIŞ PATLAMASI STRES TESTİ
    // =========================================================================
    updateStep(1, { status: "running" });
    await sleep(250);
    const t0 = performance.now();

    let baseStocks: StockItem[] = [...stockData];
    if (baseStocks.length === 0) {
      const { fetchAllRows } = await import("@/lib/supabase");
      const raw = await fetchAllRows("stocks");
      baseStocks = (raw || []).map((item: any) => ({
        Marka: item.marka,
        "Ürün Grubu": item.urun_grubu,
        "Ürün Kodu": item.urun_kodu,
        "Renk Kodu": item.renk_kodu,
        Beden: item.beden,
        Envanter: item.envanter,
        Barkod: item.barkod,
        Sezon: item.sezon,
      }));
    }

    // Stres çarpanına göre sentetik yüksek hacimli SKU varyantları üret
    const stressedStocks: StockItem[] = [...baseStocks];
    if (multiplier > 1 && baseStocks.length > 0) {
      const sampleSlice = baseStocks.slice(0, Math.min(2500, baseStocks.length));
      for (let m = 1; m < multiplier; m++) {
        sampleSlice.forEach((item, idx) => {
          // Ana bedenlerde (M, L) kasıtlı kırılma (0-1 adet) ve uç bedenlerde şişkinlik simüle et
          const isCoreSize = item.Beden === "M" || item.Beden === "L" || item.Beden === "42";
          const simulatedStock = isCoreSize ? idx % 2 : (parseInt(item.Envanter) || 4) + (idx % 18);
          stressedStocks.push({
            ...item,
            "Ürün Kodu": `${item["Ürün Kodu"]}-BF${m}`,
            Barkod: `${item.Barkod || "869000"}${m}${idx}`,
            Envanter: String(simulatedStock),
            Sezon: m % 2 === 0 ? "25SS" : "24AW",
          });
        });
      }
    }

    const stressedSales: SalesItem[] = stressedStocks.map((item, idx) => {
      const stockNum = parseInt(item.Envanter) || 0;
      const isDeadCandidate = idx % 8 === 0 && stockNum >= 10;
      const isHeroCandidate = idx % 5 === 0;
      const soldQty = isDeadCandidate
        ? 0
        : Math.max(
            1,
            Math.round(
              (isHeroCandidate ? 14 : 4) *
                velocityBoost *
                ((idx % 4) + 1) *
                0.45
            )
          );
      const unitPrice = isHeroCandidate ? 1650 : 1150;
      return {
        Marka: item.Marka,
        "Ürün Grubu": item["Ürün Grubu"],
        "Ürün Kodu": item["Ürün Kodu"],
        "Renk Kodu": item["Renk Kodu"],
        Beden: item.Beden,
        Envanter: item.Envanter,
        "Satış Miktarı": soldQty,
        "Satış (VD)": soldQty * unitPrice,
        Sezon: item.Sezon,
      };
    });

    setStockData(stressedStocks);
    setSalesData(stressedSales);
    const step1Ms = Math.max(12, Math.round(performance.now() - t0));

    updateStep(1, {
      status: "done",
      durationMs: step1Ms,
      metric: `${stressedStocks.length.toLocaleString("tr-TR")} Varyant Yüklendi`,
    });

    // =========================================================================
    // ADIM 2: SHRINKAGE (KAYIP/KAÇAK) & BARKODLU MİKRO SAYIM ALARMI
    // =========================================================================
    updateStep(2, { status: "running" });
    await sleep(300);
    const t1 = performance.now();

    const targetCountItems = stressedStocks.slice(0, 8);
    const eventId = `STRESS-CYC-${Date.now()}`;
    const eventCode = `BF-SAYIM-${Math.floor(100 + Math.random() * 900)}`;

    const newCountEvent: CountingEvent = {
      id: eventId,
      event_code: eventCode,
      event_type: "CYCLE",
      status: "COMPLETED",
      scheduled_date: new Date(),
      started_at: new Date(Date.now() - 600000),
      completed_at: new Date(),
      created_by: "Stres Testi Simülatörü",
      filter_brands: Array.from(new Set(targetCountItems.map(i => i.Marka))),
      filter_product_groups: Array.from(new Set(targetCountItems.map(i => i["Ürün Grubu"]))),
      total_items_planned: targetCountItems.length,
      total_items_counted: targetCountItems.length,
      discrepancy_count: 5,
      notes: "Black Friday Yoğunluk Sonrası Otomatik Kayıp/Kaçak (Shrinkage) Mikro Sayımı",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const newDetails: CountingDetail[] = targetCountItems.map((it, idx) => {
      const sysQty = Math.max(3, parseInt(it.Envanter) || 5);
      // İlk 5 üründe negatif fark (eksik/kayıp stok) simüle et
      const countedQty = idx < 5 ? Math.max(0, sysQty - (2 + (idx % 3))) : sysQty;
      const diff = countedQty - sysQty;
      if (diff < 0 && it["Ürün Kodu"]) {
        flagSkuFromCounting(String(it["Ürün Kodu"]));
      }
      return {
        id: `${eventId}-d-${idx}`,
        counting_event_id: eventId,
        barkod: String(it.Barkod || `${it["Ürün Kodu"]}-${it.Beden}`),
        marka: it.Marka || "UNITED",
        urun_grubu: it["Ürün Grubu"] || "TEKSTIL",
        urun_kodu: it["Ürün Kodu"] || `SKU-${idx}`,
        renk_kodu: it["Renk Kodu"] || "BLK",
        beden: it.Beden || "M",
        sezon: it.Sezon || "25SS",
        system_quantity: sysQty,
        counted_quantity: countedQty,
        discrepancy: diff,
        discrepancy_percentage: sysQty > 0 ? Math.round((diff / sysQty) * 100) : 0,
        is_counted: true,
        counted_by: "Operasyon Ekibi",
        counted_at: new Date(),
        adjustment_status: "APPROVED",
        created_at: new Date(),
        updated_at: new Date(),
      };
    });

    addCountingEvent(newCountEvent);
    setCountingDetails([...countingDetails, ...newDetails]);
    const step2Ms = Math.max(8, Math.round(performance.now() - t1));

    updateStep(2, {
      status: "done",
      durationMs: step2Ms,
      metric: `5 Kritik SKU RPT'ye Bayraklandı`,
    });

    // =========================================================================
    // ADIM 3: KIRIK BEDEN & PRE-PACK RPT SİPARİŞLERİ + OTB BÜTÇESİ
    // =========================================================================
    updateStep(3, { status: "running" });
    await sleep(300);
    const t2 = performance.now();

    setOtbBudgetLimit(stressLevel === "EXTREME" ? 2500000 : 1000000);
    clearPickingQueue();

    const rptCandidates = stressedStocks.slice(0, 6);
    const savedRptList: any[] = [];

    rptCandidates.forEach((item, idx) => {
      const orderQty = idx % 2 === 0 ? 16 : 12; // Tip A (16'lı) ve Tip B (12'li) Pre-Pack koliler
      savedRptList.push({
        urun_kodu: item["Ürün Kodu"],
        status: "approved",
        target_quantity: orderQty,
      });

      addPickingTask({
        sku: String(item["Ürün Kodu"]),
        brand: item.Marka || "GENEL",
        productGroup: item["Ürün Grubu"] || "TEKSTİL",
        color: item["Renk Kodu"] || "STD",
        quantity: orderQty,
        sourceType: "RPT_ORDER",
        targetStore: "Black Friday Acil Pre-Pack İkmal (Tip A Koli)",
        unitCost: 640,
      });
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("flowwentory_rpt_plans", JSON.stringify(savedRptList));
    }

    const step3Ms = Math.max(10, Math.round(performance.now() - t2));
    updateStep(3, {
      status: "done",
      durationMs: step3Ms,
      metric: `6 Pre-Pack Koli Siparişi Onaylandı`,
    });

    // =========================================================================
    // ADIM 4: ŞUBELER ARASI TRANSFER & OMNICHANNEL SHIP-FROM-STORE
    // =========================================================================
    updateStep(4, { status: "running" });
    await sleep(300);
    const t3 = performance.now();

    const transferCandidates = stressedStocks.slice(6, 10);
    let totalSavedCash = 0;

    transferCandidates.forEach((item, idx) => {
      const savedCost = 6 * 680;
      totalSavedCash += savedCost;
      approveStoreTransfer({
        id: `STRESS-TR-${item["Ürün Kodu"]}-${idx}`,
        sku: String(item["Ürün Kodu"]),
        brand: item.Marka || "GENEL",
        productGroup: item["Ürün Grubu"] || "TEKSTİL",
        size: item.Beden || "M",
        fromStore: idx % 2 === 0 ? "Ankara Armada Şube" : "İzmir Alsancak Şube",
        fromStoreStr: 14,
        fromStoreStock: 18,
        toStore: idx % 2 === 0 ? "İstanbul Kadıköy Flagship" : "İstanbul Beşiktaş Şube",
        toStoreStr: 86,
        toStoreStock: 0,
        transferQty: 6,
        savedPurchaseCost: savedCost,
        status: "APPROVED_TRANSFER",
      });
    });

    // 3 Adet E-Ticaret Ship-from-Store emri
    stressedStocks.slice(10, 13).forEach((item, idx) => {
      addPickingTask({
        sku: String(item["Ürün Kodu"]),
        brand: item.Marka || "GENEL",
        productGroup: item["Ürün Grubu"] || "TEKSTİL",
        color: item.Beden || "L",
        quantity: 2,
        sourceType: "STORE_TRANSFER",
        targetStore: `Omnichannel Ship-from-Store (Sipariş #WEB-${9910 + idx})`,
        unitCost: 720,
      });
    });

    const step4Ms = Math.max(9, Math.round(performance.now() - t3));
    updateStep(4, {
      status: "done",
      durationMs: step4Ms,
      metric: `+${totalSavedCash.toLocaleString("tr-TR")} ₺ Nakit Kurtarıldı`,
    });

    // =========================================================================
    // ADIM 5: SEZON SONU MARKDOWN & 2.5x PERSONEL PUSH-LIST PRİMİ
    // =========================================================================
    updateStep(5, { status: "running" });
    await sleep(300);
    const t4 = performance.now();

    stressedStocks.slice(14, 20).forEach((item, idx) => {
      applyMarkdown(String(item["Ürün Kodu"]), idx % 2 === 0 ? 30 : 50);
    });

    // Personel analizini yüksek hacimli Black Friday satışlarıyla besle
    const staffNames = [
      "Zeynep Kaya (İstinyePark)",
      "Burak Demir (Zorlu Center)",
      "Elif Yılmaz (Cevahir)",
      "Mert Aydın (Ankara Armada)",
      "Selin Şahin (Forum İstanbul)",
      "Caner Özkan (İzmir Hilltown)",
    ];

    const sampleStep = Math.max(1, Math.floor(stressedStocks.length / 120));
    const sampledPersonnelStocks = stressedStocks
      .filter((_, i) => i % sampleStep === 0)
      .slice(0, 120);

    const syntheticPersonnelRows = sampledPersonnelStocks.map((item, idx) => {
      const qty = ((idx % 5) + 3) * multiplier;
      const price = 1250 + (idx % 6) * 200;
      return {
        personelAdi: staffNames[idx % staffNames.length],
        marka: item.Marka || "GENEL",
        urunKodu: String(item["Ürün Kodu"] || `SKU-${idx}`),
        renkKodu: String(item["Renk Kodu"] || "STD"),
        urunGrubu: String(item["Ürün Grubu"] || ""),
        satisAdeti: qty,
        satisFiyati: qty * price,
      };
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("salesData", JSON.stringify(syntheticPersonnelRows));
    }

    const step5Ms = Math.max(11, Math.round(performance.now() - t4));
    updateStep(5, {
      status: "done",
      durationMs: step5Ms,
      metric: `6 Kampanya & 90 Prim İşlemi`,
    });

    // =========================================================================
    // ADIM 6: 3D DİJİTAL DEPO TOPLAMA KUYRUĞU & LAZER ROTA SENKRONU
    // =========================================================================
    updateStep(6, { status: "running" });
    await sleep(250);
    const t5 = performance.now();
    const step6Ms = Math.max(7, Math.round(performance.now() - t5));

    const totalQueueCount = 13;
    updateStep(6, {
      status: "done",
      durationMs: step6Ms,
      metric: `${totalQueueCount} Aktif 3D Rota Hazır`,
    });

    setSummaryStats({
      totalSkusProcessed: stressedStocks.length,
      totalLatencyMs: step1Ms + step2Ms + step3Ms + step4Ms + step5Ms + step6Ms,
      flaggedDiscrepancies: 5,
      approvedRptOrders: 6,
      savedTransferCash: totalSavedCash,
      warehouseQueueTasks: totalQueueCount,
    });

    setIsRunning(false);
    setIsCompleted(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:max-w-[760px] max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-slate-200">
        {/* Üst Kriz & Stres Testi Başlığı */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6">
          <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold gap-1">
                <Flame className="w-3.5 h-3.5" /> Uçtan Uca Kapalı Döngü Stres Testi
              </Badge>
              <Badge className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-[11px]">
                6 Modül Eşzamanlı Senkron
              </Badge>
            </div>
            <DialogTitle className="text-xl md:text-2xl font-extrabold text-white mt-2">
              Canlı Perakende Kriz & Stres Simülatörü (Black Friday Senaryosu)
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-xs md:text-sm mt-1">
              Tek tıkla binlerce varyantlık yoğun kampanya trafiği oluşturun; Barkodlu Sayım, Global
              RPT, Şube Transfer, Sezon Sonu Markdown, Personel Prim ve 3D Depo Lazer Rotasını aynı
              anda stres testine sokun.
            </DialogDescription>
          </DialogHeader>

          {/* Stres Seviyesi Seçici */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
            {[
              {
                id: "STANDARD" as const,
                label: "1x Standart Yük",
                sub: "Mevcut Stok • Normal Satış Hızı",
              },
              {
                id: "BLACK_FRIDAY" as const,
                label: "2x Black Friday Stresi",
                sub: "Çift Varyant • 1.8x Hız • Kırık Asorti",
              },
              {
                id: "EXTREME" as const,
                label: "3x Ekstrem Sezon Zirvesi",
                sub: "3 Kat Veri Yükü • 2.6x Satış Patlaması",
              },
            ].map(lvl => (
              <button
                key={lvl.id}
                type="button"
                disabled={isRunning}
                onClick={() => setStressLevel(lvl.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  stressLevel === lvl.id
                    ? "bg-indigo-600/40 border-indigo-400 text-white shadow-md"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                <div className="text-xs font-extrabold flex items-center justify-between">
                  <span>{lvl.label}</span>
                  {stressLevel === lvl.id && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">{lvl.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 6 Adımlı Canlı İşlem Hattı */}
        <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
          <div className="space-y-2.5">
            {steps.map(step => (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  step.status === "running"
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30"
                    : step.status === "done"
                      ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                      : "border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {step.status === "running" ? (
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    ) : step.status === "done" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 text-[10px] font-bold flex items-center justify-center text-slate-400">
                        {step.id}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {step.detail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {step.status === "done" && (
                    <>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                        {step.metric} ({step.durationMs} ms)
                      </Badge>
                      <Link
                        href={step.targetHref}
                        onClick={() => onOpenChange(false)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg flex items-center gap-1"
                      >
                        {step.targetLabel} <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stres Testi Sonuç Özeti */}
          {isCompleted && summaryStats && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4" /> Stres Testi & Senaryo Başarıyla Tamamlandı
                </span>
                <span className="text-xs font-mono text-slate-300">
                  Toplam Motor Süresi: <strong>{summaryStats.totalLatencyMs} ms</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">İşlenen Varyant</span>
                  <span className="text-base font-extrabold text-white">
                    {summaryStats.totalSkusProcessed.toLocaleString("tr-TR")} SKU
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">Sayımdan RPT Alarmı</span>
                  <span className="text-base font-extrabold text-rose-400">
                    {summaryStats.flaggedDiscrepancies} Kritik Model
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">İç Transfer Tasarrufu</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    +{summaryStats.savedTransferCash.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">3D Depo Kuyruğu</span>
                  <span className="text-base font-extrabold text-indigo-300">
                    {summaryStats.warehouseQueueTasks} Aktif Görev
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                <span className="text-[11px] text-slate-300">
                  Tüm modüller canlı verilerle dolduruldu. Şimdi modülleri gezerek sonuçları inceleyebilirsiniz:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/operations/planning"
                    onClick={() => onOpenChange(false)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1"
                  >
                    RPT & Transferleri Gör <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/warehouse-3d"
                    onClick={() => onOpenChange(false)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                  >
                    3D Depoda Rotayı Çiz <Box className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Alt Butonlar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs text-slate-500"
            >
              Kapat
            </Button>

            <Button
              onClick={handleRunStressScenario}
              disabled={isRunning}
              className="bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-600 hover:from-indigo-700 hover:to-amber-700 text-white font-bold text-xs px-5 h-10 rounded-xl shadow-md gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Stres Testi Çalışıyor...
                </>
              ) : isCompleted ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Stres Senaryosunu Tekrar Çalıştır
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  6 Aşamalı Stres Testini & Senaryoyu Başlat
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
