import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveBar } from "@nivo/bar";
import { motion } from "framer-motion";

interface CategoryBarChartProps {
  categoryBarData: any[];
}

export function CategoryBarChart({ categoryBarData }: CategoryBarChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="col-span-12 h-full"
    >
      <Card className="h-full flex flex-col dashboard-card bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
        <CardHeader className="pb-1 pt-6 px-6">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="w-2 h-6 bg-emerald-500 rounded-full" />
            Kategori Performans Analizi
          </CardTitle>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 pl-4">
            En yüksek stoklu ürün gruplarının Stok vs. Satış karşılaştırması
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-6 flex-1 flex flex-col justify-center mt-4">
          <div className="h-[300px] w-full">
            <ResponsiveBar
              data={categoryBarData}
              keys={['Stok', 'Satış']}
              indexBy="group"
              margin={{ top: 10, right: 10, bottom: 40, left: 50 }}
              padding={0.3}
              groupMode="grouped"
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={['#818cf8', '#34d399']} // Indigo-400 and Emerald-400
              borderRadius={6} // Rounded tops
              borderWidth={0}
              enableGridX={false}
              gridYValues={5}
              theme={{
                grid: {
                  line: {
                    stroke: '#e2e8f0', // slate-200
                    strokeWidth: 1,
                    strokeDasharray: '4 4'
                  }
                },
                axis: {
                  ticks: {
                    text: {
                      fontSize: 11,
                      fill: '#64748b' // slate-500
                    }
                  }
                },
                tooltip: {
                  container: {
                    background: 'transparent',
                    boxShadow: 'none',
                    padding: 0,
                  }
                }
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 0,
                tickPadding: 10,
                tickRotation: 0,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 10,
                tickRotation: 0,
                tickValues: 5,
              }}
              labelSkipWidth={16}
              labelSkipHeight={16}
              labelTextColor="#ffffff"
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'top-right',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: -30,
                  itemsSpacing: 20,
                  itemWidth: 80,
                  itemHeight: 20,
                  itemDirection: 'left-to-right',
                  itemOpacity: 0.85,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  effects: [{ on: 'hover', style: { itemOpacity: 1 } }]
                }
              ]}
              role="application"
              ariaLabel="Category Performance Chart"
              tooltip={({ id, value, color, indexValue }) => (
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-1 min-w-[140px]">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{indexValue}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <strong className="text-slate-800 dark:text-slate-100 text-sm">{id}:</strong>
                    <span className="text-slate-900 dark:text-white font-bold ml-auto">{value.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
