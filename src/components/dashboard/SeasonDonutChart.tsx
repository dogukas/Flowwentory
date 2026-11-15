"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsivePie } from "@nivo/pie";

interface SeasonDonutChartProps {
  seasonData: any[];
  totalInventory: number;
}

const SEASON_PALETTE = ["#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#6366f1"];

export function SeasonDonutChart({ seasonData, totalInventory }: SeasonDonutChartProps) {
  const coloredSeasons = seasonData.map((s, idx) => ({
    ...s,
    color: SEASON_PALETTE[idx % SEASON_PALETTE.length],
  }));

  return (
    <Card className="col-span-12 lg:col-span-3 h-[390px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl">
      <CardHeader className="pb-1 pt-5 px-5">
        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-5 bg-sky-500 rounded-full" />
            Sezon Dağılımı
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {coloredSeasons.length} Sezon
          </span>
        </CardTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 pl-4">
          Aktif sezon ağırlıkları
        </p>
      </CardHeader>

      <CardContent className="px-4 pb-4 flex-1 flex flex-col justify-between min-h-0">
        <div className="relative h-[200px] w-full">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {coloredSeasons.length}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Aktif Sezon
            </span>
          </div>

          <ResponsivePie
            data={coloredSeasons}
            colors={{ datum: "data.color" }}
            margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
            innerRadius={0.72}
            padAngle={2}
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
            tooltip={({ datum }) => (
              <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-lg text-xs flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: datum.color }} />
                <span className="font-semibold">{datum.id}:</span>
                <span className="font-bold">{datum.value.toLocaleString("tr-TR")} adet</span>
              </div>
            )}
            legends={[]}
          />
        </div>

        {/* Sezon Listesi ve Oranları */}
        <div className="space-y-1.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 max-h-[95px] overflow-y-auto">
          {coloredSeasons
            .slice()
            .sort((a, b) => b.value - a.value)
            .map(item => {
              const pct = totalInventory > 0 ? ((item.value / totalInventory) * 100).toFixed(1) : "0";
              return (
                <div key={item.id} className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.value.toLocaleString("tr-TR")}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      %{pct}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
