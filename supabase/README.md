# Supabase Database Migrations

This directory contains SQL migration files for the FlightOps database schema.

## Prerequisites

Install the Supabase CLI:

```bash
# macOS
brew install supabase/tap/supabase

# Other platforms
npm install -g supabase
```

## Applying Migrations

### Option 1: Using Supabase CLI (Recommended)

**Install Supabase CLI first:**

1. Link your local project to your Supabase project:

```bash
supabase link --project-ref weivxhdfturzlyaaxwvb
```

2. Apply all migrations:

```bash
npm run supabase:migrate
# or
supabase db push
```

3. Generate TypeScript types:

```bash
npm run supabase:types
```

### Option 2: Manual Application via Supabase Dashboard

If you don't have the CLI installed, you can apply migrations manually:

1. Go to https://app.supabase.com/project/weivxhdfturzlyaaxwvb/editor
2. Open the SQL Editor
3. Copy and paste the contents of each migration file in order:
   - `20250101000000_initial_schema.sql`
   - `20250101000001_flights_rls_policies.sql`
   - `20250102000000_flight_events_table.sql`
4. Execute each migration

## Migration Files

### 20250101000000_initial_schema.sql

Creates the `flights` table with:

- UUID primary key
- Flight code, origin, destination, status
- Scheduled and arrival timestamps
- Automatic `updated_at` trigger
- Indexes on `scheduled_at` and `status`

### 20250101000001_flights_rls_policies.sql

Sets up Row Level Security (RLS) policies:

- Enables RLS on flights table
- Allows authenticated users to read flights
- Denies all client-side write operations

### 20250102000000_flight_events_table.sql

Creates the `flight_events` audit table:

- Tracks all flight state changes
- Foreign key to flights table with cascade delete
- RLS policies (read-only for authenticated users)
- Indexes on `flight_id` and `created_at`

## Verifying Migrations

After applying migrations, verify the schema:

```bash
# List all tables
supabase db list

# Check RLS policies
supabase db inspect
```

Or check in the Supabase Dashboard:

- Tables: https://app.supabase.com/project/weivxhdfturzlyaaxwvb/editor
- Policies: https://app.supabase.com/project/weivxhdfturzlyaaxwvb/auth/policies

## Regenerating Types

After any schema changes, regenerate TypeScript types:

```bash
npm run supabase:types
```

This updates `lib/supabase/types.ts` with the latest database schema.

## Verification

After applying migrations, verify the schema is correct:

```bash
# Install dotenv if not already installed
npm install --save-dev dotenv

# Run verification script
npm run supabase:verify
```

This will check that:

- Both tables exist and are accessible
- RLS policies are correctly configured
- Client-side writes are properly blocked
