
-- Stok Tablosu
-- JSON'daki alanlar: Marka, Ürün Grubu, Ürün Kodu, Renk Kodu, Beden, Envanter, Barkod, Sezon
create table public.stocks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  marka text,
  urun_grubu text,
  urun_kodu text,
  renk_kodu text,
  beden text,
  envanter text, -- Orijinal veride string olarak tutulduğu için text, istenirse integer'a çevrilebilir
  barkod text,
  sezon text
);

-- Satış Tablosu
-- JSON'daki alanlar: Marka, Ürün Grubu, Ürün Kodu, Renk Kodu, Beden, Envanter, Sezon, Satış Miktarı, Satış (VD)
create table public.sales (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  marka text,
  urun_grubu text,
  urun_kodu text,
  renk_kodu text,
  beden text,
  envanter text,
  sezon text,
  satis_miktari integer,
  satis_vd text -- "1.250,00 TL" gibi formatlı geldiği için text
);

-- Row Level Security (RLS) Politikaları (Opsiyonel - Başlangıç için herkese açık okuma/yazma)
alter table public.stocks enable row level security;
alter table public.sales enable row level security;

-- Geliştirme aşamasında herkese açık erişim (Production'da kapatılmalı)
create policy "Enable all access for all users" on public.stocks
for all using (true) with check (true);

create policy "Enable all access for all users" on public.sales
for all using (true) with check (true);
