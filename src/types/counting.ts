/**
 * Stok Sayım Sistemi - Tip Tanımlamaları
 * Inventory counting system type definitions
 */

// ==========================================
// SAYIM TİPLERİ (COUNTING TYPES)
// ==========================================

/**
 * Sayım olay tipi
 */
export type CountingEventType = 'FULL' | 'CYCLE' | 'SPOT';

/**
 * Sayım durumu
 */
export type CountingStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * ABC grubu (döngüsel sayım için)
 */
export type ABCGroup = 'A' | 'B' | 'C';

/**
 * Fark nedenleri
 */
export type DiscrepancyReason =
    | 'DAMAGED'         // Hasarlı
    | 'LOST'            // Kayıp
    | 'FOUND'           // Bulundu
    | 'THEFT'           // Çalınma
    | 'DATA_ERROR'      // Veri hatası
    | 'TRANSFER'        // Transfer kaydı eksik
    | 'OTHER';          // Diğer

/**
 * Düzeltme durumu
 */
export type AdjustmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ADJUSTED';

/**
 * Düzeltme tipi
 */
export type AdjustmentType = 'INCREASE' | 'DECREASE';

// ==========================================
// ANA VERİ YAPILARI (MAIN DATA STRUCTURES)
// ==========================================

/**
 * Sayım olayı
 */
export interface CountingEvent {
    id: string;
    event_code: string;              // SCE-2024-001
    event_type: CountingEventType;
    status: CountingStatus;

    // Planlama
    scheduled_date: Date;
    started_at?: Date;
    completed_at?: Date;

    // Atama
    created_by: string;              // User ID
    assigned_to: string[];           // Sayım ekibi user IDs

    // Lokasyon ve filtreler
    location_id?: string;
    abc_group?: ABCGroup;

    // İstatistikler
    total_items_planned: number;
    total_items_counted: number;
    discrepancy_count: number;

    notes?: string;
    created_at: Date;
    updated_at: Date;
}

/**
 * Sayım detayı
 */
export interface CountingDetail {
    id: string;
    counting_event_id: string;

    // Ürün bilgileri
    product_key: string;             // Marka-ÜrünKodu-Renk-Beden
    marka: string;
    urun_kodu: string;
    urun_grubu: string;
    renk_kodu: string;
    beden: string;
    barkod?: string;
    location: string;                // Raf/Depo konumu

    // Sayım verileri
    system_quantity: number;         // Sistemdeki kayıt
    counted_quantity: number;        // Fiziksel sayım
    discrepancy: number;             // counted - system

    // Sayım bilgileri
    counted_by: string;
    counted_at: Date;
    verified_by?: string;
    verified_at?: Date;

    // Fark yönetimi
    discrepancy_reason?: DiscrepancyReason;
    discrepancy_notes?: string;

    // Düzeltme
    adjustment_status: AdjustmentStatus;
    adjusted_quantity?: number;
    adjusted_by?: string;
    adjusted_at?: Date;

    // Kanıt
    photo_urls?: string[];

    created_at: Date;
    updated_at: Date;
}

/**
 * Sayım takvimi
 */
export interface CountingSchedule {
    id: string;
    schedule_name: string;
    schedule_type: 'RECURRING' | 'ONE_TIME';

    // Döngüsel sayım ayarları
    abc_group?: ABCGroup;
    frequency?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    day_of_week?: number;            // 1-7 (Pazartesi-Pazar)
    day_of_month?: number;           // 1-31

    // Filtreler
    location_filters?: string[];
    product_filters?: {
        markalar?: string[];
    };

    // Durum
    is_active: boolean;
    next_scheduled_date: Date;
    last_executed_date?: Date;

    created_by: string;
    created_at: Date;
    updated_at: Date;
}

/**
 * Stok düzeltmesi
 */
export interface CountingAdjustment {
    id: string;
    counting_detail_id: string;

    adjustment_type: AdjustmentType;
    quantity_change: number;
    reason: string;
    financial_impact: number;        // TRY cinsinden

    approved_by: string;
    approved_at: Date;
    applied_to_inventory: boolean;
    applied_at?: Date;

    created_at: Date;
}

// ==========================================
// RAPOR YAPILARI (REPORT STRUCTURES)
// ==========================================

/**
 * Sayım özet raporu
 */
export interface CountingSummaryReport {
    event_info: {
        code: string;
        type: CountingEventType;
        date: Date;
        duration_hours: number;
    };

    statistics: {
        total_items_planned: number;
        total_items_counted: number;
        completion_rate: number;       // %
        accuracy_rate: number;         // Fark olmayan ürün %'si

        discrepancies: {
            total_count: number;
            total_value_impact: number;  // TRY
            by_reason: Record<DiscrepancyReason, number>;
        };
    };

    top_discrepancies: Array<{
        product: string;
        system_qty: number;
        counted_qty: number;
        difference: number;
        value_impact: number;
    }>;

    team_performance: Array<{
        user: string;
        items_counted: number;
        accuracy_rate: number;
        avg_time_per_item: number;     // seconds
    }>;
}

/**
 * Trend analizi raporu
 */
export interface CountingTrendReport {
    period: {
        start: Date;
        end: Date;
    };

    accuracy_trend: Array<{
        date: Date;
        accuracy_rate: number;
    }>;

    frequent_discrepancy_products: Array<{
        product: string;
        discrepancy_count: number;
        avg_discrepancy: number;
        recommendation: string;
    }>;

    financial_impact_by_month: Array<{
        month: string;
        shrinkage_value: number;       // Kayıp
        overage_value: number;         // Fazla
        net_impact: number;
    }>;

    location_analysis: Array<{
        location: string;
        discrepancy_rate: number;
        high_risk_score: number;       // 0-100
    }>;
}

// ==========================================
// FORM YAPILARI (FORM STRUCTURES)
// ==========================================

/**
 * Yeni sayım oluşturma formu
 */
export interface CreateCountingEventForm {
    event_type: CountingEventType;
    scheduled_date: Date;
    assigned_to: string[];
    location_id?: string;
    abc_group?: ABCGroup;
    notes?: string;
}

/**
 * Sayım detayı giriş formu
 */
export interface CountingDetailInput {
    product_key: string;
    counted_quantity: number;
    discrepancy_reason?: DiscrepancyReason;
    discrepancy_notes?: string;
    photo_urls?: string[];
}

// ==========================================
// YARDIMCI TİPLER (UTILITY TYPES)
// ==========================================

/**
 * Fark seviyesi (UI için renk kodlama)
 */
export type DiscrepancySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Fark seviyesini hesapla
 */
export function getDiscrepancySeverity(
    systemQty: number,
    countedQty: number
): DiscrepancySeverity {
    const diff = Math.abs(countedQty - systemQty);
    const percentage = systemQty > 0 ? (diff / systemQty) * 100 : 100;

    if (percentage < 5) return 'LOW';
    if (percentage < 15) return 'MEDIUM';
    return 'HIGH';
}

/**
 * Fark rengi (UI için)
 */
export function getDiscrepancyColor(severity: DiscrepancySeverity): string {
    switch (severity) {
        case 'LOW': return 'green';
        case 'MEDIUM': return 'yellow';
        case 'HIGH': return 'red';
    }
}
