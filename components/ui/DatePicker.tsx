'use client'

import { useState, useRef, useEffect } from 'react'
import './DatePicker.css'

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseYmd(s: string): Date | null {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
}

function toYmd(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate()
}

function firstDow(y: number, m: number) {
    return new Date(y, m, 1).getDay() // 0=Sun
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

// ── DateRangePicker ────────────────────────────────────────────────────────────

type RangeProps = {
    from: string
    to: string
    onFromChange: (v: string) => void
    onToChange: (v: string) => void
}

export function DateRangePicker({ from, to, onFromChange, onToChange }: RangeProps) {
    const [open, setOpen] = useState<'from' | 'to' | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function onDown(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(null)
            }
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [])

    function handleSelect(date: string) {
        if (open === 'from') {
            onFromChange(date)
            if (to && date > to) onToChange(date)
        } else {
            onToChange(date)
            if (from && date < from) onFromChange(date)
        }
        setOpen(null)
    }

    return (
        <div className="dp-range" ref={containerRef}>
            <Trigger
                value={from}
                placeholder="시작일"
                active={open === 'from'}
                onClick={() => setOpen(open === 'from' ? null : 'from')}
            />
            <span className="dp-sep">~</span>
            <Trigger
                value={to}
                placeholder="종료일"
                active={open === 'to'}
                onClick={() => setOpen(open === 'to' ? null : 'to')}
            />
            {open && (
                <CalendarPopup
                    from={from}
                    to={to}
                    editing={open}
                    onSelect={handleSelect}
                    align={open === 'from' ? 'left' : 'right'}
                />
            )}
        </div>
    )
}

// ── Trigger ────────────────────────────────────────────────────────────────────

function Trigger({ value, placeholder, active, onClick, fullWidth }: {
    value: string
    placeholder: string
    active: boolean
    onClick: () => void
    fullWidth?: boolean
}) {
    return (
        <button
            type="button"
            className={`dp-trigger${active ? ' is-active' : ''}`}
            onClick={onClick}
            style={fullWidth ? { width: '100%' } : undefined}
        >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="dp-trigger-icon">
                <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M5 2v2M11 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M2 7h12" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <span className={value ? 'dp-trigger-val' : 'dp-trigger-placeholder'}>
                {value || placeholder}
            </span>
        </button>
    )
}

// ── DateSinglePicker ───────────────────────────────────────────────────────────

export function DateSinglePicker({ value, onChange, fullWidth }: {
    value: string
    onChange: (v: string) => void
    fullWidth?: boolean
}) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function onDown(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [])

    return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', width: fullWidth ? '100%' : undefined }}>
            <Trigger
                value={value}
                placeholder="YYYY-MM-DD"
                active={open}
                onClick={() => setOpen(o => !o)}
                fullWidth={fullWidth}
            />
            {open && (
                <CalendarPopup
                    from={value}
                    to={value}
                    editing="from"
                    onSelect={(date) => { onChange(date); setOpen(false) }}
                    align="left"
                />
            )}
        </div>
    )
}

// ── CalendarPopup ──────────────────────────────────────────────────────────────

type PanelMode = 'calendar' | 'year' | 'month'

function CalendarPopup({ from, to, editing, onSelect, align }: {
    from: string
    to: string
    editing: 'from' | 'to'
    onSelect: (date: string) => void
    align: 'left' | 'right'
}) {
    const target = editing === 'from' ? from : to
    const initD = parseYmd(target) ?? new Date()

    const [viewYear, setViewYear] = useState(initD.getFullYear())
    const [viewMonth, setViewMonth] = useState(initD.getMonth())
    const [panelMode, setPanelMode] = useState<PanelMode>('calendar')
    const [yearRangeStart, setYearRangeStart] = useState(() => Math.floor(initD.getFullYear() / 9) * 9)
    const [pendingYear, setPendingYear] = useState<number | null>(null)

    const todayStr = toYmd(new Date())

    // ── Calendar ─────────────────────────────────────────────────────────────

    function shiftMonth(delta: number) {
        let m = viewMonth + delta
        let y = viewYear
        if (m > 11) { m = 0; y++ }
        if (m < 0) { m = 11; y-- }
        setViewMonth(m)
        setViewYear(y)
    }

    function renderCalendar() {
        const totalDays = daysInMonth(viewYear, viewMonth)
        const startDow = firstDow(viewYear, viewMonth)
        const prevMonthDays = daysInMonth(viewYear, viewMonth - 1 < 0 ? 11 : viewMonth - 1)

        type Cell = { y: number; m: number; d: number; cur: boolean }
        const cells: Cell[] = []

        for (let i = startDow - 1; i >= 0; i--) {
            const m = viewMonth - 1 < 0 ? 11 : viewMonth - 1
            const y = viewMonth - 1 < 0 ? viewYear - 1 : viewYear
            cells.push({ y, m, d: prevMonthDays - i, cur: false })
        }
        for (let d = 1; d <= totalDays; d++) {
            cells.push({ y: viewYear, m: viewMonth, d, cur: true })
        }
        const remaining = 42 - cells.length
        for (let d = 1; d <= remaining; d++) {
            const m = viewMonth + 1 > 11 ? 0 : viewMonth + 1
            const y = viewMonth + 1 > 11 ? viewYear + 1 : viewYear
            cells.push({ y, m, d, cur: false })
        }

        return (
            <div className="dp-calendar">
                <div className="dp-cal-header">
                    <button type="button" className="dp-cal-title" onClick={() => setPanelMode('year')}>
                        {viewYear}년 {viewMonth + 1}월
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="dp-nav-group">
                        <button type="button" className="dp-nav-btn" onClick={() => shiftMonth(-1)} title="이전 달">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                        <button type="button" className="dp-nav-btn" onClick={() => shiftMonth(1)} title="다음 달">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                    </div>
                </div>

                <div className="dp-weekdays">
                    {WEEKDAYS.map((w, i) => (
                        <div key={w} className={`dp-weekday${i === 0 ? ' is-sun' : ''}`}>{w}</div>
                    ))}
                </div>

                <div className="dp-days">
                    {cells.map((cell, idx) => {
                        const ds = `${cell.y}-${String(cell.m + 1).padStart(2, '0')}-${String(cell.d).padStart(2, '0')}`
                        const isFrom = ds === from
                        const isTo = ds === to
                        const isSelected = isFrom || isTo
                        const isToday = ds === todayStr
                        const isSun = idx % 7 === 0

                        return (
                            <div key={idx} className="dp-day-cell">
                                <button
                                    type="button"
                                    className={[
                                        'dp-day',
                                        !cell.cur ? 'is-other' : '',
                                        isSelected ? 'is-selected' : '',
                                        isToday && !isSelected ? 'is-today' : '',
                                        isSun && !isSelected ? 'is-sun' : '',
                                    ].filter(Boolean).join(' ')}
                                    onClick={() => onSelect(ds)}
                                >
                                    {cell.d}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // ── Year Panel ────────────────────────────────────────────────────────────

    function renderYearPanel() {
        const years = Array.from({ length: 9 }, (_, i) => yearRangeStart + i)
        const fromY = from ? parseInt(from.slice(0, 4)) : null
        const toY = to ? parseInt(to.slice(0, 4)) : null

        return (
            <div className="dp-panel">
                <div className="dp-cal-header">
                    <span className="dp-panel-title">연도</span>
                    <div className="dp-nav-group">
                        <button type="button" className="dp-nav-btn" onClick={() => setYearRangeStart(s => s - 9)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                        <button type="button" className="dp-nav-btn" onClick={() => setYearRangeStart(s => s + 9)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                    </div>
                </div>
                <div className="dp-year-grid">
                    {years.map(y => {
                        const isSelected = y === viewYear
                        const inRange = !!(fromY && toY && y > fromY && y < toY)
                        const isBound = y === fromY || y === toY
                        return (
                            <button
                                key={y}
                                type="button"
                                className={[
                                    'dp-year-btn',
                                    isSelected ? 'is-selected' : '',
                                    !isSelected && isBound ? 'is-bound' : '',
                                    !isSelected && !isBound && inRange ? 'in-range' : '',
                                ].filter(Boolean).join(' ')}
                                onClick={() => {
                                    setPendingYear(y)
                                    setViewYear(y)
                                    setPanelMode('month')
                                }}
                            >
                                {y}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    // ── Month Panel ───────────────────────────────────────────────────────────

    function renderMonthPanel() {
        const y = pendingYear ?? viewYear
        const fromD = parseYmd(from)
        const toD = parseYmd(to)

        return (
            <div className="dp-panel">
                <div className="dp-cal-header">
                    <button type="button" className="dp-back-btn" onClick={() => setPanelMode('year')}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span className="dp-panel-title">{y}년</span>
                    </button>
                </div>
                <div className="dp-month-grid">
                    {MONTHS.map((label, m) => {
                        const thisMs = new Date(y, m, 1).getTime()
                        const fromMs = fromD ? new Date(fromD.getFullYear(), fromD.getMonth(), 1).getTime() : null
                        const toMs = toD ? new Date(toD.getFullYear(), toD.getMonth(), 1).getTime() : null
                        const isSelected = m === viewMonth && y === viewYear
                        const isBound = !!(fromMs && thisMs === fromMs) || !!(toMs && thisMs === toMs)
                        const inRange = !!(fromMs && toMs && thisMs > fromMs && thisMs < toMs)
                        return (
                            <button
                                key={m}
                                type="button"
                                className={[
                                    'dp-month-btn',
                                    isSelected ? 'is-selected' : '',
                                    !isSelected && isBound ? 'is-bound' : '',
                                    !isSelected && !isBound && inRange ? 'in-range' : '',
                                ].filter(Boolean).join(' ')}
                                onClick={() => {
                                    setViewMonth(m)
                                    setViewYear(y)
                                    setPanelMode('calendar')
                                }}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className={`dp-popup dp-popup--${align}`}>
            {panelMode === 'calendar' && renderCalendar()}
            {panelMode === 'year' && renderYearPanel()}
            {panelMode === 'month' && renderMonthPanel()}
        </div>
    )
}
