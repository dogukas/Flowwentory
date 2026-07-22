import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveTreeMap } from "@nivo/treemap";

interface StockTreeMapProps {
  treemapData: any;
}

export function StockTreeMap({ treemapData }: StockTreeMapProps) {
  return (
    <div className="grid grid-cols-1 gap-6 mt-4">
      <Card className="dashboard-card bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-2xl">
        <CardHeader className="pb-1 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-slate-700">Satış Hacmi Isı Haritası (Marka x Kategori)</CardTitle>
          <p className="text-[11px] text-slate-400">Marka ve ürün gruplarının satış adet dağılımı</p>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <div className="h-[350px]">
            {treemapData.children.length > 0 ? (
              <ResponsiveTreeMap
                data={treemapData}
                identity="id"
                value="value"
                valueFormat={value => `${Number(value).toLocaleString('tr-TR')} adet`}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                labelSkipSize={18}
                labelTextColor={{ from: 'color', modifiers: [['darker', 2.5]] }}
                parentLabelPosition="top"
                parentLabelTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
                colors={{ scheme: 'nivo' }}
                borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
                nodeOpacity={0.85}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Finansal/Satış verisi bulunamadı veya sıfır.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
