-- THIS SCRIPT WILL FINALLY FIX THE DATABASE ERRORS PREVENTING SIGNUPS
-- Run this completely in your Supabase SQL Editor.

-- 1. Aggressively clean up ANY old broken triggers on auth.users 
-- This loops through and deletes triggers that might be trying to write to old, deleted tables.
DO $$
DECLARE
    row record;
BEGIN
    FOR row IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'users'
        AND event_object_schema = 'auth'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || row.trigger_name || ' ON auth.users;';
    END LOOP;
END;
$$;

-- 2. Drop the old function cascade just in case
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Ensure the 'riders' table has all required columns for Borla Wura App
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS language text DEFAULT 'English';
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS rider_license_number text;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS license_photo_url text;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS ghana_card_photo_url text;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS vehicle_photo_url text;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 5.0;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS total_trips integer DEFAULT 0;

-- 4. Create the new correct function
-- We use COALESCE to satisfy potential NOT-NULL constraints in your existing DB structure
CREATE OR REPLACE FUNCTION public.handle_new_rider()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.riders (
    id, 
    email, 
    first_name, 
    last_name, 
    phone,
    full_name,
    phone_number
  )
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(new.raw_user_meta_data->>'last_name', ''),
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach the single fresh trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_rider();
