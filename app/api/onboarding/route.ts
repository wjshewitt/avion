import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateUsername } from '@/lib/utils/username'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, username, avatar, role, timezone, theme, hqLocation, hqTimezoneSameAsMain } = body

    // Basic username validation (format/length), but no availability check
    const { valid, error: validationError } = validateUsername(username)

    if (!valid) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    if (!role || !timezone || !theme) {
      return NextResponse.json(
        { error: 'Missing required fields: role, timezone, and theme are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['flight_ops', 'broker'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be flight_ops or broker' },
        { status: 400 }
      )
    }

    // Map theme names: ceramic -> light, tungsten -> dark
    let themePreference = theme
    if (theme === 'ceramic') themePreference = 'light'
    if (theme === 'tungsten') themePreference = 'dark'

    // Check if profile already exists and fetch preferences for merge
    const { data: existingProfile } = await ((supabase as any)
      .from('user_profiles')
      .select('id, preferences')
      .eq('user_id', user.id)
      .single())

    let mergedPreferences: any = existingProfile?.preferences || null
    if (hqLocation || typeof hqTimezoneSameAsMain === 'boolean') {
      mergedPreferences = {
        ...(mergedPreferences || {}),
        ...(hqLocation ? { hq_location: hqLocation } : {}),
        ...(typeof hqTimezoneSameAsMain === 'boolean'
          ? { hq_timezone_same_as_main: hqTimezoneSameAsMain }
          : {}),
      }
    }

    const profileData = {
      user_id: user.id,
      username: username,
      display_name: name || username,
      avatar_url: avatar,
      role: role,
      timezone: timezone,
      theme_preference: themePreference,
      preferences: mergedPreferences,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    }

    if (!existingProfile) {
      // Create new profile
      const { data: profile, error: insertError } = await ((supabase as any)
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single())

      if (insertError) {
        console.error('Error creating profile:', insertError)
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, profile })
    } else {
      // Update existing profile
      const { data: profile, error: updateError } = await ((supabase as any)
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single())

      if (updateError) {
        console.error('Error updating profile:', updateError)
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, profile })
    }
  } catch (error: any) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message },
      { status: 500 }
    )
  }
}
