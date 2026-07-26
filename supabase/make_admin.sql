-- ============================================================
-- 🔵 sadidogu0@gmail.com HESABINI ADMIN YAPMA VE DOĞRULAMA SORGUSU
-- Supabase Dashboard > SQL Editor > New Query > Paste & Run
-- ============================================================

-- 1. Adım: Kullanıcının profilini ADMIN yap ve ilk şirkete bağla
update public.profiles
set 
  role = 'admin',
  company_id = coalesce(
    company_id, 
    (select id from public.companies order by created_at asc limit 1)
  )
where id = (
  select id from auth.users where email = 'sadidogu0@gmail.com'
);

-- 2. Adım: İşlem sonucunu (SQL Çıktısını) tablo olarak göster
select 
  u.id as "Kullanıcı UUID",
  u.email as "E-posta Adresi",
  p.full_name as "Ad Soyad",
  p.role as "Yeni Yetki Rolü",
  c.name as "Bağlı Olduğu Şirket",
  p.created_at as "Kayıt Tarihi"
from public.profiles p
join auth.users u on u.id = p.id
left join public.companies c on c.id = p.company_id
where u.email = 'sadidogu0@gmail.com';
