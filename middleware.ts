import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Middleware auth error:', error)
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const user = session?.user
    const { pathname } = req.nextUrl

    // If user is signed in and trying to access auth pages, redirect to dashboard
    if (user && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // If user is not signed in and trying to access protected pages, redirect to login
    if (!user && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup']
}
