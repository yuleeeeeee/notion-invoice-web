import 'server-only'

import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { env } from '@/lib/env'

// ---------------------------------------------------------------------------
// 세션 데이터 타입
// ---------------------------------------------------------------------------

export interface SessionData {
  adminEmail: string
  isLoggedIn: boolean
}

// iron-session 타입 확장
declare module 'iron-session' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IronSessionData extends SessionData {}
}

// ---------------------------------------------------------------------------
// 세션 옵션
// ---------------------------------------------------------------------------

const sessionOptions = {
  cookieName: 'invoice-session',
  password: env.SESSION_SECRET ?? 'fallback-secret-for-build-only-not-used',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    // 24시간
    maxAge: 60 * 60 * 24,
  },
}

// ---------------------------------------------------------------------------
// 세션 유틸
// ---------------------------------------------------------------------------

/** 현재 요청의 세션을 반환. 미인증이면 isLoggedIn=false */
export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

/**
 * 인증된 세션을 반환. 미인증이면 /login으로 리디렉션.
 * Server Component 및 Server Action에서 사용
 */
export async function requireSession(redirectTo = '/login') {
  const session = await getSession()
  if (!session.isLoggedIn) {
    redirect(redirectTo)
  }
  return session
}
