/**
 * Counting Store
 * Zustand store for managing inventory counting data
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
    CountingEvent,
    CountingDetail,
    CountingSchedule,
    CountingAdjustment,
    CreateCountingEventForm,
    CountingDetailInput,
} from '@/types/counting';

// ==========================================
// STORE STATE INTERFACE
// ==========================================

interface CountingState {
    version: number;

    // Data
    countingEvents: CountingEvent[];
    countingDetails: CountingDetail[];
    countingSchedules: CountingSchedule[];
    countingAdjustments: CountingAdjustment[];

    // Current active counting
    activeEventId: string | null;

    // Filters and search
    searchQuery: string;
    statusFilter: string;

    // Actions - Events
    setCountingEvents: (events: CountingEvent[]) => void;
    addCountingEvent: (event: CountingEvent) => void;
    updateCountingEvent: (id: string, updates: Partial<CountingEvent>) => void;
    deleteCountingEvent: (id: string) => void;
    setActiveEvent: (id: string | null) => void;

    // Actions - Details
    setCountingDetails: (details: CountingDetail[]) => void;
    addCountingDetail: (detail: CountingDetail) => void;
    updateCountingDetail: (id: string, updates: Partial<CountingDetail>) => void;
    getDetailsByEventId: (eventId: string) => CountingDetail[];

    // Actions - Schedules
    setCountingSchedules: (schedules: CountingSchedule[]) => void;
    addCountingSchedule: (schedule: CountingSchedule) => void;
    updateCountingSchedule: (id: string, updates: Partial<CountingSchedule>) => void;
    deleteCountingSchedule: (id: string) => void;

    // Actions - Adjustments
    setCountingAdjustments: (adjustments: CountingAdjustment[]) => void;
    addCountingAdjustment: (adjustment: CountingAdjustment) => void;
    approveDiscrepancy: (detailId: string, reason: import('@/types/counting').DiscrepancyReason, notes: string, userId: string) => void;
    rejectDiscrepancy: (detailId: string, notes: string) => void;

    // Utility actions
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: string) => void;
    getFilteredEvents: () => CountingEvent[];
    clearAllData: () => void;
}

type PersistedState = Omit<
    CountingState,
    'getDetailsByEventId' | 'getFilteredEvents' | 'setSearchQuery' | 'setStatusFilter' |
    'setCountingEvents' | 'addCountingEvent' | 'updateCountingEvent' | 'deleteCountingEvent' |
    'setActiveEvent' | 'setCountingDetails' | 'addCountingDetail' | 'updateCountingDetail' |
    'setCountingSchedules' | 'addCountingSchedule' | 'updateCountingSchedule' |
    'deleteCountingSchedule' | 'setCountingAdjustments' | 'addCountingAdjustment' | 'clearAllData'
>;

// ==========================================
// STORE IMPLEMENTATION
// ==========================================

export const useCountingStore = create<CountingState>()(
    persist(
        (set, get) => ({
            version: 1,
            countingEvents: [],
            countingDetails: [],
            countingSchedules: [],
            countingAdjustments: [],
            activeEventId: null,
            searchQuery: '',
            statusFilter: '',

            // Events actions
            setCountingEvents: (events) => set({ countingEvents: events }),

            addCountingEvent: (event) =>
                set((state) => ({
                    countingEvents: [...state.countingEvents, event],
                })),

            updateCountingEvent: (id, updates) =>
                set((state) => ({
                    countingEvents: state.countingEvents.map((event) =>
                        event.id === id ? { ...event, ...updates, updated_at: new Date() } : event
                    ),
                })),

            deleteCountingEvent: (id) =>
                set((state) => ({
                    countingEvents: state.countingEvents.filter((event) => event.id !== id),
                    countingDetails: state.countingDetails.filter(
                        (detail) => detail.counting_event_id !== id
                    ),
                })),

            setActiveEvent: (id) => set({ activeEventId: id }),

            // Details actions
            setCountingDetails: (details) => set({ countingDetails: details }),

            addCountingDetail: (detail) =>
                set((state) => ({
                    countingDetails: [...state.countingDetails, detail],
                })),

            updateCountingDetail: (id, updates) =>
                set((state) => ({
                    countingDetails: state.countingDetails.map((detail) =>
                        detail.id === id ? { ...detail, ...updates, updated_at: new Date() } : detail
                    ),
                })),

            getDetailsByEventId: (eventId) => {
                return get().countingDetails.filter(
                    (detail) => detail.counting_event_id === eventId
                );
            },

            // Schedules actions
            setCountingSchedules: (schedules) => set({ countingSchedules: schedules }),

            addCountingSchedule: (schedule) =>
                set((state) => ({
                    countingSchedules: [...state.countingSchedules, schedule],
                })),

            updateCountingSchedule: (id, updates) =>
                set((state) => ({
                    countingSchedules: state.countingSchedules.map((schedule) =>
                        schedule.id === id ? { ...schedule, ...updates, updated_at: new Date() } : schedule
                    ),
                })),

            deleteCountingSchedule: (id) =>
                set((state) => ({
                    countingSchedules: state.countingSchedules.filter(
                        (schedule) => schedule.id !== id
                    ),
                })),

            // Adjustments actions
            setCountingAdjustments: (adjustments) => set({ countingAdjustments: adjustments }),

            addCountingAdjustment: (adjustment) =>
                set((state) => ({
                    countingAdjustments: [...state.countingAdjustments, adjustment],
                })),

            // Approve discrepancy and create adjustment
            approveDiscrepancy: (detailId, reason, notes, userId) => {
                const detail = get().countingDetails.find(d => d.id === detailId);
                if (!detail) return;

                // Update detail status
                get().updateCountingDetail(detailId, {
                    adjustment_status: 'APPROVED',
                    discrepancy_reason: reason,
                    discrepancy_notes: notes,
                    adjusted_by: userId,
                    adjusted_at: new Date(),
                    adjusted_quantity: detail.counted_quantity,
                });

                // Create adjustment record
                const adjustment: CountingAdjustment = {
                    id: crypto.randomUUID(),
                    counting_detail_id: detailId,
                    adjustment_type: detail.discrepancy > 0 ? 'INCREASE' : 'DECREASE',
                    quantity_change: Math.abs(detail.discrepancy),
                    reason,
                    financial_impact: 0, // TODO: Calculate based on product cost
                    approved_by: userId,
                    approved_at: new Date(),
                    applied_to_inventory: true,
                    applied_at: new Date(),
                    created_at: new Date(),
                };

                get().addCountingAdjustment(adjustment);
            },

            // Reject discrepancy
            rejectDiscrepancy: (detailId, notes) => {
                get().updateCountingDetail(detailId, {
                    adjustment_status: 'REJECTED',
                    discrepancy_notes: notes,
                });
            },

            // Utility actions
            setSearchQuery: (query) => set({ searchQuery: query }),

            setStatusFilter: (status) => set({ statusFilter: status }),

            getFilteredEvents: () => {
                const { countingEvents, searchQuery, statusFilter } = get();

                return countingEvents.filter((event) => {
                    // Search filter
                    if (searchQuery) {
                        const searchLower = searchQuery.toLowerCase();
                        const matchesSearch =
                            event.event_code.toLowerCase().includes(searchLower) ||
                            event.notes?.toLowerCase().includes(searchLower);
                        if (!matchesSearch) return false;
                    }

                    // Status filter
                    if (statusFilter && statusFilter !== 'ALL') {
                        if (event.status !== statusFilter) return false;
                    }

                    return true;
                });
            },

            clearAllData: () =>
                set({
                    countingEvents: [],
                    countingDetails: [],
                    countingSchedules: [],
                    countingAdjustments: [],
                    activeEventId: null,
                    searchQuery: '',
                    statusFilter: '',
                }),
        }),
        {
            name: 'counting-storage',
            storage: createJSONStorage(() => {
                if (typeof window !== 'undefined') {
                    return window.localStorage;
                }
                return {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { },
                };
            }),
            version: 1,
            migrate: (persistedState: unknown, version: number) => {
                if (version === 0) {
                    return {
                        version: 1,
                        countingEvents: (persistedState as PersistedState)?.countingEvents || [],
                        countingDetails: (persistedState as PersistedState)?.countingDetails || [],
                        countingSchedules: (persistedState as PersistedState)?.countingSchedules || [],
                        countingAdjustments: (persistedState as PersistedState)?.countingAdjustments || [],
                        activeEventId: null,
                        searchQuery: '',
                        statusFilter: '',
                    };
                }
                return persistedState as PersistedState;
            },
        }
    )
);

// Re-export types for convenience
export type {
    CountingEvent,
    CountingDetail,
    CountingSchedule,
    CountingAdjustment,
    CreateCountingEventForm,
    CountingDetailInput,
} from '@/types/counting';
