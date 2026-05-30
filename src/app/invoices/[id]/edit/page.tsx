import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'

import { updateInvoiceAction } from '@/app/invoices/actions'
import { InvoiceForm } from '@/components/invoices/invoice-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInvoice } from '@/lib/notion'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditInvoicePage({ params }: PageProps) {
  const { id } = await params
  const invoice = await getInvoice(id)

  if (!invoice) notFound()

  // pageId를 첫 번째 인수로 바인딩
  const boundAction = updateInvoiceAction.bind(null, id)

  return (
    <div className="container mx-auto max-w-xl px-4 py-10">
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
          <Link href={`/invoices/${id}`}>
            <ChevronLeftIcon className="h-4 w-4" />
            상세로 돌아가기
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">인보이스 편집</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {invoice.invoiceNumber}
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
            action={boundAction}
            defaultValues={invoice}
            submitLabel="수정 저장"
          />
        </CardContent>
      </Card>
    </div>
  )
}
