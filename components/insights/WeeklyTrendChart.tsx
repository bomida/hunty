'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import type { WeekData } from '@/lib/supabase/insights'

const COLORS = {
    apply: '#e0dcf5',
    response: '#8b78e0',
    interview: '#5645d4',
}

type TooltipProps = {
    active?: boolean
    payload?: { name: string; value: number; color: string }[]
    label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null
    const interview = payload.find(p => p.name === 'interview')?.value ?? 0
    const response = payload.find(p => p.name === 'response')?.value ?? 0
    const apply = payload.find(p => p.name === 'apply')?.value ?? 0
    const total = interview + response + apply
    return (
        <div style={{
            background: 'var(--ink-deep)',
            color: 'var(--on-dark)',
            fontSize: 12,
            fontWeight: 500,
            padding: '8px 10px',
            borderRadius: 6,
            lineHeight: 1.5,
            whiteSpace: 'nowrap',
        }}>
            <div>{label} · 지원 {total}건</div>
            <div style={{ color: 'var(--on-dark-muted)' }}>
                응답 {response + interview} · 면접 {interview}
            </div>
        </div>
    )
}

type Props = { data: WeekData[] }

export default function WeeklyTrendChart({ data }: Props) {
    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart
                data={data}
                margin={{ top: 4, right: 4, left: -32, bottom: 0 }}
                barCategoryGap="28%"
            >
                <CartesianGrid vertical={false} stroke="var(--hairline-soft)" />
                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: 'var(--steel)', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--hairline)' }}
                />
                <YAxis
                    tick={{ fontSize: 11, fill: 'var(--stone)', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={40}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface)', radius: 4 }} />
                <Bar dataKey="interview" name="interview" stackId="a" fill={COLORS.interview} radius={[0, 0, 0, 0]} />
                <Bar dataKey="response" name="response" stackId="a" fill={COLORS.response} />
                <Bar dataKey="apply" name="apply" stackId="a" fill={COLORS.apply} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
