import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon, PencilIcon } from 'lucide-react'

import { ShareButton } from '@/components/invoices/share-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="container mx-auto max-w-3xl px-4 py-10">
      {/* 헤더 */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/invoices">
              <ChevronLeftIcon className="h-4 w-4" />
              목록으로
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {invoice.invoiceNumber}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {invoice.clientName}
          </p>
        </div>
        <div className="flex gap-2">
          <ShareButton invoiceId={invoice.id} />
          <Button asChild>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <PencilIcon className="h-4 w-4" />
              편집
            </Link>
          </Button>
        </div>
      </div>

      {/* 기본 정보 */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
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
            <span className="text-xl font-bold">
              {invoice.totalAmount.toLocaleString('ko-KR')}원
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 항목 목록 */}
      {invoice.items.length > 0 && (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold">항목 목록</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="divide-y">
              {invoice.items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {item.unitPrice.toLocaleString('ko-KR')}원 ×{' '}
                      {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {item.amount.toLocaleString('ko-KR')}원
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-muted/20 flex items-center justify-between rounded-b-xl px-6 py-4">
              <span className="text-muted-foreground text-sm font-medium">
                합계
              </span>
              <span className="text-lg font-bold">
                {invoice.totalAmount.toLocaleString('ko-KR')}원
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
