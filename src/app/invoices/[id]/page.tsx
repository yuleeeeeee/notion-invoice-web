import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PencilIcon } from 'lucide-react'

import { ShareButton } from '@/components/invoices/share-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getInvoice } from '@/lib/notion'
import type { InvoiceStatus } from '@/lib/notion-types'

const STATUS_VARIANT: Record<
  InvoiceStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  대기: 'secondary',
  발송: 'default',
  결제완료: 'outline',
  기간만료: 'destructive',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params
  const invoice = await getInvoice(id)

  if (!invoice) notFound()

  return (
    <div className="container mx-auto max-w-3xl py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/invoices"
            className="text-muted-foreground mb-2 block text-sm hover:underline"
          >
            ← 목록으로
          </Link>
          <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
        </div>
        <div className="flex gap-2">
          <ShareButton invoiceId={invoice.id} />
          <Button asChild>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <PencilIcon className="mr-2 h-4 w-4" />
              편집
            </Link>
          </Button>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">상태</span>
          <Badge variant={STATUS_VARIANT[invoice.status]}>
            {invoice.status}
          </Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">클라이언트명</span>
          <span className="font-medium">{invoice.clientName}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">발행일</span>
          <span>{invoice.issueDate ?? '-'}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">유효기간</span>
          <span>{invoice.validUntil ?? '-'}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">총금액</span>
          <span className="text-lg font-bold">
            {invoice.totalAmount.toLocaleString('ko-KR')}원
          </span>
        </div>
      </div>

      {/* 항목 목록 */}
      {invoice.items.length > 0 && (
        <div className="mt-6 rounded-lg border">
          <div className="border-b p-4 font-medium">항목</div>
          <div className="divide-y">
            {invoice.items.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {item.unitPrice.toLocaleString('ko-KR')}원 × {item.quantity}
                  </p>
                </div>
                <span className="font-medium">
                  {item.amount.toLocaleString('ko-KR')}원
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
