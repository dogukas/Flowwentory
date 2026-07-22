import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";

interface CompactInventoryTableProps {
  brandMetrics: any[];
  brandTooltipData: Record<string, any>;
  totalInventory: number;
}

export function CompactInventoryTable({ brandMetrics, brandTooltipData, totalInventory }: CompactInventoryTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="col-span-12 lg:col-span-4 h-full flex"
    >
      <Card className="flex-1 flex flex-col dashboard-card bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
          <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="w-2 h-4 bg-indigo-500 rounded-full" />
            Marka Envanter Özeti
          </CardTitle>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 pl-4">En yüksek stok hacmine sahip markalar</p>
        </div>
        <ScrollArea className="flex-1 h-[250px]">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase h-10 px-4">Marka</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase text-right h-10">Stok</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase text-right h-10">SKU</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase text-right h-10">Satış</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase text-right h-10 px-4">Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brandMetrics.sort((a, b) => b.stock - a.stock).slice(0, 15).map((metric, idx) => {
                const share = totalInventory > 0 ? ((metric.stock / totalInventory) * 100).toFixed(1) : "0";
                const tooltipInfo = brandTooltipData[metric.brand];
                const totalUnique = tooltipInfo?.totalUniqueProducts || 0;
                return (
                  <TableRow key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-slate-50 dark:border-slate-800/50 group">
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200 text-xs py-2.5 px-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{metric.brand}</TableCell>
                    <TableCell className="text-right text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5">{metric.stock.toLocaleString('tr-TR')}</TableCell>
                    <TableCell className="text-right text-slate-500 dark:text-slate-400 font-medium text-[11px] py-2.5">{totalUnique.toLocaleString('tr-TR')}</TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-bold text-xs py-2.5">{metric.sales.toLocaleString('tr-TR')}</TableCell>
                    <TableCell className="text-right py-2.5 px-4">
                      <Badge variant="outline" className="bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20 text-[10px] font-bold px-1.5 py-0.5 h-5 shadow-sm">
                        %{share}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </motion.div>
  );
}
