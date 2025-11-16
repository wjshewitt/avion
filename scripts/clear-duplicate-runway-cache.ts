#!/usr/bin/env tsx
// Script to clear cache entries for airports with duplicate runways
// This forces re-processing with the fixed deduplication logic

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Airports known to have duplicate runway issues
const airportsToRefresh = ['KORD', 'KATL', 'KLAX', 'EGLF'];

async function clearDuplicateRunwayCache() {
  console.log('🔧 Clearing cache for airports with duplicate runways...\n');

  for (const icao of airportsToRefresh) {
    try {
      const { error } = await supabase
        .from('airport_cache')
        .delete()
        .eq('icao_code', icao);

      if (error) {
        console.error(`❌ Failed to clear ${icao}:`, error.message);
      } else {
        console.log(`✅ Cleared cache for ${icao}`);
      }
    } catch (err) {
      console.error(`❌ Error clearing ${icao}:`, err);
    }
  }

  console.log('\n✨ Cache clearing complete!');
  console.log('Next time these airports are requested, they will be re-processed with fixed deduplication.');
}

clearDuplicateRunwayCache().catch(console.error);
