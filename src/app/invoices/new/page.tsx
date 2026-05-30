import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'

import { createInvoiceAction } from '@/app/invoices/actions'
import { InvoiceForm } from '@/components/invoices/invoice-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewInvoicePage() {
  return (
    <div className="container mx-auto max-w-xl px-4 py-10">
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
          <Link href="/invoices">
            <ChevronLeftIcon className="h-4 w-4" />
            목록으로
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">새 인보이스</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          견적서 정보를 입력하세요
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            인보이스 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceForm
            action={createInvoiceAction}
            submitLabel="인보이스 생성"
          />
        </CardContent>
      </Card>
    </div>
  )
}
