import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDashboardStats, getKanbanApplications, type Application } from '@/lib/supabase/applications'
import { getUserProfile } from '@/lib/supabase/profile'
import { getCodesByGroup } from '@/lib/supabase/codes'
import { APPLY_STATUS_VARIANT, KANBAN_COLUMNS } from '@/lib/codes'

// ── 유틸 ────────────────────────────────────────────────────────
function calcDday(dateStr: string): { label: string; variant: string } {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(`${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`)
    const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000)
    if (diff <= 2) return { label: `D-${diff}`, variant: 'urgent' }
    if (diff <= 7) return { label: `D-${diff}`, variant: 'soon' }
    return { label: `D-${diff}`, variant: 'later' }
}

function formatInterviewDate(dateStr: string): string {
    const d = new Date(`${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`)
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`
}

function relativeTime(dateTimeStr: string, elapsed = false): string {
    const diff = Math.floor((Date.now() - new Date(dateTimeStr).getTime()) / 86400000)
    if (diff === 0) return '오늘'
    if (diff < 7) return elapsed ? `${diff}일 경과` : `${diff}일 전`
    if (diff < 14) return elapsed ? '1주 경과' : '1주 전'
    return elapsed ? `${Math.floor(diff / 7)}주 경과` : `${Math.floor(diff / 7)}주 전`
}

// ── 컴포넌트 ─────────────────────────────────────────────────────
export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [profile, stats, applications, statusCodes, platformCodes] = await Promise.all([
        getUserProfile(user.id).catch(() => null),
        getDashboardStats(user.id).catch(() => ({ total: 0, recentCount: 0, inProgress: 0, interviewCount: 0, nearestDday: null, nearestCompany: null, passed: 0 })),
        getKanbanApplications(user.id).catch(() => [] as Application[]),
        getCodesByGroup('APPLY001').catch(() => []),
        getCodesByGroup('APPLY002').catch(() => []),
    ])

    const statusMap = Object.fromEntries(
        statusCodes.map(c => [c.sub_code, {
            label: c.code_name,
            variant: APPLY_STATUS_VARIANT[c.sub_code] ?? 'applied',
        }])
    )

    const platformMap = Object.fromEntries(
        platformCodes.map(c => [c.sub_code, c.code_name])
    )

    function getPlatformLabel(app: Application): string {
        if (app.apply_platform === 'ETC') return app.apply_platform_memo || '기타'
        return platformMap[app.apply_platform ?? ''] ?? app.apply_platform ?? ''
    }

    const nickname = profile?.nickname
        ?? user.user_metadata?.name
        ?? user.email?.split('@')[0]
        ?? '사용자'

    const statCards = [
        { label: '전체 지원',  num: stats.total,         delta: `지난 30일 +${stats.recentCount}`,  variant: '' },
        { label: '진행중',     num: stats.inProgress,    delta: '지원완료 · 검토 · 면접 · 대기',      variant: 'progress', swatch: true },
        {
            label: '면접 예정', num: stats.interviewCount,
            delta: stats.nearestDday && stats.nearestCompany ? `최단 ${stats.nearestDday} · ${stats.nearestCompany}` : '예정 없음',
            deltaVariant: stats.nearestDday ? 'warn' : '',
            variant: 'interview', swatch: true,
        },
        { label: '합격', num: stats.passed, delta: '올해 누적', variant: 'pass', swatch: true },
    ]

    return (
        <>
            {/* 상단 바 */}
            <header className="topbar">
                <div className="crumbs">
                    <span>Workspace</span>
                    <span className="sep">/</span>
                    <b>대시보드</b>
                </div>
            </header>

            {/* 페이지 본문 */}
            <div className="flex flex-col gap-6 p-8 flex-1 min-h-0">

                {/* 인사 */}
                <h1 className="text-xl font-semibold" style={{ color: 'var(--ink)', letterSpacing: '-0.3px' }}>
                    안녕하세요, {nickname}님
                </h1>

                {/* 통계 */}
                <div className="grid grid-cols-4 gap-4">
                    {statCards.map((s) => (
                        <div key={s.label} className={`stat ${s.variant}`}>
                            <div className="label">
                                {s.swatch && <span className="swatch" />}
                                {s.label}
                            </div>
                            <div className="num">{s.num}</div>
                            <div className={`delta ${s.deltaVariant ?? ''}`}>
                                <b>{s.delta}</b>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 섹션 헤더 */}
                <div className="flex flex-col gap-1">
                    <h2 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>진행중인 지원</h2>
                    <p className="text-sm" style={{ color: 'var(--stone)' }}>합격 · 불합격 · 포기는 자동으로 숨겨집니다.</p>
                </div>

                {/* 칸반 보드 */}
                <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
                    {KANBAN_COLUMNS.map((col) => {
                        const cards = applications.filter(a => (col.statuses as readonly string[]).includes(a.apply_status))
                        return (
                            <div key={col.id} className={`col ${col.variant}`}>
                                <div className="col-head">
                                    <div className="title">
                                        <span className="dot" />
                                        {col.label}
                                    </div>
                                    <span className="count">{cards.length}</span>
                                </div>

                                {cards.map((app) => {
                                    const tag = statusMap[app.apply_status]
                                    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
                                    const dday = app.interview_date && app.interview_date >= todayStr
                                        ? calcDday(app.interview_date)
                                        : null
                                    const isUrgent = dday?.variant === 'urgent'
                                    const isWaiting = app.apply_status === 'WAITING'

                                    return (
                                        <Link key={app.application_id} href={`/companies/${app.application_id}`} className={`card ${isUrgent ? 'urgent' : ''}`}>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="card-name">{app.company_name}</div>
                                                    {app.apply_position && (
                                                        <div className="card-pos">{app.apply_position}</div>
                                                    )}
                                                </div>
                                                {dday && (
                                                    <span className={`dday ${dday.variant}`} style={{ flexShrink: 0 }}>
                                                        {dday.label}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-1.5">
                                                {tag && (
                                                    <span className={`tag ${tag.variant}`}>
                                                        <span className="dot" />
                                                        {tag.label}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="card-foot">
                                                <span className="plat">{getPlatformLabel(app)}</span>
                                                <span className="when">
                                                    {app.interview_date && app.apply_status === 'INTERVIEW'
                                                        ? formatInterviewDate(app.interview_date)
                                                        : relativeTime(app.insert_time, isWaiting)
                                                    }
                                                </span>
                                            </div>
                                        </Link>
                                    )
                                })}

                                <Link href={`/companies/new?status=${col.statuses[0]}`} className="add-card">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                        <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                    </svg>
                                    카드 추가
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}
