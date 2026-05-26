import { notFound } from 'next/navigation'
import Link from 'next/link'

import { updateInvoiceAction } from '@/app/invoices/actions'
import { InvoiceForm } from '@/components/invoices/invoice-form'
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
    <div className="container mx-auto max-w-xl py-8">
      <div className="mb-6">
        <Link
          href={`/invoices/${id}`}
          className="text-muted-foreground mb-2 block text-sm hover:underline"
        >
          ← 상세로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold">인보이스 편집</h1>
      </div>

      <div className="rounded-lg border p-6">
        <InvoiceForm
          action={boundAction}
          defaultValues={invoice}
          submitLabel="수정 저장"
        />
      </div>
    </div>
  )
}
