/**
 * Discrepancy Approval Dialog
 * Dialog for reviewing and approving inventory discrepancies
 */
"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, XCircle, FileText } from "lucide-react";

import type { CountingDetail, DiscrepancyReason } from "@/types/counting";
import { getDiscrepancySeverity } from "@/types/counting";

interface DiscrepancyApprovalDialogProps {
    detail: CountingDetail;
    trigger?: React.ReactNode;
    onApprove: (detailId: string, reason: DiscrepancyReason, notes: string) => void;
    onReject: (detailId: string, notes: string) => void;
}

const DISCREPANCY_REASONS: Array<{ value: DiscrepancyReason; label: string }> = [
    { value: "DAMAGED", label: "Hasarlı Ürün" },
    { value: "LOST", label: "Kayıp" },
    { value: "FOUND", label: "Bulundu" },
    { value: "THEFT", label: "Çalınma Şüphesi" },
    { value: "DATA_ERROR", label: "Veri Girişi Hatası" },
    { value: "TRANSFER", label: "Transfer Kaydı Eksik" },
    { value: "OTHER", label: "Diğer" },
];

export function DiscrepancyApprovalDialog({
    detail,
    trigger,
    onApprove,
    onReject,
}: DiscrepancyApprovalDialogProps) {
    const [open, setOpen] = useState(false);
    const [action, setAction] = useState<"approve" | "reject" | null>(null);
    const [reason, setReason] = useState<DiscrepancyReason>(
        detail.discrepancy_reason || "OTHER"
    );
    const [notes, setNotes] = useState(detail.discrepancy_notes || "");

    const severity = getDiscrepancySeverity(detail.system_quantity, detail.counted_quantity);
    const isOverage = detail.discrepancy > 0;
    const isShortage = detail.discrepancy < 0;

    const handleApprove = () => {
        onApprove(detail.id, reason, notes);
        setOpen(false);
        setAction(null);
    };

    const handleReject = () => {
        onReject(detail.id, notes);
        setOpen(false);
        setAction(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        İncele
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Fark Onayı</DialogTitle>
                    <DialogDescription>
                        Sayım farkını inceleyin ve onaylayın veya reddedin
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Product Info */}
                    <div className="rounded-lg border p-4 bg-muted/50">
                        <h4 className="font-semibold mb-2">{detail.marka}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Ürün Kodu:</span>
                                <span className="ml-2">{detail.urun_kodu}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Renk:</span>
                                <span className="ml-2">{detail.renk_kodu}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Beden:</span>
                                <span className="ml-2">{detail.beden}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Konum:</span>
                                <span className="ml-2">{detail.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Discrepancy Details */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-lg bg-blue-50">
                            <p className="text-xs text-muted-foreground mb-1">Sistem Miktarı</p>
                            <p className="text-2xl font-bold text-blue-700">{detail.system_quantity}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-purple-50">
                            <p className="text-xs text-muted-foreground mb-1">Sayılan Miktar</p>
                            <p className="text-2xl font-bold text-purple-700">{detail.counted_quantity}</p>
                        </div>
                        <div
                            className={`text-center p-3 rounded-lg ${isOverage ? "bg-green-50" : "bg-red-50"
                                }`}
                        >
                            <p className="text-xs text-muted-foreground mb-1">Fark</p>
                            <p
                                className={`text-2xl font-bold ${isOverage ? "text-green-700" : "text-red-700"
                                    }`}
                            >
                                {detail.discrepancy > 0 && "+"}
                                {detail.discrepancy}
                            </p>
                        </div>
                    </div>

                    {/* Severity Badge */}
                    <div className="flex items-center gap-2">
                        <AlertTriangle
                            className={`h-5 w-5 ${severity === "HIGH"
                                    ? "text-red-500"
                                    : severity === "MEDIUM"
                                        ? "text-yellow-500"
                                        : "text-green-500"
                                }`}
                        />
                        <Badge
                            variant="outline"
                            className={
                                severity === "HIGH"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : severity === "MEDIUM"
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        : "bg-green-50 text-green-700 border-green-200"
                            }
                        >
                            {severity === "HIGH" && "Yüksek Seviye Fark"}
                            {severity === "MEDIUM" && "Orta Seviye Fark"}
                            {severity === "LOW" && "Düşük Seviye Fark"}
                        </Badge>
                    </div>

                    {/* Reason Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">Fark Nedeni *</Label>
                        <Select value={reason} onValueChange={(v) => setReason(v as DiscrepancyReason)}>
                            <SelectTrigger id="reason">
                                <SelectValue placeholder="Neden seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                {DISCREPANCY_REASONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notlar</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Fark hakkında ek bilgi veya açıklama..."
                            rows={3}
                        />
                    </div>

                    {/* High Severity Warning */}
                    {severity === "HIGH" && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-red-700">
                                <p className="font-medium">Yüksek seviye fark tespit edildi!</p>
                                <p className="mt-1">
                                    Lütfen nedeni detaylı açıklayın ve gerekirse ikinci bir doğrulama yapın.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="flex-1"
                    >
                        İptal
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleReject}
                        className="flex-1"
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reddet
                    </Button>
                    <Button type="button" onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Onayla
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
