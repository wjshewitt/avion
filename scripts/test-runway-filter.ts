#!/usr/bin/env tsx
// Test script to verify closed runway filtering

import { AirportDataProcessorImpl } from '../lib/airports/airport-data-processor';

async function testRunwayFilter() {
  console.log('🧪 Testing Runway Filter Logic\n');
  
  // Fetch KORD data from AirportDB API
  const response = await fetch(
    `https://airportdb.io/api/v1/airport/KORD?apiToken=${process.env.AIRPORTDB_API_KEY}`
  );
  
  const apiData = await response.json();
  
  console.log('📡 Raw API Data:');
  console.log(`Total runways from API: ${apiData.runways?.length || 0}`);
  console.log('\nRunway Status from API:');
  apiData.runways?.forEach((r: any) => {
    console.log(`  ${r.le_ident}/${r.he_ident}: closed=${r.closed}`);
  });
  
  // Process through our processor
  const processor = new AirportDataProcessorImpl();
  const processed = processor.processAirportData(apiData);
  
  console.log('\n✅ Processed Data:');
  console.log(`Count: ${processed.runways.count}`);
  console.log(`Details length: ${processed.runways.details.length}`);
  console.log('\nRunways after processing:');
  processed.runways.details.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.runway_designation}`);
  });
  
  // Validation
  const hasClosed14L = processed.runways.details.some(
    r => r.runway_designation.includes('14L') || r.runway_designation.includes('32R')
  );
  const hasClosed18 = processed.runways.details.some(
    r => r.runway_designation.includes('18') || r.runway_designation.includes('36')
  );
  
  console.log('\n🔍 Validation:');
  if (!hasClosed14L) {
    console.log('✅ Runway 14L/32R (closed) correctly filtered out');
  } else {
    console.log('❌ Runway 14L/32R (closed) still present!');
  }
  
  if (!hasClosed18) {
    console.log('✅ Runway 18/36 (closed) correctly filtered out');
  } else {
    console.log('❌ Runway 18/36 (closed) still present!');
  }
  
  if (processed.runways.details.length === 8) {
    console.log('✅ Correct count: 8 active runways');
  } else {
    console.log(`❌ Wrong count: ${processed.runways.details.length} (expected 8)`);
  }
}

testRunwayFilter().catch(console.error);
