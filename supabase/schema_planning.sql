create table public.planning (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  urun_kodu text not null, -- Links to stock/sales via SKU
  target_quantity integer default 0, -- Planned production/order quantity
  notes text,
  status text default 'planned' -- planned, in_production, done
);

-- Enable RLS (though for now we allow all as per dev mode)
alter table public.planning enable row level security;

create policy "Enable all access for now"
on public.planning
for all
using (true)
with check (true);
