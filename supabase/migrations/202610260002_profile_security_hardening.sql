-- Security hardening for the draft v1 schema.
-- Run after 202610260001_operational_schema_v1.sql.
-- Prevents a user from promoting their own role or changing their employee number.
begin;
drop policy if exists "profiles_update_self_limited" on public.chiaplast_profiles;
drop policy if exists "profiles_admin_update_only" on public.chiaplast_profiles;
create policy "profiles_admin_update_only" on public.chiaplast_profiles
for update to authenticated
using (public.chiaplast_is_admin())
with check (public.chiaplast_is_admin());

-- A profile may read its own row, but only an administrator may change profile fields.
commit;
