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
        {/* 헤더 */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">견적서</h1>
            <p className="mt-1 text-sm text-gray-500">
              {invoice.invoiceNumber}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block rounded border px-3 py-1 text-sm font-medium">
              {STATUS_LABEL[invoice.status]}
            </span>
          </div>
        </div>

        {/* 클라이언트 정보 */}
        <div className="mb-8">
          <p className="text-sm text-gray-500">수신</p>
          <p className="text-xl font-semibold">{invoice.clientName}</p>
        </div>

        {/* 날짜 정보 */}
        <div className="mb-8 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">발행일</p>
            <p className="font-medium">{invoice.issueDate ?? '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">유효기간</p>
            <p className="font-medium">{invoice.validUntil ?? '-'}</p>
          </div>
        </div>

        {/* 항목 테이블 */}
        {invoice.items.length > 0 && (
          <div className="mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="pb-2 text-left font-medium">항목</th>
                  <th className="pb-2 text-right font-medium">수량</th>
                  <th className="pb-2 text-right font-medium">단가</th>
                  <th className="pb-2 text-right font-medium">금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td className="py-3">{item.name}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">
                      {item.unitPrice.toLocaleString('ko-KR')}원
                    </td>
                    <td className="py-3 text-right font-medium">
                      {item.amount.toLocaleString('ko-KR')}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 총금액 */}
        <div className="border-t border-gray-300 pt-4 text-right">
          <p className="text-sm text-gray-500">총금액</p>
          <p className="text-2xl font-bold">
            {invoice.totalAmount.toLocaleString('ko-KR')}원
          </p>
        </div>

        {/* PDF 버튼 (인쇄 시 숨김) */}
        <div className="mt-10 text-center print:hidden">
          <PrintButton />
        </div>
      </div>
    </div>
  )
}
