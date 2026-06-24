-- Run this script in your Supabase SQL Editor to add the rating column to the orders table

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rating numeric(3,1);

-- Note: The column is named "rating" (singular) to match the profiles table, 
-- but if you specifically need the plural "ratings", you can use the line below instead:
-- ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS ratings numeric(3,1);
