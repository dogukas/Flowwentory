/**
 * Counting Detail Page
 * Specific counting event detail and item counting interface
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ArrowLeft,
    Play,
    CheckCircle2,
    AlertTriangle,
    Search,
    Package,
    ScanBarcode,
    ChevronLeft,
    ChevronRight,
    Loader2,
    TrendingUp,
    TrendingDown,
    Minus,
    Plus,
    ClipboardCheck,
    BarChart3,
    Target,
    ShieldAlert,
} from "lucide-react";
import { motion } from "framer-motion";

import { useCountingStore } from "@/store/useCountingStore";
import { useStockStore } from "@/store/useStockStore";
import { fetchAllRows } from "@/lib/supabase";
import { BarcodeScanner } from "@/components/counting";
import type { CountingEvent, CountingDetail } from "@/types/counting";
import { getDiscrepancySeverity, getDiscrepancyColor } from "@/types/counting";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function CountingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const {
        countingEvents,
        countingDetails,
        updateCountingEvent,
        getDetailsByEventId,
        addCountingDetail,
        updateCountingDetail,
    } = useCountingStore();

    const { stockData, setStockData } = useStockStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [currentEvent, setCurrentEvent] = useState<CountingEvent | null>(null);
    const [eventDetails, setEventDetails] = useState<CountingDetail[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isLoadingStock, setIsLoadingStock] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);

    const isMobile = useMediaQuery('(max-width: 768px)');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // Fix #8: Auto-fetch stocks from Supabase if stockData is empty
    useEffect(() => {
        const fetchStocks = async () => {
            if (stockData.length > 0) return;
            setIsLoadingStock(true);
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
                        Sezon: item.sezon,
                    }));
                    setStockData(formattedStocks);
                }
            } catch (error) {
                console.error("Stock fetch error:", error);
            } finally {
                setIsLoadingStock(false);
            }
        };
        fetchStocks();
    }, [stockData.length, setStockData]);

    // Load event and details
    useEffect(() => {
        const event = countingEvents.find((e) => e.id === eventId);
        if (event) setCurrentEvent(event);
    }, [eventId, countingEvents]);

    useEffect(() => {
        const details = getDetailsByEventId(eventId);
        setEventDetails(details);
        if (currentPage > Math.ceil(details.length / itemsPerPage)) {
            setCurrentPage(1);
        }
    }, [eventId, countingDetails, getDetailsByEventId, currentPage, itemsPerPage]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && e.target === document.body) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Fix #4: Guard against double-start
    const hasExistingDetails = getDetailsByEventId(eventId).length > 0;

    // Fix #1 + #3: Start counting with guards
    const handleStartCounting = () => {
        if (!currentEvent) return;

        // Guard: prevent double-start
        if (hasExistingDetails) {
            alert("Bu sayım zaten başlatılmış. Ürünler mevcut.");
            return;
        }

        // Guard: no stock data
        if (stockData.length === 0) {
            alert("⚠️ Stok verisi bulunamadı.\n\nÖnce \"Stok Sorgula\" sayfasından Excel yükleyin veya Supabase'den veri çekin.");
            return;
        }

        const newDetails: CountingDetail[] = stockData.map((item) => ({
            id: uuidv4(),
            counting_event_id: eventId,
            product_key: `${item.Marka}-${item["Ürün Kodu"]}-${item["Renk Kodu"]}-${item.Beden}`,
            marka: item.Marka,
            urun_kodu: item["Ürün Kodu"],
            urun_grubu: item["Ürün Grubu"] || "",
            renk_kodu: item["Renk Kodu"],
            beden: item.Beden,
            barkod: item.Barkod,
            location: "Ana Depo",
            system_quantity: parseInt(item.Envanter) || 0,
            counted_quantity: 0,
            discrepancy: 0,
            counted_by: "current-user",
            counted_at: new Date(),
            adjustment_status: "PENDING",
            created_at: new Date(),
            updated_at: new Date(),
        }));

        newDetails.forEach((detail) => addCountingDetail(detail));

        updateCountingEvent(eventId, {
            status: "IN_PROGRESS",
            started_at: new Date(),
            total_items_planned: newDetails.length,
        });
    };

    // Handle barcode scan
    const handleBarcodeScan = (barcode: string) => {
        const detail = eventDetails.find((d) => d.barkod === barcode);
        if (!detail) {
            alert(`❌ Barkod bulunamadı: ${barcode}`);
            return;
        }

        const newCountedQty = detail.counted_quantity + 1;
        const newDiscrepancy = newCountedQty - detail.system_quantity;

        updateCountingDetail(detail.id, {
            counted_quantity: newCountedQty,
            discrepancy: newDiscrepancy,
        });

        const updatedDetails = eventDetails.map((d) =>
            d.id === detail.id ? { ...d, counted_quantity: newCountedQty, discrepancy: newDiscrepancy } : d
        );
        const totalCounted = updatedDetails.filter((d) => d.counted_quantity > 0).length;
        const discrepancies = updatedDetails.filter((d) => d.discrepancy !== 0).length;

        updateCountingEvent(eventId, {
            total_items_counted: totalCounted,
            discrepancy_count: discrepancies,
        });
    };

    // Handle manual count input
    const handleManualCount = (detailId: string, quantity: number) => {
        const detail = eventDetails.find((d) => d.id === detailId);
        if (!detail) return;

        const newCountedQty = Math.max(0, quantity || 0);
        const newDiscrepancy = newCountedQty - detail.system_quantity;

        updateCountingDetail(detailId, {
            counted_quantity: newCountedQty,
            discrepancy: newDiscrepancy,
        });

        const updatedDetails = eventDetails.map((d) =>
            d.id === detailId ? { ...d, counted_quantity: newCountedQty, discrepancy: newDiscrepancy } : d
        );
        const totalCounted = updatedDetails.filter((d) => d.counted_quantity > 0).length;
        const discrepancies = updatedDetails.filter((d) => d.discrepancy !== 0).length;

        updateCountingEvent(eventId, {
            total_items_counted: totalCounted,
            discrepancy_count: discrepancies,
        });
    };

    // Fix #5: Completion with confirmation
    const handleCompleteCounting = () => {
        if (!currentEvent) return;
        setShowCompleteDialog(true);
    };

    const confirmComplete = () => {
        updateCountingEvent(eventId, {
            status: "COMPLETED",
            completed_at: new Date(),
        });
        setShowCompleteDialog(false);
    };

    // Loading state
    if (!currentEvent) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
                <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Sayım bulunamadı</h3>
                    <p className="text-slate-400 mt-2 text-sm">Bu sayım mevcut değil veya silinmiş olabilir.</p>
                    <Link href="/stock-counting">
                        <Button className="mt-4 rounded-xl">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Sayım Listesine Dön
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const completionRate =
        currentEvent.total_items_planned > 0
            ? (currentEvent.total_items_counted / currentEvent.total_items_planned) * 100
            : 0;

    const accuracyRate =
        eventDetails.length > 0
            ? ((eventDetails.length - currentEvent.discrepancy_count) / eventDetails.length) * 100
            : 100;

    const uncountedItems = eventDetails.filter((d) => d.counted_quantity === 0).length;
    const positiveDiscrepancies = eventDetails.filter((d) => d.discrepancy > 0).length;
    const negativeDiscrepancies = eventDetails.filter((d) => d.discrepancy < 0).length;

    // Filter
    const filteredDetails = eventDetails.filter((detail) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            detail.barkod?.toLowerCase().includes(query) ||
            detail.marka.toLowerCase().includes(query) ||
            detail.urun_kodu.toLowerCase().includes(query) ||
            detail.renk_kodu.toLowerCase().includes(query) ||
            detail.beden.toLowerCase().includes(query)
        );
    });

    const paginatedDetails = filteredDetails.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="relative min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 overflow-x-hidden pb-8">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-300/10 blur-[120px]" />
                <div className="absolute top-[30%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-violet-300/10 blur-[120px]" />
            </div>

            {/* Complete Confirmation Dialog (Fix #5) */}
            <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                            Sayımı Tamamla
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>Bu sayımı tamamlamak istediğinize emin misiniz?</p>

                                {uncountedItems > 0 && (
                                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm">
                                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                        <span className="text-amber-700 dark:text-amber-300">
                                            <strong>{uncountedItems}</strong> ürün henüz sayılmadı.
                                        </span>
                                    </div>
                                )}

                                {currentEvent && currentEvent.discrepancy_count > 0 && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm">
                                        <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                        <span className="text-red-700 dark:text-red-300">
                                            <strong>{currentEvent.discrepancy_count}</strong> üründe stok farkı tespit edildi.
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm">
                                    <div>
                                        <span className="text-slate-500">Sayılan:</span>{" "}
                                        <strong>{currentEvent?.total_items_counted || 0}</strong> / {currentEvent?.total_items_planned || 0}
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Doğruluk:</span>{" "}
                                        <strong className="text-emerald-600">{accuracyRate.toFixed(1)}%</strong>
                                    </div>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmComplete} className="bg-blue-600 hover:bg-blue-700">
                            Evet, Tamamla
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <motion.div
                className="container mx-auto p-4 md:p-6 pt-20 space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-slate-800 shadow-sm">
                    <Link href="/stock-counting">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{currentEvent.event_code}</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {currentEvent.event_type === "FULL" && "Tam Sayım"}
                            {currentEvent.event_type === "CYCLE" && `Döngüsel Sayım - ${currentEvent.abc_group} Grubu`}
                            {currentEvent.event_type === "SPOT" && "Spot Sayım"}
                            {currentEvent.notes && ` · ${currentEvent.notes}`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {currentEvent.status === "PLANNED" && (
                            <Button
                                onClick={handleStartCounting}
                                disabled={hasExistingDetails || isLoadingStock}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                            >
                                {isLoadingStock ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Stok Yükleniyor...</>
                                ) : (
                                    <><Play className="mr-2 h-4 w-4" /> Sayımı Başlat</>
                                )}
                            </Button>
                        )}
                        {currentEvent.status === "IN_PROGRESS" && (
                            <Button
                                onClick={handleCompleteCounting}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/20"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Sayımı Tamamla
                            </Button>
                        )}
                    </div>
                </div>

                {/* Fix #6: Completion Summary Card for COMPLETED events */}
                {currentEvent.status === "COMPLETED" && (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/20">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-6 h-6" />
                            <h2 className="text-lg font-bold">Sayım Tamamlandı — Özet Rapor</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Target className="w-4 h-4 opacity-80" />
                                    <span className="text-xs opacity-80 font-medium">Toplam Ürün</span>
                                </div>
                                <div className="text-2xl font-bold">{currentEvent.total_items_planned}</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <ClipboardCheck className="w-4 h-4 opacity-80" />
                                    <span className="text-xs opacity-80 font-medium">Sayılan</span>
                                </div>
                                <div className="text-2xl font-bold">{currentEvent.total_items_counted}</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <BarChart3 className="w-4 h-4 opacity-80" />
                                    <span className="text-xs opacity-80 font-medium">Doğruluk</span>
                                </div>
                                <div className="text-2xl font-bold">{accuracyRate.toFixed(1)}%</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="w-4 h-4 opacity-80" />
                                    <span className="text-xs opacity-80 font-medium">Fark Sayısı</span>
                                </div>
                                <div className="text-2xl font-bold">{currentEvent.discrepancy_count}</div>
                                {positiveDiscrepancies > 0 && (
                                    <span className="text-[10px] opacity-70 flex items-center gap-0.5 mt-0.5"><TrendingUp className="w-3 h-3" /> {positiveDiscrepancies} fazla</span>
                                )}
                                {negativeDiscrepancies > 0 && (
                                    <span className="text-[10px] opacity-70 flex items-center gap-0.5"><TrendingDown className="w-3 h-3" /> {negativeDiscrepancies} eksik</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Cards (IN_PROGRESS or PLANNED) */}
                {currentEvent.status !== "COMPLETED" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Durum", render: () => (
                                <Badge className={
                                    currentEvent.status === "PLANNED" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                    currentEvent.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                                    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                }>
                                    {currentEvent.status === "PLANNED" && "Planlandı"}
                                    {currentEvent.status === "IN_PROGRESS" && "Devam Ediyor"}
                                    {currentEvent.status === "CANCELLED" && "İptal Edildi"}
                                </Badge>
                            )},
                            { label: "İlerleme", render: () => (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{currentEvent.total_items_counted}/{currentEvent.total_items_planned}</span>
                                        <span className="font-bold text-blue-600">{completionRate.toFixed(0)}%</span>
                                    </div>
                                    <Progress value={completionRate} className="h-1.5" />
                                </div>
                            )},
                            { label: "Doğruluk", render: () => <div className="text-2xl font-bold text-emerald-600">{accuracyRate.toFixed(1)}%</div> },
                            { label: "Farklar", render: () => <div className="text-2xl font-bold text-red-500">{currentEvent.discrepancy_count}</div> },
                        ].map((card) => (
                            <div key={card.label} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-800 shadow-sm p-4">
                                <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">{card.label}</p>
                                {card.render()}
                            </div>
                        ))}
                    </div>
                )}

                {/* Search and Barcode */}
                {currentEvent.status === "IN_PROGRESS" && (
                    <div className="flex flex-col md:flex-row gap-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-800 shadow-sm">
                        <div className="flex-1 relative">
                            <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Barkod okutun veya ürün arayın..."
                                value={searchQuery}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchQuery(value);
                                    if (value.length >= 13 && /^\d+$/.test(value)) {
                                        handleBarcodeScan(value);
                                        setTimeout(() => setSearchQuery(""), 300);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && searchQuery.trim() && /^\d+$/.test(searchQuery.trim())) {
                                        handleBarcodeScan(searchQuery.trim());
                                        setSearchQuery("");
                                    }
                                    if (e.key === "Escape") setSearchQuery("");
                                }}
                                className="pl-9 text-lg font-mono bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl"
                                autoFocus
                            />
                            {searchQuery && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                    {filteredDetails.length} sonuç
                                </span>
                            )}
                        </div>
                        <div className="flex gap-4 items-center text-xs text-slate-500 px-2">
                            <span>Toplam: <strong className="text-slate-700 dark:text-slate-200">{eventDetails.length}</strong></span>
                            <span>Sayılan: <strong className="text-emerald-600">{eventDetails.filter(d => d.counted_quantity > 0).length}</strong></span>
                        </div>
                    </div>
                )}

                {/* Items Table / Cards */}
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-700 dark:text-slate-200">Sayım Detayları</CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    {searchQuery ? `${filteredDetails.length} / ` : ""}{eventDetails.length} ürün
                                </CardDescription>
                            </div>
                            {filteredDetails.length > itemsPerPage && (
                                <span className="text-xs text-slate-400">
                                    Sayfa {currentPage} / {Math.ceil(filteredDetails.length / itemsPerPage)}
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredDetails.length === 0 ? (
                            <div className="text-center py-20 px-4">
                                <div className="relative mx-auto w-20 h-20 mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl opacity-10 animate-pulse" />
                                    <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Package className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold mb-1 text-slate-700 dark:text-slate-200">
                                    {searchQuery ? "Sonuç Bulunamadı" : "Henüz Ürün Eklenmedi"}
                                </h3>
                                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                                    {searchQuery
                                        ? "Farklı arama terimleri deneyerek yeniden arayabilirsiniz"
                                        : '"Sayımı Başlat" butonuna tıklayarak ürünleri listeleyebilirsiniz'}
                                </p>
                            </div>
                        ) : isMobile ? (
                            // Fix #7: Mobile Card View with +1/-1 buttons
                            <div className="grid gap-2 p-3">
                                {paginatedDetails.map((detail) => {
                                    const hasDiscrepancy = detail.discrepancy !== 0;
                                    return (
                                        <div key={detail.id} className={`p-3 rounded-xl border ${hasDiscrepancy ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10' : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{detail.marka}</p>
                                                    <p className="text-[10px] text-slate-400">{detail.urun_kodu} · {detail.renk_kodu} · {detail.beden}</p>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-400">{detail.barkod || "-"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-slate-500">
                                                    Sistem: <strong>{detail.system_quantity}</strong>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg"
                                                        onClick={() => handleManualCount(detail.id, detail.counted_quantity - 1)}
                                                        disabled={detail.counted_quantity <= 0 || currentEvent.status === "COMPLETED"}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="font-bold text-lg w-10 text-center">{detail.counted_quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg"
                                                        onClick={() => handleManualCount(detail.id, detail.counted_quantity + 1)}
                                                        disabled={currentEvent.status === "COMPLETED"}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="w-14 text-right">
                                                    {detail.discrepancy !== 0 ? (
                                                        <span className={`text-xs font-bold ${detail.discrepancy > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {detail.discrepancy > 0 && "+"}{detail.discrepancy}
                                                        </span>
                                                    ) : (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Desktop: Table View
                            <>
                                <Table>
                                    <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
                                        <TableRow className="border-slate-100 dark:border-slate-800">
                                            <TableHead className="font-bold text-slate-500">Ürün</TableHead>
                                            <TableHead className="font-bold text-slate-500">Barkod</TableHead>
                                            <TableHead className="font-bold text-slate-500 text-center">Sistem</TableHead>
                                            <TableHead className="font-bold text-slate-500 text-center">Sayılan</TableHead>
                                            <TableHead className="font-bold text-slate-500 text-center">Fark</TableHead>
                                            <TableHead className="font-bold text-slate-500">Durum</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedDetails.map((detail) => {
                                            const severity = getDiscrepancySeverity(detail.system_quantity, detail.counted_quantity);

                                            return (
                                                <TableRow
                                                    key={detail.id}
                                                    className="border-slate-100 dark:border-slate-800/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                                                >
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium text-slate-700 dark:text-slate-200">{detail.marka}</p>
                                                            <p className="text-[10px] text-slate-400">{detail.urun_kodu} · {detail.renk_kodu} · {detail.beden}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-slate-400">
                                                        {detail.barkod || "-"}
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium">{detail.system_quantity}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={detail.counted_quantity}
                                                            onChange={(e) => handleManualCount(detail.id, parseInt(e.target.value) || 0)}
                                                            className="w-20 text-center mx-auto rounded-lg"
                                                            onClick={(e) => (e.target as HTMLInputElement).select()}
                                                            disabled={currentEvent.status === "COMPLETED"}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`font-bold ${
                                                            detail.discrepancy > 0 ? "text-emerald-600" :
                                                            detail.discrepancy < 0 ? "text-red-600" : "text-slate-400"
                                                        }`}>
                                                            {detail.discrepancy > 0 && "+"}{detail.discrepancy}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {detail.counted_quantity === 0 ? (
                                                            <Badge variant="outline" className="text-[10px] rounded-md border-slate-200 dark:border-slate-700 text-slate-400">
                                                                Bekliyor
                                                            </Badge>
                                                        ) : detail.discrepancy === 0 ? (
                                                            <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3" /> Uyumlu
                                                            </span>
                                                        ) : (
                                                            <Badge variant="outline" className={`text-[10px] rounded-md ${
                                                                severity === 'LOW' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300' :
                                                                severity === 'MEDIUM' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300' :
                                                                'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300'
                                                            }`}>
                                                                <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                                                                Fark
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {filteredDetails.length > itemsPerPage && (
                                    <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-xs text-slate-400">
                                            {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredDetails.length)} / {filteredDetails.length} ürün
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-lg"
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Önceki
                                            </Button>
                                            <span className="text-xs text-slate-500">
                                                {currentPage} / {Math.ceil(filteredDetails.length / itemsPerPage)}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-lg"
                                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredDetails.length / itemsPerPage), p + 1))}
                                                disabled={currentPage === Math.ceil(filteredDetails.length / itemsPerPage)}
                                            >
                                                Sonraki
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
