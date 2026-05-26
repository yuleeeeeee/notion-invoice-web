'use client'

import { useActionState, useEffect } from 'react'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import type { InvoiceFormState } from '@/app/invoices/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Invoice } from '@/lib/notion-types'

type FormAction = (
  state: InvoiceFormState,
  formData: FormData
) => Promise<InvoiceFormState>

interface InvoiceFormProps {
  action: FormAction
  defaultValues?: Partial<Invoice>
  submitLabel?: string
  onCancel?: () => void
}

export function InvoiceForm({
  action,
  defaultValues,
  submitLabel = '저장',
  onCancel,
}: InvoiceFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    status: 'idle',
  })

  useEffect(() => {
    if (state.status === 'error' && state.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-5">
      {/* 견적서 번호 */}
      <div className="space-y-1.5">
        <Label htmlFor="invoiceNumber">견적서 번호 *</Label>
        <Input
          id="invoiceNumber"
          name="invoiceNumber"
          placeholder="INV-2025-001"
          defaultValue={defaultValues?.invoiceNumber}
          disabled={isPending}
          required
        />
        {state.fieldErrors?.invoiceNumber && (
          <p className="text-destructive text-sm">
            {state.fieldErrors.invoiceNumber[0]}
          </p>
        )}
      </div>

      {/* 클라이언트명 */}
      <div className="space-y-1.5">
        <Label htmlFor="clientName">클라이언트명 *</Label>
        <Input
          id="clientName"
          name="clientName"
          placeholder="ABC 회사"
          defaultValue={defaultValues?.clientName}
          disabled={isPending}
          required
        />
        {state.fieldErrors?.clientName && (
          <p className="text-destructive text-sm">
            {state.fieldErrors.clientName[0]}
          </p>
        )}
      </div>

      {/* 상태 */}
      <div className="space-y-1.5">
        <Label htmlFor="status">상태</Label>
        <Select
          name="status"
          defaultValue={defaultValues?.status ?? '대기'}
          disabled={isPending}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="대기">대기</SelectItem>
            <SelectItem value="발송">발송</SelectItem>
            <SelectItem value="결제완료">결제완료</SelectItem>
            <SelectItem value="기간만료">기간만료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 발행일 */}
      <div className="space-y-1.5">
        <Label htmlFor="issueDate">발행일</Label>
        <Input
          id="issueDate"
          name="issueDate"
          type="date"
          defaultValue={defaultValues?.issueDate ?? ''}
          disabled={isPending}
        />
      </div>

      {/* 유효기간 */}
      <div className="space-y-1.5">
        <Label htmlFor="validUntil">유효기간</Label>
        <Input
          id="validUntil"
          name="validUntil"
          type="date"
          defaultValue={defaultValues?.validUntil ?? ''}
          disabled={isPending}
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            submitLabel
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            취소
          </Button>
        )}
      </div>
    </form>
  )
}
