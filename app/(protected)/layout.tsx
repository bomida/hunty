import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/profile'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const profile = await getUserProfile(user.id)
    const name =
        profile?.nickname ??
        user.user_metadata?.name ??
        user.email?.split('@')[0] ??
        '사용자'
    const email = user.email ?? ''
    const avatarUrl = user.user_metadata?.avatar_url ?? null

    return (
        <div className="grid min-h-screen" style={{ gridTemplateColumns: 'var(--sidebar-w) 1fr' }}>
            <Sidebar name={name} email={email} avatarUrl={avatarUrl} />
            <main className="min-w-0 flex flex-col overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    )
}
