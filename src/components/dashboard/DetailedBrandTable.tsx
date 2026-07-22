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
}

export function DetailedBrandTable({
  brandMetrics,
  maxStock,
  maxSales,
  exportBrandMetrics,
  brandTooltipData,
  heatmapData
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
    <div className="mt-4">
      <Card className="w-full dashboard-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-2xl">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">Detaylı Marka Performansı</CardTitle>
              <p className="text-[11px] text-slate-400">Markaların stok, satış ve devir hızı analizleri (Kategorileri görmek için tıklayın)</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:bg-slate-800 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20"
                onClick={exportBrandMetrics}
              >
                <FileDown className="h-3 w-3" />
                <span className="hidden sm:inline">Excel'e Aktar</span>
              </Button>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Marka ara..."
                  value={brandSearchTerm}
                  onChange={(e) => setBrandSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs w-[180px] bg-white dark:bg-slate-800"
                />
              </div>
              <Select value={brandSortOption} onValueChange={(val: any) => setBrandSortOption(val)}>
                <SelectTrigger className="w-[140px] h-8 text-xs bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Sıralama" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock" className="text-xs">Stok Miktarı</SelectItem>
                  <SelectItem value="sales" className="text-xs">Satış Miktarı</SelectItem>
                  <SelectItem value="turnover" className="text-xs">Devir Hızı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 backdrop-blur-sm">
                <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase px-6 py-3">Marka</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase px-6 py-3 min-w-[200px]">Stok Performansı</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase px-6 py-3 min-w-[200px]">Satış Performansı</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase px-6 py-3 text-right">Devir Hızı</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brandMetrics
                  .filter(metric => metric.brand.toLowerCase().includes(brandSearchTerm.toLowerCase()))
                  .sort((a: any, b: any) => {
                    if (brandSortOption === 'sales') return b.sales - a.sales;
                    if (brandSortOption === 'turnover') return b.turnoverRate - a.turnoverRate;
                    return b.stock - a.stock;
                  })
                  .map((metric, index) => {
                    const isExpanded = expandedBrands.includes(metric.brand);
                    const tooltipInfo = brandTooltipData ? brandTooltipData[metric.brand] : null;
                    const productGroups = tooltipInfo?.productGroups || {};
                    
                    return (
                      <Fragment key={index}>
                        <TableRow 
                          onClick={() => toggleBrand(metric.brand)}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-slate-50 dark:border-slate-800 cursor-pointer"
                        >
                          <TableCell className="pl-4 pr-0">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                          {/* Brand Name */}
                          <TableCell className="px-6 py-3">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{metric.brand}</span>
                          </TableCell>

                          {/* Stock Performance Bar */}
                          <TableCell className="px-6 py-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] text-slate-400 font-medium">STOK</span>
                              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{metric.stock.toLocaleString('tr-TR')}</span>
                            </div>
                            <Progress value={(metric.stock / maxStock) * 100} className="h-1.5 bg-blue-50 dark:bg-blue-950 [&>div]:bg-blue-500" />
                          </TableCell>

                          {/* Sales Performance Bar */}
                          <TableCell className="px-6 py-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] text-slate-400 font-medium">SATIŞ</span>
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{metric.sales.toLocaleString('tr-TR')}</span>
                            </div>
                            <Progress value={(metric.sales / maxSales) * 100} className="h-1.5 bg-emerald-50 dark:bg-emerald-950 [&>div]:bg-emerald-500" />
                          </TableCell>

                          {/* Turnover Rate Badge */}
                          <TableCell className="px-6 py-3 text-right">
                            <Badge variant="outline" className={`text-xs px-2 py-0.5 border-transparent ${metric.turnoverRate > 1.0
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : metric.turnoverRate > 0.5
                                  ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}>
                              {metric.turnoverRate}x
                            </Badge>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <TableRow className="bg-slate-50/30 dark:bg-slate-900/30 hover:bg-slate-50/30">
                              <TableCell colSpan={5} className="p-0 border-b border-slate-100 dark:border-slate-800">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 pl-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {Object.entries(productGroups)
                                      .sort(([, a]: any, [, b]: any) => b.total - a.total)
                                      .map(([group, data]: any, i) => {
                                        // Satış adetini heatmapData üzerinden bul
                                        const groupSales = heatmapData?.data?.find(
                                          (d: any) => d.brand === metric.brand && d.category === group
                                        )?.sales || 0;

                                        return (
                                          <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                                              <Package2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{group}</p>
                                              <p className="text-[10px] text-slate-500">{data.count} çeşit</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-[10px] text-slate-400 mb-0.5">Stok / Satış</p>
                                              <div className="flex items-center justify-end gap-1.5 text-xs font-medium">
                                                <span className="text-blue-600 dark:text-blue-400">{data.total}</span>
                                                <span className="text-slate-300 dark:text-slate-600">/</span>
                                                <span className="text-emerald-600 dark:text-emerald-400">{groupSales}</span>
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
    </div>
  );
}
