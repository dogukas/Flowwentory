import { Card, CardContent } from "@/components/ui/card";
import { Check, AlertCircle, PackageSearch, Layers, Box, Tag } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardsProps {
  totalInventory: number;
  uniqueProducts: number;
  uniqueBrandsCount: number;
  uniqueProductGroupsCount: number;
  totalProductsCount: number;
  allCategoriesPercentage: string;
  totalCategorizedStock: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function MetricCards({
  totalInventory,
  uniqueProducts,
  uniqueBrandsCount,
  uniqueProductGroupsCount,
  totalProductsCount,
  allCategoriesPercentage,
  totalCategorizedStock
}: MetricCardsProps) {
  return (
    <motion.div 
      className="col-span-12 lg:col-span-4 flex flex-col gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Envanter Skoru Kartı */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-indigo-600" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Envanter Skoru</p>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                <PackageSearch className="w-4 h-4" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{totalInventory.toLocaleString('tr-TR')}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Toplam Stok Adedi</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{uniqueProducts.toLocaleString('tr-TR')}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Benzersiz SKU</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Portföy Özeti Kartı */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-fuchsia-600" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Portföy Özeti</p>
              <div className="p-2 bg-violet-50 dark:bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{uniqueBrandsCount}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase">Marka</p>
              </div>
              <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{uniqueProductGroupsCount}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase">Grup</p>
              </div>
              <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-fuchsia-600 dark:text-fuchsia-400">{totalProductsCount.toLocaleString('tr-TR')}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase">Barkod</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Veri Doğrulama Kartı */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${totalCategorizedStock === totalInventory ? 'from-emerald-500 to-emerald-600' : 'from-amber-500 to-amber-600'}`} />
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Veri Doğrulama</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{allCategoriesPercentage}%</p>
                <p className="text-xs text-slate-500 font-medium">Kategorize Edildi</p>
              </div>
            </div>
            {totalCategorizedStock === totalInventory ? (
              <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Check className="h-6 w-6 mb-1" />
                <span className="text-[10px] font-bold">Tamam</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-3 py-2 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                <AlertCircle className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-bold whitespace-nowrap">Fark: {totalInventory - totalCategorizedStock}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
