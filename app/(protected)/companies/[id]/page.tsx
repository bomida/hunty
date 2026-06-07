import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getApplicationById } from '@/lib/supabase/applications'
import { getCodesByGroup } from '@/lib/supabase/codes'
import NewApplicationForm from '@/components/applications/NewApplicationForm'
import { updateApplicationAction, deleteApplicationAction } from './actions'
import { decodeId } from '@/lib/id'

export const metadata = { title: 'Hunty · 지원 수정' }

/** YYYYMMDD → YYYY-MM-DD (폼 표시용) */
function toFormDate(s: string | null | undefined): string {
    if (!s || s.length !== 8) return ''
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}

export default async function EditApplicationPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const applicationId = decodeId(id)
    if (!applicationId) notFound()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [app, statusCodes, platformCodes, contractCodes] = await Promise.all([
        getApplicationById(user.id, applicationId).catch(() => null),
        getCodesByGroup('APPLY001').catch(() => []),
        getCodesByGroup('APPLY002').catch(() => []),
        getCodesByGroup('CNTR001').catch(() => []),
    ])

    if (!app) notFound()

    const initialData = {
        company: app.company_name,
        status: app.apply_status,
        position: app.apply_position ?? '',
        platform: app.apply_platform ?? '',
        platformOther: app.apply_platform_memo ?? '',
        employment: app.contract_type ?? '',
        deadline: toFormDate(app.apply_date_to),
        interviewDate: toFormDate(app.interview_date),
        memo: app.memo ?? '',
        workType: app.work_type ?? '',
        jobPostUrl: app.job_post_url ?? '',
        requirements: app.requirements ?? '',
        benefits: app.benefits ?? '',
        questions: app.interviewNotes.map(n => ({ q: n.question, a: n.answer ?? '' })),
    }

    const boundAction = updateApplicationAction.bind(null, applicationId)
    const boundDeleteAction = deleteApplicationAction.bind(null, applicationId)

    return (
        <NewApplicationForm
            statusCodes={statusCodes}
            platformCodes={platformCodes}
            contractCodes={contractCodes}
            initialData={initialData}
            mode="edit"
            saveAction={boundAction}
            deleteAction={boundDeleteAction}
        />
    )
}
