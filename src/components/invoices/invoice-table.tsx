import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Invoice, InvoiceStatus } from '@/lib/notion-types'

const STATUS_VARIANT: Record<
  InvoiceStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  대기: 'secondary',
  발송: 'default',
  결제완료: 'outline',
  기간만료: 'destructive',
}

function formatAmount(amount: number) {
  return amount.toLocaleString('ko-KR') + '원'
}

interface InvoiceTableProps {
  invoices: Invoice[]
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border py-16 text-center">
        <p className="text-muted-foreground text-sm">인보이스가 없습니다.</p>
        <Link
          href="/invoices/new"
          className="text-primary mt-2 text-sm underline-offset-4 hover:underline"
        >
          첫 인보이스 만들기
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>견적서 번호</TableHead>
            <TableHead>클라이언트</TableHead>
            <TableHead className="text-right">총금액</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>유효기간</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map(invoice => (
            <TableRow
              key={invoice.id}
              className="hover:bg-muted/50 cursor-pointer"
            >
              <TableCell>
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="font-medium hover:underline"
                >
                  {invoice.invoiceNumber}
                </Link>
              </TableCell>
              <TableCell>{invoice.clientName}</TableCell>
              <TableCell className="text-right">
                {formatAmount(invoice.totalAmount)}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[invoice.status]}>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {invoice.validUntil ?? '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
