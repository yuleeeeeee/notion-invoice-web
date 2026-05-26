import { getIronSession } from 'iron-session'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import type { SessionData } from '@/lib/auth'

const sessionOptions = {
  cookieName: 'invoice-session',
  password: process.env.SESSION_SECRET!,
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

  // 보호 라우트: 미인증 시 /login?next=pathname 리디렉션
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/login', '/invoices', '/invoices/:path*'],
}
