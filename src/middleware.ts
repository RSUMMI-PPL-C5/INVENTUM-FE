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
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
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
      return handleError(request, 'token_expired')
    }
    
    // Get user role from token
    const userRole = getTokenPayload(accessToken).role
    
    // If on login page, redirect based on role
    if (isLoginPage) {
      return redirectBasedOnRole(request, userRole)
    }
    
    // Protect admin-only routes
    const path = request.nextUrl.pathname
    if (path.startsWith('/dashboard/user') && userRole !== 'Admin') {
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