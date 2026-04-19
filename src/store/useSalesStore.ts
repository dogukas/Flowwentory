/**
 * Sales Store
 * Zustand store for managing sales data with persistence
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SalesItem } from '@/types/stock';

// ==========================================
// STORE STATE INTERFACE
// ==========================================

interface SalesState {
  version: number;
  salesData: SalesItem[];
  searchQuery: string;
  filterField: string;
  filterValue: string;
  setSalesData: (data: SalesItem[]) => void;
  clearSalesData: () => void;
  setSearchQuery: (query: string) => void;
  setFilter: (field: string, value: string) => void;
  getFilteredData: () => SalesItem[];
}

type PersistedState = Omit<SalesState, 'getFilteredData'>;

// ==========================================
// STORE IMPLEMENTATION
// ==========================================

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      version: 1,
      salesData: [],
      searchQuery: '',
      filterField: '',
      filterValue: '',

      setSalesData: (data) => set({ salesData: data }),

      clearSalesData: () => set({ salesData: [] }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setFilter: (field, value) => set({ filterField: field, filterValue: value }),

      getFilteredData: () => {
        const { salesData, searchQuery, filterField, filterValue } = get();

        return salesData.filter((item) => {
          // Genel arama
          if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            return Object.values(item).some(
              (value) => value != null && value.toString().toLowerCase().includes(searchLower)
            );
          }

          // Spesifik alan filtresi
          if (filterField && filterValue) {
            const itemValue = item[filterField as keyof SalesItem];
            return itemValue != null && itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
          }

          return true;
        });
      },
    }),
    {
      name: 'sales-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => { },
          removeItem: () => { }
        };
      }),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          return {
            version: 1,
            salesData: (persistedState as PersistedState)?.salesData || [],
            searchQuery: '',
            filterField: '',
            filterValue: '',
          };
        }
        return persistedState as PersistedState;
      },
    }
  )
);

// Re-export SalesItem for backward compatibility
export type { SalesItem } from '@/types/stock';