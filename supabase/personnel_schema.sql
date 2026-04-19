-- ============================================================
-- 🔵 Personel Satış (Analiz) Tablosu ve KVKK Kuralları
-- Çalıştır: Supabase Dashboard > SQL Editor
-- ============================================================

create table if not exists public.personnel_sales (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  personel_adi text,
  marka text,
  urun_kodu text,
  renk_kodu text,
  satis_adeti integer,
  satis_fiyati numeric
);

-- RLS (KVKK İzolasyonu: Sadece şirketin yetkilileri)
alter table public.personnel_sales enable row level security;

-- Önce varsa eski policy'yi temizleyelim (hata vermemesi için)
drop policy if exists "personnel_sales_company_isolation" on public.personnel_sales;

-- Kendi şirketi için tüm haklar
create policy "personnel_sales_company_isolation"
  on public.personnel_sales
  for all
  using (company_id = public.get_my_company_id())
  with check (company_id = public.get_my_company_id());
