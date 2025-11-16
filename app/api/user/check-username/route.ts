import { NextResponse } from 'next/server'

// Username availability checks have been disabled.
// This endpoint now simply indicates that the feature is no longer supported.
export async function GET() {
  return NextResponse.json(
    { error: 'Username availability check is disabled' },
    { status: 410 },
  );
}
