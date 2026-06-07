import { createClient } from './server'

export type CodeItem = {
    sub_code: string
    code_name: string
}

export async function getCodesByGroup(groupCode: string): Promise<CodeItem[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('comCodeMaster')
        .select('sub_code, code_name')
        .eq('group_code', groupCode)
        .order('sort_seq', { ascending: true })
    if (error) {
        console.error('codes error:', error.message, error.code, error.details, error.hint)
        throw error
    }
    return data ?? []
}
