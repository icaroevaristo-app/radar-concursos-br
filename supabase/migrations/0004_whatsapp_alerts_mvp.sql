alter table public.user_preferences
add column if not exists whatsapp_phone text null,
add column if not exists whatsapp_opt_in boolean not null default false,
add column if not exists whatsapp_opt_in_at timestamptz null,
add column if not exists whatsapp_opt_out_at timestamptz null;

create table if not exists public.whatsapp_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  contest_id uuid references public.contests(id) on delete cascade not null,
  phone text not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  sent_at timestamptz null,
  copied_at timestamptz null,
  canceled_at timestamptz null,
  error_message text null,
  created_by uuid null,
  constraint whatsapp_alerts_status_valid check (status in ('pending', 'copied', 'sent', 'failed', 'canceled')),
  constraint whatsapp_alerts_user_contest_unique unique (user_id, contest_id)
);

alter table public.whatsapp_alerts enable row level security;

drop policy if exists "whatsapp_alerts_select_own" on public.whatsapp_alerts;
create policy "whatsapp_alerts_select_own"
on public.whatsapp_alerts for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "whatsapp_alerts_admin_select" on public.whatsapp_alerts;
create policy "whatsapp_alerts_admin_select"
on public.whatsapp_alerts for select
to authenticated
using (public.is_admin());

drop policy if exists "whatsapp_alerts_admin_insert" on public.whatsapp_alerts;
create policy "whatsapp_alerts_admin_insert"
on public.whatsapp_alerts for insert
to authenticated
with check (public.is_admin());

drop policy if exists "whatsapp_alerts_admin_update" on public.whatsapp_alerts;
create policy "whatsapp_alerts_admin_update"
on public.whatsapp_alerts for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "whatsapp_alerts_admin_delete" on public.whatsapp_alerts;
create policy "whatsapp_alerts_admin_delete"
on public.whatsapp_alerts for delete
to authenticated
using (public.is_admin());
