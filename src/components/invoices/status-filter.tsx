'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import type { InvoiceStatus } from '@/lib/notion-types'

const STATUS_OPTIONS: { label: string; value: InvoiceStatus | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '대기', value: '대기' },
  { label: '발송', value: '발송' },
  { label: '결제완료', value: '결제완료' },
  { label: '기간만료', value: '기간만료' },
]

export function StatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') ?? 'all'

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('status')
    } else {
      params.set('status', value)
    }
    router.push(`/invoices?${params.toString()}`)
  }

  return (
    <div className="bg-muted/30 inline-flex rounded-lg border p-1">
      {STATUS_OPTIONS.map(opt => (
        <Button
          key={opt.value}
          variant="ghost"
          size="sm"
          onClick={() => handleSelect(opt.value)}
          className={
            current === opt.value
              ? 'bg-background text-foreground hover:bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}
