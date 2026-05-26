import Link from 'next/link'

import { createInvoiceAction } from '@/app/invoices/actions'
import { InvoiceForm } from '@/components/invoices/invoice-form'

export default function NewInvoicePage() {
  return (
    <div className="container mx-auto max-w-xl py-8">
      <div className="mb-6">
        <Link
          href="/invoices"
          className="text-muted-foreground mb-2 block text-sm hover:underline"
        >
          ← 목록으로
        </Link>
        <h1 className="text-2xl font-bold">새 인보이스</h1>
      </div>

      <div className="rounded-lg border p-6">
        <InvoiceForm action={createInvoiceAction} submitLabel="인보이스 생성" />
      </div>
    </div>
  )
}
