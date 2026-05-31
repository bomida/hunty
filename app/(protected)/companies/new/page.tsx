import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCodesByGroup } from '@/lib/supabase/codes'
import NewApplicationForm from '@/components/applications/NewApplicationForm'
import { createApplicationAction } from './actions'

export const metadata = { title: 'Hunty · 지원 추가' }

export default async function NewApplicationPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { status: initialStatus } = await searchParams

    const [statusCodes, platformCodes, contractCodes] = await Promise.all([
        getCodesByGroup('APPLY001').catch(() => []),
        getCodesByGroup('APPLY002').catch(() => []),
        getCodesByGroup('CNTR001').catch(() => []),
    ])

    return (
        <NewApplicationForm
            statusCodes={statusCodes}
            platformCodes={platformCodes}
            contractCodes={contractCodes}
            initialStatus={initialStatus}
            saveAction={createApplicationAction}
        />
    )
}
