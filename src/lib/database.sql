-- Companies
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text not null default 'basico',
  active boolean not null default true,
  whatsapp text,
  email text,
  logo_url text,
  created_at timestamptz default now()
);

-- Users
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'admin',
  active boolean not null default true,
  created_at timestamptz default now()
);

-- Professionals
create table professionals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  bio text,
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- Services
create table services (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null default 60,
  price integer not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- Working Hours
create table working_hours (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references professionals(id) on delete cascade,
  day_of_week integer not null,
  start_time time not null,
  end_time time not null,
  active boolean not null default true
);

-- Appointments
create table appointments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  professional_id uuid references professionals(id),
  service_id uuid references services(id),
  client_name text not null,
  client_phone text not null,
  client_email text,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pendente',
  notes text,
  payment_method text default 'presencial',
  payment_status text default 'pendente',
  created_at timestamptz default now()
);

-- RLS
alter table companies enable row level security;
alter table users enable row level security;
alter table professionals enable row level security;
alter table services enable row level security;
alter table working_hours enable row level security;
alter table appointments enable row level security;

-- Função para pegar company_id do usuário logado
create or replace function get_user_company_id()
returns uuid language sql stable
as $$ select company_id from users where id = auth.uid() $$;

-- Policies
create policy "users_own_company" on users for all using (company_id = get_user_company_id());
create policy "professionals_own_company" on professionals for all using (company_id = get_user_company_id());
create policy "services_own_company" on services for all using (company_id = get_user_company_id());
create policy "appointments_own_company" on appointments for all using (company_id = get_user_company_id());
create policy "working_hours_via_professional" on working_hours for all using (
  professional_id in (select id from professionals where company_id = get_user_company_id())
);

-- Leitura pública para página de agendamento
create policy "services_public_read" on services for select using (active = true);
create policy "professionals_public_read" on professionals for select using (active = true);
create policy "appointments_public_insert" on appointments for insert with check (true);

-- Trigger para criar user após cadastro
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into users (id, company_id, name, email, role)
  values (
    new.id,
    (new.raw_user_meta_data->>'company_id')::uuid,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
