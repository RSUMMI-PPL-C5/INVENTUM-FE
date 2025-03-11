import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('token')

  if (!accessToken) {
    return NextResponse.redirect(new URL('/?error=unauthorized', request.url))
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl) {
      return NextResponse.redirect(new URL('/?error=server_error', request.url))
    }

    const apiResponse = await fetch(`${apiUrl}/auth/check`, {
      headers: { Authorization: `Bearer ${accessToken.value}` },
    })

    if (!apiResponse.ok) {
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error(error)
    return NextResponse.redirect(new URL('/?error=server_error', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
