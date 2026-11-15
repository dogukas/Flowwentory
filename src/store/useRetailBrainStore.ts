/**
 * Retail Intelligence Store (Kapalı Döngü Perakende Beyni)
 * Stok Sayım, RPT Planlama, 3D Depo Sevkiyat Listesi, OTB Bütçe,
 * Şubeler Arası Transfer (Inter-Store Balancing) ve Sezon Sonu Markdown
 * senaryolarını birbirine bağlayan merkezi Zustand store.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface PickingTask {
  id: string;
  sku: string;
  brand: string;
  productGroup: string;
  color: string;
  quantity: number;
  sourceType: "RPT_ORDER" | "STORE_TRANSFER" | "COUNT_DISCREPANCY";
  sourceStore?: string;
  targetStore?: string;
  unitCost: number;
  createdAt: string;
  status: "PENDING" | "PICKED";
}

export interface StoreTransferProposal {
  id: string;
  sku: string;
  brand: string;
  productGroup: string;
  size: string;
  fromStore: string;
  fromStoreStr: number;
  fromStoreStock: number;
  toStore: string;
  toStoreStr: number;
  toStoreStock: number;
  transferQty: number;
  savedPurchaseCost: number; // Satınalma yerine transfer yapılarak kurtarılan nakit (TL)
  status: "PROPOSED" | "APPROVED_TRANSFER";
}

export interface MarkdownRecommendation {
  sku: string;
  brand: string;
  productGroup: string;
  season: string;
  deadStockQty: number;
  tiedUpCapital: number; // Depoda bağlı kalan nakit (TL)
  recommendedDiscountPct: 20 | 30 | 50;
  expectedCashRecovery: number; // İndirim sonrası 3 haftada nakde dönecek tutar
  applied: boolean;
}

interface RetailBrainState {
  // 1. OTB (Open-To-Buy) Haftalık Satınalma Bütçesi (TL)
  otbBudgetLimit: number;
  setOtbBudgetLimit: (limit: number) => void;

  // 2. 3D Depo & Sevkiyat Toplama (Picking) Görevleri
  pickingQueue: PickingTask[];
  addPickingTask: (task: Omit<PickingTask, "id" | "createdAt" | "status">) => void;
  markPickingComplete: (id: string) => void;
  clearPickingQueue: () => void;

  // 3. Şubeler Arası Transfer (Inter-Store Balancing) Onayları
  approvedTransfers: Record<string, boolean>;
  approveStoreTransfer: (proposal: StoreTransferProposal) => void;

  // 4. Sezon Sonu Markdown (İndirim) Kampanya Onayları
  appliedMarkdowns: Record<string, number>; // sku -> discountPct
  applyMarkdown: (sku: string, discountPct: number) => void;

  // 5. Sayımdan Tetiklenen Acil RPT SKU'ları
  discrepancyAlertSkus: string[];
  flagSkuFromCounting: (sku: string) => void;
}

// Ürün grubuna göre gerçekçi birim maliyet (TL) hesaplayıcı
export function estimateUnitCost(productGroup: string, sku: string): number {
  const g = (productGroup || "").toUpperCase();
  let base = 420;
  if (g.includes("AYAKKABI") || g.includes("BOT")) base = 950;
  else if (g.includes("CEKET") || g.includes("MONT") || g.includes("KABAN")) base = 1150;
  else if (g.includes("PANTOLON") || g.includes("JEAN") || g.includes("DENIM")) base = 680;
  else if (g.includes("SWEAT") || g.includes("TRIKO") || g.includes("KAZAK")) base = 540;
  else if (g.includes("TSHIRT") || g.includes("T-SHIRT") || g.includes("TIŞÖRT")) base = 310;

  let hash = 0;
  for (let i = 0; i < sku.length; i++) {
    hash = (hash + sku.charCodeAt(i) * 17) % 120;
  }
  return base + hash;
}

export const useRetailBrainStore = create<RetailBrainState>()(
  persist(
    (set, get) => ({
      otbBudgetLimit: 500000, // Varsayılan 500.000 TL Haftalık OTB Bütçesi

      setOtbBudgetLimit: (limit) => set({ otbBudgetLimit: Math.max(50000, limit) }),

      pickingQueue: [],

      addPickingTask: (task) =>
        set((state) => {
          const existingIdx = state.pickingQueue.findIndex(
            (t) => t.sku === task.sku && t.sourceType === task.sourceType && t.status === "PENDING"
          );
          if (existingIdx > -1) {
            const updated = [...state.pickingQueue];
            updated[existingIdx] = {
              ...updated[existingIdx],
              quantity: task.quantity,
            };
            return { pickingQueue: updated };
          }
          return {
            pickingQueue: [
              {
                ...task,
                id: `${task.sku}-${Date.now()}`,
                createdAt: new Date().toISOString(),
                status: "PENDING",
              },
              ...state.pickingQueue,
            ],
          };
        }),

      markPickingComplete: (id) =>
        set((state) => ({
          pickingQueue: state.pickingQueue.map((t) =>
            t.id === id ? { ...t, status: "PICKED" } : t
          ),
        })),

      clearPickingQueue: () => set({ pickingQueue: [] }),

      approvedTransfers: {},

      approveStoreTransfer: (proposal) => {
        set((state) => ({
          approvedTransfers: { ...state.approvedTransfers, [proposal.id]: true },
        }));
        get().addPickingTask({
          sku: proposal.sku,
          brand: proposal.brand,
          productGroup: proposal.productGroup,
          color: proposal.size,
          quantity: proposal.transferQty,
          sourceType: "STORE_TRANSFER",
          sourceStore: proposal.fromStore,
          targetStore: proposal.toStore,
          unitCost: Math.round(proposal.savedPurchaseCost / Math.max(1, proposal.transferQty)),
        });
      },

      appliedMarkdowns: {},

      applyMarkdown: (sku, discountPct) =>
        set((state) => ({
          appliedMarkdowns: { ...state.appliedMarkdowns, [sku]: discountPct },
        })),

      discrepancyAlertSkus: [],

      flagSkuFromCounting: (sku) =>
        set((state) => ({
          discrepancyAlertSkus: Array.from(new Set([...state.discrepancyAlertSkus, sku])),
        })),
    }),
    {
      name: "flowwentory-retail-brain",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
);
