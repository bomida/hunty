import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getInsightsData } from '@/lib/supabase/insights'
import WeeklyTrendChart from '@/components/insights/WeeklyTrendChart'

const PP = ['#dd5b00', '#e87830', '#f5a060', '#f8c8a0', '#fde8d0']

export default async function InsightsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const data = await getInsightsData(user.id).catch(() => null)

    const total = data?.total ?? 0
    const responseRate = data?.responseRate ?? 0
    const respondedCount = data?.respondedCount ?? 0
    const interviewPassRate = data?.interviewPassRate ?? 0
    const interviewedCount = data?.interviewedCount ?? 0
    const passedCount = data?.passedCount ?? 0
    const passRate = data?.passRate ?? 0
    const avgResponseDays = data?.avgResponseDays ?? null
    const minResponseDays = data?.minResponseDays ?? null
    const minResponseCompany = data?.minResponseCompany ?? null
    const maxResponseDays = data?.maxResponseDays ?? null
    const maxResponseCompany = data?.maxResponseCompany ?? null
    const weeks = data?.weeks ?? []
    const platforms = data?.platforms ?? []
    const funnelResponded = data?.funnelResponded ?? 0
    const funnelInterview = data?.funnelInterview ?? 0
    const funnelPassed = data?.funnelPassed ?? 0

    const funnelRespondedPct = total > 0 ? Math.round((funnelResponded / total) * 100) : 0
    const funnelInterviewPct = total > 0 ? Math.round((funnelInterview / total) * 100) : 0
    const funnelPassedPct = total > 0 ? Math.round((funnelPassed / total) * 100) : 0

    const maxPlatformTotal = platforms.reduce((m, p) => Math.max(m, p.total), 1)

    return (
        <>
            {/* 상단 바 */}
            <header className="topbar">
                <div className="crumbs">
                    <span>Workspace</span>
                    <span className="sep">/</span>
                    <b>인사이트</b>
                </div>
            </header>

            {/* 페이지 본문 */}
            <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto" style={{ maxWidth: 1480 }}>

                <h1 className="text-xl font-semibold" style={{ color: 'var(--ink)', letterSpacing: '-0.3px' }}>
                    인사이트
                </h1>

                {/* Summary KPI */}
                <section
                    className="rounded-xl p-6"
                    style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)' }}
                    aria-label="요약 지표"
                >
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-0">

                        {/* 총 지원 */}
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2">
                                <span className="w-[30px] h-[30px] rounded-[8px] grid place-items-center flex-none"
                                    style={{ background: 'var(--tint-peach)', color: 'var(--primary)' }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M14 2L2 6.8l4.4 1.6L8 13l2.2-4.2L14 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                                        <path d="M14 2L6.4 8.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                    </svg>
                                </span>
                                <span className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--steel)' }}>총 지원</span>
                            </div>
                            <div className="flex items-baseline gap-1 text-[30px] font-semibold leading-none" style={{ color: 'var(--ink)', letterSpacing: '-0.6px' }}>
                                {total}<span className="text-[15px] font-medium" style={{ color: 'var(--steel)' }}>건</span>
                            </div>
                            <div className="text-[12px]" style={{ color: 'var(--stone)' }}>누적 지원 총계</div>
                        </div>

                        {/* 응답률 */}
                        <KpiCell
                            iconBg="var(--tint-sky)" iconColor="var(--link-blue)"
                            icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M2.5 4.5L8 9l5.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            label="응답률"
                            value={responseRate} unit="%" delta={`${respondedCount}건 / ${total}건`}
                        />

                        {/* 면접 통과율 */}
                        <KpiCell
                            iconBg="var(--tint-peach)" iconColor="var(--brand-orange)"
                            icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" /><path d="M5.2 8.2l2 2 3.6-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            label="면접 통과율"
                            value={interviewPassRate} unit="%"
                            delta={`면접 ${interviewedCount}건 중 ${passedCount}건`}
                        />

                        {/* 최종 합격 */}
                        <KpiCell
                            iconBg="var(--tint-mint)" iconColor="var(--brand-green)"
                            icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2h8v3a4 4 0 0 1-8 0V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M12 3.2h1.6V5a1.6 1.6 0 0 1-1.6 1.6M4 3.2H2.4V5A1.6 1.6 0 0 0 4 6.6M6.4 9.4h3.2M8 9.4v2.4M6 13.6h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            label="최종 합격"
                            value={passedCount} unit="건"
                            delta={`지원 대비 합격률 ${passRate}%`}
                        />

                        {/* 평균 응답 기간 */}
                        <div className="flex flex-col gap-2.5 px-4 border-l" style={{ borderColor: 'var(--hairline)' }}>
                            <div className="flex items-center gap-2">
                                <span className="w-[30px] h-[30px] rounded-[8px] grid place-items-center flex-none"
                                    style={{ background: 'var(--tint-gray)', color: 'var(--charcoal)' }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.4" />
                                        <path d="M8 5.5V8.5l2 1.4M5.5 1.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                    </svg>
                                </span>
                                <span className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--steel)' }}>평균 응답 기간</span>
                            </div>
                            <div className="flex items-baseline gap-1 text-[30px] font-semibold leading-none" style={{ color: 'var(--ink)', letterSpacing: '-0.6px' }}>
                                {avgResponseDays ?? '—'}<span className="text-[15px] font-medium" style={{ color: 'var(--steel)' }}>{avgResponseDays !== null ? '일' : ''}</span>
                            </div>
                            {avgResponseDays !== null ? (
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-baseline gap-1.5 text-[12px]" style={{ color: 'var(--steel)', whiteSpace: 'nowrap' }}>
                                        <span className="font-semibold" style={{ color: 'var(--stone)' }}>최단</span>
                                        <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{minResponseDays}일</b>
                                        <span style={{ color: 'var(--stone)' }}>· {minResponseCompany}</span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5 text-[12px]" style={{ color: 'var(--steel)', whiteSpace: 'nowrap' }}>
                                        <span className="font-semibold" style={{ color: 'var(--stone)' }}>최장</span>
                                        <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{maxResponseDays}일</b>
                                        <span style={{ color: 'var(--stone)' }}>· {maxResponseCompany}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[12px]" style={{ color: 'var(--stone)' }}>면접 일정 데이터 없음</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Weekly trend chart */}
                <section
                    className="rounded-xl p-6"
                    style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)' }}
                >
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                        <div>
                            <h2 className="m-0 text-[18px] font-semibold" style={{ color: 'var(--ink)' }}>주별 지원 추이</h2>
                            <p className="mt-1 text-[13px]" style={{ color: 'var(--steel)' }}>지원 단계별 누적 — 최근 12주</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <LegendDot color="#fde8d0" label="지원" />
                            <LegendDot color="#f5a060" label="응답" />
                            <LegendDot color="#dd5b00" label="면접" />
                        </div>
                    </div>
                    <WeeklyTrendChart data={weeks} />
                </section>

                {/* Platform + Funnel */}
                <div className="grid gap-4" style={{ gridTemplateColumns: '1.2fr 1fr' }}>

                    {/* Platform response rate */}
                    <section
                        className="rounded-xl p-6"
                        style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)' }}
                    >
                        <div className="mb-5">
                            <h2 className="m-0 text-[18px] font-semibold" style={{ color: 'var(--ink)' }}>플랫폼별 응답률</h2>
                            <p className="mt-1 text-[13px]" style={{ color: 'var(--steel)' }}>지원 횟수가 많은 순</p>
                        </div>

                        {platforms.length === 0 ? (
                            <p className="text-[13px] text-center py-8" style={{ color: 'var(--stone)' }}>지원 데이터가 없습니다.</p>
                        ) : (
                            <div className="flex flex-col">
                                {platforms.map((p, i) => (
                                    <div key={p.name} className="grid items-center gap-4 py-[7px]"
                                        style={{ gridTemplateColumns: '70px 1fr 95px' }}>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="w-2 h-2 rounded-full flex-none" style={{ background: PP[i] }} />
                                            <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--ink)' }}
                                                title={p.name}>{p.name}</span>
                                        </div>
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
                                            <div className="h-full rounded-full"
                                                style={{ width: `${(p.total / maxPlatformTotal) * 100}%`, background: PP[i] }} />
                                        </div>
                                        <div className="grid items-baseline" style={{ gridTemplateColumns: '42px 1fr', fontVariantNumeric: 'tabular-nums' }}>
                                            <span className="text-[14px] font-bold text-right" style={{ color: 'var(--ink)' }}>{p.rate}%</span>
                                            <span className="text-[13px] text-right" style={{ color: 'var(--steel)' }}>{p.responded} / {p.total}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Funnel */}
                    <section
                        className="rounded-xl p-6"
                        style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)' }}
                    >
                        <div className="mb-5">
                            <h2 className="m-0 text-[18px] font-semibold" style={{ color: 'var(--ink)' }}>채용 단계별 현황</h2>
                            <p className="mt-1 text-[13px]" style={{ color: 'var(--steel)' }}>
                                단계별 전환율 — {total}건의 지원 기준
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            {/* 서류 통과 */}
                            <FunnelStep
                                label="서류 통과"
                                meta={`${funnelResponded}건 · 응답률 ${funnelRespondedPct}%`}
                                pct={funnelRespondedPct}
                                dropPct={100 - funnelRespondedPct}
                                fillClass="bg-[#dd5b00]"
                                textClass="text-white"
                            />
                            {/* 면접 진행 */}
                            <FunnelStep
                                label="면접 진행"
                                meta={`${funnelInterview}건 · 지원 대비 ${funnelInterviewPct}%`}
                                pct={funnelInterviewPct}
                                dropPct={funnelRespondedPct > 0 ? funnelRespondedPct - funnelInterviewPct : 0}
                                fillClass="bg-[#f5a060]"
                                textClass="text-white"
                            />
                            {/* 최종 합격 */}
                            <FunnelStep
                                label="최종 합격"
                                meta={`${funnelPassed}건 · 면접 통과 ${interviewPassRate}%`}
                                pct={funnelPassedPct}
                                dropPct={funnelInterviewPct > 0 ? funnelInterviewPct - funnelPassedPct : 0}
                                fillClass="bg-[#fde8d0]"
                                textClass="text-[#7a3000]"
                            />
                        </div>
                    </section>

                </div>
            </div>
        </>
    )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function KpiCell({
    iconBg, iconColor, icon, label, value, unit, delta,
}: {
    iconBg: string
    iconColor: string
    icon: React.ReactNode
    label: string
    value: number
    unit: string
    delta: string
}) {
    return (
        <div className="flex flex-col gap-2.5 px-4 border-l" style={{ borderColor: 'var(--hairline)' }}>
            <div className="flex items-center gap-2">
                <span className="w-[30px] h-[30px] rounded-[8px] grid place-items-center flex-none"
                    style={{ background: iconBg, color: iconColor }}>
                    {icon}
                </span>
                <span className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--steel)' }}>{label}</span>
            </div>
            <div className="flex items-baseline gap-1 text-[30px] font-semibold tracking-tight"
                style={{ color: 'var(--ink)', letterSpacing: '-0.6px', lineHeight: 1.1 }}>
                {value}<span className="text-[15px] font-medium" style={{ color: 'var(--steel)' }}>{unit}</span>
            </div>
            <div className="text-[12px]" style={{ color: 'var(--stone)' }}>{delta}</div>
        </div>
    )
}

function LegendDot({ color, label }: { color: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--steel)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            {label}
        </span>
    )
}

function FunnelStep({
    label, meta, pct, dropPct, fillClass, textClass,
}: {
    label: string
    meta: string
    pct: number
    dropPct: number
    fillClass: string
    textClass: string
}) {
    return (
        <div className="grid items-center gap-3" style={{ gridTemplateColumns: '96px 1fr 52px' }}>
            <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>{label}</span>
                <span className="text-[11px] font-medium" style={{ color: 'var(--steel)' }}>{meta}</span>
            </div>
            <div className="relative h-10 rounded-[6px] overflow-hidden" style={{ background: 'var(--surface)' }}>
                <div
                    className={`absolute left-0 top-0 bottom-0 flex items-center px-3.5 text-[14px] font-semibold rounded-[6px] ${fillClass} ${textClass}`}
                    style={{ width: `${Math.max(pct, pct > 0 ? 8 : 0)}%`, minWidth: pct > 0 ? 40 : 0 }}
                >
                    {pct > 0 ? `${pct}%` : ''}
                </div>
            </div>
            <div className="flex items-center justify-end">
                <span className="text-[13px] font-semibold" style={{ color: 'var(--error)' }}>
                    {dropPct > 0 ? `−${dropPct}%` : '—'}
                </span>
            </div>
        </div>
    )
}
