import { Metadata } from 'next'

import { LoginForm } from '@/components/login-form'

export const metadata: Metadata = {
  title: '관리자 로그인 | invoice-web',
  description: '관리자 로그인 페이지',
}

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <LoginForm />
      </div>
    </div>
  )
}
