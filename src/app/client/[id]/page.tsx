import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { PrintButton } from '@/components/invoices/print-button'
import { getInvoice } from '@/lib/notion'
import type { InvoiceStatus } from '@/lib/notion-types'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  대기: '대기',
  발송: '발송',
  결제완료: '결제완료',
  기간만료: '기간만료',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClientInvoicePage({ params }: PageProps) {
  const { id } = await params
  const invoice = await getInvoice(id)

  if (!invoice) notFound()

  return (
    <div className="min-h-screen bg-white p-8 text-black print:p-4">
      <div className="mx-auto max-w-2xl">
        {/* 브랜드 라인 */}
        <p className="mb-8 text-xs tracking-widest text-gray-400 uppercase print:mb-4">
          Invoice Web
        </p>

        {/* 헤더 */}
        <div className="mb-10 flex items-start justify-between print:mb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">견적서</h1>
            <p className="mt-2 text-sm text-gray-500">
              {invoice.invoiceNumber}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block rounded-lg border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium">
              {STATUS_LABEL[invoice.status]}
            </span>
          </div>
        </div>

        {/* 클라이언트 정보 */}
        <div className="mb-10 print:mb-6">
          <p className="mb-1 text-xs tracking-wide text-gray-400 uppercase">
            수신
          </p>
          <p className="text-2xl font-semibold">{invoice.clientName}</p>
        </div>

        {/* 날짜 정보 */}
        <div className="mb-10 grid grid-cols-2 gap-6 print:mb-6">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="mb-1 text-xs tracking-wide text-gray-400 uppercase">
              발행일
            </p>
            <p className="font-semibold">{invoice.issueDate ?? '-'}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="mb-1 text-xs tracking-wide text-gray-400 uppercase">
              유효기간
            </p>
            <p className="font-semibold">{invoice.validUntil ?? '-'}</p>
          </div>
        </div>

        {/* 항목 테이블 */}
        {invoice.items.length > 0 && (
          <div className="mb-10 overflow-hidden rounded-xl border border-gray-200 print:mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    항목
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    수량
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    단가
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    금액
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-medium">{item.name}</td>
                    <td className="px-5 py-4 text-right text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-600">
                      {item.unitPrice.toLocaleString('ko-KR')}원
                    </td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {item.amount.toLocaleString('ko-KR')}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 총금액 */}
        <div className="rounded-xl bg-gray-50 px-6 py-5 text-right">
          <p className="mb-1 text-xs tracking-wide text-gray-400 uppercase">
            총금액
          </p>
          <p className="text-3xl font-bold">
            {invoice.totalAmount.toLocaleString('ko-KR')}원
          </p>
        </div>

        {/* PDF 버튼 (인쇄 시 숨김) */}
        <div className="mt-12 text-center print:hidden">
          <PrintButton />
        </div>
      </div>
    </div>
  )
}
