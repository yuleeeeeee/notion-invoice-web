import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'

import { InvoiceTable } from '@/components/invoices/invoice-table'
import { InvoiceTableSkeleton } from '@/components/invoices/invoice-table-skeleton'
import { StatusFilter } from '@/components/invoices/status-filter'
import { queryInvoices } from '@/lib/notion'
import type { InvoiceStatus } from '@/lib/notion-types'

export const dynamic = 'force-dynamic'

const VALID_STATUS: InvoiceStatus[] = ['대기', '발송', '결제완료', '기간만료']
const VALID_SORT = ['created', 'edited', 'validUntil'] as const
type SortBy = (typeof VALID_SORT)[number]

interface PageProps {
  searchParams: Promise<{ status?: string; sortBy?: string }>
}

async function InvoiceList({
  status,
  sortBy,
}: {
  status?: InvoiceStatus
  sortBy: SortBy
}) {
  const getCached = unstable_cache(
    () =>
      queryInvoices({
        pageSize: 50,
        status,
        sortBy,
        sortDirection: 'descending',
      }),
    ['invoices-list', status ?? 'all', sortBy],
    { revalidate: 60, tags: ['invoices'] }
  )
  const { items } = await getCached()
  return <InvoiceTable invoices={items} />
}

export default async function InvoicesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = VALID_STATUS.includes(params.status as InvoiceStatus)
    ? (params.status as InvoiceStatus)
    : undefined
  const sortBy = VALID_SORT.includes(params.sortBy as SortBy)
    ? (params.sortBy as SortBy)
    : 'created'

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">인보이스 목록</h1>
        <Link
          href="/invoices/new"
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          + 새 인보이스
        </Link>
      </div>

      <div className="mb-4">
        <StatusFilter />
      </div>

      <Suspense fallback={<InvoiceTableSkeleton />}>
        <InvoiceList status={status} sortBy={sortBy} />
      </Suspense>
    </div>
  )
}
