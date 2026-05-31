<!-- 배너 이미지 / 데모 GIF -->
<!-- TODO: 배포 후 스크린샷 또는 데모 GIF 삽입 -->
![Hunty Banner](https://placehold.co/1200x400/5645d4/ffffff?text=Hunty)

<div align="center">

**이직 준비를 위한 채용 지원 현황 관리 도구**

[![Vercel](https://img.shields.io/badge/배포-Vercel-black?logo=vercel)](https://hunty.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## 목차

1. [프로젝트 소개](#-프로젝트-소개)
2. [주요 기능](#-주요-기능)
3. [기술 스택](#-기술-스택)
4. [프로젝트 구조](#-프로젝트-구조)
5. [ERD / DB 설계](#-erd--db-설계)
6. [환경 변수 & 실행 방법](#-환경-변수--실행-방법)
7. [화면 구성](#-화면-구성)
8. [기술적 고민 & 의사결정](#-기술적-고민--의사결정)
9. [향후 개선 계획](#-향후-개선-계획)

---

## 📌 프로젝트 소개

**Hunty**는 이직 준비 과정에서 여러 기업에 흩어진 지원 현황을 한 곳에서 관리하고, 면접 질문과 답변을 아카이빙할 수 있는 웹 애플리케이션입니다.

스프레드시트나 메모앱 대신, 지원 상태별 현황 파악 · 마감일 추적 · 면접 기록 관리를 하나의 도구로 해결하는 것을 목표로 제작했습니다.

| 항목 | 내용 |
|------|------|
| 프로젝트 유형 | 이직 포트폴리오용 개인 풀스택 프로젝트 |
| 개발 기간 | 2025.06 ~ |
| 배포 URL | https://hunty.vercel.app |

---

## 🚀 주요 기능

| 기능 | 설명 |
|------|------|
| 소셜 로그인 | Google OAuth를 통한 1-click 로그인 |
| 대시보드 | 지원 총계, 진행 중 건수, 합격 수, 면접 D-day 통계 카드 |
| 지원 관리 | 기업별 지원 CRUD (상태 · 플랫폼 · 계약형태 · 메모 · 마감일) |
| 면접 기록 | 지원 건별 면접 질문 / 답변 아카이빙 |
| 주간 트렌드 | 최근 지원 현황 주별 차트 |
| 계정 설정 | 닉네임 변경, D-day 알림 기준일 설정, 로그아웃, 회원탈퇴 |
| 세션 관리 | 일별 세션 갱신 — 당일 이후 자동 로그아웃 |

---

## 🛠 기술 스택

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

| 분류 | 기술 | 선택 이유 |
|------|------|-----------|
| 프레임워크 | Next.js 16 App Router | Server Actions으로 API 레이어 없이 풀스택 구현 |
| 언어 | TypeScript 5 (strict) | 타입 안전성, IDE 자동완성 |
| 스타일 | Tailwind CSS | 유틸리티 클래스 기반 빠른 UI 개발 |
| 인증 | Supabase Auth | Google OAuth + RLS 통합, 별도 인증 서버 불필요 |
| DB | Supabase PostgreSQL | RLS 정책으로 Row-level 보안, 실시간 구독 지원 |
| 배포 | Vercel | Next.js 최적 배포 환경, Edge Functions 지원 |

---

## 🗂 프로젝트 구조

```
hunty/
├── app/
│   ├── (protected)/              # 인증 필요 라우트 그룹
│   │   ├── companies/            # 지원 목록 & CRUD
│   │   │   ├── [id]/             # 지원 상세 / 수정
│   │   │   └── new/              # 신규 지원 등록
│   │   ├── dashboard/            # 통계 대시보드
│   │   ├── insights/             # 주간 트렌드 차트
│   │   ├── settings/             # 계정 설정
│   │   └── layout.tsx            # 사이드바 레이아웃 + 인증 게이트
│   ├── auth/callback/            # OAuth 콜백 처리
│   ├── login/                    # 로그인 페이지
│   ├── onboarding/               # 최초 닉네임 설정
│   └── page.tsx                  # 랜딩 페이지
├── components/
│   ├── applications/             # 지원 폼
│   ├── companies/                # 지원 목록 테이블
│   ├── insights/                 # 차트
│   ├── layout/                   # 사이드바
│   ├── settings/                 # 설정 폼
│   └── ui/                       # 공통 UI
├── lib/
│   └── supabase/                 # DB 쿼리 함수 (server / client / admin)
├── middleware.ts                 # 세션 검증 미들웨어
└── proxy.ts                      # 미들웨어 로직 (session-date 체크)
```

---

## 🗄 ERD / DB 설계

```
auth.users (Supabase 관리)
    │
    └─ userProfile (1:1)
            │
            └─ jobApplication (1:N)
                    │
                    ├─ interviewNote (1:N)
                    └─ jobApplicationFile (1:N)

comCodeGroup ─── comCodeMaster  (공통코드)
```

**테이블 요약**

| 테이블 | 역할 |
|--------|------|
| `userProfile` | 닉네임, 알림 기준일, 관리자 여부 |
| `jobApplication` | 기업명, 지원상태, 플랫폼, 계약형태, 마감일, 면접일, 메모 |
| `interviewNote` | 면접 질문/답변, 회차, 회차별 면접일 |
| `jobApplicationFile` | 첨부 링크 URL |
| `comCodeGroup` / `comCodeMaster` | 지원상태·플랫폼·계약형태 공통코드 |

> **날짜 저장 규칙:** 모든 날짜는 `varchar(8)` YYYYMMDD 형식으로 저장 (시간대 이슈 차단)

---

## ⚙️ 환경 변수 & 실행 방법

### 환경 변수

`.env` 파일을 프로젝트 루트에 생성하세요.

```env
# Supabase (Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 회원 탈퇴 시 auth 유저 삭제용 (절대 클라이언트에 노출 금지)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

---

## 📸 화면 구성

> TODO: 배포 후 스크린샷 추가

| 페이지 | 설명 |
|--------|------|
| 랜딩 | Google 로그인 유도 |
| 대시보드 | 통계 카드 + 진행 중 지원 리스트 |
| 지원 목록 | 전체 지원 현황 테이블 + 상태 필터 |
| 지원 상세 | 기업 정보 수정 + 면접 질문/답변 |
| 인사이트 | 주간 지원 트렌드 차트 |
| 설정 | 닉네임, 알림 기준일, 계정 삭제 |

---

## 💡 기술적 고민 & 의사결정

### 1. Server Actions vs API Routes

Next.js App Router에서 별도 API 엔드포인트(`/api/*`) 없이 Server Actions만으로 모든 CRUD를 처리했습니다.

- **장점:** 클라이언트-서버 간 타입 공유, 보일러플레이트 감소, 서버 컴포넌트와 자연스러운 통합
- **고민:** Server Actions는 POST 요청만 가능 → 데이터 조회는 Server Component에서 직접 fetch, 변경은 Action으로 분리하는 패턴으로 해결

### 2. 날짜를 `varchar(8)` YYYYMMDD로 저장하는 이유

`DATE` / `TIMESTAMP` 타입 대신 문자열로 저장합니다.

- Supabase는 UTC 기준 저장 → 한국 시간(KST, UTC+9) 처리 시 날짜 경계에서 off-by-one 발생 가능
- 문자열 YYYYMMDD는 시간대 변환 없이 `string.slice()` 비교만으로 충분
- 정렬·필터링 모두 문자열 대소비교로 동일하게 동작

### 3. 세션 관리 — `session-date` 쿠키

Supabase의 기본 토큰 만료(7일)와 별개로 **당일 세션** 개념을 추가했습니다.

- `httpOnly` 쿠키 `session-date`에 로그인 날짜를 저장
- 미들웨어(`proxy.ts`)에서 오늘 날짜와 비교 → 다르면 강제 로그아웃
- 목적: 장기간 방치된 세션 정리, 일별 재인증 강제

### 4. RLS + Server-side userId로 이중 소유권 검증

Supabase RLS 정책이 1차 방어선이고, Server Actions에서 `supabase.auth.getUser()`로 얻은 `userId`를 쿼리 조건에 항상 포함해 2차 검증합니다.

```ts
// RLS + 애플리케이션 레이어 이중 체크
await supabase.from('jobApplication')
    .update({...})
    .eq('application_id', applicationId)
    .eq('id', userId)          // ← 소유권 검증
    .select('application_id')
    .single()                  // ← 0행이면 null → 즉시 throw
```

### 5. 공통코드 테이블로 하드코딩 제거

지원상태·플랫폼·계약형태 등 코드성 데이터를 `comCodeGroup` / `comCodeMaster` 테이블로 관리합니다.

- 코드 추가·수정 시 DB만 변경, 배포 불필요
- 그룹 코드 네이밍 규칙(`APPLY00N`, `CNTR00N`, `ITVW00N`)으로 도메인별 분류

---

## 🔮 향후 개선 계획

| 우선순위 | 기능 | 설명 |
|---------|------|------|
| ★★★ | 이메일 마감 알림 | Supabase Edge Function + Cron으로 D-day 이메일 발송 |
| ★★☆ | 첨부 링크 관리 | 자소서·포트폴리오 링크 지원 건별 관리 |
| ★☆☆ | 모바일 반응형 | 현재 데스크톱 최적화 → 모바일 레이아웃 추가 |
| ★☆☆ | 면접 회차별 기록 | 현재 단일 메모 → 1차/2차/최종 회차별 분리 |
