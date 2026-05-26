# invoice-web

Notion에서 관리하는 견적서를 클라이언트(고객)가 별도 계정 없이 고유 링크로 웹에서 확인하고 PDF로 다운로드할 수 있는 서비스입니다.

## 프로젝트 개요

**목적**: 프리랜서/소규모 사업주가 Notion DB에 저장한 견적서를 고객에게 공개 URL로 공유하고, 고객은 로그인 없이 견적서를 확인 및 PDF 저장할 수 있다.

**사용자**:

- 관리자(사업주): 로그인 후 인보이스 목록 조회, 생성, 편집, 공유
- 클라이언트(고객): 인증 없이 고유 URL로 견적서 확인 및 PDF 다운로드

## 주요 페이지

1. **로그인** (`/login`) - 관리자 이메일/비밀번호 인증
2. **인보이스 목록** (`/invoices`) - 전체 인보이스 현황 대시보드, 상태 필터
3. **인보이스 상세** (`/invoices/[id]`) - 단일 인보이스 조회, 공유 링크 복사
4. **인보이스 생성** (`/invoices/new`) - Notion DB에 새 인보이스 생성 폼
5. **인보이스 편집** (`/invoices/[id]/edit`) - 기존 인보이스 수정 폼
6. **클라이언트 견적서 뷰** (`/view/[id]`) - 공개 접근, PDF 다운로드 지원

## 핵심 기능

- F001: 인보이스 목록 조회 (상태 필터/정렬)
- F002: 인보이스 상세 조회 (관리자)
- F003: 인보이스 생성 (Notion DB 저장)
- F004: 인보이스 편집 (Notion DB 업데이트)
- F005: 공개 링크 공유 (클립보드 복사)
- F006: 클라이언트 견적서 뷰 (인증 불필요)
- F007: PDF 다운로드 (브라우저 인쇄 다이얼로그)
- F010: 관리자 인증 (이메일/비밀번호, 세션 기반)

## 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19.1.0 + TypeScript 5
- **Styling**: TailwindCSS v4 + shadcn/ui (new-york style)
- **Forms**: React Hook Form + Zod + Server Actions
- **UI Components**: Radix UI + Lucide Icons
- **Database**: Notion API (@notionhq/client v5)
- **Deployment**: Vercel

## 시작하기

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local에 NOTION_API_KEY, NOTION_DATABASE_ID 설정

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

개발 서버: [http://localhost:3000](http://localhost:3000)

## 환경 변수

| 변수명               | 설명                                     |
| -------------------- | ---------------------------------------- |
| `NOTION_API_KEY`     | Notion Integration 시크릿 키             |
| `NOTION_DATABASE_ID` | 인보이스 Notion 데이터베이스 ID          |
| `ADMIN_EMAIL`        | 관리자 이메일 (환경변수로 자격증명 관리) |
| `ADMIN_PASSWORD`     | 관리자 비밀번호                          |

## 개발 상태

- [x] 기본 프로젝트 구조 설정
- [x] Notion API 연동 (CRUD)
- [x] 인보이스 목록 페이지 (ISR)
- [x] Server Actions (생성/수정)
- [ ] 관리자 인증 (세션 기반)
- [ ] 인보이스 상세/생성/편집 페이지 UI
- [ ] 클라이언트 견적서 뷰 페이지
- [ ] PDF 다운로드 기능
- [ ] 공유 링크 생성 및 복사

## 문서

- [PRD 문서](./docs/PRD.md) - 상세 요구사항
- [개발 로드맵](./docs/ROADMAP.md) - 개발 계획
- [개발 가이드](./CLAUDE.md) - 개발 지침
