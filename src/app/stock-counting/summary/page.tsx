/**
 * Counting Summary Page
 * Overview of all counting activities with quick stats
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Calendar,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Clock,
    AlertTriangle,
    FileBarChart,
} from "lucide-react";

import { useCountingStore } from "@/store/useCountingStore";

export default function CountingSummaryPage() {
    const { countingEvents, countingDetails, countingAdjustments } = useCountingStore();

    // Calculate statistics
    const stats = {
        totalEvents: countingEvents.length,
        completedEvents: countingEvents.filter((e) => e.status === "COMPLETED").length,
        inProgressEvents: countingEvents.filter((e) => e.status === "IN_PROGRESS").length,
        totalDiscrepancies: countingEvents.reduce((sum, e) => sum + e.discrepancy_count, 0),
        totalAdjustments: countingAdjustments.length,
        pendingApprovals: countingDetails.filter((d) => d.adjustment_status === "PENDING").length,
    };

    const latestEvents = countingEvents.slice(-5).reverse();

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Sayım Özeti</h1>
                    <p className="text-muted-foreground mt-1">
                        Tüm stok sayım aktivitelerinizin hızlı özeti
                    </p>
                </div>
                <Link href="/stock-counting">
                    <Button>
                        <FileBarChart className="mr-2 h-4 w-4" />
                        Tüm Sayımlar
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Toplam Sayım
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEvents}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tamamlanan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completedEvents}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Devam Eden
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.inProgressEvents}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Toplam Fark
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.totalDiscrepancies}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Düzeltme
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.totalAdjustments}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Bekleyen Onay
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{stats.pendingApprovals}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Latest Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Son Sayımlar</CardTitle>
                    <CardDescription>En son 5 sayım aktivitesi</CardDescription>
                </CardHeader>
                <CardContent>
                    {latestEvents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Henüz sayım yapılmamış
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {latestEvents.map((event) => (
                                <Link key={event.id} href={`/stock-counting/${event.id}`}>
                                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                {event.status === "PLANNED" && (
                                                    <Calendar className="h-5 w-5 text-blue-500" />
                                                )}
                                                {event.status === "IN_PROGRESS" && (
                                                    <Clock className="h-5 w-5 text-yellow-500" />
                                                )}
                                                {event.status === "COMPLETED" && (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{event.event_code}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(event.scheduled_date).toLocaleDateString("tr-TR")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline">
                                                {event.event_type === "FULL" && "Tam Sayım"}
                                                {event.event_type === "CYCLE" && "Döngüsel"}
                                                {event.event_type === "SPOT" && "Spot"}
                                            </Badge>
                                            {event.discrepancy_count > 0 && (
                                                <Badge variant="destructive">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    {event.discrepancy_count} Fark
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-dashed">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-semibold mb-2">Raporlama (Yakında)</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Detaylı raporlar ve trend analizleri
                            </p>
                            <Button variant="outline" disabled>
                                Raporlar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-dashed">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-semibold mb-2">Otomatik Planlama (Yakında)</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Döngüsel sayım takvimleri oluşturun
                            </p>
                            <Button variant="outline" disabled>
                                Takvim
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
