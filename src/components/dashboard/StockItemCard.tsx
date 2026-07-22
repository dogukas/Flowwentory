/**
 * StockItemCard Component
 * Reusable component for displaying stock items with expandable details
 * Supports different color variants: low (orange), medium (blue), high (green)
 */
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { GroupedStockItem } from "@/types/stock";

// ==========================================
// TYPES
// ==========================================

export type StockLevel = "low" | "medium" | "high";

interface StockItemCardProps {
    item: GroupedStockItem;
    index: number;
    level: StockLevel;
}

// ==========================================
// COLOR CONFIGURATIONS
// ==========================================

const colorConfig = {
    low: {
        bg: "bg-orange-50",
        border: "border-orange-100",
        title: "text-orange-900",
        subtitle: "text-orange-600",
        muted: "text-orange-500",
        badge: "bg-orange-100 text-orange-700",
        detailBg: "bg-orange-100",
        detailText: "text-orange-800",
        detailMuted: "text-orange-700",
    },
    medium: {
        bg: "bg-blue-50",
        border: "border-blue-100",
        title: "text-blue-900",
        subtitle: "text-blue-600",
        muted: "text-blue-500",
        badge: "bg-blue-100 text-blue-700",
        detailBg: "bg-blue-100",
        detailText: "text-blue-800",
        detailMuted: "text-blue-700",
    },
    high: {
        bg: "bg-green-50",
        border: "border-green-100",
        title: "text-green-900",
        subtitle: "text-green-600",
        muted: "text-green-500",
        badge: "bg-green-100 text-green-700",
        detailBg: "bg-green-100",
        detailText: "text-green-800",
        detailMuted: "text-green-700",
    },
};

// ==========================================
// COMPONENT
// ==========================================

export function StockItemCard({ item, index, level }: StockItemCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const colors = colorConfig[level];

    return (
        <div className={`${colors.bg} rounded-lg border ${colors.border} overflow-hidden`}>
            {/* Header - Clickable */}
            <div
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    <p className={`font-medium ${colors.title}`}>{item.Marka}</p>
                    <div className={`flex gap-2 text-sm ${colors.subtitle}`}>
                        <span>{item["Ürün Kodu"]}</span>
                        <span>•</span>
                        <span>{item["Ürün Grubu"]}</span>
                    </div>
                    <div className={`flex gap-2 text-xs ${colors.muted} mt-1`}>
                        <span className="flex items-center gap-1">
                            <span className="font-medium">Renk:</span>
                            {item["Renk Kodu"]}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <Badge variant="outline" className={colors.badge}>
                        {item.totalEnvanter} adet
                    </Badge>
                    <span className={`text-xs ${colors.muted} mt-1`}>
                        {item.bedenler.length} beden
                    </span>
                </div>
            </div>

            {/* Expandable Details */}
            {isOpen && (
                <div className={`px-3 pb-3 pt-1 border-t ${colors.border}`}>
                    <div className={`text-sm font-medium ${colors.detailText} mb-2`}>
                        Beden Detayları:
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {item.bedenler.map((bedenItem, bedenIndex) => (
                            <div key={bedenIndex} className={`${colors.detailBg} rounded p-2 text-xs`}>
                                <div className={`font-medium ${colors.detailText}`}>
                                    {bedenItem.beden}
                                </div>
                                <div className={colors.detailMuted}>
                                    {bedenItem.envanter} adet
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// LEGACY EXPORTS (for backward compatibility)
// ==========================================

export function LowStockItem({ item, index }: { item: GroupedStockItem; index: number }) {
    return <StockItemCard item={item} index={index} level="low" />;
}

export function MediumStockItem({ item, index }: { item: GroupedStockItem; index: number }) {
    return <StockItemCard item={item} index={index} level="medium" />;
}

export function HighStockItem({ item, index }: { item: GroupedStockItem; index: number }) {
    return <StockItemCard item={item} index={index} level="high" />;
}
