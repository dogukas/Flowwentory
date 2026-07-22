import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardFiltersProps {
  globalBrandFilter: string;
  setGlobalBrandFilter: (val: string) => void;
  globalSeasonFilter: string;
  setGlobalSeasonFilter: (val: string) => void;
  globalUniqueBrands: string[];
  globalUniqueSeasons: string[];
}

export function DashboardFilters({
  globalBrandFilter,
  setGlobalBrandFilter,
  globalSeasonFilter,
  setGlobalSeasonFilter,
  globalUniqueBrands,
  globalUniqueSeasons
}: DashboardFiltersProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between relative z-0">
      <div className="flex items-center gap-2 text-indigo-600">
        <Filter className="w-5 h-5" />
        <span className="font-semibold text-sm">Global Analiz Filtresi</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Select value={globalBrandFilter} onValueChange={setGlobalBrandFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-10 bg-white border-slate-200 rounded-xl shadow-sm text-sm focus:ring-indigo-500/50">
            <SelectValue placeholder="Tüm Markalar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Markalar</SelectItem>
            {globalUniqueBrands.map(brand => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={globalSeasonFilter} onValueChange={setGlobalSeasonFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-10 bg-white border-slate-200 rounded-xl shadow-sm text-sm focus:ring-indigo-500/50">
            <SelectValue placeholder="Tüm Sezonlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Sezonlar</SelectItem>
            {globalUniqueSeasons.map(season => (
              <SelectItem key={season} value={season}>{season}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(globalBrandFilter !== 'all' || globalSeasonFilter !== 'all') && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setGlobalBrandFilter('all'); setGlobalSeasonFilter('all'); }}
            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 h-10 rounded-xl transition-colors"
          >
            Filtreyi Temizle
          </Button>
        )}
      </div>
    </div>
  );
}
