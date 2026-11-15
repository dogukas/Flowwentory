"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsivePie } from "@nivo/pie";
import { useMemo } from "react";

const SET2_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#0ea5e9",
  "#8b5cf6",
  "#14b8a6",
  "#64748b",
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
  setSelectedBrand,
}: BrandPieChartProps) {
  const brandColors = useMemo(() => {
    return pieChartData.map((item, i) => ({
      id: item.id,
      label: item.label,
      value: item.value,
      color: SET2_COLORS[i % SET2_COLORS.length],
    }));
  }, [pieChartData]);

  return (
    <Card className="col-span-12 lg:col-span-4 h-[390px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl">
      <CardHeader className="pb-1 pt-5 px-5">
        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-5 bg-violet-600 rounded-full" />
            Marka Stok Dağılımı
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {pieChartData.length} Marka
          </span>
        </CardTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 pl-4">
          Detaylı ürün grubu dağılımı için dilime tıklayın
        </p>
      </CardHeader>

      <CardContent className="px-4 pb-4 flex-1 flex flex-col justify-between min-h-0">
        <div className="relative h-[220px] w-full">
          {/* Merkez Toplam */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalInventory.toLocaleString("tr-TR")}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Toplam Adet
            </span>
          </div>

          <ResponsivePie
            data={brandColors}
            colors={{ datum: "data.color" }}
            margin={{ top: 12, right: 24, bottom: 12, left: 24 }}
            innerRadius={0.68}
            padAngle={1.8}
            cornerRadius={5}
            activeOuterRadiusOffset={6}
            borderWidth={0}
            enableArcLinkLabels={false}
            enableArcLabels={false}
            theme={{
              tooltip: {
                container: {
                  background: "transparent",
                  boxShadow: "none",
                  padding: 0,
                },
              },
            }}
            tooltip={({ datum }) => {
              const tooltipInfo = brandTooltipData[datum.id as string];
              const productGroups = tooltipInfo?.productGroups || {};
              const totalUniqueProducts = tooltipInfo?.totalUniqueProducts || 0;
              return (
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 min-w-[240px]">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{datum.id}</p>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: datum.color }} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {datum.value.toLocaleString("tr-TR")} adet • {totalUniqueProducts} model
                    </p>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {Object.entries(productGroups)
                      .sort(([, a]: any, [, b]: any) => b.total - a.total)
                      .slice(0, 5)
                      .map(([group, data]: [string, any], index) => {
                        const percentage = ((data.total / datum.value) * 100).toFixed(1);
                        return (
                          <div key={index} className="flex items-center justify-between gap-2">
                            <span className="text-slate-600 dark:text-slate-300 truncate">{group}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-bold text-slate-900 dark:text-white">{data.total}</span>
                              <Badge variant="outline" className="text-[10px] py-0 px-1 h-4 bg-slate-50">
                                %{percentage}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            }}
            onClick={({ id }) => setSelectedBrand(id as string)}
            legends={[]}
          />
        </div>

        {/* Kompakt Marka Etiketleri */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 max-h-[76px] overflow-y-auto">
          {brandColors.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedBrand(item.id)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate max-w-[90px]">{item.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
