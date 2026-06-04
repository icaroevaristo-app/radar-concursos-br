create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  provider text not null default 'manual',
  provider_subscription_id text null,
  status text not null default 'inactive',
  plan text not null default 'radar_premium',
  trial_start timestamptz null,
  trial_end timestamptz null,
  current_period_start timestamptz null,
  current_period_end timestamptz null,
  cancel_at timestamptz null,
  canceled_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_status_valid check (
    status in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'expired')
  ),
  constraint subscriptions_plan_valid check (plan in ('radar_premium')),
  constraint subscriptions_user_unique unique (user_id)
);

drop trigger if exists update_subscriptions_updated_at on public.subscriptions;
create trigger update_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.update_updated_at_column();

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
on public.subscriptions for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "subscriptions_admin_select" on public.subscriptions;
create policy "subscriptions_admin_select"
on public.subscriptions for select
to authenticated
using (public.is_admin());

drop policy if exists "subscriptions_admin_insert" on public.subscriptions;
create policy "subscriptions_admin_insert"
on public.subscriptions for insert
to authenticated
with check (public.is_admin());

drop policy if exists "subscriptions_admin_update" on public.subscriptions;
create policy "subscriptions_admin_update"
on public.subscriptions for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "subscriptions_admin_delete" on public.subscriptions;
create policy "subscriptions_admin_delete"
on public.subscriptions for delete
to authenticated
using (public.is_admin());
