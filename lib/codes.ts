// UI 전용 매핑 — label은 comCodeMaster에서 조회, variant는 CSS 클래스명이므로 여기서 관리

// APPLY001 지원현황 variant
export const APPLY_STATUS_VARIANT: Record<string, string> = {
    APPLY:     'applied',
    INTERVIEW: 'interview',
    WAITING:   'waiting',
    PASSED:    'pass',
    FAILED:    'fail',
    DROPPED:   'gaveup',
}

// 진행중 / 완료 구분
export const IN_PROGRESS_STATUSES = ['APPLY', 'REVIEW', 'INTERVIEW', 'WAITING'] as const
export const DONE_STATUSES        = ['PASSED', 'FAILED', 'DROPPED'] as const

// 칸반 컬럼 정의
export const KANBAN_COLUMNS = [
    { id: 'applied',   label: '지원 완료', variant: 'applied',   statuses: ['APPLY'] },
    { id: 'interview', label: '면접 예정', variant: 'interview', statuses: ['INTERVIEW'] },
    { id: 'waiting',   label: '결과 대기', variant: 'waiting',   statuses: ['WAITING'] },
    { id: 'result',    label: '지원 결과', variant: 'result',    statuses: ['PASSED', 'FAILED', 'DROPPED'] },
] as const
