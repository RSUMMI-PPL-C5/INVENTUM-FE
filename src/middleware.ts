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
    // First try with base64url encoding
    const payload = token.split('.')[1] ?? ''
    const base64Url = payload.replace(/-/g, '+').replace(/_/g, '/')
    const base64 = base64Url.padEnd(base64Url.length + (4 - (base64Url.length % 4)) % 4, '=')
    const json = atob(base64)
    return JSON.parse(json)
  } catch (error) {
      console.error('Failed to parse token with base64url encoding:', error)
    // Fallback to regular base64 if the first attempt fails
    try {
      const payload = token.split('.')[1] ?? ''
      const json = atob(payload)
      return JSON.parse(json)
    } catch (error) {
      console.error('Failed to parse token payload:', error)
      return {}
    }
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
    return handleError(request, 'server_error')
  }

  try {
    // Validate token with backend
    const apiResponse = await fetch(`${apiUrl}/auth/check`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    // Handle invalid token
    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}))
      if (errorData.message?.includes('expired')) {
        return handleError(request, 'token_expired')
      }
      return handleError(request, 'invalid_token')
    }

    // Get user role and validate from token
    const tokenData = getTokenPayload(accessToken)
    if (!tokenData || !tokenData.role) {
      return handleError(request, 'invalid_token')
    }

    const userRole = tokenData.role

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
    console.warn('Backend not available, skipping token validation:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
}