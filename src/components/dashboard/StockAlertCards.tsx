import { Card } from "@/components/ui/card";
import { Clock, AlertCircle, TrendingDown, Package2, TrendingUp, LineChart } from "lucide-react";
import { motion } from "framer-motion";

interface StockAlertCardsProps {
  stockOutGroupsCount: number;
  stockOutCount: number;
  stockOutPercentage: string;
  setStockOutDialogOpen: (val: boolean) => void;

  deadStockGroupsCount: number;
  deadStockCount: number;
  deadStockPercentage: string;
  setDeadStockDialogOpen: (val: boolean) => void;

  lowStockGroupsCount: number;
  lowStockCount: number;
  lowStockPercentage: string;
  setLowStockDialogOpen: (val: boolean) => void;

  mediumStockGroupsCount: number;
  mediumStockCount: number;
  mediumStockPercentage: string;
  setMediumStockDialogOpen: (val: boolean) => void;

  highStockGroupsCount: number;
  highStockCount: number;
  highStockPercentage: string;
  setHighStockDialogOpen: (val: boolean) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function StockAlertCards({
  stockOutGroupsCount,
  stockOutCount,
  stockOutPercentage,
  setStockOutDialogOpen,
  deadStockGroupsCount,
  deadStockCount,
  deadStockPercentage,
  setDeadStockDialogOpen,
  lowStockGroupsCount,
  lowStockCount,
  lowStockPercentage,
  setLowStockDialogOpen,
  mediumStockGroupsCount,
  mediumStockCount,
  mediumStockPercentage,
  setMediumStockDialogOpen,
  highStockGroupsCount,
  highStockCount,
  highStockPercentage,
  setHighStockDialogOpen
}: StockAlertCardsProps) {
  return (
    <motion.div 
      className="col-span-12 lg:col-span-4 flex flex-col gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Forecast / Stock-out Card */}
      <motion.button variants={itemVariants} onClick={() => setStockOutDialogOpen(true)} className="text-left w-full group">
        <Card className="border-l-4 border-l-purple-500 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-3xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="p-4 flex justify-between items-center relative z-10">
            <div>
              <p className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Tükenme Riski (15 Gün)
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stockOutGroupsCount}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">Kritik SKU • {stockOutCount.toLocaleString('tr-TR')} Adet</p>
            </div>
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 transition-colors">
              <LineChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="px-5 pb-4 pt-1 relative z-10"><div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-purple-500 h-full rounded-full" style={{ width: `${stockOutPercentage}%` }} /></div></div>
        </Card>
      </motion.button>

      {/* Dead Stock Card */}
      <motion.button variants={itemVariants} onClick={() => setDeadStockDialogOpen(true)} className="text-left w-full group">
        <Card className="border-l-4 border-l-rose-500 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-3xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="p-4 flex justify-between items-center relative z-10">
            <div>
              <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Ölü Stok Riski
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{deadStockCount.toLocaleString('tr-TR')}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">%{deadStockPercentage} • {deadStockGroupsCount} SKU (Sıfır Satış)</p>
            </div>
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-colors">
              <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div className="px-5 pb-4 pt-1 relative z-10"><div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-rose-500 h-full rounded-full" style={{ width: `${deadStockPercentage}%` }} /></div></div>
        </Card>
      </motion.button>

      {/* Low Stock Card */}
      <motion.button variants={itemVariants} onClick={() => setLowStockDialogOpen(true)} className="text-left w-full group">
        <Card className="border-l-4 border-l-amber-500 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-3xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="p-4 flex justify-between items-center relative z-10">
            <div>
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" /> Düşük Stok
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{lowStockCount.toLocaleString('tr-TR')}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">%{lowStockPercentage} • {lowStockGroupsCount} SKU</p>
            </div>
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors">
              <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="px-5 pb-4 pt-1 relative z-10"><div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-amber-500 h-full rounded-full" style={{ width: `${lowStockPercentage}%` }} /></div></div>
        </Card>
      </motion.button>

      {/* Medium Stock Card */}
      <motion.button variants={itemVariants} onClick={() => setMediumStockDialogOpen(true)} className="text-left w-full group">
        <Card className="border-l-4 border-l-sky-500 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-3xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="p-4 flex justify-between items-center relative z-10">
            <div>
              <p className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Package2 className="w-3.5 h-3.5" /> Orta Stok (4-6)
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{mediumStockCount.toLocaleString('tr-TR')}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">%{mediumStockPercentage} • {mediumStockGroupsCount} SKU</p>
            </div>
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 group-hover:bg-sky-100 dark:group-hover:bg-sky-500/20 transition-colors">
              <Package2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <div className="px-5 pb-4 pt-1 relative z-10"><div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-sky-500 h-full rounded-full" style={{ width: `${mediumStockPercentage}%` }} /></div></div>
        </Card>
      </motion.button>

      {/* High Stock Card */}
      <motion.button variants={itemVariants} onClick={() => setHighStockDialogOpen(true)} className="text-left w-full group">
        <Card className="border-l-4 border-l-emerald-500 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-3xl group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="p-4 flex justify-between items-center relative z-10">
            <div>
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Yüksek Stok (7+)
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{highStockCount.toLocaleString('tr-TR')}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">%{highStockPercentage} • {highStockGroupsCount} SKU</p>
            </div>
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="px-5 pb-4 pt-1 relative z-10"><div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: `${highStockPercentage}%` }} /></div></div>
        </Card>
      </motion.button>
    </motion.div>
  );
}
