// middleware.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { createClient } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/api/auth']

export async function middleware(request: NextRequest) {
  // Create a response object
  const response = NextResponse.next()

  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )    
    // Get session
    const { data: { session } } = await supabase.auth.getSession()

    // Check if current path is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // If not authenticated and not on public route, redirect to login
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If authenticated but trying to access auth pages, redirect to home
    if (session && isPublicRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // If error occurs, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}