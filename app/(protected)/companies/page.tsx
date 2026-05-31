import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getKanbanApplications } from '@/lib/supabase/applications'
import { getCodesByGroup } from '@/lib/supabase/codes'
import { APPLY_STATUS_VARIANT } from '@/lib/codes'
import CompaniesContent from '@/components/companies/CompaniesContent'

export default async function CompaniesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [applications, statusCodes, platformCodes] = await Promise.all([
        getKanbanApplications(user.id).catch(() => []),
        getCodesByGroup('APPLY001').catch((e) => { console.error('[APPLY001]', e); return [] }),
        getCodesByGroup('APPLY002').catch((e) => { console.error('[APPLY002]', e); return [] }),
    ])
    const statusMap = Object.fromEntries(
        statusCodes.map(c => [c.sub_code, {
            label: c.code_name,
            variant: APPLY_STATUS_VARIANT[c.sub_code] ?? 'applied',
        }])
    )

    const platformMap = Object.fromEntries(
        platformCodes.map(c => [c.sub_code, c.code_name])
    )

    return <CompaniesContent data={applications} statusCodes={statusCodes} statusMap={statusMap} platformMap={platformMap} />
}
