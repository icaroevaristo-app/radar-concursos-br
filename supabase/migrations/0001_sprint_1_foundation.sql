-- Radar Concursos BR - Sprint 1 foundation schema.
-- This migration prepares Supabase Auth, PostgreSQL tables, RLS policies,
-- admin helpers, and demo-safe constraints. It does not implement crawlers,
-- AI, payments, or real notifications.

create extension if not exists pgcrypto;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text null,
  city text null,
  state text null,
  latitude numeric null,
  longitude numeric null,
  education_level text null,
  subscription_status text not null default 'free',
  terms_accepted_at timestamptz null,
  privacy_accepted_at timestamptz null,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  states text[] not null default '{}',
  cities text[] not null default '{}',
  radius_km integer not null default 100,
  education_levels text[] not null default '{}',
  desired_roles text[] not null default '{}',
  areas text[] not null default '{}',
  min_salary numeric null,
  accepts_temporary boolean not null default true,
  accepts_reserve_list boolean not null default true,
  accepts_remote_or_other_city_exam boolean not null default true,
  notification_channels text[] not null default array['email'],
  notification_frequency text not null default 'daily',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_preferences_radius_positive check (radius_km > 0),
  constraint user_preferences_min_salary_non_negative check (min_salary is null or min_salary >= 0),
  constraint user_preferences_notification_frequency_valid check (
    notification_frequency in ('immediate', 'daily', 'weekly', 'paused')
  )
);

create table if not exists public.admin_users (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  constraint admin_users_role_valid check (role in ('owner', 'admin'))
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  base_url text not null,
  city text null,
  state text null,
  reliability_score integer not null default 50,
  crawl_frequency text null,
  crawler_strategy text null,
  status text not null default 'active',
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sources_reliability_score_range check (reliability_score between 0 and 100),
  constraint sources_type_valid check (
    type in (
      'board',
      'city_hall',
      'city_council',
      'official_diary',
      'contest_portal',
      'state_agency',
      'autarchy',
      'other'
    )
  ),
  constraint sources_status_valid check (status in ('active', 'paused', 'inactive'))
);

create table if not exists public.contests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  sphere text not null default 'municipal',
  city text null,
  state text not null,
  latitude numeric null,
  longitude numeric null,
  board text null,
  status text not null default 'draft',
  official_url text not null,
  source_id uuid null references public.sources(id) on delete set null,
  summary text null,
  document_url text null,
  document_storage_path text null,
  confidence_score integer not null default 100,
  publication_status text not null default 'draft',
  is_demo boolean not null default false,
  published_at timestamptz null,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contests_confidence_score_range check (confidence_score between 0 and 100),
  constraint contests_sphere_valid check (sphere in ('municipal', 'estadual', 'federal', 'other')),
  constraint contests_status_valid check (
    status in ('draft', 'open', 'upcoming', 'closed', 'suspended', 'canceled', 'finished', 'archived')
  ),
  constraint contests_publication_status_valid check (
    publication_status in ('draft', 'published', 'unpublished', 'needs_review', 'rejected')
  ),
  constraint contests_published_official_url_required check (
    publication_status <> 'published' or length(btrim(official_url)) > 0
  ),
  constraint contests_published_at_required check (
    publication_status <> 'published' or published_at is not null
  )
);

create table if not exists public.contest_roles (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  role_name text not null,
  area text null,
  education_level text null,
  salary numeric null,
  salary_text text null,
  vacancies integer null,
  reserve_list boolean not null default false,
  workload text null,
  requirements text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contest_roles_salary_non_negative check (salary is null or salary >= 0),
  constraint contest_roles_vacancies_non_negative check (vacancies is null or vacancies >= 0)
);

create table if not exists public.contest_dates (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  event_type text not null,
  date_start date null,
  date_end date null,
  description text null,
  is_estimated boolean not null default false,
  confidence_score integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contest_dates_confidence_score_range check (confidence_score between 0 and 100),
  constraint contest_dates_event_type_valid check (
    event_type in (
      'registration_start',
      'registration_end',
      'payment_due',
      'exam_date',
      'exam_location',
      'result',
      'appeal_period',
      'convocation',
      'other'
    )
  )
);

create table if not exists public.saved_contests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  contest_id uuid not null references public.contests(id) on delete cascade,
  status text not null default 'saved',
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_contests_user_contest_unique unique (user_id, contest_id),
  constraint saved_contests_status_valid check (
    status in ('saved', 'interested', 'registered', 'paid', 'exam_scheduled', 'abandoned', 'finished')
  )
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid null references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  "before" jsonb null,
  "after" jsonb null,
  created_at timestamptz not null default now()
);

create or replace function public.set_contest_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.publication_status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;

  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, subscription_status)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'free'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    updated_at = now();

  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and role = 'owner'
  );
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists set_contests_published_at on public.contests;
create trigger set_contests_published_at
before insert or update of publication_status, published_at on public.contests
for each row execute function public.set_contest_published_at();

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

drop trigger if exists update_user_preferences_updated_at on public.user_preferences;
create trigger update_user_preferences_updated_at
before update on public.user_preferences
for each row execute function public.update_updated_at_column();

drop trigger if exists update_sources_updated_at on public.sources;
create trigger update_sources_updated_at
before update on public.sources
for each row execute function public.update_updated_at_column();

drop trigger if exists update_contests_updated_at on public.contests;
create trigger update_contests_updated_at
before update on public.contests
for each row execute function public.update_updated_at_column();

drop trigger if exists update_contest_roles_updated_at on public.contest_roles;
create trigger update_contest_roles_updated_at
before update on public.contest_roles
for each row execute function public.update_updated_at_column();

drop trigger if exists update_contest_dates_updated_at on public.contest_dates;
create trigger update_contest_dates_updated_at
before update on public.contest_dates
for each row execute function public.update_updated_at_column();

drop trigger if exists update_saved_contests_updated_at on public.saved_contests;
create trigger update_saved_contests_updated_at
before update on public.saved_contests
for each row execute function public.update_updated_at_column();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.admin_users enable row level security;
alter table public.sources enable row level security;
alter table public.contests enable row level security;
alter table public.contest_roles enable row level security;
alter table public.contest_dates enable row level security;
alter table public.saved_contests enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select"
on public.profiles for select
to authenticated
using (public.is_admin());

drop policy if exists "user_preferences_select_own" on public.user_preferences;
create policy "user_preferences_select_own"
on public.user_preferences for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_preferences_insert_own" on public.user_preferences;
create policy "user_preferences_insert_own"
on public.user_preferences for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_preferences_update_own" on public.user_preferences;
create policy "user_preferences_update_own"
on public.user_preferences for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "user_preferences_delete_own" on public.user_preferences;
create policy "user_preferences_delete_own"
on public.user_preferences for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_preferences_admin_select" on public.user_preferences;
create policy "user_preferences_admin_select"
on public.user_preferences for select
to authenticated
using (public.is_admin());

drop policy if exists "admin_users_admin_select" on public.admin_users;
create policy "admin_users_admin_select"
on public.admin_users for select
to authenticated
using (public.is_admin());

drop policy if exists "admin_users_owner_insert" on public.admin_users;
create policy "admin_users_owner_insert"
on public.admin_users for insert
to authenticated
with check (public.is_owner());

drop policy if exists "admin_users_owner_update" on public.admin_users;
create policy "admin_users_owner_update"
on public.admin_users for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "admin_users_owner_delete" on public.admin_users;
create policy "admin_users_owner_delete"
on public.admin_users for delete
to authenticated
using (public.is_owner());

drop policy if exists "sources_authenticated_select_active" on public.sources;
create policy "sources_authenticated_select_active"
on public.sources for select
to authenticated
using (status = 'active');

drop policy if exists "sources_admin_select_all" on public.sources;
create policy "sources_admin_select_all"
on public.sources for select
to authenticated
using (public.is_admin());

drop policy if exists "sources_admin_insert" on public.sources;
create policy "sources_admin_insert"
on public.sources for insert
to authenticated
with check (public.is_admin());

drop policy if exists "sources_admin_update" on public.sources;
create policy "sources_admin_update"
on public.sources for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "sources_admin_delete" on public.sources;
create policy "sources_admin_delete"
on public.sources for delete
to authenticated
using (public.is_admin());

drop policy if exists "contests_public_select_published" on public.contests;
create policy "contests_public_select_published"
on public.contests for select
to anon, authenticated
using (publication_status = 'published');

drop policy if exists "contests_admin_select_all" on public.contests;
create policy "contests_admin_select_all"
on public.contests for select
to authenticated
using (public.is_admin());

drop policy if exists "contests_admin_insert" on public.contests;
create policy "contests_admin_insert"
on public.contests for insert
to authenticated
with check (public.is_admin());

drop policy if exists "contests_admin_update" on public.contests;
create policy "contests_admin_update"
on public.contests for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "contests_admin_delete" on public.contests;
create policy "contests_admin_delete"
on public.contests for delete
to authenticated
using (public.is_admin());

drop policy if exists "contest_roles_public_select_published_contests" on public.contest_roles;
create policy "contest_roles_public_select_published_contests"
on public.contest_roles for select
to anon, authenticated
using (
  exists (
    select 1
    from public.contests
    where contests.id = contest_roles.contest_id
      and contests.publication_status = 'published'
  )
);

drop policy if exists "contest_roles_admin_select_all" on public.contest_roles;
create policy "contest_roles_admin_select_all"
on public.contest_roles for select
to authenticated
using (public.is_admin());

drop policy if exists "contest_roles_admin_insert" on public.contest_roles;
create policy "contest_roles_admin_insert"
on public.contest_roles for insert
to authenticated
with check (public.is_admin());

drop policy if exists "contest_roles_admin_update" on public.contest_roles;
create policy "contest_roles_admin_update"
on public.contest_roles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "contest_roles_admin_delete" on public.contest_roles;
create policy "contest_roles_admin_delete"
on public.contest_roles for delete
to authenticated
using (public.is_admin());

drop policy if exists "contest_dates_public_select_published_contests" on public.contest_dates;
create policy "contest_dates_public_select_published_contests"
on public.contest_dates for select
to anon, authenticated
using (
  exists (
    select 1
    from public.contests
    where contests.id = contest_dates.contest_id
      and contests.publication_status = 'published'
  )
);

drop policy if exists "contest_dates_admin_select_all" on public.contest_dates;
create policy "contest_dates_admin_select_all"
on public.contest_dates for select
to authenticated
using (public.is_admin());

drop policy if exists "contest_dates_admin_insert" on public.contest_dates;
create policy "contest_dates_admin_insert"
on public.contest_dates for insert
to authenticated
with check (public.is_admin());

drop policy if exists "contest_dates_admin_update" on public.contest_dates;
create policy "contest_dates_admin_update"
on public.contest_dates for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "contest_dates_admin_delete" on public.contest_dates;
create policy "contest_dates_admin_delete"
on public.contest_dates for delete
to authenticated
using (public.is_admin());

drop policy if exists "saved_contests_select_own" on public.saved_contests;
create policy "saved_contests_select_own"
on public.saved_contests for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "saved_contests_insert_own" on public.saved_contests;
create policy "saved_contests_insert_own"
on public.saved_contests for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "saved_contests_update_own" on public.saved_contests;
create policy "saved_contests_update_own"
on public.saved_contests for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "saved_contests_delete_own" on public.saved_contests;
create policy "saved_contests_delete_own"
on public.saved_contests for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "saved_contests_admin_select" on public.saved_contests;
create policy "saved_contests_admin_select"
on public.saved_contests for select
to authenticated
using (public.is_admin());

drop policy if exists "audit_logs_admin_select" on public.audit_logs;
create policy "audit_logs_admin_select"
on public.audit_logs for select
to authenticated
using (public.is_admin());

drop policy if exists "audit_logs_admin_insert" on public.audit_logs;
create policy "audit_logs_admin_insert"
on public.audit_logs for insert
to authenticated
with check (public.is_admin());

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_owner() to anon, authenticated;
