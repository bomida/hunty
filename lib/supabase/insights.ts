import { createClient } from './server'
import { getCodesByGroup } from './codes'

export type WeekData = {
    label: string
    apply: number
    response: number
    interview: number
}

export type PlatformData = {
    name: string
    total: number
    responded: number
    rate: number
}

export type InsightsData = {
    total: number
    dateRange: string
    responseRate: number
    respondedCount: number
    interviewPassRate: number
    interviewedCount: number
    interviewPassedCount: number
    passedCount: number
    passRate: number
    avgResponseDays: number | null
    minResponseDays: number | null
    minResponseCompany: string | null
    maxResponseDays: number | null
    maxResponseCompany: string | null
    weeks: WeekData[]
    platforms: PlatformData[]
    funnelResponded: number
    funnelInterview: number
    funnelPassed: number
}

function getWeekMonday(isoDate: string): Date {
    const d = new Date(isoDate)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
}

function weekLabel(d: Date): string {
    return `${d.getMonth() + 1}/${d.getDate()}`
}

export async function getInsightsData(userId: string): Promise<InsightsData> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('jobApplication')
        .select('apply_status, apply_platform, apply_platform_memo, insert_time, company_name, interview_date')
        .eq('id', userId)
        .order('insert_time', { ascending: true })

    if (error) throw error
    const apps = data ?? []

    const platformCodes = await getCodesByGroup('APPLY002').catch(() => [])
    const platformLabelMap = Object.fromEntries(platformCodes.map(c => [c.sub_code, c.code_name]))

    const total = apps.length

    // KPI
    const respondedSet = ['INTERVIEW', 'WAITING', 'PASSED', 'FAILED']
    const interviewSet = ['INTERVIEW', 'WAITING', 'PASSED']
    const respondedCount = apps.filter(a => respondedSet.includes(a.apply_status)).length
    const responseRate = total > 0 ? Math.round((respondedCount / total) * 100) : 0
    const interviewedCount = apps.filter(a => interviewSet.includes(a.apply_status)).length
    const passedCount = apps.filter(a => a.apply_status === 'PASSED').length
    const interviewPassedCount = passedCount
    const interviewPassRate = interviewedCount > 0 ? Math.round((passedCount / interviewedCount) * 100) : 0
    const passRate = total > 0 ? Math.round((passedCount / total) * 100) : 0

    // Date range
    let dateRange = ''
    if (apps.length > 0) {
        const first = new Date(apps[0].insert_time)
        const last = new Date(apps[apps.length - 1].insert_time)
        const fmt = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
        dateRange = `${fmt(first)} – ${fmt(last)} 기준 · 총 ${total}건의 지원 데이터`
    }

    // Weekly trend — last 12 weeks from today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weeks: WeekData[] = []
    for (let i = 11; i >= 0; i--) {
        const monday = new Date(today)
        const dayOfWeek = monday.getDay()
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        monday.setDate(monday.getDate() - daysToMonday - i * 7)
        monday.setHours(0, 0, 0, 0)
        const sunday = new Date(monday)
        sunday.setDate(sunday.getDate() + 6)
        sunday.setHours(23, 59, 59, 999)

        const weekApps = apps.filter(a => {
            const d = new Date(a.insert_time)
            return d >= monday && d <= sunday
        })

        const interview = weekApps.filter(a => interviewSet.includes(a.apply_status)).length
        const response = weekApps.filter(a => a.apply_status === 'FAILED').length
        const apply = weekApps.length - interview - response

        weeks.push({ label: weekLabel(monday), apply, response, interview })
    }

    // Average response days (insert_time → interview_date)
    const responseTimes = apps
        .filter(a => a.interview_date && a.interview_date.length === 8)
        .map(a => {
            const applied = new Date(a.insert_time)
            applied.setHours(0, 0, 0, 0)
            const d = a.interview_date!
            const interviewed = new Date(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`)
            const days = Math.max(0, Math.round((interviewed.getTime() - applied.getTime()) / 86400000))
            return { days, company: a.company_name }
        })

    let avgResponseDays: number | null = null
    let minResponseDays: number | null = null
    let minResponseCompany: string | null = null
    let maxResponseDays: number | null = null
    let maxResponseCompany: string | null = null

    if (responseTimes.length > 0) {
        avgResponseDays = Math.round(
            (responseTimes.reduce((s, r) => s + r.days, 0) / responseTimes.length) * 10
        ) / 10
        const minEntry = responseTimes.reduce((a, b) => a.days <= b.days ? a : b)
        const maxEntry = responseTimes.reduce((a, b) => a.days >= b.days ? a : b)
        minResponseDays = minEntry.days
        minResponseCompany = minEntry.company
        maxResponseDays = maxEntry.days
        maxResponseCompany = maxEntry.company
    }

    // Platform response rate
    const platformMap = new Map<string, { total: number; responded: number }>()
    for (const app of apps) {
        const key = app.apply_platform === 'ETC'
            ? (app.apply_platform_memo || '기타')
            : (platformLabelMap[app.apply_platform ?? ''] ?? app.apply_platform ?? '기타')
        const entry = platformMap.get(key) ?? { total: 0, responded: 0 }
        entry.total++
        if (respondedSet.includes(app.apply_status)) entry.responded++
        platformMap.set(key, entry)
    }
    const platforms: PlatformData[] = Array.from(platformMap.entries())
        .map(([name, { total, responded }]) => ({
            name,
            total,
            responded,
            rate: total > 0 ? Math.round((responded / total) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)

    return {
        total,
        dateRange,
        responseRate,
        respondedCount,
        interviewPassRate,
        interviewedCount,
        interviewPassedCount,
        passedCount,
        passRate,
        avgResponseDays,
        minResponseDays,
        minResponseCompany,
        maxResponseDays,
        maxResponseCompany,
        weeks,
        platforms,
        funnelResponded: respondedCount,
        funnelInterview: interviewedCount,
        funnelPassed: passedCount,
    }
}
