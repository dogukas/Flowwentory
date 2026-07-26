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
          if (!user) {
            set({ company: null, userId: null, userRole: null, isLoading: false });
            return;
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('role, company_id, companies(id, name, slug)')
            .eq('id', user.id)
            .single();

          let targetCompany: Company | null = null;

          if (profile?.companies) {
            const co = profile.companies as unknown as Company;
            targetCompany = { id: co.id, name: co.name, slug: co.slug };
          } else if (profile?.company_id) {
            // Fallback: companies join sonucu gelmediyse doğrudan ID ile şirketi sorgula
            const { data: coData } = await supabase
              .from('companies')
              .select('id, name, slug')
              .eq('id', profile.company_id)
              .single();
            if (coData) {
              targetCompany = coData;
            }
          }

          // Eğer şirketi hala bulamadıysa (ilk kurucu / null company_id durumu), sistemdeki ilk şirkete bağlamayı dene
          if (!targetCompany) {
            const { data: firstCo } = await supabase
              .from('companies')
              .select('id, name, slug')
              .order('created_at', { ascending: true })
              .limit(1)
              .single();
            if (firstCo) {
              targetCompany = firstCo;
              // Profili arka planda onar
              await supabase
                .from('profiles')
                .update({ company_id: firstCo.id, role: 'admin' })
                .eq('id', user.id);
            }
          }

          set({
            userId: user.id,
            userRole: profile?.role || 'admin',
            company: targetCompany,
          });
        } catch (err) {
          console.error('Tenant fetch error:', err);
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
