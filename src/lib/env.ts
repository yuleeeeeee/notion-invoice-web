import { timingSafeEqual } from 'crypto'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VERCEL_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Notion API 통합 (서버 사이드 전용 - NEXT_PUBLIC_ 접두사 금지)
  NOTION_API_KEY: z
    .string()
    .min(1, 'NOTION_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.')
    .refine(
      v => v.startsWith('ntn_') || v.startsWith('secret_'),
      'NOTION_API_KEY는 ntn_ 또는 secret_ 으로 시작해야 합니다.'
    )
    .optional(),
  NOTION_DATABASE_ID: z
    .string()
    .regex(
      /^[0-9a-fA-F]{32}$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      'NOTION_DATABASE_ID는 32자 hex 또는 UUID 형식이어야 합니다.'
    )
    .optional(),
  NOTION_ITEMS_DATABASE_ID: z
    .string()
    .regex(
      /^[0-9a-fA-F]{32}$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      'NOTION_ITEMS_DATABASE_ID는 32자 hex 또는 UUID 형식이어야 합니다.'
    )
    .optional(),

  // 관리자 인증 (서버 사이드 전용)
  ADMIN_EMAIL: z
    .string()
    .email('ADMIN_EMAIL은 유효한 이메일 형식이어야 합니다.')
    .min(1, 'ADMIN_EMAIL이 설정되지 않았습니다. .env.local을 확인하세요.'),
  ADMIN_PASSWORD: z
    .string()
    .min(8, 'ADMIN_PASSWORD는 최소 8자 이상이어야 합니다.'),
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET은 최소 32자 이상이어야 합니다.'),
})

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
  NOTION_ITEMS_DATABASE_ID: process.env.NOTION_ITEMS_DATABASE_ID,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  SESSION_SECRET: process.env.SESSION_SECRET,
})

export type Env = z.infer<typeof envSchema>

// 타이밍 공격 방지를 위한 안전한 문자열 비교
export function compareStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    // 길이가 달라도 timingSafeEqual 호출해 상수 시간 유지
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}
