'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createApplication } from '@/lib/supabase/applications'

function stripDashes(s: string): string {
    return s.replace(/-/g, '')
}

export type SavePayload = {
    company: string
    status: string
    position: string
    platform: string
    platformOther: string
    employment: string
    deadline: string
    interviewDate: string
    memo: string
    questions: { q: string; a: string }[]
}

export async function createApplicationAction(payload: SavePayload): Promise<{ error: string } | void> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const isEtc = payload.platform === 'ETC'
    const platform = payload.platform || null
    const platformMemo = isEtc ? (payload.platformOther.trim() || null) : null

    try {
        await createApplication(
            user.id,
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
        console.error('[createApplicationAction]', (e as { message?: string })?.message ?? String(e))
        return { error: '저장 중 오류가 발생했습니다.' }
    }

    redirect('/companies')
}
