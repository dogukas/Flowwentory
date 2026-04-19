-- ============================================================
-- 🔵 BACKEND AJAN: Şirket Kayıt Fonksiyonu
-- Supabase SQL Editor'de çalıştır
-- ============================================================
-- Bu fonksiyon bir transaction içinde:
-- 1. Şirket oluşturur
-- 2. Kullanıcı profilini şirkete bağlar
-- Auth kullanıcısı client-side supabase.auth.signUp() ile oluşturulur
-- ============================================================

create or replace function public.register_company(
  p_company_name text,
  p_company_slug text,
  p_user_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_existing_slug text;
begin
  -- Slug kontrolü (benzersiz olmalı)
  select slug into v_existing_slug from companies where slug = p_company_slug;
  if v_existing_slug is not null then
    return json_build_object('error', 'Bu şirket adı zaten kullanılıyor');
  end if;

  -- Şirket oluştur
  insert into companies (name, slug)
  values (p_company_name, p_company_slug)
  returning id into v_company_id;

  -- Profili güncelle: user → company bağlantısı + admin rolü
  update profiles
  set company_id = v_company_id, role = 'admin'
  where id = p_user_id;

  return json_build_object(
    'success', true,
    'company_id', v_company_id,
    'company_name', p_company_name
  );
end;
$$;
