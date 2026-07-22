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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    ListChecks,
    PlayCircle,
    ClipboardCheck,
    AlertTriangle,
    ArrowRight,
    MoreVertical,
    Trash2,
    Ban,
} from "lucide-react";

// ==========================================
// ANIMATION
// ==========================================
import { motion } from "framer-motion";

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

const STATUS_CONFIG: Record<CountingStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    PLANNED: {
        label: 'Planlandı',
        color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        bgColor: 'from-blue-500 to-blue-600',
        icon: <Calendar className="h-3 w-3" />,
    },
    IN_PROGRESS: {
        label: 'Devam Ediyor',
        color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
        bgColor: 'from-amber-500 to-amber-600',
        icon: <Clock className="h-3 w-3" />,
    },
    COMPLETED: {
        label: 'Tamamlandı',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
        bgColor: 'from-emerald-500 to-emerald-600',
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
    CANCELLED: {
        label: 'İptal Edildi',
        color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        bgColor: 'from-red-500 to-red-600',
        icon: <XCircle className="h-3 w-3" />,
    },
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
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
        updateCountingEvent,
        deleteCountingEvent,
    } = useCountingStore();

    const [filteredEvents, setFilteredEvents] = useState<CountingEvent[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Confirm dialogs
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [cancelTarget, setCancelTarget] = useState<string | null>(null);

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
            if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
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

    const statCards = [
        { label: "Toplam Sayım", value: stats.total, icon: <ClipboardCheck className="w-5 h-5" />, gradient: "from-blue-500 to-indigo-600" },
        { label: "Devam Eden", value: stats.inProgress, icon: <Clock className="w-5 h-5" />, gradient: "from-amber-500 to-orange-600" },
        { label: "Planlandı", value: stats.planned, icon: <Calendar className="w-5 h-5" />, gradient: "from-purple-500 to-violet-600" },
        { label: "Tamamlanan", value: stats.completed, icon: <CheckCircle2 className="w-5 h-5" />, gradient: "from-emerald-500 to-teal-600" },
    ];

    // Handlers
    const handleCancelEvent = (id: string) => {
        updateCountingEvent(id, { status: 'CANCELLED' });
        setCancelTarget(null);
    };

    const handleDeleteEvent = (id: string) => {
        deleteCountingEvent(id);
        setDeleteTarget(null);
    };

    // Action menu for each event
    const EventActions = ({ event }: { event: CountingEvent }) => {
        const canCancel = event.status === 'PLANNED' || event.status === 'IN_PROGRESS';
        const canDelete = event.status === 'PLANNED' || event.status === 'CANCELLED';

        if (!canCancel && !canDelete) return null;

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <MoreVertical className="h-4 w-4 text-slate-400" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    {canCancel && (
                        <DropdownMenuItem
                            onClick={() => setCancelTarget(event.id)}
                            className="text-amber-600 dark:text-amber-400 focus:text-amber-700"
                        >
                            <Ban className="h-4 w-4 mr-2" />
                            İptal Et
                        </DropdownMenuItem>
                    )}
                    {canCancel && canDelete && <DropdownMenuSeparator />}
                    {canDelete && (
                        <DropdownMenuItem
                            onClick={() => setDeleteTarget(event.id)}
                            className="text-red-600 dark:text-red-400 focus:text-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <div className="relative min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 overflow-x-hidden pb-8">
            {/* Background Mesh */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-300/10 blur-[120px]" />
                <div className="absolute top-[30%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-violet-300/10 blur-[120px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-emerald-300/10 blur-[120px]" />
            </div>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Ban className="w-5 h-5 text-amber-500" />
                            Sayımı İptal Et
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu sayım iptal edilecek. İptal edilen sayımlar daha sonra silinebilir.
                            Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => cancelTarget && handleCancelEvent(cancelTarget)}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            Evet, İptal Et
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            Sayımı Sil
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu sayım ve tüm detayları kalıcı olarak silinecek. Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteTarget && handleDeleteEvent(deleteTarget)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Evet, Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <motion.main
                className="container mx-auto p-4 md:p-6 pt-20 space-y-6"
                role="main"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Header */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.04)]"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                                <ClipboardCheck className="w-5 h-5 text-white" />
                            </div>
                            Stok Sayım
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[46px]">
                            Envanter sayımlarını yönetin ve takip edin
                        </p>
                    </div>
                    <NewCountingDialog
                        trigger={
                            <Button
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 rounded-xl min-h-[44px] px-5"
                                aria-label="Yeni sayım oluştur"
                            >
                                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                                Yeni Sayım Oluştur
                            </Button>
                        }
                    />
                </motion.div>

                {/* Statistics Cards */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-slate-800 shadow-sm p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md text-white`}>
                                    {stat.icon}
                                </div>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 pl-[52px]">
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Search & Filter Bar */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col md:flex-row gap-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex-1 relative">
                        <label htmlFor="search-input" className="sr-only">Sayım kodu veya not ara</label>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                        <Input
                            id="search-input"
                            ref={searchInputRef}
                            placeholder="Sayım kodu veya not ara... ( / )"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl"
                            aria-label="Sayım ara"
                        />
                        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                            {searchQuery && `${filteredEvents.length} sayım bulundu`}
                        </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-[200px] bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl" aria-label="Durum filtresi">
                            <Filter className="mr-2 h-4 w-4 text-slate-400" aria-hidden="true" />
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
                </motion.div>

                {/* Events List */}
                <motion.div variants={itemVariants}>
                    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-700 dark:text-slate-200">Sayım Listesi</CardTitle>
                                    <CardDescription className="text-xs mt-0.5">
                                        {filteredEvents.length} sayım bulundu
                                    </CardDescription>
                                </div>
                                {filteredEvents.length > 0 && (
                                    <Badge variant="secondary" className="rounded-lg text-xs">
                                        {filteredEvents.length} kayıt
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredEvents.length === 0 ? (
                                <div className="text-center py-20 px-4">
                                    <div className="relative mx-auto w-24 h-24 mb-6">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl opacity-10 animate-pulse" />
                                        <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <ListChecks className="h-10 w-10 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-200">
                                        {searchQuery || statusFilter !== 'ALL' ? 'Sonuç Bulunamadı' : 'Henüz Sayım Yok'}
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
                                        {searchQuery || statusFilter !== 'ALL'
                                            ? 'Farklı filtreler deneyerek yeniden arayabilirsiniz'
                                            : 'Envanter sayımına başlamak için yeni bir sayım oluşturun ve stoklarınızı düzenli takip edin'}
                                    </p>
                                    <NewCountingDialog
                                        trigger={
                                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 rounded-xl">
                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                Sayımı Başlat
                                            </Button>
                                        }
                                    />
                                    <div className="mt-6 flex justify-center gap-4 text-xs text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono border border-slate-200 dark:border-slate-700">/</kbd>
                                            <span>Ara</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono border border-slate-200 dark:border-slate-700">Esc</kbd>
                                            <span>Temizle</span>
                                        </div>
                                    </div>
                                </div>
                            ) : isMobile ? (
                                // Mobile: Card View
                                <div className="grid gap-3 p-4">
                                    {filteredEvents.map((event) => {
                                        const statusConfig = STATUS_CONFIG[event.status];
                                        const completionRate =
                                            event.total_items_planned > 0
                                                ? (event.total_items_counted / event.total_items_planned) * 100
                                                : 0;

                                        return (
                                            <div key={event.id} className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all group">
                                                {/* Header: Code + Status + Actions */}
                                                <div className="flex justify-between items-start mb-3">
                                                    <Link href={`/stock-counting/${event.id}`} className="flex-1">
                                                        <h3 className="font-bold text-blue-600 dark:text-blue-400 text-base mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                                            {event.event_code}
                                                        </h3>
                                                        <Badge variant="outline" className="text-[10px] rounded-md border-slate-200 dark:border-slate-700">
                                                            {event.event_type === 'FULL' && 'Tam Sayım'}
                                                            {event.event_type === 'CYCLE' && 'Döngüsel'}
                                                            {event.event_type === 'SPOT' && 'Spot Sayım'}
                                                        </Badge>
                                                    </Link>
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge className={`${statusConfig.color} border flex items-center gap-1 text-[10px] rounded-lg`}>
                                                            {statusConfig.icon}
                                                            {statusConfig.label}
                                                        </Badge>
                                                        <EventActions event={event} />
                                                    </div>
                                                </div>

                                                <Link href={`/stock-counting/${event.id}`}>
                                                    {/* Progress */}
                                                    <div className="space-y-1.5 mb-3">
                                                        <Progress value={completionRate} className="h-1.5 rounded-full" />
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-slate-400">
                                                                {event.total_items_counted}/{event.total_items_planned} ürün
                                                            </span>
                                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                                {completionRate.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="flex justify-between items-center text-xs text-slate-400">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(event.scheduled_date).toLocaleDateString('tr-TR')}
                                                        </div>
                                                        {event.discrepancy_count > 0 ? (
                                                            <Badge variant="destructive" className="text-[10px] rounded-md">
                                                                <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                                                                {event.discrepancy_count} fark
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-emerald-500 font-medium flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3" /> Uyumlu
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                // Desktop: Table View
                                <ScrollArea className="max-h-[500px]">
                                    <Table>
                                        <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
                                            <TableRow className="border-slate-100 dark:border-slate-800">
                                                <TableHead scope="col" className="font-bold text-slate-500">Sayım Kodu</TableHead>
                                                <TableHead scope="col" className="font-bold text-slate-500">Tip</TableHead>
                                                <TableHead scope="col" className="font-bold text-slate-500">Durum</TableHead>
                                                <TableHead scope="col" className="font-bold text-slate-500">Tarih</TableHead>
                                                <TableHead scope="col" className="font-bold text-slate-500">İlerleme</TableHead>
                                                <TableHead scope="col" className="font-bold text-slate-500">Farklar</TableHead>
                                                <TableHead className="text-right font-bold text-slate-500" scope="col">İşlemler</TableHead>
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
                                                        className="border-slate-100 dark:border-slate-800/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors duration-150 cursor-pointer group"
                                                    >
                                                        <TableCell className="font-medium">
                                                            <Link
                                                                href={`/stock-counting/${event.id}`}
                                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
                                                            >
                                                                {event.event_code}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="rounded-lg text-[10px] border-slate-200 dark:border-slate-700">
                                                                {event.event_type === 'FULL' && 'Tam Sayım'}
                                                                {event.event_type === 'CYCLE' && 'Döngüsel'}
                                                                {event.event_type === 'SPOT' && 'Spot Sayım'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={`${statusConfig.color} border flex items-center gap-1 w-fit text-[10px] rounded-lg`}>
                                                                {statusConfig.icon}
                                                                {statusConfig.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-slate-500 dark:text-slate-400 text-sm">
                                                            {new Date(event.scheduled_date).toLocaleDateString('tr-TR')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1.5 min-w-[140px]">
                                                                <Progress value={completionRate} className="h-1.5 rounded-full" />
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <span className="text-slate-400">
                                                                        {event.total_items_counted}/{event.total_items_planned}
                                                                    </span>
                                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                                        {completionRate.toFixed(0)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {event.discrepancy_count > 0 ? (
                                                                <Badge variant="destructive" className="rounded-lg text-[10px]">
                                                                    <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                                                                    {event.discrepancy_count}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                                                                    <CheckCircle2 className="h-3 w-3" /> Uyumlu
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Link href={`/stock-counting/${event.id}`}>
                                                                    <Button variant="ghost" size="sm" className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                                                                        <ArrowRight className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                <EventActions event={event} />
                                                            </div>
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
                </motion.div>
            </motion.main>
        </div>
    );
}
