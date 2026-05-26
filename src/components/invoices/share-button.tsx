'use client'

import { LinkIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

export function ShareButton({ invoiceId }: { invoiceId: string }) {
  async function handleCopy() {
    const url = `${window.location.origin}/client/${invoiceId}`
    await navigator.clipboard.writeText(url)
    toast.success('공유 링크가 복사되었습니다.')
  }

  return (
    <Button variant="outline" onClick={handleCopy}>
      <LinkIcon className="mr-2 h-4 w-4" />
      공유 링크 복사
    </Button>
  )
}
