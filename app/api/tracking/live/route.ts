import { NextRequest, NextResponse } from 'next/server';
import { AirplanesLiveClient } from '@/lib/adsb/airplanes-live';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bounds = searchParams.get('bounds');
  
  if (!bounds) {
    return NextResponse.json(
      { error: 'Bounds parameter required (north,south,east,west)' },
      { status: 400 }
    );
  }

  const [north, south, east, west] = bounds.split(',').map(Number);

  if ([north, south, east, west].some(isNaN)) {
    return NextResponse.json(
      { error: 'Invalid bounds format' },
      { status: 400 }
    );
  }

  try {
    const traffic = await AirplanesLiveClient.getTrafficInBounds(north, south, east, west);
    return NextResponse.json(traffic);
  } catch (error) {
    console.error('Live tracking API error:', error);
    return NextResponse.json({ error: 'Failed to fetch traffic' }, { status: 500 });
  }
}
