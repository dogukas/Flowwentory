import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertCircle, TrendingDown, Package2, TrendingUp, Clock, Check } from "lucide-react";
import { GroupedStockItem } from "@/types/stock";

interface StockAlertsDialogsProps {
  uniqueBrands: string[];
  uniqueProductGroups: string[];
  
  deadStockDialogOpen: boolean;
  setDeadStockDialogOpen: (open: boolean) => void;
  deadStockSearch: string;
  setDeadStockSearch: (val: string) => void;
  deadStockFilters: { brand: string, group: string };
  setDeadStockFilters: (val: { brand: string, group: string } | ((prev: { brand: string, group: string }) => { brand: string, group: string })) => void;
  deadStockGroups: GroupedStockItem[];

  lowStockDialogOpen: boolean;
  setLowStockDialogOpen: (open: boolean) => void;
  lowStockSearch: string;
  setLowStockSearch: (val: string) => void;
  lowStockFilters: { brand: string, group: string };
  setLowStockFilters: (val: { brand: string, group: string } | ((prev: { brand: string, group: string }) => { brand: string, group: string })) => void;
  lowStockGroups: GroupedStockItem[];

  mediumStockDialogOpen: boolean;
  setMediumStockDialogOpen: (open: boolean) => void;
  mediumStockSearch: string;
  setMediumStockSearch: (val: string) => void;
  mediumStockFilters: { brand: string, group: string };
  setMediumStockFilters: (val: { brand: string, group: string } | ((prev: { brand: string, group: string }) => { brand: string, group: string })) => void;
  mediumStockGroups: GroupedStockItem[];

  highStockDialogOpen: boolean;
  setHighStockDialogOpen: (open: boolean) => void;
  highStockSearch: string;
  setHighStockSearch: (val: string) => void;
  highStockFilters: { brand: string, group: string };
  setHighStockFilters: (val: { brand: string, group: string } | ((prev: { brand: string, group: string }) => { brand: string, group: string })) => void;
  highStockGroups: GroupedStockItem[];

  stockOutDialogOpen: boolean;
  setStockOutDialogOpen: (open: boolean) => void;
  stockOutSearch: string;
  setStockOutSearch: (val: string) => void;
  stockOutGroups: any[];
}

export function StockAlertsDialogs({
  uniqueBrands, uniqueProductGroups,
  deadStockDialogOpen, setDeadStockDialogOpen, deadStockSearch, setDeadStockSearch, deadStockFilters, setDeadStockFilters, deadStockGroups,
  lowStockDialogOpen, setLowStockDialogOpen, lowStockSearch, setLowStockSearch, lowStockFilters, setLowStockFilters, lowStockGroups,
  mediumStockDialogOpen, setMediumStockDialogOpen, mediumStockSearch, setMediumStockSearch, mediumStockFilters, setMediumStockFilters, mediumStockGroups,
  highStockDialogOpen, setHighStockDialogOpen, highStockSearch, setHighStockSearch, highStockFilters, setHighStockFilters, highStockGroups,
  stockOutDialogOpen, setStockOutDialogOpen, stockOutSearch, setStockOutSearch, stockOutGroups
}: StockAlertsDialogsProps) {
  return (
    <>
      {/* Dead Stock Dialog */}
      <Dialog open={deadStockDialogOpen} onOpenChange={(open) => { 
        setDeadStockDialogOpen(open); 
        if (!open) { setDeadStockSearch(""); setDeadStockFilters({ brand: "all", group: "all" }); } 
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] p-0 overflow-hidden border-none shadow-[0_20px_50px_rgba(225,29,72,0.15)] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="bg-gradient-to-r from-rose-50 to-rose-100/30 p-6 border-b border-rose-100/50">
            <DialogTitle className="flex items-center gap-3 text-rose-700 text-xl font-bold">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shadow-inner">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
              Ölü Stok / Hareketsiz Ürünler
              <Badge className="ml-auto bg-white/60 text-rose-700 hover:bg-white/80 border border-rose-200 shadow-sm px-3 py-1 text-xs">
                {deadStockGroups.length} Farklı Ürün
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="bg-slate-50/50 p-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                <Input 
                  placeholder="Ürün kodu veya grup ara..." 
                  className="pl-10 bg-white border-slate-200 focus-visible:ring-rose-500/50 h-10 rounded-xl shadow-sm text-sm transition-all"
                  value={deadStockSearch}
                  onChange={(e) => setDeadStockSearch(e.target.value)}
                />
              </div>
              <Select value={deadStockFilters.brand} onValueChange={(val) => setDeadStockFilters(prev => ({ ...prev, brand: val }))}>
                <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white border-slate-200 rounded-xl shadow-sm text-sm focus:ring-rose-500/50">
                  <SelectValue placeholder="Marka Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Markalar</SelectItem>
                  {uniqueBrands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={deadStockFilters.group} onValueChange={(val) => setDeadStockFilters(prev => ({ ...prev, group: val }))}>
                <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white border-slate-200 rounded-xl shadow-sm text-sm focus:ring-rose-500/50">
                  <SelectValue placeholder="Grup Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Gruplar</SelectItem>
                  {uniqueProductGroups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="h-[45vh] sm:h-[50vh] p-4 bg-slate-50/30">
            <div className="space-y-4">
              {deadStockGroups
                .filter(g => {
                  const matchesSearch = 
                    (g.Marka || "").toLowerCase().includes(deadStockSearch.toLowerCase()) || 
                    (g["Ürün Kodu"] || "").toLowerCase().includes(deadStockSearch.toLowerCase()) ||
                    (g["Ürün Grubu"] || "").toLowerCase().includes(deadStockSearch.toLowerCase());
                  const matchesBrand = deadStockFilters.brand === "all" || g.Marka === deadStockFilters.brand;
                  const matchesGroup = deadStockFilters.group === "all" || g["Ürün Grubu"] === deadStockFilters.group;
                  return matchesSearch && matchesBrand && matchesGroup;
                })
                .map((group, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200/60 rounded-2xl hover:border-rose-300 hover:shadow-[0_8px_20px_rgba(225,29,72,0.08)] transition-all duration-300 group/card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50/50 flex items-center justify-center flex-shrink-0 group-hover/card:scale-110 group-hover/card:bg-rose-100 transition-all duration-300">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 text-lg leading-none">{group.Marka}</h4>
                        <Badge variant="secondary" className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0">
                          {group["Ürün Grubu"]}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 font-medium font-mono">
                        {group["Ürün Kodu"]} <span className="text-slate-300 mx-1.5">•</span> Renk: <span className="text-slate-700">{group["Renk Kodu"]}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-3 sm:gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 font-bold text-sm px-4 py-1.5 shadow-sm transition-colors">
                      Stok: {group.totalEnvanter} (Satış Yok)
                    </Badge>
                    <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                      {group.bedenler.map((b, i) => (
                        <div key={i} className="flex items-center text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5">
                          <span className="text-slate-500 mr-1">{b.beden}:</span>
                          <span className="text-slate-900 font-bold">{b.envanter}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Low Stock Dialog */}
      <Dialog open={lowStockDialogOpen} onOpenChange={(open) => { 
        setLowStockDialogOpen(open); 
        if (!open) { setLowStockSearch(""); setLowStockFilters({ brand: "all", group: "all" }); } 
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] p-0 overflow-hidden border-none shadow-[0_20px_50px_rgba(249,115,22,0.15)] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="bg-gradient-to-r from-orange-50 to-orange-100/30 p-6 border-b border-orange-100/50">
            <DialogTitle className="flex items-center gap-3 text-orange-700 text-xl font-bold">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shadow-inner">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
              Düşük Stok Detayları
              <Badge className="ml-auto bg-white/60 text-orange-700 hover:bg-white/80 border border-orange-200 shadow-sm px-3 py-1 text-xs">
                {lowStockGroups.length} Farklı Ürün
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="bg-slate-50/50 p-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <Input 
                  placeholder="Ürün kodu veya grup ara..." 
                  className="pl-10 bg-white border-slate-200 focus-visible:ring-orange-500/50 h-10 rounded-xl shadow-sm text-sm transition-all"
                  value={lowStockSearch}
                  onChange={(e) => setLowStockSearch(e.target.value)}
                />
              </div>
              <Select value={lowStockFilters.brand} onValueChange={(val) => setLowStockFilters(prev => ({ ...prev, brand: val }))}>
                <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white border-slate-200 rounded-xl shadow-sm text-sm focus:ring-orange-500/50">
                  <SelectValue placeholder="Marka Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Markalar</SelectItem>
                  {uniqueBrands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={lowStockFilters.group} onValueChange={(val) => setLowStockFilters(prev => ({ ...prev, group: val }))}>
                <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white border-slate-200 rounded-xl shadow-sm text-sm focus:ring-orange-500/50">
                  <SelectValue placeholder="Grup Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Gruplar</SelectItem>
                  {uniqueProductGroups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="h-[45vh] sm:h-[50vh] p-4 bg-slate-50/30">
            <div className="space-y-4">
              {lowStockGroups
                .filter(g => {
                  const matchesSearch = 
                    (g.Marka || "").toLowerCase().includes(lowStockSearch.toLowerCase()) || 
                    (g["Ürün Kodu"] || "").toLowerCase().includes(lowStockSearch.toLowerCase()) ||
                    (g["Ürün Grubu"] || "").toLowerCase().includes(lowStockSearch.toLowerCase());
                  const matchesBrand = lowStockFilters.brand === "all" || g.Marka === lowStockFilters.brand;
                  const matchesGroup = lowStockFilters.group === "all" || g["Ürün Grubu"] === lowStockFilters.group;
                  return matchesSearch && matchesBrand && matchesGroup;
                })
                .map((group, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200/60 rounded-2xl hover:border-orange-300 hover:shadow-[0_8px_20px_rgba(249,115,22,0.08)] transition-all duration-300 group/card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50/50 flex items-center justify-center flex-shrink-0 group-hover/card:scale-110 group-hover/card:bg-orange-100 transition-all duration-300">
                      <TrendingDown className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 text-lg leading-none">{group.Marka}</h4>
                        <Badge variant="secondary" className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0">
                          {group["Ürün Grubu"]}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 font-medium font-mono">
                        {group["Ürün Kodu"]} <span className="text-slate-300 mx-1.5">•</span> Renk: <span className="text-slate-700">{group["Renk Kodu"]}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-3 sm:gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 font-bold text-sm px-4 py-1.5 shadow-sm transition-colors">
                      Sadece {group.totalEnvanter} Adet Kaldı
                    </Badge>
                    <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                      {group.bedenler.map((b, i) => (
                        <div key={i} className="flex items-center text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5">
                          <span className="text-slate-500 mr-1">{b.beden}:</span>
                          <span className="text-slate-900 font-bold">{b.envanter}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Medium Stock Dialog */}
      <Dialog open={mediumStockDialogOpen} onOpenChange={(open) => { 
        setMediumStockDialogOpen(open); 
        if (!open) { setMediumStockSearch(""); setMediumStockFilters({ brand: "all", group: "all" }); } 
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] p-0 overflow-hidden border-none shadow-[0_20px_50px_rgba(14,165,233,0.15)] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="bg-gradient-to-r from-sky-50 to-sky-100/30 p-6 border-b border-sky-100/50">
            <DialogTitle className="flex items-center gap-3 text-sky-700 text-xl font-bold">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shadow-inner">
                <Package2 className="h-6 w-6 text-sky-600" />
              </div>
              Orta Seviye Stok Detayları
              <Badge className="ml-auto bg-white/60 text-sky-700 hover:bg-white/80 border border-sky-200 shadow-sm px-3 py-1 text-xs">
                {mediumStockGroups.length} Farklı Ürün
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="bg-slate-50/50 p-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                <Input 
                  placeholder="Ürün kodu veya grup ara..." 
                  className="pl-10 bg-white border-slate-200 focus-visible:ring-sky-500/50 h-10 rounded-xl shadow-sm text-sm transition-all"
                  value={mediumStockSearch}
                  onChange={(e) => setMediumStockSearch(e.target.value)}
                />
              </div>
              <Select value={mediumStockFilters.brand} onValueChange={(val) => setMediumStockFilters(prev => ({ ...prev, brand: val }))}>
                <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white border-slate-200 rounded-xl shadow-sm text-sm focus:ring-sky-500/50">
                  <SelectValue placeholder="Marka Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Markalar</SelectItem>
                  {uniqueBrands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={mediumStockFilters.group} onValueChange={(val) => setMediumStockFilters(prev => ({ ...prev, group: val }))}>
                <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white border-slate-200 rounded-xl shadow-sm text-sm focus:ring-sky-500/50">
                  <SelectValue placeholder="Grup Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Gruplar</SelectItem>
                  {uniqueProductGroups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="h-[45vh] sm:h-[50vh] p-4 bg-slate-50/30">
            <div className="space-y-4">
              {mediumStockGroups
                .filter(g => {
                  const matchesSearch = 
                    (g.Marka || "").toLowerCase().includes(mediumStockSearch.toLowerCase()) || 
                    (g["Ürün Kodu"] || "").toLowerCase().includes(mediumStockSearch.toLowerCase()) ||
                    (g["Ürün Grubu"] || "").toLowerCase().includes(mediumStockSearch.toLowerCase());
                  const matchesBrand = mediumStockFilters.brand === "all" || g.Marka === mediumStockFilters.brand;
                  const matchesGroup = mediumStockFilters.group === "all" || g["Ürün Grubu"] === mediumStockFilters.group;
                  return matchesSearch && matchesBrand && matchesGroup;
                })
                .map((group, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200/60 rounded-2xl hover:border-sky-300 hover:shadow-[0_8px_20px_rgba(14,165,233,0.08)] transition-all duration-300 group/card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50/50 flex items-center justify-center flex-shrink-0 group-hover/card:scale-110 group-hover/card:bg-sky-100 transition-all duration-300">
                      <Package2 className="w-5 h-5 text-sky-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 text-lg leading-none">{group.Marka}</h4>
                        <Badge variant="secondary" className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0">
                          {group["Ürün Grubu"]}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 font-medium font-mono">
                        {group["Ürün Kodu"]} <span className="text-slate-300 mx-1.5">•</span> Renk: <span className="text-slate-700">{group["Renk Kodu"]}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-3 sm:gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-200 font-bold text-sm px-4 py-1.5 shadow-sm transition-colors">
                      Toplam {group.totalEnvanter} Adet
                    </Badge>
                    <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                      {group.bedenler.map((b, i) => (
                        <div key={i} className="flex items-center text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5">
                          <span className="text-slate-500 mr-1">{b.beden}:</span>
                          <span className="text-slate-900 font-bold">{b.envanter}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* High Stock Dialog */}
      <Dialog open={highStockDialogOpen} onOpenChange={(open) => { 
        setHighStockDialogOpen(open); 
        if (!open) { setHighStockSearch(""); setHighStockFilters({ brand: "all", group: "all" }); } 
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] p-0 overflow-hidden border-none shadow-[0_20px_50px_rgba(16,185,129,0.15)] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/30 p-6 border-b border-emerald-100/50">
            <DialogTitle className="flex items-center gap-3 text-emerald-700 text-xl font-bold">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shadow-inner">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              Yüksek Stok Detayları
              <Badge className="ml-auto bg-white/60 text-emerald-700 hover:bg-white/80 border border-emerald-200 shadow-sm px-3 py-1 text-xs">
                {highStockGroups.length} Farklı Ürün
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="bg-slate-50/50 p-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  placeholder="Ürün kodu veya grup ara..." 
                  className="pl-10 bg-white border-slate-200 focus-visible:ring-emerald-500/50 h-10 rounded-xl shadow-sm text-sm transition-all"
                  value={highStockSearch}
                  onChange={(e) => setHighStockSearch(e.target.value)}
                />
              </div>
              <Select value={highStockFilters.brand} onValueChange={(val) => setHighStockFilters(prev => ({ ...prev, brand: val }))}>
                <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white border-slate-200 rounded-xl shadow-sm text-sm focus:ring-emerald-500/50">
                  <SelectValue placeholder="Marka Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Markalar</SelectItem>
                  {uniqueBrands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={highStockFilters.group} onValueChange={(val) => setHighStockFilters(prev => ({ ...prev, group: val }))}>
                <SelectTrigger className="w-full sm:w-[160px] h-10 bg-white border-slate-200 rounded-xl shadow-sm text-sm focus:ring-emerald-500/50">
                  <SelectValue placeholder="Grup Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Gruplar</SelectItem>
                  {uniqueProductGroups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="h-[45vh] sm:h-[50vh] p-4 bg-slate-50/30">
            <div className="space-y-4">
              {highStockGroups
                .filter(g => {
                  const matchesSearch = 
                    (g.Marka || "").toLowerCase().includes(highStockSearch.toLowerCase()) || 
                    (g["Ürün Kodu"] || "").toLowerCase().includes(highStockSearch.toLowerCase()) ||
                    (g["Ürün Grubu"] || "").toLowerCase().includes(highStockSearch.toLowerCase());
                  const matchesBrand = highStockFilters.brand === "all" || g.Marka === highStockFilters.brand;
                  const matchesGroup = highStockFilters.group === "all" || g["Ürün Grubu"] === highStockFilters.group;
                  return matchesSearch && matchesBrand && matchesGroup;
                })
                .map((group, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200/60 rounded-2xl hover:border-emerald-300 hover:shadow-[0_8px_20px_rgba(16,185,129,0.08)] transition-all duration-300 group/card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50/50 flex items-center justify-center flex-shrink-0 group-hover/card:scale-110 group-hover/card:bg-emerald-100 transition-all duration-300">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 text-lg leading-none">{group.Marka}</h4>
                        <Badge variant="secondary" className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0">
                          {group["Ürün Grubu"]}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 font-medium font-mono">
                        {group["Ürün Kodu"]} <span className="text-slate-300 mx-1.5">•</span> Renk: <span className="text-slate-700">{group["Renk Kodu"]}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-3 sm:gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 font-bold text-sm px-4 py-1.5 shadow-sm transition-colors">
                      Toplam {group.totalEnvanter} Adet
                    </Badge>
                    <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                      {group.bedenler.map((b, i) => (
                        <div key={i} className="flex items-center text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5">
                          <span className="text-slate-500 mr-1">{b.beden}:</span>
                          <span className="text-slate-900 font-bold">{b.envanter}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Stock Out Dialog */}
      <Dialog open={stockOutDialogOpen} onOpenChange={setStockOutDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 rounded-2xl overflow-hidden">
          <DialogHeader className="p-5 border-b bg-gradient-to-r from-purple-50 to-violet-50">
            <DialogTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Tükenme Riski Tahmin Raporu
            </DialogTitle>
            <p className="text-xs text-purple-600 mt-1">
              15 gün içinde tükenme ihtimali olan SKU'lar • Satış hızına göre hesaplanmışlandır
            </p>
          </DialogHeader>

          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Marka veya ürün kodu ara..."
                className="pl-9 h-9 text-sm rounded-xl"
                value={stockOutSearch}
                onChange={(e) => setStockOutSearch(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="h-[55vh] p-4">
            <div className="space-y-2">
              {stockOutGroups
                .filter(g =>
                  (g.Marka || "").toLowerCase().includes(stockOutSearch.toLowerCase()) ||
                  (g["Ürün Kodu"] || "").toLowerCase().includes(stockOutSearch.toLowerCase())
                )
                .map((g, idx) => {
                  const urgency = g.daysToStockOut <= 3 ? 'critical' : g.daysToStockOut <= 7 ? 'high' : 'medium';
                  const urgencyConfig = {
                    critical: { bg: 'bg-red-50', border: 'border-red-300', badge: 'bg-red-100 text-red-700', label: 'Kritik' },
                    high:     { bg: 'bg-orange-50', border: 'border-orange-300', badge: 'bg-orange-100 text-orange-700', label: 'Yüksek' },
                    medium:   { bg: 'bg-amber-50', border: 'border-amber-300', badge: 'bg-amber-100 text-amber-700', label: 'Orta' },
                  }[urgency];
                  return (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${urgencyConfig.bg} ${urgencyConfig.border} transition-all`}>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{g.Marka}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{g["Ürün Kodu"]} • {g["Renk Kodu"]}</span>
                          <span className="text-[10px] text-slate-400">{g["Ürün Grubu"]}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-xs text-slate-500">Mevcut Stok</p>
                          <p className="font-bold text-slate-800">{g.totalEnvanter.toLocaleString('tr-TR')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Günlük Satış</p>
                          <p className="font-bold text-slate-800">{g.dailySales.toFixed(1)}</p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl text-center ${urgencyConfig.badge}`}>
                          <p className="text-[10px] font-bold">{urgencyConfig.label}</p>
                          <p className="text-lg font-black leading-tight">{g.daysToStockOut}</p>
                          <p className="text-[9px] font-semibold">Gün</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {stockOutGroups.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <Check className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                  <p className="font-medium">Hiçbir ürün 15 gün içinde tükenmeyecek.</p>
                  <p className="text-xs mt-1">Stoklar güvende görünüyor.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
