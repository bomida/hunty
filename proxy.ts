import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getTodayKST } from '@/lib/date'

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const sessionDate = request.cookies.get('session-date')?.value
        const today = getTodayKST()

        if (!sessionDate) {
            supabaseResponse.cookies.set('session-date', today, {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
            })
        } else if (sessionDate !== today) {
            await supabase.auth.signOut()
            const res = NextResponse.redirect(new URL('/login', request.url))
            res.cookies.delete('session-date')
            return res
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!login|auth|error|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
