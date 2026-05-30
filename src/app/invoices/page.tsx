import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'

import { InvoiceTable } from '@/components/invoices/invoice-table'
import { InvoiceTableSkeleton } from '@/components/invoices/invoice-table-skeleton'
import { StatusFilter } from '@/components/invoices/status-filter'
import { Button } from '@/components/ui/button'
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
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">인보이스 목록</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            견적서를 생성하고 클라이언트와 공유하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <PlusIcon className="h-4 w-4" />새 인보이스
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <StatusFilter />
      </div>

      <Suspense fallback={<InvoiceTableSkeleton />}>
        <InvoiceList status={status} sortBy={sortBy} />
      </Suspense>
    </div>
  )
}
