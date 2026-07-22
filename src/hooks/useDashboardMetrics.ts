import { useMemo, useState } from "react";
import { StockItem, SalesItem, GroupedStockItem } from "@/types/stock";

const DASHBOARD_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function useDashboardMetrics(
  stockData: StockItem[],
  salesData: SalesItem[],
  globalBrandFilter: string,
  globalSeasonFilter: string
) {
  // Defensive check & Raw Data
  const rawSafeStockData = useMemo(() => Array.isArray(stockData) ? stockData : [], [stockData]);
  const rawSafeSalesData = useMemo(() => Array.isArray(salesData) ? salesData : [], [salesData]);

  const globalUniqueBrands = useMemo(() => [...new Set(rawSafeStockData.map(item => item.Marka))].filter(Boolean).sort(), [rawSafeStockData]);
  const globalUniqueSeasons = useMemo(() => [...new Set(rawSafeStockData.map(item => item.Sezon || 'Belirtilmemiş'))].sort(), [rawSafeStockData]);

  // Filtered Safe Data for entire dashboard
  const safeStockData = useMemo(() => {
    return rawSafeStockData.filter(item => {
      if (globalBrandFilter !== "all" && item.Marka !== globalBrandFilter) return false;
      if (globalSeasonFilter !== "all" && (item.Sezon || 'Belirtilmemiş') !== globalSeasonFilter) return false;
      return true;
    });
  }, [rawSafeStockData, globalBrandFilter, globalSeasonFilter]);

  const safeSalesData = useMemo(() => {
    return rawSafeSalesData.filter(item => {
      if (globalBrandFilter !== "all" && item.Marka !== globalBrandFilter) return false;
      if (globalSeasonFilter !== "all" && (item.Sezon || 'Belirtilmemiş') !== globalSeasonFilter) return false;
      return true;
    });
  }, [rawSafeSalesData, globalBrandFilter, globalSeasonFilter]);

  // Stok verisi hesaplamaları (Memoized)
  const stockMetrics = useMemo(() => {
    const uniqueBrands = [...new Set(safeStockData.map(item => item.Marka))].sort();
    const uniqueProductGroups = [...new Set(safeStockData.map(item => item["Ürün Grubu"]))].sort();
    const uniqueColorCodes = [...new Set(safeStockData.map(item => item["Renk Kodu"]))].sort();
    const uniqueSizes = [...new Set(safeStockData.map(item => item.Beden))].sort();

    const totalProducts = safeStockData.length;
    const totalInventory = safeStockData.reduce((sum, item) => sum + (parseInt(item.Envanter) || 0), 0);
    const uniqueProducts = new Set(safeStockData.map(item => `${item["Ürün Kodu"]}-${item["Renk Kodu"]}`)).size;

    const lowStock = safeStockData.filter(item => {
      const stock = parseInt(item.Envanter) || 0;
      return stock >= 0 && stock <= 3;
    });

    const mediumStock = safeStockData.filter(item => {
      const stock = parseInt(item.Envanter) || 0;
      return stock >= 4 && stock <= 6;
    });

    const highStock = safeStockData.filter(item => {
      const stock = parseInt(item.Envanter) || 0;
      return stock >= 7;
    });

    const lowStockCount = lowStock.reduce((sum, item) => sum + (parseInt(item.Envanter) || 0), 0);
    const mediumStockCount = mediumStock.reduce((sum, item) => sum + (parseInt(item.Envanter) || 0), 0);
    const highStockCount = highStock.reduce((sum, item) => sum + (parseInt(item.Envanter) || 0), 0);

    const lowStockPercentage = totalInventory > 0 ? ((lowStockCount / totalInventory) * 100).toFixed(1) : "0";
    const mediumStockPercentage = totalInventory > 0 ? ((mediumStockCount / totalInventory) * 100).toFixed(1) : "0";
    const highStockPercentage = totalInventory > 0 ? ((highStockCount / totalInventory) * 100).toFixed(1) : "0";

    const totalCategorizedStock = lowStockCount + mediumStockCount + highStockCount;
    const allCategoriesPercentage = totalInventory > 0 ? (totalCategorizedStock / totalInventory * 100).toFixed(1) : "0";

    const brandInventory = safeStockData.reduce((acc, item) => {
      const brand = item.Marka;
      const inventory = parseInt(item.Envanter) || 0;
      acc[brand] = (acc[brand] || 0) + inventory;
      return acc;
    }, {} as Record<string, number>);

    const pieChartData = Object.entries(brandInventory).map(([brand, total]) => ({
      id: brand,
      label: brand,
      value: total
    }));

    const seasonData = safeStockData.reduce((acc, item) => {
      const season = item.Sezon || 'Belirtilmemiş';
      if (!acc[season]) { acc[season] = { total: 0, brands: {} }; }
      const inventory = parseInt(item.Envanter) || 0;
      acc[season].total += inventory;

      const brand = item.Marka;
      if (!acc[season].brands[brand]) {
        acc[season].brands[brand] = { total: 0, uniqueProducts: new Set(), count: 0 };
      }
      acc[season].brands[brand].total += inventory;
      acc[season].brands[brand].uniqueProducts.add(item["Ürün Kodu"]);
      acc[season].brands[brand].count = acc[season].brands[brand].uniqueProducts.size;
      return acc;
    }, {} as Record<string, { total: number; brands: Record<string, { total: number; uniqueProducts: Set<string>; count: number; }>; }>);

    const seasonChartData = Object.entries(seasonData)
      .filter(([season]) => season !== 'Belirtilmemiş')
      .map(([season, data]) => ({
        id: season,
        label: season,
        value: data.total,
        brands: data.brands,
        color: DASHBOARD_COLORS[Math.floor(Math.random() * DASHBOARD_COLORS.length)]
      }));

    // Brand Metrics Calculation
    const brandMetrics = Object.entries(brandInventory || {}).map(([brand, stock]) => {
      const brandSales = (safeSalesData || [])
        .filter(sale => sale.Marka === brand)
        .reduce((sum, sale) => sum + (Number(sale["Satış Miktarı"]) || 0), 0);
      const turnoverRate = stock > 0 ? (brandSales / stock).toFixed(2) : "0.00";
      return { brand, stock, sales: brandSales, turnoverRate: parseFloat(turnoverRate) };
    });

    return {
      uniqueBrands, uniqueProductGroups, uniqueColorCodes, uniqueSizes,
      totalProducts, totalInventory, uniqueProducts,
      lowStock, mediumStock, highStock,
      lowStockCount, mediumStockCount, highStockCount,
      lowStockPercentage, mediumStockPercentage, highStockPercentage,
      totalCategorizedStock, allCategoriesPercentage,
      brandInventory, pieChartData, seasonChartData, brandMetrics
    };
  }, [safeStockData, safeSalesData]);

  // Alert Groups (Low, Medium, High, Dead, StockOut)
  const lowStockGroups = useMemo(() => {
    const skuGroups = stockMetrics.lowStock.reduce((acc: Record<string, GroupedStockItem>, item) => {
      const envanter = parseInt(item.Envanter) || 0;
      if (envanter < 0 || envanter > 3) return acc;
      const key = `${item.Marka}-${item["Ürün Kodu"]}-${item["Ürün Grubu"]}-${item["Renk Kodu"]}`;
      if (!acc[key]) {
        acc[key] = { Marka: item.Marka, "Ürün Kodu": item["Ürün Kodu"], "Ürün Grubu": item["Ürün Grubu"], "Renk Kodu": item["Renk Kodu"], bedenler: [], totalEnvanter: 0 };
      }
      acc[key].bedenler.push({ beden: item.Beden, envanter });
      acc[key].totalEnvanter += envanter;
      return acc;
    }, {});
    return Object.values(skuGroups).filter(item => item.totalEnvanter >= 0 && item.totalEnvanter <= 3);
  }, [stockMetrics.lowStock]);

  const highStockGroups = useMemo(() => {
    const skuGroups = stockMetrics.highStock.reduce((acc: Record<string, GroupedStockItem>, item) => {
      const envanter = parseInt(item.Envanter) || 0;
      if (envanter < 7) return acc;
      const key = `${item.Marka}-${item["Ürün Kodu"]}-${item["Ürün Grubu"]}-${item["Renk Kodu"]}`;
      if (!acc[key]) {
        acc[key] = { Marka: item.Marka, "Ürün Kodu": item["Ürün Kodu"], "Ürün Grubu": item["Ürün Grubu"], "Renk Kodu": item["Renk Kodu"], bedenler: [], totalEnvanter: 0 };
      }
      acc[key].bedenler.push({ beden: item.Beden, envanter });
      acc[key].totalEnvanter += envanter;
      return acc;
    }, {});
    return Object.values(skuGroups).filter(item => item.totalEnvanter >= 7);
  }, [stockMetrics.highStock]);

  const mediumStockGroups = useMemo(() => {
    const skuGroups = stockMetrics.mediumStock.reduce((acc: Record<string, GroupedStockItem>, item) => {
      const envanter = parseInt(item.Envanter) || 0;
      if (envanter < 4 || envanter > 6) return acc;
      const key = `${item.Marka}-${item["Ürün Kodu"]}-${item["Ürün Grubu"]}-${item["Renk Kodu"]}`;
      if (!acc[key]) {
        acc[key] = { Marka: item.Marka, "Ürün Kodu": item["Ürün Kodu"], "Ürün Grubu": item["Ürün Grubu"], "Renk Kodu": item["Renk Kodu"], bedenler: [], totalEnvanter: 0 };
      }
      acc[key].bedenler.push({ beden: item.Beden, envanter });
      acc[key].totalEnvanter += envanter;
      return acc;
    }, {});
    return Object.values(skuGroups).filter(item => item.totalEnvanter >= 4 && item.totalEnvanter <= 6);
  }, [stockMetrics.mediumStock]);

  const deadStockGroups = useMemo(() => {
    const salesPerSku = safeSalesData.reduce((acc, item) => {
      const key = `${item.Marka}-${item["Ürün Kodu"]}-${item["Renk Kodu"]}`;
      const qty = Number(item["Satış Miktarı"]) || 0;
      acc[key] = (acc[key] || 0) + qty;
      return acc;
    }, {} as Record<string, number>);

    const skuGroups = safeStockData.reduce((acc: Record<string, GroupedStockItem>, item) => {
      const envanter = parseInt(item.Envanter) || 0;
      const fullKey = `${item.Marka}-${item["Ürün Kodu"]}-${item["Ürün Grubu"]}-${item["Renk Kodu"]}`;
      if (!acc[fullKey]) {
        acc[fullKey] = { Marka: item.Marka, "Ürün Kodu": item["Ürün Kodu"], "Ürün Grubu": item["Ürün Grubu"], "Renk Kodu": item["Renk Kodu"], bedenler: [], totalEnvanter: 0 };
      }
      acc[fullKey].bedenler.push({ beden: item.Beden, envanter });
      acc[fullKey].totalEnvanter += envanter;
      return acc;
    }, {});

    return Object.values(skuGroups).filter(item => {
      const salesKey = `${item.Marka}-${item["Ürün Kodu"]}-${item["Renk Kodu"]}`;
      const totalSales = salesPerSku[salesKey] || 0;
      return item.totalEnvanter >= 5 && totalSales === 0;
    }).sort((a, b) => b.totalEnvanter - a.totalEnvanter);
  }, [safeStockData, safeSalesData]);

  const deadStockCount = deadStockGroups.reduce((sum, g) => sum + g.totalEnvanter, 0);
  const deadStockPercentage = stockMetrics.totalInventory > 0 ? ((deadStockCount / stockMetrics.totalInventory) * 100).toFixed(1) : "0";

  const stockOutGroups = useMemo(() => {
    const salesPerSku = safeSalesData.reduce((acc, item) => {
      const key = `${item.Marka}-${item["Ürün Kodu"]}-${item["Renk Kodu"]}`;
      const qty = Number(item["Satış Miktarı"]) || 0;
      acc[key] = (acc[key] || 0) + qty;
      return acc;
    }, {} as Record<string, number>);

    const skuGroups = safeStockData.reduce((acc: Record<string, GroupedStockItem>, item) => {
      const envanter = parseInt(item.Envanter) || 0;
      const fullKey = `${item.Marka}-${item["Ürün Kodu"]}-${item["Ürün Grubu"]}-${item["Renk Kodu"]}`;
      if (!acc[fullKey]) {
        acc[fullKey] = { Marka: item.Marka, "Ürün Kodu": item["Ürün Kodu"], "Ürün Grubu": item["Ürün Grubu"], "Renk Kodu": item["Renk Kodu"], bedenler: [], totalEnvanter: 0 };
      }
      acc[fullKey].bedenler.push({ beden: item.Beden, envanter });
      acc[fullKey].totalEnvanter += envanter;
      return acc;
    }, {});

    return Object.values(skuGroups)
      .map(item => {
        const salesKey = `${item.Marka}-${item["Ürün Kodu"]}-${item["Renk Kodu"]}`;
        const totalSales = salesPerSku[salesKey] || 0;
        const dailySales = totalSales / 30;
        const daysToStockOut = dailySales > 0 ? Math.floor(item.totalEnvanter / dailySales) : 999;
        return { ...item, totalSales, daysToStockOut, dailySales };
      })
      .filter(item => item.totalEnvanter > 0 && item.daysToStockOut <= 15)
      .sort((a, b) => a.daysToStockOut - b.daysToStockOut);
  }, [safeStockData, safeSalesData]);

  const stockOutCount = stockOutGroups.reduce((sum, g) => sum + g.totalEnvanter, 0);
  const stockOutPercentage = stockMetrics.totalInventory > 0 ? ((stockOutCount / stockMetrics.totalInventory) * 100).toFixed(1) : "0";

  const treemapData = useMemo(() => {
    const brandGroups: Record<string, any> = {};
    safeSalesData.forEach(item => {
      const brand = item.Marka || 'Belirtilmemiş';
      const group = item["Ürün Grubu"] || 'Belirtilmemiş';
      let salesAmount = 0;
      try {
        const vd = item["Satış (VD)"];
        if (typeof vd === 'string') {
          salesAmount = parseFloat(vd.replace(/\./g, '').replace(',', '.')) || 0;
        } else if (typeof vd === 'number') {
          salesAmount = vd;
        }
      } catch {}
      if (salesAmount <= 0) {
        salesAmount = Number(item["Satış Miktarı"]) || 0;
      }
      if (salesAmount <= 0) return;
      if (!brandGroups[brand]) brandGroups[brand] = {};
      brandGroups[brand][group] = (brandGroups[brand][group] || 0) + salesAmount;
    });

    return {
      id: 'root',
      children: Object.entries(brandGroups).map(([brand, groups]) => ({
        id: brand,
        children: Object.entries(groups).map(([group, revenue]) => ({
          id: group,
          value: revenue
        }))
      }))
    };
  }, [safeSalesData]);

  const brandTooltipData = useMemo(() => {
    const result: Record<string, { productGroups: Record<string, { total: number; uniqueProducts: Set<string>; count: number }>; totalUniqueProducts: number }> = {};
    for (const item of safeStockData) {
      const brand = item.Marka;
      if (!result[brand]) {
        result[brand] = { productGroups: {}, totalUniqueProducts: 0 };
      }
      const group = item["Ürün Grubu"];
      if (!result[brand].productGroups[group]) {
        result[brand].productGroups[group] = { total: 0, uniqueProducts: new Set(), count: 0 };
      }
      result[brand].productGroups[group].total += parseInt(item.Envanter) || 0;
      result[brand].productGroups[group].uniqueProducts.add(item["Ürün Kodu"]);
      result[brand].productGroups[group].count = result[brand].productGroups[group].uniqueProducts.size;
    }
    for (const brand of Object.keys(result)) {
      const allProducts = new Set<string>();
      for (const group of Object.values(result[brand].productGroups)) {
        for (const p of group.uniqueProducts) allProducts.add(p);
      }
      result[brand].totalUniqueProducts = allProducts.size;
    }
    return result;
  }, [safeStockData]);

  const totalTurnoverRate = useMemo(() => {
    const totalSalesQty = stockMetrics.brandMetrics.reduce((sum, m) => sum + m.sales, 0);
    const totalStockQty = stockMetrics.brandMetrics.reduce((sum, m) => sum + m.stock, 0);
    return totalStockQty > 0 ? Number((totalSalesQty / totalStockQty).toFixed(2)) : 0;
  }, [stockMetrics.brandMetrics]);

  const categoryBarData = useMemo(() => {
    const stockByGroup = safeStockData.reduce((acc, item) => {
      const group = item["Ürün Grubu"] || 'Belirtilmemiş';
      acc[group] = (acc[group] || 0) + (parseInt(item.Envanter) || 0);
      return acc;
    }, {} as Record<string, number>);

    const salesByGroup = safeSalesData.reduce((acc, item) => {
      const group = item["Ürün Grubu"] || 'Belirtilmemiş';
      acc[group] = (acc[group] || 0) + (Number(item["Satış Miktarı"]) || 0);
      return acc;
    }, {} as Record<string, number>);

    return stockMetrics.uniqueProductGroups.map(group => ({
      group,
      "Stok": stockByGroup[group] || 0,
      "Satış": salesByGroup[group] || 0
    })).sort((a, b) => b.Stok - a.Stok).slice(0, 8);
  }, [safeStockData, safeSalesData, stockMetrics.uniqueProductGroups]);

  const heatmapData = useMemo(() => {
    const data: Array<{ brand: string; category: string; sales: number }> = [];
    const brandSet = new Set<string>();
    const categorySet = new Set<string>();

    safeSalesData.forEach(item => {
      const brand = item.Marka || 'Belirtilmemiş';
      const category = item["Ürün Grubu"] || 'Belirtilmemiş';
      const sales = Number(item["Satış Miktarı"]) || 0;
      
      if (sales > 0) {
        brandSet.add(brand);
        categorySet.add(category);
        
        const existing = data.find(d => d.brand === brand && d.category === category);
        if (existing) {
          existing.sales += sales;
        } else {
          data.push({ brand, category, sales });
        }
      }
    });

    const brands = Array.from(brandSet).sort();
    const categories = Array.from(categorySet).sort();

    return { brands, categories, data };
  }, [safeSalesData]);

  return {
    rawSafeStockData,
    rawSafeSalesData,
    safeStockData,
    safeSalesData,
    globalUniqueBrands,
    globalUniqueSeasons,
    ...stockMetrics,
    lowStockGroups,
    highStockGroups,
    mediumStockGroups,
    deadStockGroups,
    deadStockCount,
    deadStockPercentage,
    stockOutGroups,
    stockOutCount,
    stockOutPercentage,
    treemapData,
    brandTooltipData,
    totalTurnoverRate,
    categoryBarData,
    heatmapData
  };
}
