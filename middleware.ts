import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  console.log('Middleware running for:', request.nextUrl.pathname)
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// // middleware.ts (in your project root)
// import { type NextRequest } from 'next/server'
// import { updateSession } from '@/utils/supabase/middleware'

// export async function middleware(request: NextRequest) {
//   try {
//     return await updateSession(request)
//   } catch (error) {
//     console.error('Middleware error:', error)
//     // If there's an unexpected error, redirect to login
//     const url = request.nextUrl.clone()
//     url.pathname = '/login'
//     return Response.redirect(url)
//   }
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
//      * Feel free to modify this pattern to include more paths.
//      */
//     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//   ],
// }

// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
// import { Database } from '@/types/supabase'
// import { updateSession } from '@/utils/supabase/middleware'

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next()
//   const supabase = createMiddlewareClient<Database>({ req, res })

//   try {
//     const {
//       data: { session },
//       error,
//     } = await supabase.auth.getSession()

//     if (error) {
//       console.error('Middleware auth error:', error)
//       return NextResponse.redirect(new URL('/login', req.url))
//     }

//     const user = session?.user
//     const { pathname } = req.nextUrl

//     // If user is signed in and trying to access auth pages, redirect to dashboard
//     if (user && (pathname === '/login' || pathname === '/signup')) {
//       return NextResponse.redirect(new URL('/dashboard', req.url))
//     }

//     // If user is not signed in and trying to access protected pages, redirect to login
//     if (!user && pathname.startsWith('/dashboard')) {
//       return NextResponse.redirect(new URL('/login', req.url))
//     }

//     return res
//   } catch (error) {
//     console.error('Middleware error:', error)
//     return NextResponse.redirect(new URL('/login', req.url))
//   }
// }

// export const config = {
//   matcher: ['/dashboard/:path*', '/login', '/signup']
// }
