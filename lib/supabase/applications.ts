import { createClient } from './server'
import { IN_PROGRESS_STATUSES } from '@/lib/codes'

// ── 지원 추가 ───────────────────────────────────────────────────────────────

export type NewApplicationData = {
    company_name: string
    apply_status: string
    apply_position?: string | null
    apply_platform?: string | null
    apply_platform_memo?: string | null
    contract_type?: string | null
    apply_date_to?: string | null
    interview_date?: string | null
    memo?: string | null
    work_type?: string | null
    job_post_url?: string | null
    requirements?: string | null
    benefits?: string | null
}

export type NewInterviewNote = {
    question: string
    answer: string
}

export async function createApplication(
    userId: string,
    data: NewApplicationData,
    interviewNotes?: NewInterviewNote[],
): Promise<number> {
    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data: inserted, error } = await supabase
        .from('jobApplication')
        .insert({
            id: userId,
            company_name: data.company_name,
            apply_status: data.apply_status,
            apply_position: data.apply_position ?? null,
            apply_platform: data.apply_platform ?? null,
            apply_platform_memo: data.apply_platform_memo ?? null,
            contract_type: data.contract_type ?? null,
            apply_date_to: data.apply_date_to ?? null,
            interview_date: data.interview_date ?? null,
            memo: data.memo ?? null,
            work_type: data.work_type ?? null,
            job_post_url: data.job_post_url ?? null,
            requirements: data.requirements ?? null,
            benefits: data.benefits ?? null,
            insert_time: now,
            update_time: now,
        })
        .select('application_id')
        .single()

    if (error) throw error
    const applicationId = (inserted as { application_id: number }).application_id

    const notes = (interviewNotes ?? []).filter(n => n.question.trim())
    if (notes.length > 0) {
        const { error: notesError } = await supabase
            .from('interviewNote')
            .insert(
                notes.map(n => ({
                    application_id: applicationId,
                    question: n.question,
                    answer: n.answer || null,
                    insert_time: now,
                    update_time: now,
                })),
            )
        if (notesError) throw notesError
    }

    return applicationId
}

// ── 목록 조회 ───────────────────────────────────────────────────────────────

export type Application = {
    application_id: number
    company_name: string
    apply_status: string
    apply_position: string | null
    apply_platform: string | null
    apply_platform_memo: string | null
    apply_date_fr: string | null
    apply_date_to: string | null
    interview_date: string | null
    insert_time: string
}

// ── 단건 조회 ───────────────────────────────────────────────────────────────

export type ApplicationDetail = Application & {
    contract_type: string | null
    memo: string | null
    work_type: string | null
    job_post_url: string | null
    requirements: string | null
    benefits: string | null
    interviewNotes: { question_no: number; question: string; answer: string | null }[]
}

export async function getApplicationById(
    userId: string,
    applicationId: number,
): Promise<ApplicationDetail | null> {
    const supabase = await createClient()

    const { data: app, error } = await supabase
        .from('jobApplication')
        .select('application_id, company_name, apply_status, apply_position, apply_platform, apply_platform_memo, contract_type, apply_date_fr, apply_date_to, interview_date, memo, work_type, job_post_url, requirements, benefits, insert_time')
        .eq('application_id', applicationId)
        .eq('id', userId)
        .single()

    if (error || !app) return null

    const { data: notes } = await supabase
        .from('interviewNote')
        .select('question_no, question, answer')
        .eq('application_id', applicationId)
        .order('question_no', { ascending: true })

    return { ...app, interviewNotes: notes ?? [] }
}

// ── 수정 ────────────────────────────────────────────────────────────────────

export async function updateApplication(
    userId: string,
    applicationId: number,
    data: NewApplicationData,
    interviewNotes?: NewInterviewNote[],
): Promise<void> {
    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data: updated, error } = await supabase
        .from('jobApplication')
        .update({
            company_name: data.company_name,
            apply_status: data.apply_status,
            apply_position: data.apply_position ?? null,
            apply_platform: data.apply_platform ?? null,
            apply_platform_memo: data.apply_platform_memo ?? null,
            contract_type: data.contract_type ?? null,
            apply_date_to: data.apply_date_to ?? null,
            interview_date: data.interview_date ?? null,
            memo: data.memo ?? null,
            work_type: data.work_type ?? null,
            job_post_url: data.job_post_url ?? null,
            requirements: data.requirements ?? null,
            benefits: data.benefits ?? null,
            update_time: now,
        })
        .eq('application_id', applicationId)
        .eq('id', userId)
        .select('application_id')
        .single()

    if (error) throw error
    if (!updated) throw new Error('Application not found or access denied')

    // 면접 질문 전체 교체 (삭제 후 재삽입)
    const { error: deleteError } = await supabase
        .from('interviewNote')
        .delete()
        .eq('application_id', applicationId)
    if (deleteError) throw deleteError

    const notes = (interviewNotes ?? []).filter(n => n.question.trim())
    if (notes.length > 0) {
        const { error: notesError } = await supabase
            .from('interviewNote')
            .insert(
                notes.map(n => ({
                    application_id: applicationId,
                    question: n.question,
                    answer: n.answer || null,
                    insert_time: now,
                    update_time: now,
                })),
            )
        if (notesError) throw notesError
    }
}

export async function deleteApplication(userId: string, applicationId: number): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
        .from('jobApplication')
        .delete()
        .eq('application_id', applicationId)
        .eq('id', userId)
    if (error) throw error
}

export async function getKanbanApplications(userId: string): Promise<Application[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('jobApplication')
        .select('application_id, company_name, apply_status, apply_position, apply_platform, apply_platform_memo, apply_date_fr, apply_date_to, interview_date, insert_time')
        .eq('id', userId)
        .order('insert_time', { ascending: false })
    if (error) throw error
    return data ?? []
}

export async function getDashboardStats(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('jobApplication')
        .select('apply_status, interview_date, company_name, insert_time')
        .eq('id', userId)
    if (error) throw error

    const apps = data ?? []
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const total = apps.length
    const recentCount = apps.filter(a => new Date(a.insert_time) >= thirtyDaysAgo).length
    const inProgress = apps.filter(a => (IN_PROGRESS_STATUSES as readonly string[]).includes(a.apply_status)).length
    const passed = apps.filter(a => a.apply_status === 'PASSED').length

    const upcomingInterviews = apps
        .filter(a => a.apply_status === 'INTERVIEW' && a.interview_date && a.interview_date >= todayStr)
        .sort((a, b) => a.interview_date!.localeCompare(b.interview_date!))

    const interviewCount = apps.filter(a => a.apply_status === 'INTERVIEW').length

    let nearestDday: string | null = null
    let nearestCompany: string | null = null

    if (upcomingInterviews.length > 0) {
        const nearest = upcomingInterviews[0]
        const d = nearest.interview_date!
        const target = new Date(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000)
        nearestDday = `D-${diff}`
        nearestCompany = nearest.company_name
    }

    return { total, recentCount, inProgress, interviewCount, nearestDday, nearestCompany, passed }
}
