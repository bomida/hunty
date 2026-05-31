import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/lib/supabase/settings'
import SettingsForm from '@/components/settings/SettingsForm'
import {
    updateNicknameAction,
    updateAlarmAction,
    logoutAction,
    deleteAccountAction,
} from './actions'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [settings, { count: appCount }] = await Promise.all([
        getSettings(user.id).catch(() => null),
        supabase
            .from('jobApplication')
            .select('application_id', { count: 'exact', head: true })
            .eq('id', user.id),
    ])

    const nickname =
        settings?.nickname ??
        user.user_metadata?.name ??
        user.email?.split('@')[0] ??
        '사용자'

    return (
        <>
            <header className="topbar">
                <div className="crumbs">
                    <span>Workspace</span>
                    <span className="sep">/</span>
                    <b>설정</b>
                </div>
            </header>

            <SettingsForm
                nickname={nickname}
                email={user.email ?? ''}
                alarmDDay={settings?.alarm_d_day ?? 3}
                appCount={appCount ?? 0}
                updateNicknameAction={updateNicknameAction}
                updateAlarmAction={updateAlarmAction}
                logoutAction={logoutAction as () => Promise<void>}
                deleteAccountAction={deleteAccountAction}
            />
        </>
    )
}
