"use client";

import { useEffect, useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useStockStore } from "@/store/useStockStore";
import { useSalesStore } from "@/store/useSalesStore";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, Truck, CheckCircle2, AlertTriangle, Search, Download, Filter } from "lucide-react";
import * as XLSX from "xlsx";

// Types
interface PlanningItem {
    id: string;
    sku: string;
    brand: string;
    productGroup: string;
    stats: {
        stock: number;
        sales: number;
        ratio: number;
    };
    status: "suggestion" | "requested" | "approved";
}

const COLUMNS = {
    suggestion: { title: "RPT Önerileri", color: "bg-yellow-50/50", icon: <AlertTriangle className="w-4 h-4 text-yellow-500" /> },
    requested: { title: "RPT Talebi (Mağaza)", color: "bg-blue-50/50", icon: <Truck className="w-4 h-4 text-blue-500" /> },
    approved: { title: "Onaylanan S.", color: "bg-green-50/50", icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> }
};

export default function RptPlanningPage() {
    const stockData = useStockStore((state) => state.stockData);
    const salesData = useSalesStore((state) => state.salesData);

    const [items, setItems] = useState<PlanningItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("all");
    const [selectedGroup, setSelectedGroup] = useState("all");

    // Derived Filters Lists
    const uniqueBrands = useMemo(() => Array.from(new Set(items.map(i => i.brand))).filter(Boolean).sort(), [items]);
    const uniqueGroups = useMemo(() => Array.from(new Set(items.map(i => i.productGroup))).filter(Boolean).sort(), [items]);

    // 1. Fetch & Merge Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: savedPlans } = await supabase.from('planning').select('*');

                const analysis = new Map<string, PlanningItem>();

                stockData.forEach(s => {
                    const sku = s["Ürün Kodu"];
                    if (!analysis.has(sku)) {
                        analysis.set(sku, {
                            id: sku,
                            sku,
                            brand: s.Marka,
                            productGroup: s["Ürün Grubu"],
                            stats: { stock: 0, sales: 0, ratio: 0 },
                            status: 'suggestion'
                        });
                    }
                    analysis.get(sku)!.stats.stock += parseInt(s.Envanter) || 0;
                });

                salesData.forEach(s => {
                    const sku = s["Ürün Kodu"];
                    if (analysis.has(sku)) {
                        analysis.get(sku)!.stats.sales += s["Satış Miktarı"] || 0;
                    }
                });

                const finalItems: PlanningItem[] = [];

                analysis.forEach(item => {
                    if (item.stats.stock > 0) {
                        item.stats.ratio = parseFloat((item.stats.sales / item.stats.stock).toFixed(2));
                    } else if (item.stats.sales > 0) {
                        item.stats.ratio = 999;
                    }

                    const saved = savedPlans?.find((p: any) => p.urun_kodu === item.sku);
                    if (saved) {
                        item.id = saved.id;
                        item.status = saved.status as any;
                        finalItems.push(item);
                    } else {
                        if (item.stats.ratio > 0.5 || item.stats.stock < 5) {
                            finalItems.push(item);
                        }
                    }
                });

                setItems(finalItems);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [stockData, salesData]);

    // 2. Drag End
    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const updatedItems = items.map(item => {
            if (item.sku === draggableId) {
                return { ...item, status: destination.droppableId as any };
            }
            return item;
        });
        setItems(updatedItems);

        const movedItem = updatedItems.find(i => i.sku === draggableId);
        if (movedItem) {
            try {
                const payload = {
                    urun_kodu: movedItem.sku,
                    status: movedItem.status,
                    target_quantity: 0,
                    updated_at: new Date().toISOString()
                };

                const { data: existing } = await supabase.from('planning').select('id').eq('urun_kodu', movedItem.sku).single();

                if (existing) {
                    await supabase.from('planning').update(payload).eq('id', existing.id);
                } else {
                    const { data: inserted } = await supabase.from('planning').insert(payload).select().single();
                    if (inserted) {
                        setItems(prev => prev.map(i => i.sku === movedItem.sku ? { ...i, id: inserted.id } : i));
                    }
                }
            } catch (err) {
                console.error("Save failed", err);
            }
        }
    };

    // 3. Export Excel
    const handleExportExcel = () => {
        const dataToExport = getFilteredItems().map(item => ({
            "Ürün Kodu": item.sku,
            "Marka": item.brand,
            "Ürün Grubu": item.productGroup,
            "Mevcut Stok": item.stats.stock,
            "Satış Adedi": item.stats.sales,
            "Satış Hızı": item.stats.ratio,
            "Durum": COLUMNS[item.status].title
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "RPT Planlama");
        XLSX.writeFile(wb, "RPT_Planlama_Listesi.xlsx");
    };

    const getFilteredItems = () => {
        return items.filter(item => {
            const matchesSearch =
                item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.productGroup.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesBrand = selectedBrand === "all" || item.brand === selectedBrand;
            const matchesGroup = selectedGroup === "all" || item.productGroup === selectedGroup;

            return matchesSearch && matchesBrand && matchesGroup;
        });
    };

    const getList = (status: string) => getFilteredItems().filter(i => i.status === status);

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
    );

    return (
        <div className="p-8 h-screen flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">RPT Talep Yönetimi</h1>
                    <p className="text-slate-500">Satış hızına göre RPT önerilerini inceleyin ve talep oluşturun.</p>
                </div>
                <Button onClick={handleExportExcel} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Excel İndir
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Ara (SKU, Marka)..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="border-none shadow-none focus-visible:ring-0 px-0 h-auto"
                    />
                </div>
                <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block" />

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger className="w-[180px] border-slate-200">
                            <SelectValue placeholder="Marka Seç" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm Markalar</SelectItem>
                            {uniqueBrands.map(b => (
                                <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="w-[180px] border-slate-200">
                            <SelectValue placeholder="Grup Seç" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm Gruplar</SelectItem>
                            {uniqueGroups.map(g => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 h-full overflow-hidden pb-4">
                    {Object.entries(COLUMNS).map(([id, col]) => (
                        <div key={id} className={`flex-1 flex flex-col rounded-xl border border-slate-200 ${col.color}`}>
                            <div className="p-4 border-b border-slate-200/50 flex items-center gap-2 font-semibold text-slate-700">
                                {col.icon}
                                {col.title}
                                <Badge variant="secondary" className="ml-auto bg-white/50">{getList(id).length}</Badge>
                            </div>

                            <Droppable droppableId={id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-black/5' : ''}`}
                                    >
                                        {getList(id).map((item, index) => (
                                            <Draggable key={item.sku} draggableId={item.sku} index={index}>
                                                {(provided, snapshot) => (
                                                    <Card
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border-none ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-indigo-500' : ''}`}
                                                    >
                                                        <CardContent className="p-3">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <div className="font-semibold text-sm text-slate-800">{item.brand}</div>
                                                                    <div className="text-xs text-slate-500">{item.productGroup}</div>
                                                                </div>
                                                                <Badge variant="outline" className="font-mono text-[10px]">{item.sku}</Badge>
                                                            </div>

                                                            <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] uppercase text-slate-400">Stok</span>
                                                                    <span className="font-bold">{item.stats.stock}</span>
                                                                </div>
                                                                <div className="w-px h-6 bg-slate-200" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] uppercase text-slate-400">Satış</span>
                                                                    <span className="font-bold">{item.stats.sales}</span>
                                                                </div>
                                                                <div className="w-px h-6 bg-slate-200" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] uppercase text-slate-400">Hız</span>
                                                                    <span className={`font-bold ${item.stats.ratio > 0.5 ? 'text-green-600' : ''}`}>{item.stats.ratio}</span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}
