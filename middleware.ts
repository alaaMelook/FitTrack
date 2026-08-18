import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase/types'

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
]

// Routes that start with /register (invite or self-registration)
const REGISTER_PREFIX = '/register'

// Role → their home dashboard
const ROLE_HOME: Record<string, string> = {
  admin: '/admin/dashboard',
  coach: '/coach/dashboard',
  client: '/client/dashboard',
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing (e.g. on fresh Vercel deploy before adding envs), pass through gracefully
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session — IMPORTANT: do not remove this
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // Allow public routes and register flow
    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route)
    const isRegisterRoute = pathname.startsWith(REGISTER_PREFIX)
    const isApiRoute = pathname.startsWith('/api/')

    if (isPublicRoute || isRegisterRoute || isApiRoute) {
      // Redirect authenticated users away from auth pages to their dashboard
      if (user && isPublicRoute) {
        const role = user.user_metadata?.role as string | undefined
        const home = role ? (ROLE_HOME[role] ?? '/') : '/'
        return NextResponse.redirect(new URL(home, request.url))
      }
      return supabaseResponse
    }

    // Unauthenticated → redirect to login
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirected_from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = user.user_metadata?.role as string | undefined

    // Role-based route protection
    if (pathname.startsWith('/admin') && role !== 'admin') {
      const home = role ? (ROLE_HOME[role] ?? '/login') : '/login'
      return NextResponse.redirect(new URL(home, request.url))
    }
    if (pathname.startsWith('/coach') && role !== 'coach') {
      const home = role ? (ROLE_HOME[role] ?? '/login') : '/login'
      return NextResponse.redirect(new URL(home, request.url))
    }
    if (pathname.startsWith('/client') && role !== 'client') {
      const home = role ? (ROLE_HOME[role] ?? '/login') : '/login'
      return NextResponse.redirect(new URL(home, request.url))
    }

    // Handle root path — redirect to role dashboard
    if (pathname === '/') {
      const home = role ? (ROLE_HOME[role] ?? '/login') : '/login'
      return NextResponse.redirect(new URL(home, request.url))
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware execution error:', error)
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
