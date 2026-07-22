-- Create the subscriptions table
create table public.subscriptions (
  id text primary key,
  company_id text not null, -- Assuming company_id maps to user.id or a companies table
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan text default 'free',
  status text default 'active',
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- Turn on RLS
alter table public.subscriptions enable row level security;

-- Only service_role can manage all subscriptions (used by webhook)
-- Users can only read their own subscription (based on company_id = auth.uid() for now)
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (company_id = auth.uid()::text);

-- If you have a separate `companies` table and `user.user_metadata.company_id`, you'd adjust the RLS.
