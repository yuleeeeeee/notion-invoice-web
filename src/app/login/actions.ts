'use server'

import { redirect } from 'next/navigation'

import { compareStrings } from '@/lib/env'
import { env } from '@/lib/env'
import { getSession } from '@/lib/auth'

export type LoginState = {
  error?: string
}

/** 관리자 로그인 Server Action */
export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  // 자격증명 검증 (타이밍 공격 방지)
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    return { error: '관리자 계정이 설정되지 않았습니다.' }
  }

  const emailMatch = compareStrings(email, env.ADMIN_EMAIL)
  const passwordMatch = compareStrings(password, env.ADMIN_PASSWORD)

  if (!emailMatch || !passwordMatch) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
  }

  // 세션 발급
  const session = await getSession()
  session.adminEmail = email
  session.isLoggedIn = true
  await session.save()

  redirect('/invoices')
}

/** 관리자 로그아웃 Server Action */
export async function logoutAction(): Promise<void> {
  const session = await getSession()
  session.destroy()
  redirect('/login')
}
