/**
 * Discrepancy Alert Card
 * Visual display for inventory discrepancies with severity levels
 */
"use client";

import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DiscrepancySeverity } from "@/types/counting";

interface DiscrepancyAlertProps {
    systemQty: number;
    countedQty: number;
    productName: string;
    severity: DiscrepancySeverity;
    difference: number;
}

export function DiscrepancyAlert({
    systemQty,
    countedQty,
    productName,
    severity,
    difference,
}: DiscrepancyAlertProps) {
    const isOverage = difference > 0;
    const isShortage = difference < 0;
    const isPerfect = difference === 0;

    const getSeverityConfig = () => {
        switch (severity) {
            case "LOW":
                return {
                    color: "bg-green-50 border-green-200",
                    textColor: "text-green-700",
                    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
                    label: "Düşük Fark",
                    badgeColor: "bg-green-100 text-green-700",
                };
            case "MEDIUM":
                return {
                    color: "bg-yellow-50 border-yellow-200",
                    textColor: "text-yellow-700",
                    icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
                    label: "Orta Fark",
                    badgeColor: "bg-yellow-100 text-yellow-700",
                };
            case "HIGH":
                return {
                    color: "bg-red-50 border-red-200",
                    textColor: "text-red-700",
                    icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
                    label: "Yüksek Fark",
                    badgeColor: "bg-red-100 text-red-700",
                };
        }
    };

    const config = getSeverityConfig();
    const percentage = systemQty > 0 ? Math.abs((difference / systemQty) * 100) : 0;

    if (isPerfect) {
        return (
            <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                            <p className="font-medium text-green-700">{productName}</p>
                            <p className="text-sm text-green-600">Fark yok - mükemmel eşleşme!</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">✓ OK</Badge>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`${config.color} border`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="mt-1">{config.icon}</div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className={`font-medium ${config.textColor}`}>{productName}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {config.label} tespit edildi
                                </p>
                            </div>
                            <Badge className={config.badgeColor}>
                                {difference > 0 ? "+" : ""}
                                {difference} ({percentage.toFixed(1)}%)
                            </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground text-xs">Sistem</p>
                                <p className="font-medium">{systemQty} adet</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Sayılan</p>
                                <p className="font-medium">{countedQty} adet</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Fark</p>
                                <div className="flex items-center gap-1">
                                    {isOverage && <TrendingUp className="h-3 w-3 text-green-600" />}
                                    {isShortage && <TrendingDown className="h-3 w-3 text-red-600" />}
                                    <p className={`font-medium ${isOverage ? "text-green-600" : "text-red-600"}`}>
                                        {Math.abs(difference)} adet
                                    </p>
                                </div>
                            </div>
                        </div>

                        {severity === "HIGH" && (
                            <div className="bg-red-100 rounded p-2 text-xs text-red-700 flex items-start gap-2">
                                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>
                                    Yüksek seviye fark! Lütfen{" "}
                                    {isShortage ? "eksiklik nedenini" : "fazlalık kaynağını"} kontrol edin.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
