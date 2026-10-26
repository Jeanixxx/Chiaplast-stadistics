-- Chiaplast Statistics — esquema operativo inicial v1
-- Rama: feature/supabase-schema-v1
-- IMPORTANTE: archivo de diseño/migración; NO se ejecuta automáticamente.
-- No altera ni elimina la tabla existente public.chiaplast_reportes.
-- Revisar primero en un proyecto Supabase de pruebas y adaptar el sincronizador antes de producción.

begin;

create extension if not exists pgcrypto;

-- 1) Identidad y autorización
create table if not exists public.chiaplast_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  employee_number text unique,
  display_name text not null,
  role text not null default 'tecnico'
    check (role in ('administrador','jefe_mantenimiento','supervisor_area','tecnico','consulta')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chiaplast_areas (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.chiaplast_profile_areas (
  user_id uuid not null references public.chiaplast_profiles(user_id) on delete cascade,
  area_id uuid not null references public.chiaplast_areas(id) on delete cascade,
  can_view boolean not null default true,
  can_edit boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, area_id),
  check (not can_edit or can_view)
);

-- 2) Catálogo compartido de máquinas
create table if not exists public.chiaplast_machines (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.chiaplast_areas(id),
  machine_code text not null,
  name text not null,
  status text not null default 'Operando'
    check (status in ('Operando','Detenida','Mantenimiento','Fuera de servicio','Inactiva')),
  daily_target_kg numeric(12,2) not null default 0 check (daily_target_kg >= 0),
  location text,
  technical_data jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (area_id, machine_code)
);

-- 3) Reportes operativos / fallas. Los campos de origen se guardan; no se guardan indicadores calculados.
create table if not exists public.chiaplast_events (
  id uuid primary key default gen_random_uuid(),
  client_record_id text,
  area_id uuid not null references public.chiaplast_areas(id),
  machine_id uuid not null references public.chiaplast_machines(id),
  event_type text not null default 'falla'
    check (event_type in ('falla','incidente','paro','observacion','otro')),
  title text not null,
  description text,
  component text,
  symptoms text,
  cause text,
  action_taken text,
  status text not null default 'abierto'
    check (status in ('abierto','en_proceso','resuelto','cancelado')),
  priority text not null default 'media'
    check (priority in ('baja','media','alta','critica')),
  occurred_at timestamptz not null default now(),
  resolved_at timestamptz,
  downtime_minutes integer check (downtime_minutes is null or downtime_minutes >= 0),
  created_by uuid references public.chiaplast_profiles(user_id) on delete set null,
  assigned_to uuid references public.chiaplast_profiles(user_id) on delete set null,
  source_app text not null default 'web',
  source_record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (source_app, client_record_id)
);

create index if not exists chiaplast_events_area_machine_date_idx
  on public.chiaplast_events(area_id, machine_id, occurred_at desc);
create index if not exists chiaplast_events_status_idx
  on public.chiaplast_events(status, priority);

-- 4) Planes preventivos y ejecución de inspecciones
create table if not exists public.chiaplast_pm_plans (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.chiaplast_areas(id),
  machine_id uuid not null references public.chiaplast_machines(id),
  name text not null,
  description text,
  frequency_days integer check (frequency_days is null or frequency_days > 0),
  checklist jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.chiaplast_profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chiaplast_pm_runs (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.chiaplast_pm_plans(id) on delete set null,
  area_id uuid not null references public.chiaplast_areas(id),
  machine_id uuid not null references public.chiaplast_machines(id),
  scheduled_at timestamptz,
  performed_at timestamptz not null default now(),
  status text not null default 'completado'
    check (status in ('programado','en_proceso','completado','omitido','requiere_trabajo')),
  checklist_results jsonb not null default '[]'::jsonb,
  observations text,
  performed_by uuid references public.chiaplast_profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);

-- 5) Órdenes de trabajo
create table if not exists public.chiaplast_work_orders (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique,
  area_id uuid not null references public.chiaplast_areas(id),
  machine_id uuid not null references public.chiaplast_machines(id),
  event_id uuid references public.chiaplast_events(id) on delete set null,
  pm_run_id uuid references public.chiaplast_pm_runs(id) on delete set null,
  title text not null,
  description text,
  work_type text not null default 'correctivo'
    check (work_type in ('correctivo','preventivo','mejora','inspeccion','otro')),
  priority text not null default 'media'
    check (priority in ('baja','media','alta','critica')),
  status text not null default 'pendiente'
    check (status in ('pendiente','asignada','en_proceso','en_espera','completada','cancelada')),
  assigned_to uuid references public.chiaplast_profiles(user_id) on delete set null,
  opened_at timestamptz not null default now(),
  started_at timestamptz,
  closed_at timestamptz,
  labor_minutes integer check (labor_minutes is null or labor_minutes >= 0),
  materials_used jsonb not null default '[]'::jsonb,
  completion_notes text,
  created_by uuid references public.chiaplast_profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6) Refacciones e historial de movimientos; el historial no se reemplaza por un total.
create table if not exists public.chiaplast_parts (
  id uuid primary key default gen_random_uuid(),
  part_code text not null unique,
  name text not null,
  description text,
  unit text not null default 'pieza',
  minimum_stock numeric(12,3) not null default 0 check (minimum_stock >= 0),
  location text,
  supplier text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chiaplast_inventory_movements (
  id uuid primary key default gen_random_uuid(),
  part_id uuid not null references public.chiaplast_parts(id),
  area_id uuid references public.chiaplast_areas(id),
  movement_type text not null check (movement_type in ('entrada','salida','ajuste','devolucion')),
  quantity numeric(12,3) not null check (quantity > 0),
  unit_cost numeric(12,2) check (unit_cost is null or unit_cost >= 0),
  work_order_id uuid references public.chiaplast_work_orders(id) on delete set null,
  notes text,
  moved_at timestamptz not null default now(),
  created_by uuid references public.chiaplast_profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);

-- 7) Recordatorios compartidos. Las notificaciones las programa cada dispositivo.
create table if not exists public.chiaplast_reminders (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references public.chiaplast_areas(id),
  title text not null,
  description text,
  priority text not null default 'media'
    check (priority in ('baja','media','alta','critica')),
  status text not null default 'pendiente'
    check (status in ('pendiente','en_proceso','completado','cancelado')),
  due_at timestamptz,
  assigned_to uuid references public.chiaplast_profiles(user_id) on delete set null,
  created_by uuid references public.chiaplast_profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8) Evidencias seleccionadas: almacenar metadatos y ruta, nunca bytes de imagen en una fila.
-- El bucket privado "chiaplast-evidencias" debe crearse por separado en Supabase Storage.
create table if not exists public.chiaplast_attachments (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.chiaplast_areas(id),
  event_id uuid references public.chiaplast_events(id) on delete cascade,
  pm_run_id uuid references public.chiaplast_pm_runs(id) on delete cascade,
  work_order_id uuid references public.chiaplast_work_orders(id) on delete cascade,
  reminder_id uuid references public.chiaplast_reminders(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  caption text,
  uploaded_by uuid references public.chiaplast_profiles(user_id) on delete set null,
  uploaded_at timestamptz not null default now(),
  check (num_nonnulls(event_id, pm_run_id, work_order_id, reminder_id) = 1)
);

-- 9) Bitácora de cambios para trazabilidad. Solo roles autorizados deben poder consultarla.
create table if not exists public.chiaplast_audit_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id text not null,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  changed_by uuid references public.chiaplast_profiles(user_id) on delete set null,
  changed_at timestamptz not null default now(),
  old_values jsonb,
  new_values jsonb
);

-- Funciones auxiliares para políticas RLS.
create or replace function public.chiaplast_is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.chiaplast_profiles p
    where p.user_id = auth.uid()
      and p.is_active
      and p.role = 'administrador'
  );
$$;

create or replace function public.chiaplast_can_view_area(p_area_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.chiaplast_is_admin()
    or exists (
      select 1
      from public.chiaplast_profiles p
      join public.chiaplast_profile_areas pa on pa.user_id = p.user_id
      where p.user_id = auth.uid()
        and p.is_active
        and pa.area_id = p_area_id
        and pa.can_view
    )
    or exists (
      select 1 from public.chiaplast_profiles p
      where p.user_id = auth.uid()
        and p.is_active
        and p.role in ('jefe_mantenimiento','consulta')
    );
$$;

create or replace function public.chiaplast_can_edit_area(p_area_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select public.chiaplast_is_admin()
    or exists (
      select 1
      from public.chiaplast_profiles p
      join public.chiaplast_profile_areas pa on pa.user_id = p.user_id
      where p.user_id = auth.uid()
        and p.is_active
        and pa.area_id = p_area_id
        and pa.can_edit
    )
    or exists (
      select 1 from public.chiaplast_profiles p
      where p.user_id = auth.uid()
        and p.is_active
        and p.role = 'jefe_mantenimiento'
    );
$$;

-- RLS activado en todas las tablas operativas.
alter table public.chiaplast_profiles enable row level security;
alter table public.chiaplast_areas enable row level security;
alter table public.chiaplast_profile_areas enable row level security;
alter table public.chiaplast_machines enable row level security;
alter table public.chiaplast_events enable row level security;
alter table public.chiaplast_pm_plans enable row level security;
alter table public.chiaplast_pm_runs enable row level security;
alter table public.chiaplast_work_orders enable row level security;
alter table public.chiaplast_parts enable row level security;
alter table public.chiaplast_inventory_movements enable row level security;
alter table public.chiaplast_reminders enable row level security;
alter table public.chiaplast_attachments enable row level security;
alter table public.chiaplast_audit_log enable row level security;

-- Políticas iniciales: no se concede acceso anónimo.
drop policy if exists "profiles_read_self_or_admin" on public.chiaplast_profiles;
create policy "profiles_read_self_or_admin" on public.chiaplast_profiles
for select to authenticated
using (user_id = auth.uid() or public.chiaplast_is_admin());

drop policy if exists "profiles_update_self_limited" on public.chiaplast_profiles;
create policy "profiles_update_self_limited" on public.chiaplast_profiles
for update to authenticated
using (user_id = auth.uid() or public.chiaplast_is_admin())
with check (user_id = auth.uid() or public.chiaplast_is_admin());

drop policy if exists "areas_read_authorized" on public.chiaplast_areas;
create policy "areas_read_authorized" on public.chiaplast_areas
for select to authenticated
using (public.chiaplast_is_admin() or exists (
  select 1 from public.chiaplast_profiles p
  where p.user_id = auth.uid() and p.is_active
    and p.role in ('jefe_mantenimiento','consulta')
) or exists (
  select 1 from public.chiaplast_profile_areas pa
  where pa.user_id = auth.uid() and pa.area_id = id and pa.can_view
));

drop policy if exists "areas_admin_manage" on public.chiaplast_areas;
create policy "areas_admin_manage" on public.chiaplast_areas
for all to authenticated
using (public.chiaplast_is_admin())
with check (public.chiaplast_is_admin());

drop policy if exists "profile_areas_self_or_admin_read" on public.chiaplast_profile_areas;
create policy "profile_areas_self_or_admin_read" on public.chiaplast_profile_areas
for select to authenticated
using (user_id = auth.uid() or public.chiaplast_is_admin());

drop policy if exists "profile_areas_admin_manage" on public.chiaplast_profile_areas;
create policy "profile_areas_admin_manage" on public.chiaplast_profile_areas
for all to authenticated
using (public.chiaplast_is_admin())
with check (public.chiaplast_is_admin());

drop policy if exists "machines_area_read" on public.chiaplast_machines;
create policy "machines_area_read" on public.chiaplast_machines
for select to authenticated using (public.chiaplast_can_view_area(area_id));
drop policy if exists "machines_area_insert" on public.chiaplast_machines;
create policy "machines_area_insert" on public.chiaplast_machines
for insert to authenticated with check (public.chiaplast_can_edit_area(area_id));
drop policy if exists "machines_area_update" on public.chiaplast_machines;
create policy "machines_area_update" on public.chiaplast_machines
for update to authenticated using (public.chiaplast_can_edit_area(area_id))
with check (public.chiaplast_can_edit_area(area_id));
drop policy if exists "machines_admin_delete" on public.chiaplast_machines;
create policy "machines_admin_delete" on public.chiaplast_machines
for delete to authenticated using (public.chiaplast_is_admin());

-- Policies CRUD por área para registros operativos.
do $policies$
declare t text;
begin
  foreach t in array array[
    'chiaplast_events','chiaplast_pm_plans','chiaplast_pm_runs',
    'chiaplast_work_orders','chiaplast_inventory_movements','chiaplast_attachments'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_read_area', t);
    execute format('create policy %I on public.%I for select to authenticated using (public.chiaplast_can_view_area(area_id))', t || '_read_area', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert_area', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.chiaplast_can_edit_area(area_id))', t || '_insert_area', t);
    execute format('drop policy if exists %I on public.%I', t || '_update_area', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.chiaplast_can_edit_area(area_id)) with check (public.chiaplast_can_edit_area(area_id))', t || '_update_area', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete_area', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.chiaplast_is_admin())', t || '_delete_area', t);
  end loop;
end
$policies$;

drop policy if exists "parts_read_authenticated" on public.chiaplast_parts;
create policy "parts_read_authenticated" on public.chiaplast_parts
for select to authenticated using (
  public.chiaplast_is_admin()
  or exists (select 1 from public.chiaplast_profiles p
    where p.user_id = auth.uid() and p.is_active
      and p.role in ('jefe_mantenimiento','supervisor_area','tecnico','consulta'))
);
drop policy if exists "parts_manage_admin_or_maintenance" on public.chiaplast_parts;
create policy "parts_manage_admin_or_maintenance" on public.chiaplast_parts
for all to authenticated
using (public.chiaplast_is_admin() or exists (
  select 1 from public.chiaplast_profiles p
  where p.user_id = auth.uid() and p.is_active
    and p.role in ('jefe_mantenimiento','supervisor_area')
))
with check (public.chiaplast_is_admin() or exists (
  select 1 from public.chiaplast_profiles p
  where p.user_id = auth.uid() and p.is_active
    and p.role in ('jefe_mantenimiento','supervisor_area')
));

drop policy if exists "reminders_read_area_or_global" on public.chiaplast_reminders;
create policy "reminders_read_area_or_global" on public.chiaplast_reminders
for select to authenticated using (
  area_id is null and (public.chiaplast_is_admin() or exists (
    select 1 from public.chiaplast_profiles p where p.user_id=auth.uid()
    and p.is_active and p.role in ('jefe_mantenimiento','consulta')
  )) or (area_id is not null and public.chiaplast_can_view_area(area_id))
);
drop policy if exists "reminders_insert_area_or_global" on public.chiaplast_reminders;
create policy "reminders_insert_area_or_global" on public.chiaplast_reminders
for insert to authenticated with check (
  (area_id is null and (public.chiaplast_is_admin() or exists (
    select 1 from public.chiaplast_profiles p where p.user_id=auth.uid()
    and p.is_active and p.role in ('jefe_mantenimiento')
  ))) or (area_id is not null and public.chiaplast_can_edit_area(area_id))
);
drop policy if exists "reminders_update_area_or_global" on public.chiaplast_reminders;
create policy "reminders_update_area_or_global" on public.chiaplast_reminders
for update to authenticated using (
  (area_id is null and (public.chiaplast_is_admin() or exists (
    select 1 from public.chiaplast_profiles p where p.user_id=auth.uid()
    and p.is_active and p.role in ('jefe_mantenimiento')
  ))) or (area_id is not null and public.chiaplast_can_edit_area(area_id))
) with check (
  (area_id is null and (public.chiaplast_is_admin() or exists (
    select 1 from public.chiaplast_profiles p where p.user_id=auth.uid()
    and p.is_active and p.role in ('jefe_mantenimiento')
  ))) or (area_id is not null and public.chiaplast_can_edit_area(area_id))
);
drop policy if exists "reminders_admin_delete" on public.chiaplast_reminders;
create policy "reminders_admin_delete" on public.chiaplast_reminders
for delete to authenticated using (public.chiaplast_is_admin());

drop policy if exists "audit_admin_read" on public.chiaplast_audit_log;
create policy "audit_admin_read" on public.chiaplast_audit_log
for select to authenticated using (public.chiaplast_is_admin());

-- Por seguridad, las tablas no se exponen a anon y el log no permite escrituras directas.
revoke all on public.chiaplast_profiles, public.chiaplast_areas,
  public.chiaplast_profile_areas, public.chiaplast_machines, public.chiaplast_events,
  public.chiaplast_pm_plans, public.chiaplast_pm_runs, public.chiaplast_work_orders,
  public.chiaplast_parts, public.chiaplast_inventory_movements, public.chiaplast_reminders,
  public.chiaplast_attachments, public.chiaplast_audit_log from anon;
grant select, insert, update, delete on public.chiaplast_profiles,
  public.chiaplast_areas, public.chiaplast_profile_areas, public.chiaplast_machines,
  public.chiaplast_events, public.chiaplast_pm_plans, public.chiaplast_pm_runs,
  public.chiaplast_work_orders, public.chiaplast_parts, public.chiaplast_inventory_movements,
  public.chiaplast_reminders, public.chiaplast_attachments to authenticated;
grant select on public.chiaplast_audit_log to authenticated;
grant usage, select on sequence public.chiaplast_audit_log_id_seq to authenticated;

commit;

-- Pendientes antes de producción:
-- 1. Crear el bucket privado chiaplast-evidencias y sus políticas Storage equivalentes por área.
-- 2. Crear perfil/rol y asignaciones por medio de un flujo administrativo seguro; no aceptar el rol enviado por el cliente.
-- 3. Poblar áreas y máquinas desde MACHINE_DB, revisando códigos repetidos entre áreas.
-- 4. Adaptar supabase-sync.js para mapear el formato actual de db.events a chiaplast_events con IDs estables.
-- 5. Crear triggers de updated_at y auditoría, probar RLS con usuarios de cada rol.
-- 6. Migrar información existente solo después de exportar respaldo y validar conteos.
-- 7. No sincronizar el módulo de comidas ni datos de personal sensible hasta definir sus permisos específicos.
