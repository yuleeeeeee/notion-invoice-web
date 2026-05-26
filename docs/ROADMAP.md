# invoice-web 개발 로드맵

Notion에서 관리하는 견적서를 클라이언트가 별도 계정 없이 고유 링크로 열람하고 PDF로 저장할 수 있게 해주는 경량 견적서 공유 서비스입니다.

## 개요

invoice-web은 프리랜서 및 소규모 사업주(관리자)와 그 고객(클라이언트)을 위한 Notion 기반 견적서 공유 서비스로 다음 기능을 제공합니다.

- **관리자 인보이스 관리**: Notion DB를 백엔드로 사용하여 인보이스를 생성/조회/편집하고 상태(Draft/Sent/Paid/Overdue)를 추적
- **공개 링크 공유**: 인증 없이 접근 가능한 클라이언트 전용 URL을 클립보드 한 번으로 공유
- **클라이언트 견적서 뷰 & PDF 다운로드**: 로그인 없이 견적서 열람 및 브라우저 인쇄 다이얼로그 기반 PDF 저장

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**
   - 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조. 예를 들어 현재 작업이 `012`라면 `011`과 `010`을 예시로 참조.
   - 이러한 예시들은 완료된 작업이므로 내용이 완료된 작업의 최종 상태를 반영함(체크된 박스와 변경 사항 요약). 새 작업의 경우 문서에는 빈 박스와 변경 사항 요약이 없어야 함. 초기 상태의 샘플로 `000-sample.md` 참조.

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - **API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 ✅로 표시

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 ✅

> **목표**: 전체 라우트 구조와 도메인 타입을 먼저 확정하여, 이후 UI/기능 작업이 독립적으로 진행될 수 있는 기반을 마련한다.
> **완료 기준**: 모든 주요 라우트의 빈 페이지가 존재하고, 도메인 타입과 Notion 연동 모듈이 정상 동작한다.

- **Task 001: 프로젝트 초기 설정 및 기본 구조** ✅ - 완료
  - ✅ Next.js 15.5.3 + React 19 + TypeScript 5 프로젝트 초기화 (App Router + Turbopack)
  - ✅ ESLint, Prettier, Husky, lint-staged 설정
  - ✅ TailwindCSS v4 도입 및 글로벌 스타일 구성
  - ✅ `src/app/layout.tsx` 루트 레이아웃 구성 (ThemeProvider + Sonner Toaster)
  - ✅ 홈 경로(`/`)에서 `/login`으로 리디렉션 처리

- **Task 002: 도메인 타입 및 환경변수 검증** ✅ - 완료
  - ✅ `Invoice`, `InvoiceStatus`, `CreateInvoiceInput`, `UpdateInvoiceInput` 타입 정의 (`src/lib/notion-types.ts`)
  - ✅ Notion 프로퍼티 이름 상수 `NOTION_PROPS` 정의
  - ✅ Zod 기반 환경변수 검증 (`src/lib/env.ts`) — `NOTION_API_KEY`, `NOTION_DATABASE_ID` 포맷 검증
  - ✅ 페이지네이션 응답 타입(`PaginatedResult<T>`) 정의

- **Task 003: Notion API 클라이언트 모듈 구현** ✅ - 완료
  - ✅ `@notionhq/client` v5 기반 싱글톤 클라이언트 구성 (`src/lib/notion.ts`)
  - ✅ CRUD 함수 구현: `queryInvoices`, `queryAllInvoices`, `getInvoice`, `createInvoice`, `updateInvoice`, `archiveInvoice`
  - ✅ Notion 페이지 ↔ 도메인 타입 매핑 함수 (`mapPageToInvoice`, `mapInvoiceInputToProperties`)
  - ✅ Rate Limit 대응 지수 백오프 재시도(`withRetry`) 구현
  - ✅ Notion 에러 한국어 메시지 변환(`getNotionErrorMessage`) 유틸
  - ✅ Notion 데이터 소스 기반 필터/정렬 쿼리 옵션 지원

### Phase 2: UI 골격 및 공통 컴포넌트 ✅

> **목표**: shadcn/ui 기반 디자인 시스템과 인증/공개 라우트 골격을 완성하여 후속 페이지들이 빠르게 채워질 수 있도록 한다.
> **완료 기준**: 14개 이상의 shadcn 컴포넌트가 설치되고, 다크모드/토스트/로그인 폼 UI가 동작한다.

- **Task 004: shadcn/ui 컴포넌트 라이브러리 도입** ✅ - 완료
  - ✅ shadcn/ui new-york 스타일 도입 및 `components.json` 설정
  - ✅ Button, Card, Input, Label, Form, Select, Dialog, Sheet, Badge, Skeleton, Alert, Avatar, Separator, Checkbox, Dropdown Menu, Navigation Menu, Progress, Sonner 등 14개 이상 컴포넌트 추가
  - ✅ Lucide React 아이콘 통합
  - ✅ Tailwind v4 + `tw-animate-css` 애니메이션 유틸 설정

- **Task 005: 다크모드 테마 시스템** ✅ - 완료
  - ✅ `next-themes` 기반 `ThemeProvider` 구성 (`src/components/providers/theme-provider.tsx`)
  - ✅ `ThemeToggle` 컴포넌트 구현 (`src/components/theme-toggle.tsx`)
  - ✅ 루트 레이아웃에서 `suppressHydrationWarning` 적용

- **Task 006: 로그인 페이지 UI 골격** ✅ - 완료
  - ✅ `/login` 라우트 페이지 구성 (`src/app/login/page.tsx`)
  - ✅ `LoginForm` 컴포넌트(이메일/비밀번호 입력, 비밀번호 표시 토글, 클라이언트 검증) 구현
  - ✅ shadcn Card + Input + Label 기반 디자인 적용

- **Task 007: 인보이스 목록 페이지 골격 및 Notion API 라우트** ✅ - 완료
  - ✅ `/invoices` 라우트 기본 구조 (`src/app/invoices/page.tsx`) — ISR + `force-dynamic` 적용
  - ✅ `unstable_cache` + `revalidateTag('invoices')` 캐시 전략
  - ✅ `createInvoiceAction`, `updateInvoiceStatusAction` Server Actions 골격 (`src/app/invoices/actions.ts`)
  - ✅ `GET/POST /api/notion` Route Handler 구현 (`src/app/api/notion/route.ts`)

### Phase 3: 인증 및 접근 제어

> **목표**: 환경변수 기반 단일 관리자 인증을 도입하고, 미들웨어로 관리자 라우트를 보호한다.
> **완료 기준**: 미인증 상태에서 `/invoices/*` 접근 시 자동으로 `/login`으로 리디렉션되고, 정상 자격증명 입력 시 세션이 발급되어 목록 페이지로 이동한다.

- **Task 008: 환경변수 기반 관리자 자격증명 스키마 확장** - 우선순위
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET` 환경변수를 `src/lib/env.ts`에 추가하고 Zod로 검증
  - 비밀번호는 비교 시 `timingSafeEqual` 사용을 권장하는 헬퍼 함수 구현
  - `.env.example` 파일 작성 및 README/PRD에 환경변수 가이드 갱신

- **Task 009: 세션 발급/검증 모듈 구현**
  - `src/lib/auth.ts`에 세션 토큰 생성/검증 유틸 작성(HMAC 서명 + 만료 시각 포함, JWT 또는 `iron-session` 중 선택)
  - 세션 쿠키 옵션: `httpOnly`, `secure`, `sameSite=lax`, `maxAge` 설정
  - 서버 컴포넌트에서 호출할 수 있는 `getSession()`, `requireSession()` 유틸 제공
  - Playwright MCP로 쿠키 발급/만료/위변조 시나리오 단위 검증

- **Task 010: 로그인/로그아웃 Server Action**
  - `src/app/login/actions.ts`에 `loginAction`, `logoutAction` Server Actions 구현
  - `LoginForm`을 `useActionState` 기반으로 리팩터링하여 폼 상태/에러를 서버 액션과 연동
  - 로그인 성공 시 `/invoices`로 리디렉션, 실패 시 에러 메시지 반환
  - 로그아웃 후 `/login` 리디렉션 처리
  - Playwright MCP로 정상/실패 로그인 및 로그아웃 E2E 시나리오 검증

- **Task 011: 인증 미들웨어 및 보호 라우트 설정**
  - `src/middleware.ts` 작성: `/invoices`, `/invoices/*` 경로에 세션 쿠키 검증, 미인증 시 `/login?next=...` 리디렉션
  - `matcher`에서 `/client/*` 및 정적 자원은 제외
  - 로그인된 사용자가 `/login` 접근 시 `/invoices`로 자동 이동 처리
  - Playwright MCP로 보호/공개 경로 접근 권한 매트릭스 검증

### Phase 4: 관리자 핵심 기능 구현

> **목표**: 인보이스 목록/상세/생성/편집 페이지를 완성하고, 공개 링크 공유 기능을 통합한다.
> **완료 기준**: 관리자가 인보이스를 생성→공유링크 복사→편집→상태 변경까지 한 번에 수행할 수 있다.

- **Task 012: 인보이스 목록 페이지 완성** - 우선순위
  - shadcn Table/Badge/Select 기반 목록 UI 고도화 (번호, 고객사, 금액, 상태 배지, 만기일)
  - 상태 필터(`전체/Draft/Sent/Paid/Overdue`)를 URL 쿼리(`?status=`)와 동기화하여 SSR
  - 정렬 토글(`sortBy=created|edited|dueDate`) 지원
  - `Suspense` + Skeleton fallback으로 로딩 UX 개선
  - 빈 상태(인보이스 없음) UI 정비
  - Playwright MCP로 필터/정렬/페이지네이션 시나리오 검증

- **Task 013: 인보이스 상세 페이지 구현 (F002, F005)**
  - `/invoices/[id]` 동적 라우트 생성 — `getInvoice(id)`로 서버 사이드 fetch
  - 인보이스 전체 필드 표시 + 상태 배지 시각화
  - **공유 링크 복사** 버튼: `/client/[id]`의 절대 URL을 클립보드에 복사 + Sonner 토스트 피드백
  - **편집** 버튼: `/invoices/[id]/edit` 이동
  - 존재하지 않는 ID 접근 시 Next.js `notFound()` 호출
  - Playwright MCP로 상세 조회, 클립보드 복사, 404 처리 시나리오 검증

- **Task 014: 인보이스 생성 페이지 구현 (F003)**
  - `/invoices/new` 라우트 페이지 작성
  - React Hook Form + Zod resolver 기반 폼(`InvoiceForm` 컴포넌트로 분리) 구성
  - Server Action `createInvoiceAction`과 `useActionState`로 연동 (이미 작성된 액션 활용)
  - 필드별 에러/토스트 메시지 표시 및 저장 후 `/invoices/[id]` 이동
  - 상태 Select는 `Draft` 기본값
  - Playwright MCP로 유효성 실패, 정상 생성, Notion 에러 케이스 검증

- **Task 015: 인보이스 편집 페이지 구현 (F004)**
  - `/invoices/[id]/edit` 동적 라우트 페이지 작성
  - 기존 인보이스 데이터를 폼 초기값으로 설정 (`InvoiceForm` 재사용)
  - `updateInvoiceAction(pageId, ...)` Server Action 추가 — Notion 부분 업데이트 호출
  - 저장 성공 시 `revalidateTag('invoices')` + `/invoices/[id]` 리디렉션
  - 취소 버튼으로 상세 페이지 복귀
  - Playwright MCP로 상태 변경(Draft→Sent→Paid) 플로우 검증

- **Task 016: 관리자 공통 레이아웃 및 내비게이션**
  - `/invoices` 하위에 공통 헤더/내비 레이아웃(`src/app/invoices/layout.tsx`) 구성
  - 로그아웃 버튼, ThemeToggle, 사용자 식별 영역 배치
  - 모바일 반응형 내비게이션 정비

### Phase 5: 클라이언트 견적서 공개 페이지

> **목표**: 인증 없이 접근 가능한 견적서 뷰와 PDF 다운로드(인쇄 다이얼로그) 기능을 완성한다.
> **완료 기준**: 클라이언트가 `/client/[id]` URL만으로 견적서를 열람하고 PDF로 저장할 수 있으며, 미들웨어가 이 경로를 차단하지 않는다.

- **Task 017: 클라이언트 견적서 뷰 페이지 구현 (F006)** - 우선순위
  - `/client/[id]` 동적 라우트 생성 — `getInvoice(id)` 호출, 미들웨어 예외 처리 확인
  - 견적서 필드 표시 전용 인쇄 친화 레이아웃(`InvoicePrintView` 컴포넌트) 작성
  - 존재하지 않는 ID 접근 시 사용자 친화적 404 페이지 노출(`not-found.tsx`)
  - SEO 차단을 위한 `robots: { index: false }` 메타데이터 적용
  - Playwright MCP로 비로그인 접근, 404, 다양한 상태값 렌더링 검증

- **Task 018: PDF 다운로드(인쇄 다이얼로그) 기능 (F007)**
  - `window.print()`를 트리거하는 **PDF 다운로드** 버튼 추가
  - `@media print` CSS로 헤더/푸터/버튼 숨김, 페이지 여백, 모노톤 색상 최적화
  - 인쇄용 폰트 사이즈 및 페이지 분할(`page-break-inside: avoid`) 설정
  - Playwright MCP로 인쇄 다이얼로그 트리거 및 print stylesheet 적용 검증

### Phase 6: 품질, 운영 및 배포

> **목표**: 통합 E2E 테스트, 에러 처리, 운영 준비를 마치고 Vercel에 배포한다.
> **완료 기준**: 주요 사용자 플로우가 자동화 테스트로 검증되고, 프로덕션 환경에서 정상 동작한다.

- **Task 019: 통합 E2E 시나리오 및 에러 핸들링**
  - Playwright MCP로 관리자 전체 플로우(로그인→생성→공유링크 복사→편집→상태 변경→로그아웃) E2E 검증
  - 클라이언트 뷰 플로우(URL 직접 접근→PDF 다운로드) E2E 검증
  - 글로벌 `error.tsx`, `not-found.tsx`, `loading.tsx` 추가 및 사용자 친화 메시지 적용
  - Notion API 장애/Rate Limit 상황 시뮬레이션 후 복구 동작 점검

- **Task 020: 운영 환경 설정 및 Vercel 배포**
  - `.env.example` 최신화 및 Vercel 환경변수 설정 가이드 작성
  - `next.config.ts` 점검(이미지 도메인, 보안 헤더, `poweredByHeader: false`)
  - Vercel 배포(Preview→Production) 및 도메인/HTTPS 확인
  - Vercel Analytics 또는 기본 로그 모니터링 활성화
  - 프로덕션 환경에서 핵심 시나리오 스모크 테스트 수행

- **Task 021: 문서화 및 인수인계**
  - `README.md`에 셋업/배포/환경변수 가이드 정리
  - `docs/guides/*` 문서와 정합성 확인 및 갱신
  - Notion DB 프로퍼티 셋업 절차 문서화(이름/타입/Select 옵션 일치 요구사항)
  - 운영 체크리스트(백업, 비밀번호 로테이션, Notion Integration 갱신) 작성
