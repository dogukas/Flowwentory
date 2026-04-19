
import { createClient } from '@supabase/supabase-js'

// Bu anahtarları .env.local dosyasında saklamanız güvenli olur
// Örnek:
// NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxh...

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Supabase'den tüm satırları çeker (1000 satır limitini aşar).
 * Varsayılan olarak Supabase .select('*') maksimum 1000 satır döndürür.
 * Bu fonksiyon sayfalama ile TÜM verileri çeker.
 */
export async function fetchAllRows(tableName: string, selectQuery = '*') {
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
