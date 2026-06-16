-- 1. Enable the pg_cron extension (This is available on all Supabase projects)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create the cleanup function
-- This looks for any rider marked as 'online' who hasn't sent a location update in the last 3 minutes
CREATE OR REPLACE FUNCTION public.mark_inactive_riders_offline()
RETURNS void AS $$
BEGIN
  UPDATE public.riders
  SET is_online = false
  WHERE is_online = true 
  AND updated_at < NOW() - INTERVAL '3 minutes';
END;
$$ LANGUAGE plpgsql;

-- 3. Schedule the cron job to run every 1 minute
-- If you need to unschedule it later, you can run: SELECT cron.unschedule('mark-inactive-riders-offline');
SELECT cron.schedule(
  'mark-inactive-riders-offline',
  '* * * * *', -- Runs every minute
  $$ SELECT public.mark_inactive_riders_offline(); $$
);
