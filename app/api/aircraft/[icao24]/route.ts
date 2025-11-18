import { NextRequest, NextResponse } from 'next/server';
import { AdsbDbClient } from '@/lib/adsb/adsbdb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ icao24: string }> }
) {
  const { icao24 } = await params;
  
  if (!icao24) {
    return NextResponse.json({ error: 'ICAO24 code required' }, { status: 400 });
  }

  const aircraft = await AdsbDbClient.getAircraftMetadata(icao24);

  if (!aircraft) {
    return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
  }

  return NextResponse.json(aircraft);
}
