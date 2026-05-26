'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import {
  createInvoice,
  getNotionErrorMessage,
  updateInvoice,
} from '@/lib/notion'
import type { InvoiceStatus } from '@/lib/notion-types'

const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, '인보이스 번호를 입력하세요.'),
  clientName: z.string().min(1, '고객사명을 입력하세요.'),
  status: z.enum(['대기', '발송', '결제완료', '기간만료']).default('대기'),
  issueDate: z.string().optional(),
  validUntil: z.string().optional(),
})

export type InvoiceFormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Record<string, string[]>
}

/**
 * 인보이스 생성 Server Action
 * useActionState와 함께 사용
 */
export async function createInvoiceAction(
  _prevState: InvoiceFormState,
  formData: FormData
): Promise<InvoiceFormState> {
  const parsed = invoiceFormSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: '입력값이 올바르지 않습니다.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  try {
    const created = await createInvoice({
      invoiceNumber: parsed.data.invoiceNumber,
      clientName: parsed.data.clientName,
      status: parsed.data.status,
      issueDate: parsed.data.issueDate || null,
      validUntil: parsed.data.validUntil || null,
    })

    revalidateTag('invoices')
    redirect(`/invoices/${created.id}`)
  } catch (error) {
    return {
      status: 'error',
      message: getNotionErrorMessage(error),
    }
  }
}

/**
 * 인보이스 수정 Server Action
 * 편집 페이지에서 .bind(null, pageId)로 바인딩하여 사용
 */
export async function updateInvoiceAction(
  pageId: string,
  _prevState: InvoiceFormState,
  formData: FormData
): Promise<InvoiceFormState> {
  const parsed = invoiceFormSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: '입력값이 올바르지 않습니다.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  try {
    await updateInvoice(pageId, {
      invoiceNumber: parsed.data.invoiceNumber,
      clientName: parsed.data.clientName,
      status: parsed.data.status,
      issueDate: parsed.data.issueDate || null,
      validUntil: parsed.data.validUntil || null,
    })

    revalidateTag('invoices')
    redirect(`/invoices/${pageId}`)
  } catch (error) {
    return {
      status: 'error',
      message: getNotionErrorMessage(error),
    }
  }
}

/** 인보이스 상태만 변경하는 가벼운 Server Action */
export async function updateInvoiceStatusAction(
  pageId: string,
  status: InvoiceStatus
): Promise<{ ok: boolean; message?: string }> {
  try {
    await updateInvoice(pageId, { status })
    revalidateTag('invoices')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: getNotionErrorMessage(error) }
  }
}
