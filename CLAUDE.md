@AGENTS.md


# CLAUDE.md

## 프로젝트 개요
채용 지원 현황 관리 앱. Next.js 14 App Router + Supabase + Tailwind

## 개발 규칙
- TypeScript strict 모드 사용
- 컴포넌트는 /components 폴더에 작성
- Supabase 쿼리는 /lib/supabase 에서 관리
- 날짜는 항상 varchar(8) YYYYMMDD 형식으로 저장

## 디자인
- DESIGN.md 참고
- Tailwind 유틸리티 클래스만 사용 (커스텀 CSS 지양)

## DB 규칙
- 모든 테이블에 insert_time, update_time 포함
- RLS 정책 반드시 적용
- 