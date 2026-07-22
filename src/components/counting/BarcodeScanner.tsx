/**
 * Barcode Scanner Dialog
 * Simple barcode scanner using device camera or manual entry
 */
"use client";

import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanBarcode, Camera, Keyboard } from "lucide-react";

interface BarcodeScannerProps {
    trigger?: React.ReactNode;
    onScan: (barcode: string) => void;
}

export function BarcodeScanner({ trigger, onScan }: BarcodeScannerProps) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"camera" | "manual">("manual");
    const [manualCode, setManualCode] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim()) {
            onScan(manualCode.trim());
            setManualCode("");
            setOpen(false);
        }
    };

    // Auto-focus on input when dialog opens
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen && mode === "manual") {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <ScanBarcode className="mr-2 h-4 w-4" />
                        Barkod Tara
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Barkod Tara</DialogTitle>
                    <DialogDescription>
                        Barkodu manuel olarak girin veya kamera ile tarayın
                    </DialogDescription>
                </DialogHeader>

                {/* Mode Selection */}
                <div className="flex gap-2 border-b pb-4">
                    <Button
                        variant={mode === "manual" ? "default" : "outline"}
                        onClick={() => setMode("manual")}
                        className="flex-1"
                    >
                        <Keyboard className="mr-2 h-4 w-4" />
                        Manuel Giriş
                    </Button>
                    <Button
                        variant={mode === "camera" ? "default" : "outline"}
                        onClick={() => setMode("camera")}
                        className="flex-1"
                    >
                        <Camera className="mr-2 h-4 w-4" />
                        Kamera
                    </Button>
                </div>

                {/* Manual Entry Mode */}
                {mode === "manual" && (
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="barcode">Barkod Numarası</Label>
                            <Input
                                ref={inputRef}
                                id="barcode"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                placeholder="Barkod numarasını girin..."
                                autoComplete="off"
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter tuşuna basarak veya butona tıklayarak tarama yapın
                            </p>
                        </div>
                        <Button type="submit" className="w-full" disabled={!manualCode.trim()}>
                            <ScanBarcode className="mr-2 h-4 w-4" />
                            Tara
                        </Button>
                    </form>
                )}

                {/* Camera Mode */}
                {mode === "camera" && (
                    <div className="space-y-4">
                        <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <Camera className="mx-auto h-12 w-12 mb-2" />
                                <p className="text-sm">Kamera özelliği yakında eklenecek</p>
                                <p className="text-xs mt-1">Şimdilik manuel girişi kullanın</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Web kamera API entegrasyonu için modern tarayıcı gereklidir
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
