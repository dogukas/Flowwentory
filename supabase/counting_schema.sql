create table public.counting_events (
  id uuid default gen_random_uuid() primary key,
  company_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid not null,
  status text default 'active', -- active, completed, cancelled
  name text not null,
  notes text
);

create table public.counting_details (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.counting_events(id) on delete cascade,
  urun_kodu text not null,
  barcode text,
  expected_quantity integer default 0,
  counted_quantity integer default 0,
  difference integer generated always as (counted_quantity - expected_quantity) stored,
  scanned_at timestamp with time zone default now()
);

-- RLS
alter table public.counting_events enable row level security;
alter table public.counting_details enable row level security;

create policy "Users can access their own company counting events"
on public.counting_events
for all
using (company_id = auth.uid())
with check (company_id = auth.uid());

-- counting_details uses the event_id to verify access, or we can add company_id for simpler RLS
create policy "Users can access details for their events"
on public.counting_details
for all
using (
  exists (
    select 1 from public.counting_events
    where counting_events.id = counting_details.event_id
    and counting_events.company_id = auth.uid()
  )
);
