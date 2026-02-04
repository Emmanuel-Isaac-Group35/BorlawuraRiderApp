-- Create trips table
create table if not exists public.trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  customer_name text not null,
  pickup_location text not null,
  drop_location text,
  waste_type text default 'General Waste',
  fare numeric default 0,
  rating numeric,
  status text default 'pending', -- 'pending', 'active', 'completed', 'cancelled'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for trips
alter table public.trips enable row level security;

-- Policies for trips
create policy "Users can view their own trips"
  on public.trips for select
  using ( auth.uid() = user_id );

create policy "Users can insert trips"
  on public.trips for insert
  with check ( auth.uid() = user_id );
  
create policy "Users can update their own trips"
  on public.trips for update
  using ( auth.uid() = user_id );


-- Create transactions table
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  type text not null, -- 'deposit', 'withdrawal', 'earnings', 'trip_payment'
  amount numeric not null,
  description text,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for transactions
alter table public.transactions enable row level security;

-- Policies for transactions
create policy "Users can view their own transactions"
  on public.transactions for select
  using ( auth.uid() = user_id );

create policy "Users can insert transactions" -- (Optional, usually backend only but good for dev)
  on public.transactions for insert
  with check ( auth.uid() = user_id );

-- Seed some mock data for development
insert into public.trips (user_id, customer_name, pickup_location, waste_type, fare, status, created_at)
values 
  (auth.uid(), 'Kwame Mensah', 'Osu Oxford Street', 'Plastic Waste', 25.00, 'completed', now() - interval '2 hours'),
  (auth.uid(), 'Ama Serwaa', 'East Legon', 'General Waste', 45.00, 'completed', now() - interval '1 day'),
  (auth.uid(), 'John Doe', 'Cantonments', 'Organic Waste', 30.00, 'completed', now() - interval '2 days');

insert into public.transactions (user_id, type, amount, description, status, created_at)
values
  (auth.uid(), 'trip_payment', 25.00, 'Trip Payment - Kwame Mensah', 'completed', now() - interval '2 hours'),
  (auth.uid(), 'trip_payment', 45.00, 'Trip Payment - Ama Serwaa', 'completed', now() - interval '1 day'),
  (auth.uid(), 'withdrawal', -50.00, 'Mobile Money Withdrawal', 'completed', now() - interval '3 days');
