-- Rename flights table to user_flights to avoid confusion about "public"
-- Note: "public" is the schema, not visibility. This migration renames the table
-- and updates related indexes, triggers, policies, and FKs.

-- 1) Rename table
ALTER TABLE IF EXISTS public.flights RENAME TO user_flights;

-- 2) Rename indexes if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_flights_scheduled_at' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'ALTER INDEX public.idx_flights_scheduled_at RENAME TO idx_user_flights_scheduled_at';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_flights_status' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'ALTER INDEX public.idx_flights_status RENAME TO idx_user_flights_status';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_flights_user_id' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'ALTER INDEX public.idx_flights_user_id RENAME TO idx_user_flights_user_id';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_flights_aircraft' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'ALTER INDEX public.idx_flights_aircraft RENAME TO idx_user_flights_aircraft';
  END IF;
END$$;

-- 3) Recreate updated_at trigger on renamed table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE event_object_table = 'user_flights' AND trigger_name = 'update_flights_updated_at'
  ) THEN
    EXECUTE 'DROP TRIGGER update_flights_updated_at ON public.user_flights';
  END IF;
END$$;

CREATE TRIGGER update_user_flights_updated_at
  BEFORE UPDATE ON public.user_flights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4) Drop old policies on old table name (if any remain)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='flights'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read flights" ON public.flights';
    EXECUTE 'DROP POLICY IF EXISTS "No client writes to flights" ON public.flights';
    EXECUTE 'DROP POLICY IF EXISTS "No client updates to flights" ON public.flights';
    EXECUTE 'DROP POLICY IF EXISTS "No client deletes to flights" ON public.flights';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own flights" ON public.flights';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can insert own flights" ON public.flights';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own flights" ON public.flights';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete own flights" ON public.flights';
  END IF;
END$$;

-- 5) Ensure RLS enabled and policies exist on user_flights
ALTER TABLE public.user_flights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own flights" ON public.user_flights;
DROP POLICY IF EXISTS "Authenticated users can insert own flights" ON public.user_flights;
DROP POLICY IF EXISTS "Users can update own flights" ON public.user_flights;
DROP POLICY IF EXISTS "Users can delete own flights" ON public.user_flights;

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

-- 6) Update foreign keys in dependent tables
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema='public' AND table_name='flight_events' AND constraint_type='FOREIGN KEY'
  ) THEN
    BEGIN
      ALTER TABLE public.flight_events DROP CONSTRAINT IF EXISTS flight_events_flight_id_fkey;
    EXCEPTION WHEN undefined_object THEN
      -- ignore
      NULL;
    END;
    ALTER TABLE public.flight_events
      ADD CONSTRAINT flight_events_flight_id_fkey
      FOREIGN KEY (flight_id) REFERENCES public.user_flights(id) ON DELETE CASCADE;
  END IF;
END$$;

-- 7) Reload PostgREST schema so REST sees user_flights immediately
SELECT pg_notify('pgrst','reload schema');
