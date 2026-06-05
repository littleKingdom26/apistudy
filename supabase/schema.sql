create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  naver_id text unique not null,
  name text,
  email text,
  profile_image text,
  created_at timestamptz not null default now()
);

create table if not exists public.public_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  address text,
  latitude double precision,
  longitude double precision,
  phone text,
  source text,
  raw_data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  plan_name text not null,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  payment_key text,
  order_id text unique not null,
  order_name text not null,
  amount integer not null,
  status text not null,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.public_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

create policy "public_items_read_all"
  on public.public_items for select
  using (true);
