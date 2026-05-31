import { createClient } from './server'

export async function getUserProfile(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('userProfile')
        .select('nickname')
        .eq('id', userId)
        .single()
    if (error) console.error('[getUserProfile]', error.code, '|', error.message, '|', error.details)
    return data
}

export async function createUserProfile(userId: string, nickname: string) {
    const supabase = await createClient()
    const now = new Date().toISOString()
    const { error } = await supabase
        .from('userProfile')
        .insert({ id: userId, nickname, insert_time: now, update_time: now })
    if (error) console.error('[createUserProfile]', error.code, '|', error.message, '|', error.details)
    return !error
}
