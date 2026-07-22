import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });

interface GaugeMetricsProps {
  totalTurnoverRate: number;
}

export function GaugeMetrics({ totalTurnoverRate }: GaugeMetricsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="col-span-12 lg:col-span-4 h-full"
    >
      <Card className="h-full flex flex-col dashboard-card bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
        <CardHeader className="pb-1 pt-6 px-6">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="w-2 h-6 bg-cyan-500 rounded-full" />
            Stok Devir Hızı
          </CardTitle>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 pl-4">Tüm markalar için genel satış / stok oranı</p>
        </CardHeader>
        <CardContent className="px-4 pb-6 flex-1 flex flex-col items-center justify-center relative">
          
          <div className="w-full max-w-[260px] relative z-10">
            <GaugeComponent
              type="semicircle"
              arc={{
                width: 0.15,
                padding: 0.02,
                cornerRadius: 2,
                subArcs: [
                  { limit: 0.5, color: '#f43f5e' }, // rose-500
                  { limit: 1.0, color: '#f59e0b' }, // amber-500
                  { limit: 3.0, color: '#10b981' }  // emerald-500
                ]
              }}
              pointer={{
                type: "needle",
                color: '#64748b',
                length: 0.70,
                width: 15,
                elastic: true,
              }}
              labels={{
                valueLabel: { 
                  formatTextValue: value => value + '%',
                  style: { fontSize: '35px', fill: '#0f172a', textShadow: 'none', fontWeight: 'bold' }
                },
                tickLabels: {
                  type: 'outer',
                  ticks: [
                    { value: 0 },
                    { value: 3.0 }
                  ]
                }
              }}
              value={totalTurnoverRate}
              minValue={0}
              maxValue={3.0}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
