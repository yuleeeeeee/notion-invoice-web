'use client'

import { LogOutIcon, ReceiptIcon } from 'lucide-react'
import Link from 'next/link'

import { logoutAction } from '@/app/login/actions'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

interface AdminHeaderProps {
  email: string
}

export function AdminHeader({ email }: AdminHeaderProps) {
  return (
    <header className="bg-background sticky top-0 z-10 border-b">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* 로고 */}
        <Link
          href="/invoices"
          className="flex items-center gap-2 font-semibold"
        >
          <ReceiptIcon className="h-5 w-5" />
          <span>Invoice</span>
        </Link>

        {/* 우측 영역 */}
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground hidden text-sm sm:block">
            {email}
          </span>
          <ThemeToggle />
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOutIcon className="mr-1 h-4 w-4" />
              로그아웃
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
