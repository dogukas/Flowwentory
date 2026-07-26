-- ============================================================
-- 🔵 BACKEND AJAN: Multi-Tenant Ekip Yönetimi & RLS İyileştirme
-- Çalıştır: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. get_my_company_id() Fonksiyonunu SECURITY DEFINER yapıyoruz
-- (RLS döngülerine girmeden en hızlı şekilde kullanıcının company_id bilgisini döndürür)
create or replace function public.get_my_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

-- 2. PROFILES RLS: Aynı şirketteki kullanıcılar birbirinin profilini görebilsin
alter table public.profiles enable row level security;

drop policy if exists "profiles_self_only" on public.profiles;
drop policy if exists "profiles_company_members_select" on public.profiles;
create policy "profiles_company_members_select"
  on public.profiles
  for select
  using (
    id = auth.uid() or
    (company_id is not null and company_id = public.get_my_company_id())
  );

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
  on public.profiles
  for update
  using (id = auth.uid());

-- 3. COMPANIES RLS: Şirket üyeleri kendi şirket kartlarını görebilsin
alter table public.companies enable row level security;

drop policy if exists "companies_member_only" on public.companies;
create policy "companies_member_only"
  on public.companies
  for select
  using (
    id = public.get_my_company_id()
  );

-- 4. RPC: Şirket Personellerini Listeleme (e-posta adresi dahil)
-- Sadece şirketin üyeleri kendi ekip arkadaşlarını listeyebilir
create or replace function public.get_company_team_members()
returns table (
  id uuid,
  full_name text,
  role text,
  created_at timestamp with time zone,
  email text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_my_company_id uuid;
begin
  select company_id into v_my_company_id
  from public.profiles
  where id = auth.uid();

  if v_my_company_id is null then
    return;
  end if;

  return query
  select 
    p.id,
    p.full_name,
    p.role,
    p.created_at,
    u.email::text
  from public.profiles p
  left join auth.users u on u.id = p.id
  where p.company_id = v_my_company_id
  order by 
    case when p.role = 'admin' then 0 else 1 end,
    p.created_at asc;
end;
$$;

-- 5. RPC: Yeni Kayıt Edilen Kullanıcıyı Şirkete Bağlama
-- Sadece 'admin' rolündeki kullanıcı kendi şirketine personel bağlayabilir
create or replace function public.add_user_to_my_company(
  p_target_user_id uuid,
  p_role text default 'user'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_company_id uuid;
  v_admin_role text;
begin
  -- Çağıran kişinin admin rolünü ve şirketini kontrol et
  select company_id, role into v_admin_company_id, v_admin_role
  from public.profiles
  where id = auth.uid();

  if v_admin_company_id is null or v_admin_role <> 'admin' then
    return json_build_object('error', 'Bu işlem için Admin yetkisi gereklidir.');
  end if;

  if p_role not in ('admin', 'user', 'viewer') then
    return json_build_object('error', 'Geçersiz rol seçildi.');
  end if;

  -- Hedef kullanıcının profilini güncelle
  update public.profiles
  set company_id = v_admin_company_id,
      role = p_role
  where id = p_target_user_id;

  return json_build_object('success', true, 'company_id', v_admin_company_id);
end;
$$;

-- 6. RPC: Personel Rolü Değiştirme
create or replace function public.update_team_member_role(
  p_target_user_id uuid,
  p_role text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_company_id uuid;
  v_admin_role text;
  v_target_company_id uuid;
begin
  select company_id, role into v_admin_company_id, v_admin_role
  from public.profiles
  where id = auth.uid();

  if v_admin_company_id is null or v_admin_role <> 'admin' then
    return json_build_object('error', 'Bu işlem için Admin yetkisi gereklidir.');
  end if;

  select company_id into v_target_company_id
  from public.profiles
  where id = p_target_user_id;

  if v_target_company_id <> v_admin_company_id then
    return json_build_object('error', 'Kullanıcı aynı şirkette değil.');
  end if;

  if p_role not in ('admin', 'user', 'viewer') then
    return json_build_object('error', 'Geçersiz rol seçildi.');
  end if;

  update public.profiles
  set role = p_role
  where id = p_target_user_id;

  return json_build_object('success', true);
end;
$$;

-- 7. RPC: Personel Çıkarma (Şirket bağlantısını kaldırma)
create or replace function public.remove_team_member(
  p_target_user_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_company_id uuid;
  v_admin_role text;
  v_target_company_id uuid;
begin
  if p_target_user_id = auth.uid() then
    return json_build_object('error', 'Kendinizi şirketten çıkaramazsınız.');
  end if;

  select company_id, role into v_admin_company_id, v_admin_role
  from public.profiles
  where id = auth.uid();

  if v_admin_company_id is null or v_admin_role <> 'admin' then
    return json_build_object('error', 'Bu işlem için Admin yetkisi gereklidir.');
  end if;

  select company_id into v_target_company_id
  from public.profiles
  where id = p_target_user_id;

  if v_target_company_id <> v_admin_company_id then
    return json_build_object('error', 'Kullanıcı bu şirkete üye değil.');
  end if;

  update public.profiles
  set company_id = null, role = 'user'
  where id = p_target_user_id;

  return json_build_object('success', true);
end;
$$;

-- 8. AUTO-HEALING: Eğer bir profilin company_id değeri NULL ise ama 
-- sistemdeki tek / ilk şirketin kurucusu/adminiyse otomatik olarak eşleştir
do $$
declare
  v_default_company_id uuid;
begin
  select id into v_default_company_id from public.companies order by created_at asc limit 1;
  if v_default_company_id is not null then
    update public.profiles
    set company_id = v_default_company_id,
        role = 'admin'
    where company_id is null;

    -- Eski stok / satış kayıtlarının company_id değeri NULL kalmışsa onları da eşleştir
    update public.stocks set company_id = v_default_company_id where company_id is null;
    update public.sales set company_id = v_default_company_id where company_id is null;
  end if;
end;
$$;
