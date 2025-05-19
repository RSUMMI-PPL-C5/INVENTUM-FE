import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function handleError(request: NextRequest, errorType: string) {
  if (errorType === 'token_expired') {
    const response = NextResponse.redirect(new URL('/?error=token_expired', request.url))
    response.cookies.delete('accessToken')
    return response
  }
  return NextResponse.redirect(new URL(`/?error=${errorType}`, request.url))
}

function redirectBasedOnRole(request: NextRequest, userRole: string) {
  if (userRole === 'Admin') {
    return NextResponse.redirect(new URL('/dashboard/user', request.url))
  }
  return NextResponse.redirect(new URL('/dashboard/medical-equipment', request.url))
}

function getTokenPayload(token: string) {
  try {
    const payload = token.split('.')[1] ?? ''
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/'
  const accessToken = request.cookies.get('accessToken')?.value
  
  // If no token and accessing protected route, redirect to login
  if (!accessToken) {
    return isLoginPage 
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/?error=unauthorized', request.url))
  }
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    // If no API URL configured, allow access but don't validate token
    return NextResponse.next()
  }

  try {
    // Validate token with backend
    const apiResponse = await fetch(`${apiUrl}/auth/check`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    // Handle invalid token
    if (!apiResponse.ok) {
      return handleError(request, 'token_expired')
    }
    
    // Get user role from token
    const userRole = getTokenPayload(accessToken)?.role
    
    // If on login page, redirect based on role
    if (isLoginPage) {
      return redirectBasedOnRole(request, userRole || 'Fasum')
    }
    
    // Protect admin-only routes
    const path = request.nextUrl.pathname
    if (path.startsWith('/dashboard/user') && userRole !== 'Admin') {
      return NextResponse.redirect(new URL('/dashboard/medical-equipment', request.url))
    }
    
    // Allow access if authorized
    return NextResponse.next()
  } catch (error) {
    // If backend is not available, allow access but don't validate token
    console.warn('Backend not available, skipping token validation')
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
}