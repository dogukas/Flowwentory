create table public.planning (
  id uuid default gen_random_uuid() primary key,
  company_id uuid not null, -- Added for multi-tenant isolation
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  urun_kodu text not null, -- Links to stock/sales via SKU
  target_quantity integer default 0, -- Planned production/order quantity
  notes text,
  status text default 'planned' -- planned, in_production, done
);

-- Enable RLS
alter table public.planning enable row level security;

-- Only users belonging to the company can access their planning records
create policy "Users can access their own company planning"
on public.planning
for all
using (company_id = auth.uid()) -- Assumes auth.uid() or jwt claim maps to company_id
with check (company_id = auth.uid());
