-- ============================================================
-- 🔵 BACKEND AJAN: KVKK Multi-Tenant Migration
-- Çalıştır: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. ŞİRKET TABLOSU
create table if not exists public.companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,  -- URL-safe isim, login'de kullanılır
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. KULLANICI PROFİLİ (user ↔ company bağlantısı)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  company_id uuid references public.companies(id) on delete cascade,
  full_name text,
  role text default 'user' check (role in ('admin', 'user', 'viewer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. STOCKS TABLOSUNA company_id EKLE
alter table public.stocks
  add column if not exists company_id uuid references public.companies(id);

-- 4. SALES TABLOSUNA company_id EKLE
alter table public.sales
  add column if not exists company_id uuid references public.companies(id);

-- ============================================================
-- 5. RLS POLİTİKALARI — Eski "herkese açık" policy'leri kaldır
-- ============================================================

drop policy if exists "Enable all access for all users" on public.stocks;
drop policy if exists "Enable all access for all users" on public.sales;

-- Helper function: giriş yapan kullanıcının company_id'sini döndürür
create or replace function public.get_my_company_id()
returns uuid
language sql
stable
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

-- 6. STOCKS RLS: Sadece kendi şirketi
create policy "stocks_company_isolation"
  on public.stocks
  for all
  using (company_id = public.get_my_company_id())
  with check (company_id = public.get_my_company_id());

-- 7. SALES RLS: Sadece kendi şirketi
create policy "sales_company_isolation"
  on public.sales
  for all
  using (company_id = public.get_my_company_id())
  with check (company_id = public.get_my_company_id());

-- 8. PROFILES RLS: Sadece kendi profilini görebilir
alter table public.profiles enable row level security;
create policy "profiles_self_only"
  on public.profiles
  for all
  using (id = auth.uid());

-- 9. COMPANIES RLS: Kendi şirketini görebilir
alter table public.companies enable row level security;
create policy "companies_member_only"
  on public.companies
  for select
  using (
    id = (select company_id from public.profiles where id = auth.uid())
  );

-- ============================================================
-- 10. AUTO-PROFILE: Yeni kullanıcı kayıt olunca otomatik profil
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 🔵 BACKEND → 🟢 FRONTEND mesajı:
-- "profiles.company_id kullanılabilir. get_my_company_id()
--  fonksiyonu RLS'i otomatik halleder. Frontend sadece normal
--  .select() yapabilir — company filtresi otomatik gelir."
-- ============================================================
