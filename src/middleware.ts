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
    console.error('Error parsing token:', error)
    return { role: '' }
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

  try {
    // Get user role from token
    const payload = getTokenPayload(accessToken)
    if (!payload.role) {
      console.error('Invalid token payload')
      return handleError(request, 'token_expired')
    }

    // If on login page, redirect based on role
    if (isLoginPage) {
      return redirectBasedOnRole(request, payload.role)
    }

    // Protect admin-only routes
    const path = request.nextUrl.pathname
    if (path.startsWith('/dashboard/user') && payload.role !== 'Admin') {
      return NextResponse.redirect(new URL('/dashboard/medical-equipment', request.url))
    }

    // Allow access if authorized
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return handleError(request, 'server_error')
  }
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
}