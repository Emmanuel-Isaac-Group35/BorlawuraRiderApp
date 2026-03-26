-- Borla Wura Rider App - Database Setup Script
-- Run this in your Supabase SQL Editor to fix the "Could not find table public.riders" error.

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Create Riders Table (extends auth.users)
-- This table matches the Rider App's expectations for rider details
create table if not exists public.riders (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  phone text,
  first_name text,
  last_name text,
  language text default 'English',
  rider_license_number text,
  
  -- Document URLs
  avatar_url text,           -- Profile Photo
  license_photo_url text,    -- Rider License Photo
  ghana_card_photo_url text, -- Ghana Card Photo
  vehicle_photo_url text,    -- Vehicle/Tricycle Photo
  
  -- Rider Status & Analytics
  rating numeric default 5.0,
  is_online boolean default false,
  total_trips integer default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security
alter table public.riders enable row level security;

-- 4. Set up Policies
-- Allow anyone to see riders (necessary for showing rider info to customers, etc.)
create policy "Riders are viewable by everyone"
  on public.riders for select
  using ( true );

-- Allow users to insert their own rider record during registration
create policy "Users can insert their own rider record"
  on public.riders for insert
  with check ( auth.uid() = id );

-- Allow users to update their own rider record
create policy "Users can update their own rider record"
  on public.riders for update
  using ( auth.uid() = id );

-- 5. Create Storage Bucket for Documents (if not exists)
insert into storage.buckets (id, name, public)
values ('rider_documents', 'rider_documents', true)
on conflict (id) do nothing;

-- 6. Storage Policies for Documents
-- Allow public read access to documents
create policy "Rider documents are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'rider_documents' );

-- Allow authenticated users to upload to their own folder (folder name is user ID)
create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'rider_documents' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 7. Automated Rider Creation (Trigger)
-- This ensures a rider record is created immediately when a user signs up.
create or replace function public.handle_new_rider()
returns trigger as $$
begin
  insert into public.riders (id, email, first_name, last_name, phone)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create rider record after user registration
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_rider();

-- 8. Create TRIPS table (references riders)
create table if not exists public.trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.riders(id) not null,
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

alter table public.trips enable row level security;

create policy "Users can view own trips"
  on public.trips for select
  using ( auth.uid() = user_id );

-- 9. Create TRANSACTIONS table for earnings
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.riders(id) not null,
  type text check (type in ('earning', 'withdrawal', 'bonus')) not null,
  amount numeric not null,
  description text,
  status text check (status in ('completed', 'pending', 'failed')) default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using ( auth.uid() = user_id );
