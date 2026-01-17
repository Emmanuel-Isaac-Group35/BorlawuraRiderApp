-- WARNING: THIS SCRIPT WILL DROP EXISTING TABLES AND RECREATE THEM.
-- THIS ENSURES ALL COLUMNS AND POLICIES ARE CORRECT.
-- DATA IN these tables WILL BE LOST: profiles, trips, transactions, audit_logs.

-- Drop tables with CASCADE to remove all dependent policies and keys automatically
drop table if exists public.audit_logs cascade;
drop table if exists public.transactions cascade;
drop table if exists public.trips cascade;
drop table if exists public.profiles cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES table (Public profiles for users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  phone text,
  rating numeric default 5.0,
  is_online boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- TRIPS table
create table public.trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  customer_name text not null,
  pickup_location text not null,
  drop_location text not null,
  waste_type text,
  fare numeric not null,
  status text check (status in ('pending', 'active', 'completed', 'cancelled')) default 'pending',
  rating integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  pickup_time timestamp with time zone,
  completed_at timestamp with time zone
);

-- Enable RLS
alter table public.trips enable row level security;

create policy "Users can view own trips."
  on public.trips for select
  using ( auth.uid() = user_id );

create policy "Users can insert own trips."
  on public.trips for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own trips."
  on public.trips for update
  using ( auth.uid() = user_id );

-- EARNINGS/TRANSACTIONS table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  type text check (type in ('earning', 'withdrawal', 'bonus')) not null,
  amount numeric not null,
  description text,
  status text check (status in ('completed', 'pending', 'failed')) default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.transactions enable row level security;

create policy "Users can view own transactions."
  on public.transactions for select
  using ( auth.uid() = user_id );

-- AUDIT LOGS table
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  action text not null,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.audit_logs enable row level security;

create policy "Users can view own audit logs."
  on public.audit_logs for select
  using ( auth.uid() = user_id );

create policy "Users can insert own audit logs."
  on public.audit_logs for insert
  with check ( auth.uid() = user_id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
