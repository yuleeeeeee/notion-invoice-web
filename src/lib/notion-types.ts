/**
 * 인보이스 상태 - Notion '상태' Select 옵션과 1:1 매칭 (한국어)
 */
export type InvoiceStatus = '대기' | '발송' | '결제완료' | '기간만료'

/**
 * 인보이스 항목 (Items DB 레코드)
 */
export interface InvoiceItem {
  /** Notion 페이지 ID */
  id: string
  /** 항목명 */
  name: string
  /** 수량 */
  quantity: number
  /** 단가 */
  unitPrice: number
  /** 금액 (수량 × 단가) */
  amount: number
}

/**
 * 앱 도메인의 Invoice 타입
 * Notion API 응답을 이 형태로 정규화하여 사용
 */
export interface Invoice {
  /** Notion 페이지 ID (UUID) */
  id: string
  /** 견적서 번호 (예: INV-2025-001) */
  invoiceNumber: string
  /** 클라이언트명 */
  clientName: string
  /** 총금액 (항목 금액의 합산 Rollup, 읽기 전용) */
  totalAmount: number
  /** 인보이스 상태 */
  status: InvoiceStatus
  /** 발행일 (YYYY-MM-DD) */
  issueDate: string | null
  /** 유효기간 (YYYY-MM-DD) */
  validUntil: string | null
  /** 연결된 항목 목록 (기본 빈 배열, 상세 조회 시 채워짐) */
  items: InvoiceItem[]
  /** Notion 페이지 URL */
  url: string
  /** 마지막 수정 시각 (ISO 8601) */
  lastEditedTime: string
}

/**
 * Invoice 생성 시 입력 형태
 * totalAmount(Rollup 자동계산), items(별도 DB), url/id/lastEditedTime 제외
 */
export type CreateInvoiceInput = Omit<
  Invoice,
  'id' | 'url' | 'lastEditedTime' | 'totalAmount' | 'items'
>

/** Invoice 수정 시 입력 형태 (모든 필드 optional) */
export type UpdateInvoiceInput = Partial<CreateInvoiceInput>

/** 페이지네이션 응답 형태 */
export interface PaginatedResult<T> {
  items: T[]
  hasMore: boolean
  nextCursor: string | null
}

/**
 * Notion Invoices DB 프로퍼티 이름 상수
 * 실제 Notion에서 사용 중인 한국어 프로퍼티 이름과 정확히 일치
 */
export const NOTION_PROPS = {
  invoiceNumber: '견적서 번호',
  clientName: '클라이언트명',
  totalAmount: '총금액',
  status: '상태',
  issueDate: '발행일',
  validUntil: '유효기간',
  items: '항목',
} as const

/**
 * Notion Items DB 프로퍼티 이름 상수
 */
export const NOTION_ITEM_PROPS = {
  name: '항목명',
  quantity: '수량',
  unitPrice: '단가',
  amount: '금액',
  invoices: 'Invoices',
} as const
