import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getTodayKST } from '@/lib/date'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        // Buffer cookies so they can be written onto the redirect response.
        // Using cookies() from next/headers + NextResponse.redirect() is unreliable —
        // mutations on the framework cookie jar don't propagate to a manually-created NextResponse.
        const pendingCookies: { name: string; value: string; options: object }[] = []

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        pendingCookies.push(...cookiesToSet)
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

            pendingCookies.forEach(({ name, value, options }) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                res.cookies.set(name, value, options as any)
            )
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
