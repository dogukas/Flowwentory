
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

export const isSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  !supabaseUrl.includes('YOUR_PROJECT_ID')

export const supabase = createBrowserClient(supabaseUrl, supabaseKey)

/**
 * Supabase'den tüm satırları çeker (1000 satır limitini aşar).
 * Varsayılan olarak Supabase .select('*') maksimum 1000 satır döndürür.
 * Bu fonksiyon sayfalama ile TÜM verileri çeker.
 */
export async function fetchAllRows(tableName: string, selectQuery = '*') {
  if (!isSupabaseConfigured) {
    // Yerel ortamda .env.local yoksa stoklar için public/stok.json verisini fallback olarak dön
    if (tableName === 'stocks' && typeof window !== 'undefined') {
      try {
        const res = await fetch('/stok.json');
        if (res.ok) {
          const localJson = await res.json();
          return localJson.map((item: any) => ({
            marka: item.Marka,
            urun_grubu: item["Ürün Grubu"],
            urun_kodu: String(item["Ürün Kodu"] ?? ''),
            renk_kodu: String(item["Renk Kodu"] ?? ''),
            beden: String(item.Beden ?? ''),
            envanter: String(item.Envanter ?? '0'),
            barkod: String(item.Barkod ?? ''),
            sezon: String(item.Sezon ?? ''),
          }));
        }
      } catch {
        // Fallback sessizce geçilir
      }
    }
    return [];
  }

  const PAGE_SIZE = 1000;
  let allData: any[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select(selectQuery)
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    if (data && data.length > 0) {
      allData = allData.concat(data);
      from += PAGE_SIZE;
      // Eğer dönen veri PAGE_SIZE'dan azsa, daha fazla veri yok demektir
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  return allData;
}
