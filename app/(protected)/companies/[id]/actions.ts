'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateApplication, deleteApplication } from '@/lib/supabase/applications'
import type { SavePayload } from '@/app/(protected)/companies/new/actions'

function stripDashes(s: string): string {
    return s.replace(/-/g, '')
}

export async function updateApplicationAction(
    applicationId: number,
    payload: SavePayload,
): Promise<{ error: string } | void> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const isEtc = payload.platform === 'ETC'
    const platform = payload.platform || null
    const platformMemo = isEtc ? (payload.platformOther.trim() || null) : null

    try {
        await updateApplication(
            user.id,
            applicationId,
            {
                company_name: payload.company.trim(),
                apply_status: payload.status,
                apply_position: payload.position.trim() || null,
                apply_platform: platform,
                apply_platform_memo: platformMemo,
                contract_type: payload.employment || null,
                apply_date_to: payload.deadline ? stripDashes(payload.deadline) : null,
                interview_date: payload.interviewDate ? stripDashes(payload.interviewDate) : null,
                memo: payload.memo.trim() || null,
            },
            payload.questions.map(q => ({ question: q.q, answer: q.a })),
        )
    } catch (e) {
        console.error('[updateApplicationAction]', (e as { message?: string })?.message ?? String(e))
        return { error: '저장 중 오류가 발생했습니다.' }
    }

    revalidatePath('/companies')
    revalidatePath('/dashboard')
    redirect('/companies')
}

export async function deleteApplicationAction(applicationId: number): Promise<void> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    await deleteApplication(user.id, applicationId)
    revalidatePath('/companies')
    revalidatePath('/dashboard')
    redirect('/companies')
}
