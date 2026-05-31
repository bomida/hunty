'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createUserProfile } from '@/lib/supabase/profile'

export async function submitOnboarding(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const nickname = (formData.get('nickname') as string)?.trim()
    if (!nickname || !/^[가-힣a-zA-Z0-9]{2,12}$/.test(nickname)) return

    await createUserProfile(user.id, nickname)
    redirect('/dashboard')
}
