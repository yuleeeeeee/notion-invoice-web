import { getIronSession } from 'iron-session'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import type { SessionData } from '@/lib/auth'

const sessionOptions = {
  cookieName: 'invoice-session',
  password:
    process.env.SESSION_SECRET ??
    'fallback-placeholder-not-used-in-production-x',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24,
  },
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // 미들웨어에서는 request/response 쌍으로 세션 접근
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions
  )

  const isLoggedIn = session.isLoggedIn === true

  // 로그인 페이지: 이미 인증된 경우 /invoices로 이동
  if (pathname === '/login') {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/invoices', request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: ['/login'],
}
