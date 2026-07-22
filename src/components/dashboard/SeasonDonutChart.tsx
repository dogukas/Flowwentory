import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsivePie } from "@nivo/pie";
import { motion } from "framer-motion";

interface SeasonDonutChartProps {
  seasonData: any[];
  totalInventory: number;
}

export function SeasonDonutChart({ seasonData, totalInventory }: SeasonDonutChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="col-span-12 lg:col-span-4 h-full"
    >
      <Card className="h-full flex flex-col dashboard-card bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
        <CardHeader className="pb-1 pt-6 px-6">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="w-2 h-6 bg-violet-500 rounded-full" />
            Sezonluk Dağılım
          </CardTitle>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 pl-4">Hangi sezon ürünleri ağırlıkta?</p>
        </CardHeader>
        <CardContent className="px-4 pb-6 flex-1 flex flex-col justify-center relative">
          
          {/* Custom Center Metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 mt-6">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {totalInventory.toLocaleString('tr-TR')}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">
              Stok
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsivePie
              data={seasonData}
              margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
              innerRadius={0.75}
              padAngle={2}
              cornerRadius={6}
              activeOuterRadiusOffset={8}
              colors={{ scheme: 'set3' }}
              borderWidth={0}
              enableArcLinkLabels={false}
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
              tooltip={({ datum }) => (
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-1 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: datum.color }} />
                    <strong className="text-slate-800 dark:text-slate-100 text-sm">{datum.id}:</strong>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Stok:</span>
                    <span className="text-slate-900 dark:text-white font-bold ml-auto">{datum.value.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              )}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 35,
                  itemsSpacing: 10,
                  itemWidth: 60,
                  itemHeight: 18,
                  itemTextColor: '#64748b',
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: '#0f172a'
                      }
                    }
                  ]
                }
              ]}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
