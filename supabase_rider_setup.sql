-- Enable UUID extension just in case
create extension if not exists "uuid-ossp";

-- Create specific public.profiles table (extends auth.users)
create table if not exists public.profiles (
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
  
  -- Rider Status
  rating numeric default 5.0,
  is_online boolean default false,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Storage Bucket Setup for 'rider_documents'
insert into storage.buckets (id, name, public)
values ('rider_documents', 'rider_documents', true)
on conflict (id) do nothing;

-- Storage Policies
-- Allow anyone to view (since public=true, but we can restrict if needed)
create policy "Documents are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'rider_documents' );

-- Allow authenticated users to upload files to their own folder (userId/*)
create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'rider_documents' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own documents"
  on storage.objects for update
  using (
    bucket_id = 'rider_documents' and
    auth.role() = 'authenticated' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
