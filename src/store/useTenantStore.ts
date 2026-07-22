import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface Company { id: string; name: string; slug: string; }

interface TenantState {
  company: Company | null;
  userId: string | null;
  userRole: string | null;
  isLoading: boolean;
  fetchTenant: () => Promise<void>;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      company: null, userId: null, userRole: null, isLoading: false,

      fetchTenant: async () => {
        set({ isLoading: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) { set({ company: null, userId: null, isLoading: false }); return; }
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, company_id, companies(id, name, slug)')
            .eq('id', user.id)
            .single();
          if (profile?.companies) {
            const co = profile.companies as unknown as Company;
            set({ userId: user.id, userRole: profile.role, company: { id: co.id, name: co.name, slug: co.slug } });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      clearTenant: () => set({ company: null, userId: null, userRole: null }),
    }),
    {
      name: 'tenant-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
);
