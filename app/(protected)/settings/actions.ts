'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

type ActionResult = { error?: string; success?: boolean } | null

export async function updateNicknameAction(
    _prev: ActionResult,
    formData: FormData,
): Promise<ActionResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const nickname = (formData.get('nickname') as string | null)?.trim() ?? ''
    if (!/^[가-힣a-zA-Z0-9]{2,12}$/.test(nickname)) {
        return { error: '한글·영문·숫자 2~12자로 입력해주세요.' }
    }

    const now = new Date().toISOString()
    const { error } = await supabase
        .from('userProfile')
        .upsert({ id: user.id, nickname, insert_time: now, update_time: now }, { onConflict: 'id' })

    if (error) return { error: '저장 중 오류가 발생했습니다.' }
    revalidatePath('/', 'layout')
    return { success: true }
}

export async function updateAlarmAction(
    _prev: ActionResult,
    formData: FormData,
): Promise<ActionResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const alarmDDay = Number(formData.get('alarm_d_day') ?? 3)

    const now = new Date().toISOString()
    const { error } = await supabase
        .from('userProfile')
        .upsert({ id: user.id, alarm_d_day: alarmDDay, insert_time: now, update_time: now }, { onConflict: 'id' })

    if (error) return { error: '저장 중 오류가 발생했습니다.' }
    revalidatePath('/settings')
    return { success: true }
}

export async function logoutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    ;(await cookies()).delete('session-date')
    redirect('/login')
}

export async function deleteAccountAction(
    _prev: ActionResult,
    formData: FormData,
): Promise<ActionResult> {
    const confirm = formData.get('confirm') as string | null
    if (confirm !== '탈퇴') return { error: '확인 문자가 일치하지 않아요.' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: apps } = await supabase
        .from('jobApplication')
        .select('application_id')
        .eq('id', user.id)

    if (apps && apps.length > 0) {
        const ids = apps.map(a => a.application_id)
        await supabase.from('interviewNote').delete().in('application_id', ids)
    }

    await supabase.from('jobApplication').delete().eq('id', user.id)
    await supabase.from('userProfile').delete().eq('id', user.id)

    const adminClient = createAdminClient()
    await adminClient.auth.admin.deleteUser(user.id)

    await supabase.auth.signOut()
    ;(await cookies()).delete('session-date')
    redirect('/login')
}
