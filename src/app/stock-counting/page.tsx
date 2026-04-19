/**
 * Stok Sayım (Inventory Counting) Page
 * Ana stok sayım yönetim sayfası
 */
"use client";

// ==========================================
// REACT & HOOKS
// ==========================================
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ==========================================
// UI COMPONENTS
// ==========================================
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// ==========================================
// ICONS
// ==========================================
import {
    Plus,
    Search,
    Filter,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    FileText,
    ListChecks,
    PlayCircle,
    Package,
} from "lucide-react";

// ==========================================
// INTERNAL
// ==========================================
import { useCountingStore } from "@/store/useCountingStore";
import { NewCountingDialog } from "@/components/counting/NewCountingDialog";
import type { CountingEvent, CountingStatus } from "@/types/counting";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

// ==========================================
// TYPES
// ==========================================

const STATUS_CONFIG: Record<CountingStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PLANNED: {
        label: 'Planlandı',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: <Calendar className="h-3 w-3" />,
    },
    IN_PROGRESS: {
        label: 'Devam Ediyor',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: <Clock className="h-3 w-3" />,
    },
    COMPLETED: {
        label: 'Tamamlandı',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
    CANCELLED: {
        label: 'İptal Edildi',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: <XCircle className="h-3 w-3" />,
    },
};

// ==========================================
// COMPONENT
// ==========================================

export default function StockCountingPage() {
    const {
        countingEvents,
        searchQuery,
        statusFilter,
        setSearchQuery,
        setStatusFilter,
        getFilteredEvents,
    } = useCountingStore();

    const [filteredEvents, setFilteredEvents] = useState<CountingEvent[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Responsive design
    const isMobile = useMediaQuery('(max-width: 768px)');

    // Debounced search for performance
    const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

    // Filter events when search or filter changes
    useEffect(() => {
        setFilteredEvents(getFilteredEvents());
    }, [debouncedSearchQuery, statusFilter, countingEvents, getFilteredEvents]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // "/" - Focus search
            if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // "Esc" - Clear search and filters
            if (e.key === 'Escape') {
                setSearchQuery('');
                setStatusFilter('ALL');
                searchInputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setSearchQuery, setStatusFilter]);

    // Statistics
    const stats = {
        total: countingEvents.length,
        planned: countingEvents.filter((e) => e.status === 'PLANNED').length,
        inProgress: countingEvents.filter((e) => e.status === 'IN_PROGRESS').length,
        completed: countingEvents.filter((e) => e.status === 'COMPLETED').length,
    };

    return (
        <main className="container mx-auto p-6 space-y-6" role="main">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Stok Sayım</h1>
                    <p className="text-muted-foreground mt-1">
                        Envanter sayımlarını yönetin ve takip edin
                    </p>
                </div>
                <NewCountingDialog
                    trigger={
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 min-h-[44px]"
                            aria-label="Yeni sayım oluştur"
                        >
                            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                            Yeni Sayım Oluştur
                        </Button>
                    }
                />
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-t-4 border-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Toplam Sayım
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-yellow-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Devam Eden
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-700">{stats.inProgress}</div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-purple-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Planlı
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-700">{stats.planned}</div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tamamlanan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filtreler</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <label htmlFor="search-input" className="sr-only">
                                Sayım kodu veya not ara
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <Input
                                    id="search-input"
                                    ref={searchInputRef}
                                    placeholder="Sayım kodu veya not ara... (Kısayol: /)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                    aria-label="Sayım ara"
                                />
                            </div>
                            {/* Live region for screen readers */}
                            <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                                {searchQuery && `${filteredEvents.length} sayım bulundu`}
                            </div>
                        </div>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[200px]" aria-label="Durum filtresi">
                                <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
                                <SelectValue placeholder="Tüm Durumlar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                                <SelectItem value="PLANNED">Planlandı</SelectItem>
                                <SelectItem value="IN_PROGRESS">Devam Ediyor</SelectItem>
                                <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                                <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Events List */}
            <Card>
                <CardHeader>
                    <CardTitle>Sayım Listesi</CardTitle>
                    <CardDescription>
                        {filteredEvents.length} sayım bulundu
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-16">
                            {/* Gradient Icon Background */}
                            <div className="relative mx-auto w-32 h-32 mb-6">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse" />
                                <div className="absolute inset-2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <ListChecks className="h-16 w-16 text-white" />
                                </div>
                            </div>

                            {/* Text Content */}
                            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {searchQuery || statusFilter !== 'ALL' ? 'Sonuç Bulunamadı' : 'Henüz Sayım Yok'}
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                {searchQuery || statusFilter !== 'ALL'
                                    ? 'Farklı filtreler deneyerek yeniden arayabilirsiniz'
                                    : 'Envanter sayımına başlamak için yeni bir sayım oluşturun ve stoklarınızı düzenli takip edin'}
                            </p>

                            {/* Action Button */}
                            <NewCountingDialog
                                trigger={
                                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                                        <PlayCircle className="mr-2 h-5 w-5" />
                                        Sayımı Başlat
                                    </Button>
                                }
                            />

                            {/* Keyboard Hints */}
                            <div className="mt-8 flex justify-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <kbd className="px-2 py-1 bg-muted rounded border">
                                        /
                                    </kbd>
                                    <span>Ara</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <kbd className="px-2 py-1 bg-muted rounded border">
                                        Esc
                                    </kbd>
                                    <span>Temizle</span>
                                </div>
                            </div>
                        </div>
                    ) : isMobile ? (
                        // Mobile: Card View
                        <div className="grid gap-3">
                            {filteredEvents.map((event) => {
                                const statusConfig = STATUS_CONFIG[event.status];
                                const completionRate =
                                    event.total_items_planned > 0
                                        ? (event.total_items_counted / event.total_items_planned) * 100
                                        : 0;

                                return (
                                    <Link href={`/stock-counting/${event.id}`} key={event.id}>
                                        <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                                            {/* Header: Code + Status */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-blue-600 text-lg mb-1">
                                                        {event.event_code}
                                                    </h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {event.event_type === 'FULL' && 'Tam Sayım'}
                                                        {event.event_type === 'CYCLE' && 'Döngüsel'}
                                                        {event.event_type === 'SPOT' && 'Spot Sayım'}
                                                    </Badge>
                                                </div>
                                                <Badge className={`${statusConfig.color} border flex items-center gap-1`}>
                                                    {statusConfig.icon}
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>

                                            {/* Progress */}
                                            <div className="space-y-2 mb-3">
                                                <Progress value={completionRate} className="h-2" />
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">
                                                        {event.total_items_counted}/{event.total_items_planned} ürün
                                                    </span>
                                                    <span className="font-medium text-blue-600">
                                                        {completionRate.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Footer: Date + Discrepancies */}
                                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(event.scheduled_date).toLocaleDateString('tr-TR')}
                                                </div>
                                                {event.discrepancy_count > 0 ? (
                                                    <Badge variant="destructive" className="text-xs">
                                                        {event.discrepancy_count} fark
                                                    </Badge>
                                                ) : (
                                                    <span className="text-green-600 font-medium">✓ Uyumlu</span>
                                                )}
                                            </div>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        // Desktop: Table View
                        <ScrollArea className="h-[500px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead scope="col">Sayım Kodu</TableHead>
                                        <TableHead scope="col">Tip</TableHead>
                                        <TableHead scope="col">Durum</TableHead>
                                        <TableHead scope="col">Tarih</TableHead>
                                        <TableHead scope="col">İlerleme</TableHead>
                                        <TableHead scope="col">Farklar</TableHead>
                                        <TableHead className="text-right" scope="col">İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEvents.map((event) => {
                                        const statusConfig = STATUS_CONFIG[event.status];
                                        const completionRate =
                                            event.total_items_planned > 0
                                                ? (event.total_items_counted / event.total_items_planned) * 100
                                                : 0;

                                        return (
                                            <TableRow
                                                key={event.id}
                                                className="hover:bg-accent/50 transition-colors duration-150 cursor-pointer"
                                            >
                                                <TableCell className="font-medium">
                                                    <Link
                                                        href={`/stock-counting/${event.id}`}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        {event.event_code}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {event.event_type === 'FULL' && 'Tam Sayım'}
                                                        {event.event_type === 'CYCLE' && 'Döngüsel'}
                                                        {event.event_type === 'SPOT' && 'Spot Sayım'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`${statusConfig.color} border flex items-center gap-1 w-fit`}
                                                    >
                                                        {statusConfig.icon}
                                                        {statusConfig.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(event.scheduled_date).toLocaleDateString('tr-TR')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1 min-w-[120px]">
                                                        <Progress
                                                            value={completionRate}
                                                            className="h-2"
                                                        />
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">
                                                                {event.total_items_counted}/{event.total_items_planned}
                                                            </span>
                                                            <span className="font-medium text-blue-600">
                                                                {completionRate.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {event.discrepancy_count > 0 ? (
                                                        <Badge variant="destructive">{event.discrepancy_count}</Badge>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </main >
    );
}
