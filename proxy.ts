import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Skip proxy auth checks for API routes
  if (pathname.startsWith("/api")) {
    return response;
  }

  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
  const publicPrefixes = ["/landing"];
  const onboardingRoute = "/onboarding";

  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute = publicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const isOnboardingRoute = pathname === onboardingRoute;

  const requiresAuth = !isAuthRoute && !isPublicRoute && !isOnboardingRoute;

  if (requiresAuth && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("message", "Please sign in to access this page");
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    // Check if user has completed onboarding
    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single();

    const onboardingCompleted = profile?.onboarding_completed ?? false;

    // If user hasn't completed onboarding and is not on the onboarding page
    if (!onboardingCompleted && !isOnboardingRoute && !isAuthRoute) {
      const redirectUrl = new URL(onboardingRoute, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If user has completed onboarding and is on onboarding page, redirect to flights
    if (onboardingCompleted && isOnboardingRoute) {
      const redirectUrl = new URL("/flights", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (isAuthRoute) {
      const redirectUrl = new URL(onboardingCompleted ? "/flights" : onboardingRoute, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Allow signed-in users to access /landing page (no redirect)
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
