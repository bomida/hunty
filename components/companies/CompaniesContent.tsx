'use client'

import { useState } from 'react'
import Link from 'next/link'
import { type Application } from '@/lib/supabase/applications'
import { type CodeItem } from '@/lib/supabase/codes'
import { APPLY_STATUS_VARIANT } from '@/lib/codes'
import ApplicationsTable, { type StatusMap, type PlatformMap } from './ApplicationsTable'
import { DateRangePicker } from '@/components/ui/DatePicker'

function getDefaultDates() {
    const today = new Date()
    const from = new Date(today)
    from.setMonth(from.getMonth() - 3)
    const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return { dateFrom: fmt(from), dateTo: fmt(today) }
}

type Props = {
    data: Application[]
    statusCodes: CodeItem[]
    statusMap: StatusMap
    platformMap: PlatformMap
}

export default function CompaniesContent({ data, statusCodes, statusMap, platformMap }: Props) {
    const defaults = getDefaultDates()
    const [query, setQuery] = useState('')
    const [filter, setFilter] = useState('ALL')
    const [dateFrom, setDateFrom] = useState(defaults.dateFrom)
    const [dateTo, setDateTo] = useState(defaults.dateTo)

    const filters = [
        { key: 'ALL', label: '전체', variant: '' },
        ...statusCodes.map(c => ({ key: c.sub_code, label: c.code_name, variant: APPLY_STATUS_VARIANT[c.sub_code] ?? '' })),
    ]

    const fromYmd = dateFrom.replace(/-/g, '')
    const toYmd = dateTo.replace(/-/g, '')

    const dateFiltered = data.filter(a => {
        const ymd = a.apply_date_fr ?? a.insert_time.slice(0, 10).replace(/-/g, '')
        return ymd >= fromYmd && ymd <= toYmd
    })

    const searched = query.trim()
        ? dateFiltered.filter(a => a.company_name.toLowerCase().includes(query.toLowerCase()))
        : dateFiltered

    const filtered = filter === 'ALL'
        ? searched
        : searched.filter(app => app.apply_status === filter)

    const countFor = (key: string) =>
        key === 'ALL' ? dateFiltered.length : dateFiltered.filter(a => a.apply_status === key).length

    return (
        <>
            <header className="topbar">
                <div className="crumbs">
                    <span>Workspace</span>
                    <span className="sep">/</span>
                    <b>지원 목록</b>
                </div>
            </header>

            <div className="flex flex-col gap-6 p-8">
                {/* 타이틀 */}
                <h1 className="text-xl font-semibold" style={{ color: 'var(--ink)', letterSpacing: '-0.3px' }}>
                    지원 목록
                </h1>

                {/* 필터 탭 */}
                <div className="flex items-center gap-2">
                    {filters.map((f) => (
                        <button
                            key={f.key}
                            className={`pill-tab ${filter === f.key ? 'is-active' : ''}`}
                            data-variant={f.variant}
                            onClick={() => setFilter(f.key)}
                        >
                            {f.label}
                            <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 600, opacity: 0.7 }}>
                                {countFor(f.key)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* 툴바: [날짜범위] [검색] ··· [지원추가] */}
                <div className="flex items-center gap-2">
                    <DateRangePicker
                        from={dateFrom}
                        to={dateTo}
                        onFromChange={setDateFrom}
                        onToChange={setDateTo}
                    />

                    <div style={{ width: 1, height: 20, background: 'var(--hairline)', flexShrink: 0, margin: '0 2px' }} />

                    <div className={`search-box${query ? ' has-val' : ''}`}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        <input
                            id="search-input"
                            placeholder="회사명 검색"
                            autoComplete="off"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                        <button
                            className="clear"
                            aria-label="검색 지우기"
                            onClick={() => setQuery('')}
                        >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    <div style={{ flex: 1 }} />

                    <Link href="/companies/new" className="btn btn-sm btn-primary">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        지원 추가
                    </Link>
                </div>

                <ApplicationsTable data={filtered} statusMap={statusMap} platformMap={platformMap} />
            </div>
        </>
    )
}
