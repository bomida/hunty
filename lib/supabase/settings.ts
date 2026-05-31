import { createClient } from './server'

export type UserSettings = {
    nickname: string | null
    alarm_d_day: number | null
}

export async function getSettings(userId: string): Promise<UserSettings | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('userProfile')
        .select('nickname, alarm_d_day')
        .eq('id', userId)
        .single()
    if (error) console.error('[getSettings]', error.code, '|', error.message)
    return data
}
