import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const LOGO_DEV_API_KEY = process.env.LOGO_DEV_API_KEY || '';
const LOGO_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

interface OperatorCache {
  logo_url: string | null;
  logo_cached_at: string | null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get('domain');
  
  if (!domain) {
    return NextResponse.json({ error: 'Domain required' }, { status: 400 });
  }

  // If no API key configured, return 404 to trigger fallback icon in UI
  if (!LOGO_DEV_API_KEY) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const supabase = await createClient();
    
    // Check if we have cached logo URL
    const { data: operator } = await (supabase
      .from('operators') as any)
      .select('logo_url, logo_cached_at')
      .eq('domain', domain)
      .single() as { data: OperatorCache | null };

    // Use cache if valid (within 30 days)
    if (operator?.logo_url && operator.logo_cached_at) {
      const cacheAge = Date.now() - new Date(operator.logo_cached_at).getTime();
      if (cacheAge < LOGO_CACHE_DURATION) {
        return NextResponse.redirect(operator.logo_url);
      }
    }

    // Determine if using publishable (pk_) or secret (sk_) key
    const isSecretKey = LOGO_DEV_API_KEY.startsWith('sk_');
    const isPublishableKey = LOGO_DEV_API_KEY.startsWith('pk_');
    
    let logoUrl: string;
    let fetchOptions: RequestInit = {};
    
    if (isSecretKey) {
      // Server-side secret key: use Authorization header
      logoUrl = `https://img.logo.dev/${domain}?size=64&format=webp&theme=auto&fallback=monogram`;
      fetchOptions = {
        headers: {
          'Authorization': `Bearer ${LOGO_DEV_API_KEY}`,
        },
      };
    } else if (isPublishableKey) {
      // Client-side publishable key: use token parameter
      logoUrl = `https://img.logo.dev/${domain}?size=64&format=webp&theme=auto&fallback=monogram&token=${LOGO_DEV_API_KEY}`;
    } else {
      // No key prefix, try as URL parameter (legacy)
      logoUrl = `https://img.logo.dev/${domain}?size=64&format=webp&theme=auto&fallback=monogram&token=${LOGO_DEV_API_KEY}`;
    }
    
    // Fetch the logo image
    const logoResponse = await fetch(logoUrl, fetchOptions);
    
    if (logoResponse.ok) {
      // Cache the logo URL in database
      if (operator) {
        await (supabase
          .from('operators') as any)
          .update({
            logo_url: logoUrl,
            logo_cached_at: new Date().toISOString(),
          })
          .eq('domain', domain);
      }
      
      // Return the image directly
      const imageBuffer = await logoResponse.arrayBuffer();
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': logoResponse.headers.get('Content-Type') || 'image/webp',
          'Cache-Control': 'public, max-age=2592000', // 30 days
        },
      });
    }
    
    // Return 404 to trigger fallback icon
    return new NextResponse(null, { status: 404 });
    
  } catch (error) {
    console.error('Logo fetch error:', error);
    return new NextResponse(null, { status: 404 });
  }
}
