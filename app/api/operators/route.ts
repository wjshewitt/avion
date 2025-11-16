import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search');
  
  try {
    const supabase = await createClient();
    
    let query = (supabase
      .from('operators') as any)
      .select('id, name, domain, region, logo_url')
      .eq('active', true)
      .order('name');
    
    // Filter by search term if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({ operators: data || [] });
    
  } catch (error) {
    console.error('Operators fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch operators' }, { status: 500 });
  }
}
