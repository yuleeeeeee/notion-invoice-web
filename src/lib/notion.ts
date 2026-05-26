import 'server-only'

import {
  APIErrorCode,
  Client,
  ClientErrorCode,
  isFullPage,
  isNotionClientError,
} from '@notionhq/client'
import type {
  PageObjectResponse,
  QueryDatabaseParameters,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints'

import { env } from '@/lib/env'
import {
  NOTION_ITEM_PROPS,
  NOTION_PROPS,
  type CreateInvoiceInput,
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
  type PaginatedResult,
  type UpdateInvoiceInput,
} from '@/lib/notion-types'

// env.ts에서 optional로 선언된 Notion 키를 런타임에 명시적으로 검증
function requireEnv(
  key: 'NOTION_API_KEY' | 'NOTION_DATABASE_ID' | 'NOTION_ITEMS_DATABASE_ID'
): string {
  const value = env[key]
  if (!value) {
    throw new Error(
      `환경변수 ${key}가 설정되지 않았습니다. .env.local을 확인하세요.`
    )
  }
  return value
}

// ---------------------------------------------------------------------------
// Notion 클라이언트 싱글톤 (dev HMR에서 중복 생성 방지)
// ---------------------------------------------------------------------------

declare global {
  var __notionClient: Client | undefined
}

function getNotionClient(): Client {
  if (globalThis.__notionClient) return globalThis.__notionClient

  const client = new Client({
    auth: requireEnv('NOTION_API_KEY'),
    timeoutMs: 30_000,
  })

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__notionClient = client
  }

  return client
}

export const notion = getNotionClient()

// ---------------------------------------------------------------------------
// Rich Text 유틸
// ---------------------------------------------------------------------------

/** Notion rich_text 배열을 plain string으로 변환 */
export function richTextToPlain(
  richText: RichTextItemResponse[] | undefined
): string {
  if (!richText || richText.length === 0) return ''
  return richText.map(t => t.plain_text).join('')
}

/**
 * plain string을 Notion rich_text 배열 형태로 변환
 * Notion의 단일 segment 최대 길이(2000자) 처리
 */
export function plainToRichText(text: string): { text: { content: string } }[] {
  if (!text) return []
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += 2000) {
    chunks.push(text.slice(i, i + 2000))
  }
  return chunks.map(content => ({ text: { content } }))
}

// ---------------------------------------------------------------------------
// Rate Limit 처리 - 지수 백오프 재시도 (초당 3회 제한 대응)
// ---------------------------------------------------------------------------

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0
  while (true) {
    try {
      return await fn()
    } catch (error) {
      if (!isNotionClientError(error)) throw error
      const isRetryable =
        error.code === APIErrorCode.RateLimited ||
        error.code === ClientErrorCode.RequestTimeout
      if (!isRetryable || attempt >= maxRetries) throw error
      // 1s → 2s → 4s 지수 백오프
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      )
      attempt += 1
    }
  }
}

// ---------------------------------------------------------------------------
// 숫자 프로퍼티 추출 유틸 (number / rollup / formula 대응)
// ---------------------------------------------------------------------------

function extractNumber(prop: PageObjectResponse['properties'][string]): number {
  if (!prop) return 0
  if (prop.type === 'number') return prop.number ?? 0
  if (prop.type === 'rollup' && prop.rollup.type === 'number')
    return prop.rollup.number ?? 0
  if (prop.type === 'formula' && prop.formula.type === 'number')
    return prop.formula.number ?? 0
  return 0
}

// ---------------------------------------------------------------------------
// Notion 페이지 ↔ 도메인 타입 변환
// ---------------------------------------------------------------------------

function mapPageToInvoice(page: PageObjectResponse): Invoice {
  const props = page.properties

  const titleProp = props[NOTION_PROPS.invoiceNumber]
  const clientProp = props[NOTION_PROPS.clientName]
  const totalAmountProp = props[NOTION_PROPS.totalAmount]
  const statusProp = props[NOTION_PROPS.status]
  const issueDateProp = props[NOTION_PROPS.issueDate]
  const validUntilProp = props[NOTION_PROPS.validUntil]

  return {
    id: page.id,
    invoiceNumber:
      titleProp?.type === 'title' ? richTextToPlain(titleProp.title) : '',
    clientName:
      clientProp?.type === 'rich_text'
        ? richTextToPlain(clientProp.rich_text)
        : '',
    totalAmount: extractNumber(totalAmountProp),
    status:
      statusProp?.type === 'select' && statusProp.select?.name
        ? (statusProp.select.name as InvoiceStatus)
        : '대기',
    issueDate:
      issueDateProp?.type === 'date'
        ? (issueDateProp.date?.start ?? null)
        : null,
    validUntil:
      validUntilProp?.type === 'date'
        ? (validUntilProp.date?.start ?? null)
        : null,
    items: [], // 상세 조회 시 getInvoiceItems()로 별도 fetch
    url: page.url,
    lastEditedTime: page.last_edited_time,
  }
}

function mapPageToInvoiceItem(page: PageObjectResponse): InvoiceItem {
  const props = page.properties

  const nameProp = props[NOTION_ITEM_PROPS.name]
  const quantityProp = props[NOTION_ITEM_PROPS.quantity]
  const unitPriceProp = props[NOTION_ITEM_PROPS.unitPrice]
  const amountProp = props[NOTION_ITEM_PROPS.amount]

  return {
    id: page.id,
    name: nameProp?.type === 'title' ? richTextToPlain(nameProp.title) : '',
    quantity: extractNumber(quantityProp),
    unitPrice: extractNumber(unitPriceProp),
    amount: extractNumber(amountProp),
  }
}

function mapInvoiceInputToProperties(
  input: Partial<CreateInvoiceInput>
): Record<string, unknown> {
  const properties: Record<string, unknown> = {}

  if (input.invoiceNumber !== undefined) {
    properties[NOTION_PROPS.invoiceNumber] = {
      title: plainToRichText(input.invoiceNumber),
    }
  }
  if (input.clientName !== undefined) {
    properties[NOTION_PROPS.clientName] = {
      rich_text: plainToRichText(input.clientName),
    }
  }
  if (input.status !== undefined) {
    properties[NOTION_PROPS.status] = { select: { name: input.status } }
  }
  if (input.issueDate !== undefined) {
    properties[NOTION_PROPS.issueDate] = {
      date: input.issueDate ? { start: input.issueDate } : null,
    }
  }
  if (input.validUntil !== undefined) {
    properties[NOTION_PROPS.validUntil] = {
      date: input.validUntil ? { start: input.validUntil } : null,
    }
  }

  return properties
}

// ---------------------------------------------------------------------------
// 데이터베이스 조회
// ---------------------------------------------------------------------------

export interface QueryInvoicesOptions {
  /** 페이지 사이즈 (최대 100, 기본 50) */
  pageSize?: number
  /** 다음 페이지 커서 */
  startCursor?: string
  /** 상태 필터 */
  status?: InvoiceStatus
  /** 정렬 기준 */
  sortBy?: 'created' | 'edited' | 'validUntil'
  /** 정렬 방향 */
  sortDirection?: 'ascending' | 'descending'
}

/** 인보이스 목록 조회 (페이지네이션 지원) */
export async function queryInvoices(
  options: QueryInvoicesOptions = {}
): Promise<PaginatedResult<Invoice>> {
  const {
    pageSize = 50,
    startCursor,
    status,
    sortBy = 'created',
    sortDirection = 'descending',
  } = options

  const sorts: QueryDatabaseParameters['sorts'] =
    sortBy === 'validUntil'
      ? [{ property: NOTION_PROPS.validUntil, direction: sortDirection }]
      : [
          {
            timestamp:
              sortBy === 'edited' ? 'last_edited_time' : 'created_time',
            direction: sortDirection,
          },
        ]

  const filter: QueryDatabaseParameters['filter'] | undefined = status
    ? { property: NOTION_PROPS.status, select: { equals: status } }
    : undefined

  const response = await withRetry(() =>
    notion.databases.query({
      database_id: requireEnv('NOTION_DATABASE_ID'),
      page_size: Math.min(pageSize, 100),
      start_cursor: startCursor,
      filter,
      sorts,
    })
  )

  const items = response.results.filter(isFullPage).map(mapPageToInvoice)

  return {
    items,
    hasMore: response.has_more,
    nextCursor: response.next_cursor,
  }
}

/**
 * 모든 인보이스를 자동 페이지네이션으로 조회
 * 대용량 데이터에서는 메모리 사용 주의
 */
export async function queryAllInvoices(
  options: Omit<QueryInvoicesOptions, 'startCursor' | 'pageSize'> = {}
): Promise<Invoice[]> {
  const all: Invoice[] = []
  let cursor: string | undefined

  do {
    const page = await queryInvoices({
      ...options,
      pageSize: 100,
      startCursor: cursor,
    })
    all.push(...page.items)
    cursor = page.nextCursor ?? undefined
  } while (cursor)

  return all
}

// ---------------------------------------------------------------------------
// 단일 페이지 조회
// ---------------------------------------------------------------------------

/**
 * ID로 단일 인보이스 조회 (항목 포함)
 * 페이지가 없거나 권한이 없으면 null 반환
 */
export async function getInvoice(pageId: string): Promise<Invoice | null> {
  try {
    const page = await withRetry(() =>
      notion.pages.retrieve({ page_id: pageId })
    )
    if (!isFullPage(page)) return null

    const invoice = mapPageToInvoice(page)
    invoice.items = await getInvoiceItems(pageId)
    return invoice
  } catch (error) {
    if (
      isNotionClientError(error) &&
      error.code === APIErrorCode.ObjectNotFound
    ) {
      return null
    }
    throw error
  }
}

/**
 * 인보이스에 연결된 항목 목록 조회 (Items DB에서 역관계 필터)
 */
export async function getInvoiceItems(
  invoicePageId: string
): Promise<InvoiceItem[]> {
  try {
    const itemsDbId = env.NOTION_ITEMS_DATABASE_ID
    if (!itemsDbId) return []

    const response = await withRetry(() =>
      notion.databases.query({
        database_id: itemsDbId,
        filter: {
          property: NOTION_ITEM_PROPS.invoices,
          relation: { contains: invoicePageId },
        },
      })
    )

    return response.results.filter(isFullPage).map(mapPageToInvoiceItem)
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// 페이지 생성 / 수정 / 삭제
// ---------------------------------------------------------------------------

/** 새 인보이스 생성 */
export async function createInvoice(
  input: CreateInvoiceInput
): Promise<Invoice> {
  const response = await withRetry(() =>
    notion.pages.create({
      parent: { database_id: requireEnv('NOTION_DATABASE_ID') },
      properties: mapInvoiceInputToProperties(input) as never,
    })
  )
  if (!isFullPage(response)) {
    throw new Error('Notion이 부분(Partial) 페이지 응답을 반환했습니다.')
  }
  return mapPageToInvoice(response)
}

/** 기존 인보이스 수정 (부분 업데이트) */
export async function updateInvoice(
  pageId: string,
  input: UpdateInvoiceInput
): Promise<Invoice> {
  const response = await withRetry(() =>
    notion.pages.update({
      page_id: pageId,
      properties: mapInvoiceInputToProperties(input) as never,
    })
  )
  if (!isFullPage(response)) {
    throw new Error('Notion이 부분(Partial) 페이지 응답을 반환했습니다.')
  }
  return mapPageToInvoice(response)
}

/** 인보이스를 휴지통으로 이동 (Notion은 hard delete 미지원) */
export async function archiveInvoice(pageId: string): Promise<void> {
  await withRetry(() =>
    notion.pages.update({ page_id: pageId, archived: true })
  )
}

// ---------------------------------------------------------------------------
// 에러 메시지 변환
// ---------------------------------------------------------------------------

/** Notion 에러를 한국어 사용자 친화 메시지로 변환 */
export function getNotionErrorMessage(error: unknown): string {
  if (!isNotionClientError(error)) {
    return error instanceof Error ? error.message : '알 수 없는 오류'
  }
  switch (error.code) {
    case APIErrorCode.Unauthorized:
      return 'Notion 인증에 실패했습니다. NOTION_API_KEY를 확인하세요.'
    case APIErrorCode.RestrictedResource:
      return 'Notion 리소스 접근이 제한되었습니다. Integration이 데이터베이스에 연결되어 있는지 확인하세요.'
    case APIErrorCode.ObjectNotFound:
      return '요청한 Notion 객체를 찾을 수 없습니다.'
    case APIErrorCode.RateLimited:
      return 'Notion API 요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.'
    case APIErrorCode.ValidationError:
      return `Notion 요청 검증 실패: ${error.message}`
    case ClientErrorCode.RequestTimeout:
      return 'Notion API 요청이 시간 초과되었습니다.'
    default:
      return `Notion API 오류: ${error.message}`
  }
}
