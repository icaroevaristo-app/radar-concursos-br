-- Radar Concursos BR - fix signup profile persistence.
-- Keeps RLS enabled and avoids public profile inserts. Profiles are created by
-- the auth.users trigger and may be updated server-side with service_role.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    subscription_status
  )
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

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

grant usage on schema public to anon, authenticated, service_role;
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant execute on function public.handle_new_user() to service_role;
