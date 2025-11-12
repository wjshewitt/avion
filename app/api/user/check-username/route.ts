import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ 
        available: false, 
        error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' 
      }, { status: 200 });
    }

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if username is taken (case-insensitive)
    const { data: existingUser } = await (supabase as any)
      .from('user_profiles')
      .select('id')
      .ilike('username', username)
      .neq('user_id', user.id)
      .single();

    return NextResponse.json({ 
      available: !existingUser,
      username 
    });
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
