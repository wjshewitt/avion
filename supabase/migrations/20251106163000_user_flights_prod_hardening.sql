-- Production hardening for user_flights: RLS confirm, trigger, and performance indexes

-- 1) Ensure RLS is enabled
ALTER TABLE IF EXISTS public.user_flights ENABLE ROW LEVEL SECURITY;

-- 2) Recreate RLS policies idempotently to enforce per-user isolation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_flights' AND policyname='Users can view own flights') THEN
    EXECUTE 'DROP POLICY "Users can view own flights" ON public.user_flights';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_flights' AND policyname='Authenticated users can insert own flights') THEN
    EXECUTE 'DROP POLICY "Authenticated users can insert own flights" ON public.user_flights';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_flights' AND policyname='Users can update own flights') THEN
    EXECUTE 'DROP POLICY "Users can update own flights" ON public.user_flights';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_flights' AND policyname='Users can delete own flights') THEN
    EXECUTE 'DROP POLICY "Users can delete own flights" ON public.user_flights';
  END IF;
END$$;

CREATE POLICY "Users can view own flights"
  ON public.user_flights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own flights"
  ON public.user_flights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flights"
  ON public.user_flights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own flights"
  ON public.user_flights FOR DELETE
  USING (auth.uid() = user_id);

-- 3) Ensure updated_at trigger exists on user_flights
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE event_object_schema='public' 
      AND event_object_table='user_flights' 
      AND trigger_name='update_user_flights_updated_at'
  ) THEN
    CREATE TRIGGER update_user_flights_updated_at
      BEFORE UPDATE ON public.user_flights
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- 4) Performance indexes for common access patterns
-- Composite index to serve per-user queries ordered by scheduled_at desc
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace 
    WHERE c.relname='idx_user_flights_user_sched' AND n.nspname='public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_user_flights_user_sched ON public.user_flights (user_id, scheduled_at DESC)';
  END IF;
END$$;

-- Optional selective indexes (idempotent) for frequent filters
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace 
    WHERE c.relname='idx_user_flights_aircraft' AND n.nspname='public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_user_flights_aircraft ON public.user_flights (aircraft)';
  END IF;
END$$;

-- 5) Notify PostgREST to reload schema
SELECT pg_notify('pgrst','reload schema');
