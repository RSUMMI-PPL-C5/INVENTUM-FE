import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if user is on the login page
  const isLoginPage = request.nextUrl.pathname === '/'
  
  // Get access token from cookies
  const accessToken = request.cookies.get('accessToken')

  // If user is already logged in (has accessToken)
  if (accessToken) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl) {
        return NextResponse.redirect(new URL('/?error=server_error', request.url))
      }

      // Validate token with backend
      const apiResponse = await fetch(`${apiUrl}/auth/check`, {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      })

      // If token is valid
      if (apiResponse.ok) {
        // If user is on login page, redirect to dashboard
        if (isLoginPage) {
          return NextResponse.redirect(new URL('/dashboard/user', request.url))
        }
        // Otherwise allow access to requested page
        return NextResponse.next()
      } 
      // If token is invalid or expired
      else {
        // Clear the invalid token
        const response = NextResponse.redirect(new URL('/?error=token_expired', request.url))
        response.cookies.delete('accessToken')
        return response
      }
    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/?error=server_error', request.url))
    }
  } 
  // If user is not logged in (no accessToken)
  else {
    // If trying to access protected routes, redirect to login
    if (!isLoginPage) {
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url))
    }
    // If on login page, allow access
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
}