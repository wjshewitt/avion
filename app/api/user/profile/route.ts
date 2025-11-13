import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await ((supabase as any)
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single())

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no profile exists, create one
    if (!profile) {
      const { data: newProfile, error: insertError } = await ((supabase as any)
        .from('user_profiles')
        .insert({
          user_id: user.id,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0]
        })
        .select()
        .single())

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({ profile: newProfile })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received update data:', body)

    // Remove fields that shouldn't be updated directly
    const updateData = { ...body }
    delete updateData.id
    delete updateData.user_id
    delete updateData.created_at
    delete updateData.updated_at
    console.log('Cleaned update data:', updateData)

    // First check if profile exists
    const { data: existingProfile } = await ((supabase as any)
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single())

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: insertError } = await ((supabase as any)
        .from('user_profiles')
        .insert({
          user_id: user.id,
          display_name: updateData.display_name || user.email?.split('@')[0] || 'User',
          ...updateData
        })
        .select()
        .single())

      if (insertError) {
        console.error('Database insert error:', insertError)
        return NextResponse.json({ 
          error: insertError.message,
          details: insertError,
          code: insertError.code
        }, { status: 500 })
      }

      console.log('Profile created successfully:', newProfile)
      return NextResponse.json({ profile: newProfile })
    }

    // Update existing profile
    const { data: profile, error } = await ((supabase as any)
      .from('user_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single())

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error,
        code: error.code
      }, { status: 500 })
    }

    console.log('Profile updated successfully:', profile)
    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error?.message,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}