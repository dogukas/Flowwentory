"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  PackageSearch,
  Layers,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Wallet,
  Activity,
} from "lucide-react";

interface MetricCardsProps {
  totalInventory: number;
  uniqueProducts: number;
  uniqueBrandsCount: number;
  uniqueProductGroupsCount: number;
  totalProductsCount: number;
  allCategoriesPercentage: string;
  totalCategorizedStock: number;
  totalTurnoverRate?: number;
  stockOutGroupsCount?: number;
  stockOutCount?: number;
  setStockOutDialogOpen?: (val: boolean) => void;
  deadStockGroupsCount?: number;
  deadStockCount?: number;
  setDeadStockDialogOpen?: (val: boolean) => void;
}

export function MetricCards({
  totalInventory,
  uniqueProducts,
  uniqueBrandsCount,
  uniqueProductGroupsCount,
  totalProductsCount,
  totalTurnoverRate = 0,
  stockOutGroupsCount = 0,
  stockOutCount = 0,
  setStockOutDialogOpen,
  deadStockGroupsCount = 0,
  deadStockCount = 0,
  setDeadStockDialogOpen,
}: MetricCardsProps) {
  const estimatedInventoryCapital = totalInventory * 580;
  const potentialRevenueLoss = stockOutCount * 1150;
  const tiedUpDeadCash = deadStockCount * 580;
  const turnoverPercent = Math.min(100, Math.round((totalTurnoverRate / 2.0) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {/* KPI 1: Toplam Envanter & Sermaye */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Toplam Envanter & Sermaye
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <PackageSearch className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {totalInventory.toLocaleString("tr-TR")}
              </span>
              <span className="text-xs font-semibold text-slate-500">Adet Stok</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Benzersiz Model</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {uniqueProducts.toLocaleString("tr-TR")} SKU
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Barkod Varyantı</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {totalProductsCount.toLocaleString("tr-TR")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-indigo-500" /> Sermaye Değeri:
            </span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
              {estimatedInventoryCapital.toLocaleString("tr-TR")} ₺
            </span>
          </div>
        </CardContent>
      </Card>

      {/* KPI 2: Portföy & Stok Devir Hızı (STR) */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Portföy & Devir Hızı (STR)
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {totalTurnoverRate}x
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {totalTurnoverRate >= 1.0 ? "Yüksek Hız" : totalTurnoverRate >= 0.5 ? "İdeal Hız" : "Yavaş"}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Hedef: 1.50x</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.max(12, turnoverPercent)}%` }}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Aktif Marka</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{uniqueBrandsCount} Marka</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Ürün Grubu</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{uniqueProductGroupsCount} Kategori</p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-500" /> Satış / Stok Oranı
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              %{Math.round(totalTurnoverRate * 100)} Dönüşüm
            </span>
          </div>
        </CardContent>
      </Card>

      {/* KPI 3: 15 Günlük Tükenme & Ciro Riski */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                15 Günlük Tükenme Riski
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {stockOutGroupsCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Kritik SKU ({stockOutCount.toLocaleString("tr-TR")} Adet)
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">15 Günlük Olası Ciro Kaybı</p>
                <p className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                  ~{potentialRevenueLoss.toLocaleString("tr-TR")} ₺
                </p>
              </div>
              {setStockOutDialogOpen && (
                <button
                  onClick={() => setStockOutDialogOpen(true)}
                  className="text-xs font-semibold text-slate-600 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Ürünleri Gör
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Acil İkmal Önerisi:</span>
            <Link
              href="/operations/planning"
              className="font-bold text-purple-600 hover:text-purple-700 flex items-center gap-0.5"
            >
              RPT Siparişi Geç <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* KPI 4: Ölü Stok & Hareketsiz Nakit */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Hareketsiz (Ölü) Stok
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {deadStockCount.toLocaleString("tr-TR")}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Adet ({deadStockGroupsCount} SKU)
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Depoda Bağlı Kalan Nakit</p>
                <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                  {tiedUpDeadCash.toLocaleString("tr-TR")} ₺
                </p>
              </div>
              {setDeadStockDialogOpen && (
                <button
                  onClick={() => setDeadStockDialogOpen(true)}
                  className="text-xs font-semibold text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Ürünleri Gör
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Nakit Kurtarma:</span>
            <Link
              href="/operations/planning"
              className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
            >
              Markdown / Eritme <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
