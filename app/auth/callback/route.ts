import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getTodayKST } from '@/lib/date'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()
            const isNewUser = user
                ? !(await supabase.from('userProfile').select('id').eq('id', user.id).maybeSingle()).data
                : false

            const redirectTo = isNewUser ? `${origin}/onboarding` : `${origin}/dashboard`
            const res = NextResponse.redirect(redirectTo)
            res.cookies.set('session-date', getTodayKST(), {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
            })
            return res
        }
        console.error('[callback] exchange error:', error)
    }

    const errorParam = new URL(request.url).searchParams.get('error_description')
    if (errorParam) console.error('[callback] oauth error:', errorParam)

    return NextResponse.redirect(`${origin}/login?error=auth`)
}
