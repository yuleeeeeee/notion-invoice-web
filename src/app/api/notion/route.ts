import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
  createInvoice,
  getNotionErrorMessage,
  queryInvoices,
} from '@/lib/notion'

// Notion API 호출은 항상 동적 처리 (캐싱은 Server Component 측에서 제어)
export const dynamic = 'force-dynamic'

const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, '인보이스 번호는 필수입니다.'),
  clientName: z.string().min(1, '고객사명은 필수입니다.'),
  status: z.enum(['대기', '발송', '결제완료', '기간만료']).default('대기'),
  issueDate: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
})

const querySchema = z.object({
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  startCursor: z.string().optional(),
  status: z.enum(['대기', '발송', '결제완료', '기간만료']).optional(),
  sortBy: z.enum(['created', 'edited', 'validUntil']).optional(),
  sortDirection: z.enum(['ascending', 'descending']).optional(),
})

/**
 * GET /api/notion
 * Query Params: pageSize, startCursor, status, sortBy, sortDirection
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const params = querySchema.parse(Object.fromEntries(url.searchParams))

    const result = await queryInvoices({
      pageSize: params.pageSize,
      startCursor: params.startCursor,
      status: params.status,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    })

    return NextResponse.json({ ok: true, data: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: '쿼리 파라미터가 올바르지 않습니다.',
          issues: error.issues,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { ok: false, error: getNotionErrorMessage(error) },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notion
 * Body: CreateInvoiceInput (JSON)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = createInvoiceSchema.parse(body)

    const created = await createInvoice({
      invoiceNumber: input.invoiceNumber,
      clientName: input.clientName,
      status: input.status,
      issueDate: input.issueDate ?? null,
      validUntil: input.validUntil ?? null,
    })

    return NextResponse.json({ ok: true, data: created }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: '요청 본문이 올바르지 않습니다.',
          issues: error.issues,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { ok: false, error: getNotionErrorMessage(error) },
      { status: 500 }
    )
  }
}
