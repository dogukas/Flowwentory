import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsivePie } from "@nivo/pie";
import { motion } from "framer-motion";
import { useMemo } from "react";

// Nivo 'set2' renk paleti
const SET2_COLORS = [
  '#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3',
  '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3',
];

interface BrandPieChartProps {
  totalInventory: number;
  pieChartData: any[];
  brandTooltipData: Record<string, any>;
  setSelectedBrand: (brand: string) => void;
}

export function BrandPieChart({
  totalInventory,
  pieChartData,
  brandTooltipData,
  setSelectedBrand
}: BrandPieChartProps) {
  // Marka → renk eşleşmesi (Nivo set2 sıralamasıyla aynı)
  const brandColors = useMemo(() => {
    return pieChartData.map((item, i) => ({
      id: item.id,
      label: item.label,
      color: SET2_COLORS[i % SET2_COLORS.length],
    }));
  }, [pieChartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="col-span-12 lg:col-span-4 h-full"
    >
      <Card className="h-full flex flex-col dashboard-card bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
        <CardHeader className="pb-1 pt-6 px-6">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-500 rounded-full" />
            Marka Stok Dağılımı
          </CardTitle>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 pl-4">Toplam envanter: <span className="text-slate-900 dark:text-white font-bold">{totalInventory.toLocaleString('tr-TR')}</span></p>
        </CardHeader>
        <CardContent className="px-4 pb-4 flex-1 flex flex-col justify-center">
          {/* Grafik */}
          <div className="h-[240px] w-full flex-shrink-0">
            <ResponsivePie
              data={pieChartData}
              margin={{ top: 10, right: 80, bottom: 10, left: 80 }}
              innerRadius={0.65}
              padAngle={2}
              cornerRadius={8}
              activeOuterRadiusOffset={6}
              colors={{ scheme: 'set2' }}
              borderWidth={0}
              arcLinkLabelsSkipAngle={12}
              arcLinkLabelsTextColor="#64748b"
              arcLinkLabelsThickness={1.5}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLinkLabelsDiagonalLength={10}
              arcLinkLabelsStraightLength={6}
              arcLinkLabelsTextOffset={3}
              arcLabelsSkipAngle={999}
              enableArcLabels={false}
              theme={{
                tooltip: {
                  container: {
                    background: 'transparent',
                    boxShadow: 'none',
                    padding: 0,
                  }
                }
              }}
              tooltip={({ datum }) => {
                const tooltipInfo = brandTooltipData[datum.id as string];
                const productGroups = tooltipInfo?.productGroups || {};
                const totalUniqueProducts = tooltipInfo?.totalUniqueProducts || 0;
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 min-w-[280px]"
                  >
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-slate-900 dark:text-white text-base">{datum.id}</p>
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: datum.color }} />
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>{datum.value.toLocaleString('tr-TR')} adet stok</span>
                        <span>•</span>
                        <span>{totalUniqueProducts} farklı ürün</span>
                      </div>
                    </div>
                    <div className="text-sm space-y-2">
                      {Object.entries(productGroups)
                        .sort(([, a]: any, [, b]: any) => b.total - a.total)
                        .map(([group, data]: [string, any], index) => {
                          const percentage = ((data.total / datum.value) * 100).toFixed(1);
                          return (
                            <div key={index} className="flex items-center justify-between group">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">{group}</span>
                                <span className="text-[10px] text-slate-400">({data.count} tip)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-900 dark:text-white font-bold">{data.total}</span>
                                <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 text-[10px] py-0 px-1.5 h-4">
                                  %{percentage}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </motion.div>
                );
              }}
              onClick={({ id }) => setSelectedBrand(id as string)}
              legends={[]}
            />
          </div>

          {/* Custom Legend — flexbox wrap ile tüm markalar sığar */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/50">
            {brandColors.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedBrand(item.id)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
