"use client";

import { useState, Fragment } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { FileDown, Search, ChevronDown, ChevronRight, Package2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

interface DetailedBrandTableProps {
  brandMetrics: any[];
  maxStock: number;
  maxSales: number;
  exportBrandMetrics: () => void;
  brandTooltipData?: Record<string, any>;
  heatmapData?: any;
  totalInventory?: number;
}

export function DetailedBrandTable({
  brandMetrics,
  maxStock,
  maxSales,
  exportBrandMetrics,
  brandTooltipData,
  heatmapData,
  totalInventory = 1,
}: DetailedBrandTableProps) {
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [brandSortOption, setBrandSortOption] = useState<"stock" | "sales" | "turnover">("stock");
  const [expandedBrands, setExpandedBrands] = useState<string[]>([]);

  const toggleBrand = (brand: string) => {
    setExpandedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  return (
    <Card className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="p-4 md:px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-5 bg-indigo-600 rounded-full" />
              Marka & Kategori Performans Matrisi
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5 pl-4">
              Alt ürün gruplarını ve satış kırılımlarını açmak için marka satırına tıklayın
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Marka ara..."
                value={brandSearchTerm}
                onChange={e => setBrandSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs w-[160px] bg-white dark:bg-slate-800 rounded-lg border-slate-200"
              />
            </div>
            <Select value={brandSortOption} onValueChange={(val: any) => setBrandSortOption(val)}>
              <SelectTrigger className="w-[135px] h-8 text-xs bg-white dark:bg-slate-800 rounded-lg border-slate-200">
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock" className="text-xs">Stok Hacmi</SelectItem>
                <SelectItem value="sales" className="text-xs">Satış Hacmi</SelectItem>
                <SelectItem value="turnover" className="text-xs">Devir Hızı</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 rounded-lg text-emerald-700 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100"
              onClick={exportBrandMetrics}
            >
              <FileDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tabloyu İndir</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[420px]">
          <Table>
            <TableHeader className="bg-slate-50/90 dark:bg-slate-900/90 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="w-10"></TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase px-4 py-3">Marka</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase px-4 py-3 text-right">Model (SKU)</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase px-4 py-3 text-right">Stok Payı</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase px-5 py-3 min-w-[180px]">Stok Hacmi</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase px-5 py-3 min-w-[180px]">Satış Hacmi</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase px-5 py-3 text-right">Devir Hızı</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brandMetrics
                .filter(metric => metric.brand.toLowerCase().includes(brandSearchTerm.toLowerCase()))
                .sort((a: any, b: any) => {
                  if (brandSortOption === "sales") return b.sales - a.sales;
                  if (brandSortOption === "turnover") return b.turnoverRate - a.turnoverRate;
                  return b.stock - a.stock;
                })
                .map((metric, index) => {
                  const isExpanded = expandedBrands.includes(metric.brand);
                  const tooltipInfo = brandTooltipData ? brandTooltipData[metric.brand] : null;
                  const productGroups = tooltipInfo?.productGroups || {};
                  const totalUnique = tooltipInfo?.totalUniqueProducts || 0;
                  const share = totalInventory > 0 ? ((metric.stock / totalInventory) * 100).toFixed(1) : "0";

                  return (
                    <Fragment key={index}>
                      <TableRow
                        onClick={() => toggleBrand(metric.brand)}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors border-slate-100 dark:border-slate-800 cursor-pointer"
                      >
                        <TableCell className="pl-4 pr-0">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            {isExpanded ? <ChevronDown className="h-4 w-4 text-indigo-600" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                          </Button>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{metric.brand}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right font-semibold text-xs text-slate-600 dark:text-slate-300">
                          {totalUnique.toLocaleString("tr-TR")}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <Badge variant="outline" className="bg-indigo-50/60 text-indigo-700 border-indigo-200 text-[10px] font-bold">
                            %{share}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400 font-semibold">STOK</span>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              {metric.stock.toLocaleString("tr-TR")}
                            </span>
                          </div>
                          <Progress value={(metric.stock / maxStock) * 100} className="h-1.5 bg-indigo-50 dark:bg-indigo-950 [&>div]:bg-indigo-600" />
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400 font-semibold">SATIŞ</span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {metric.sales.toLocaleString("tr-TR")}
                            </span>
                          </div>
                          <Progress value={(metric.sales / maxSales) * 100} className="h-1.5 bg-emerald-50 dark:bg-emerald-950 [&>div]:bg-emerald-500" />
                        </TableCell>
                        <TableCell className="px-5 py-3 text-right">
                          <Badge
                            variant="outline"
                            className={`text-xs font-bold px-2 py-0.5 ${
                              metric.turnoverRate >= 1.0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : metric.turnoverRate >= 0.5
                                  ? "bg-sky-50 text-sky-700 border-sky-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {metric.turnoverRate}x
                          </Badge>
                        </TableCell>
                      </TableRow>

                      <AnimatePresence>
                        {isExpanded && (
                          <TableRow className="bg-slate-50/50 dark:bg-slate-900/40">
                            <TableCell colSpan={7} className="p-0 border-b border-slate-100 dark:border-slate-800">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 pl-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                  {Object.entries(productGroups)
                                    .sort(([, a]: any, [, b]: any) => b.total - a.total)
                                    .map(([group, data]: any, i) => {
                                      const groupSales =
                                        heatmapData?.data?.find(
                                          (d: any) => d.brand === metric.brand && d.category === group
                                        )?.sales || 0;

                                      return (
                                        <div
                                          key={i}
                                          className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700 shadow-xs"
                                        >
                                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                                            <Package2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                              {group}
                                            </p>
                                            <p className="text-[10px] text-slate-500">{data.count} model</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-[10px] text-slate-400">Stok / Satış</p>
                                            <div className="flex items-center justify-end gap-1 text-xs font-bold">
                                              <span className="text-indigo-600">{data.total}</span>
                                              <span className="text-slate-300">/</span>
                                              <span className="text-emerald-600">{groupSales}</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </motion.div>
                            </TableCell>
                          </TableRow>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  );
                })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
