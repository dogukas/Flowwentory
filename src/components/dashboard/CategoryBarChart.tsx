"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveBar } from "@nivo/bar";

interface CategoryBarChartProps {
  categoryBarData: any[];
}

export function CategoryBarChart({ categoryBarData }: CategoryBarChartProps) {
  return (
    <Card className="col-span-12 lg:col-span-5 h-[390px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl">
      <CardHeader className="pb-2 pt-5 px-5 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-2 h-5 bg-indigo-600 rounded-full" />
            Kategori Performans Analizi
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 pl-4">
            En yüksek hacimli ürün gruplarında Stok vs. Satış
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /> Stok
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Satış
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-4 flex-1 min-h-0">
        <div className="h-full w-full">
          <ResponsiveBar
            data={categoryBarData}
            keys={["Stok", "Satış"]}
            indexBy="group"
            margin={{ top: 10, right: 12, bottom: 42, left: 46 }}
            padding={0.32}
            groupMode="grouped"
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={["#6366f1", "#10b981"]}
            borderRadius={4}
            borderWidth={0}
            enableGridX={false}
            gridYValues={5}
            enableLabel={false}
            theme={{
              grid: {
                line: {
                  stroke: "#f1f5f9",
                  strokeWidth: 1,
                },
              },
              axis: {
                ticks: {
                  text: {
                    fontSize: 10,
                    fill: "#64748b",
                  },
                },
              },
              tooltip: {
                container: {
                  background: "transparent",
                  boxShadow: "none",
                  padding: 0,
                },
              },
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: -18,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: 0,
              tickValues: 5,
            }}
            role="application"
            ariaLabel="Category Performance Chart"
            tooltip={({ id, value, color, indexValue }) => (
              <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-lg text-xs flex flex-col gap-1 min-w-[130px]">
                <span className="font-semibold text-slate-300">{indexValue}</span>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    {id}:
                  </span>
                  <span className="font-bold">{Number(value).toLocaleString("tr-TR")}</span>
                </div>
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
