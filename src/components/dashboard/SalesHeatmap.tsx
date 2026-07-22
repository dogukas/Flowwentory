import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Grid } from "lucide-react";

interface HeatmapData {
  brands: string[];
  categories: string[];
  data: Array<{ brand: string; category: string; sales: number }>;
}

export function SalesHeatmap({ heatmapData }: { heatmapData: HeatmapData }) {
  const { brands, categories, data } = heatmapData;

  // Find max sales to calculate color intensity
  const maxSales = Math.max(...data.map(d => d.sales), 1);

  // Helper to get color based on intensity (0 to 1)
  const getCellColor = (sales: number) => {
    if (sales === 0) return 'bg-slate-50/30 dark:bg-slate-800/20'; // Boş
    const intensity = sales / maxSales;
    
    if (intensity > 0.8) return 'bg-indigo-600 text-white';
    if (intensity > 0.6) return 'bg-indigo-500 text-white';
    if (intensity > 0.4) return 'bg-indigo-400 text-white';
    if (intensity > 0.2) return 'bg-indigo-300 text-slate-900';
    if (intensity > 0.1) return 'bg-indigo-200 text-slate-800';
    return 'bg-indigo-100 text-slate-700';
  };

  // Build matrix
  const matrix: Record<string, Record<string, number>> = {};
  brands.forEach(b => {
    matrix[b] = {};
    categories.forEach(c => {
      matrix[b][c] = 0;
    });
  });

  data.forEach(item => {
    if (matrix[item.brand] && matrix[item.brand][item.category] !== undefined) {
      matrix[item.brand][item.category] = item.sales;
    }
  });

  return (
    <Card className="dashboard-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-2xl col-span-12">
      <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <Grid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Satış Hacmi Isı Haritası
            </CardTitle>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Marka ve ürün gruplarına göre satış yoğunluğu</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="p-4 min-w-max">
            <div className="flex">
              {/* Top-left empty corner */}
              <div className="w-32 shrink-0 p-2 border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50" />
              
              {/* Category Headers */}
              {categories.map(cat => (
                <div key={cat} className="w-24 shrink-0 p-2 border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-semibold text-slate-600 dark:text-slate-300 text-center flex flex-col justify-end truncate">
                  {cat}
                </div>
              ))}
            </div>

            {/* Rows */}
            {brands.map(brand => (
              <div key={brand} className="flex group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                {/* Brand Header */}
                <div className="w-32 shrink-0 p-2 border-b border-r border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center truncate bg-white dark:bg-slate-900 group-hover:bg-transparent">
                  {brand}
                </div>
                
                {/* Cells */}
                {categories.map(cat => {
                  const val = matrix[brand][cat];
                  return (
                    <div 
                      key={cat} 
                      className={`w-24 shrink-0 border-b border-r border-slate-100 dark:border-slate-800 p-1 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:z-10 relative cursor-default`}
                    >
                      <div className={`w-full h-full rounded-md flex items-center justify-center text-[10px] font-semibold ${getCellColor(val)}`}>
                        {val > 0 ? val.toLocaleString('tr-TR') : '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
