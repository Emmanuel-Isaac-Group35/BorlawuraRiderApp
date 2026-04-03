-- COMPLETE DATABASE FIX for BorlaWura
-- This script creates the missing 'profiles' table and sets up triggers
-- to automatically populate it for ALL users (both Customers and Riders).

-- 1. Create the PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  full_name text,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  rating numeric DEFAULT 5.0,
  is_online boolean DEFAULT false,
  total_trips integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Set up Policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 4. Set up the Trigger to automatically create a profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name, phone)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name')),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_profile();

-- 6. Important: Sync existing riders into the profiles table
INSERT INTO public.profiles (id, email, first_name, last_name, phone, rating, total_trips, avatar_url)
SELECT id, email, first_name, last_name, phone, rating, total_trips, avatar_url
FROM public.riders
ON CONFLICT (id) DO NOTHING;

-- 7. Ensure 'orders' table exists and has a customer_name column
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_name') THEN
    ALTER TABLE public.orders ADD COLUMN customer_name text;
  END IF;
END $$;

-- 8. AUTOMATIC TRIGGER for Orders
-- This will automatically fill customer_name when a new order is created
CREATE OR REPLACE FUNCTION public.populate_order_customer_name()
RETURNS trigger AS $$
BEGIN
  -- Try to get name from profiles
  IF NEW.customer_name IS NULL OR NEW.customer_name = 'Customer' THEN
    SELECT COALESCE(full_name, first_name || ' ' || last_name) INTO NEW.customer_name
    FROM public.profiles
    WHERE id = NEW.user_id;
  END IF;
  
  -- Fallback to riders table if still null
  IF NEW.customer_name IS NULL OR NEW.customer_name = 'Customer' THEN
    SELECT first_name || ' ' || last_name INTO NEW.customer_name
    FROM public.riders
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_created_populate_name ON public.orders;
CREATE TRIGGER on_order_created_populate_name
  BEFORE INSERT OR UPDATE OF user_id ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.populate_order_customer_name();

-- 9. ONE-TIME REPAIR for existing NULL names
UPDATE public.orders o
SET customer_name = COALESCE(p.full_name, p.first_name || ' ' || p.last_name, r.first_name || ' ' || r.last_name, 'New Customer')
FROM public.profiles p
LEFT JOIN public.riders r ON r.id = p.id
WHERE o.user_id = p.id AND (o.customer_name IS NULL OR o.customer_name = 'Customer');

-- 10. Enable RLS for orders so riders can update them if needed (like status)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Orders are viewable by everyone" ON public.orders;
CREATE POLICY "Orders are viewable by everyone" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Riders can update assigned orders" ON public.orders;
CREATE POLICY "Riders can update assigned orders" ON public.orders FOR UPDATE USING (true);

