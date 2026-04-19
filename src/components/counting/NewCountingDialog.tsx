/**
 * New Counting Event Dialog
 * Dialog for creating new inventory counting events
 */
"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { useCountingStore } from "@/store/useCountingStore";
import type { CountingEventType, ABCGroup } from "@/types/counting";

interface NewCountingDialogProps {
    trigger?: React.ReactNode;
}

export function NewCountingDialog({ trigger }: NewCountingDialogProps) {
    const [open, setOpen] = useState(false);
    const [eventType, setEventType] = useState<CountingEventType>("CYCLE");
    const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
    const [abcGroup, setAbcGroup] = useState<ABCGroup | undefined>("A");
    const [notes, setNotes] = useState("");

    const { addCountingEvent } = useCountingStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Generate event code
        const eventCode = `SCE-${new Date().getFullYear()}-${String(
            Math.floor(Math.random() * 1000)
        ).padStart(3, "0")}`;

        const newEvent = {
            id: uuidv4(),
            event_code: eventCode,
            event_type: eventType,
            status: "PLANNED" as const,
            scheduled_date: scheduledDate,
            created_by: "current-user", // TODO: Get from auth
            assigned_to: [],
            abc_group: eventType === "CYCLE" ? abcGroup : undefined,
            total_items_planned: 0,
            total_items_counted: 0,
            discrepancy_count: 0,
            notes,
            created_at: new Date(),
            updated_at: new Date(),
        };

        addCountingEvent(newEvent);
        setOpen(false);

        // Reset form
        setEventType("CYCLE");
        setScheduledDate(new Date());
        setAbcGroup("A");
        setNotes("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Yeni Sayım Oluştur</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Yeni Sayım Oluştur</DialogTitle>
                        <DialogDescription>
                            Yeni bir envanter sayımı planlayın ve detaylarını girin.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Event Type */}
                        <div className="grid gap-2">
                            <Label htmlFor="eventType">Sayım Tipi *</Label>
                            <Select
                                value={eventType}
                                onValueChange={(value) => setEventType(value as CountingEventType)}
                            >
                                <SelectTrigger id="eventType">
                                    <SelectValue placeholder="Sayım tipi seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FULL">Tam Sayım</SelectItem>
                                    <SelectItem value="CYCLE">Döngüsel Sayım</SelectItem>
                                    <SelectItem value="SPOT">Spot Sayım</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {eventType === "FULL" && "Tüm envanterin sayılması"}
                                {eventType === "CYCLE" && "Belirli bir ABC grubunun sayılması"}
                                {eventType === "SPOT" && "Belirli ürünlerin hızlı sayımı"}
                            </p>
                        </div>

                        {/* ABC Group (only for CYCLE) */}
                        {eventType === "CYCLE" && (
                            <div className="grid gap-2">
                                <Label htmlFor="abcGroup">ABC Grubu *</Label>
                                <Select
                                    value={abcGroup}
                                    onValueChange={(value) => setAbcGroup(value as ABCGroup)}
                                >
                                    <SelectTrigger id="abcGroup">
                                        <SelectValue placeholder="ABC grubu seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">A Grubu (Yüksek Değer)</SelectItem>
                                        <SelectItem value="B">B Grubu (Orta Değer)</SelectItem>
                                        <SelectItem value="C">C Grubu (Düşük Değer)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {abcGroup === "A" && "En değerli ürünler - haftalık sayım önerilir"}
                                    {abcGroup === "B" && "Orta değer ürünler - aylık sayım önerilir"}
                                    {abcGroup === "C" && "Düşük değer ürünler - üç aylık sayım önerilir"}
                                </p>
                            </div>
                        )}

                        {/* Scheduled Date */}
                        <div className="grid gap-2">
                            <Label>Planlanan Tarih *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "justify-start text-left font-normal",
                                            !scheduledDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {scheduledDate ? (
                                            format(scheduledDate, "PPP", { locale: tr })
                                        ) : (
                                            <span>Tarih seçin</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={scheduledDate}
                                        onSelect={(date) => date && setScheduledDate(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Notes */}
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notlar</Label>
                            <Textarea
                                id="notes"
                                placeholder="Sayım hakkında notlar..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            İptal
                        </Button>
                        <Button type="submit">Sayım Oluştur</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
