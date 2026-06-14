'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
    const [loading, setLoading] = useState(false)
    const searchParams = useSearchParams()
    const hasError = searchParams.get('error') === 'auth'

    async function signInWithGoogle() {
        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                    queryParams: { prompt: 'select_account' },
                },
            })
            if (error) throw error
        } catch {
            location.href = '/error?reason=server'
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
            <div
                className="flex flex-col items-center gap-8 p-10 rounded-2xl"
                style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)', width: 360 }}
            >
                {/* Brand */}
                <div className="flex flex-col items-center gap-4">
                    <a
                        href="/"
                        style={{ textDecoration: 'none', position: 'relative', display: 'inline-block', lineHeight: 1, paddingRight: 13 }}
                    >
                        <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--ink)' }}>Hunty</span>
                        <span style={{ position: 'absolute', top: 2, right: 0, width: 9, height: 9, borderRadius: '50%', background: '#ff7a2e', display: 'block' }} aria-hidden="true" />
                    </a>
                    <div className="text-center">
                        <p className="font-semibold text-base" style={{ color: 'var(--ink)' }}>Hunty에 오신 것을 환영합니다</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--steel)' }}>채용 지원 현황을 한 눈에 관리하세요</p>
                    </div>
                </div>

                {hasError && (
                    <p className="text-sm text-center px-1" style={{ color: 'var(--semantic-error)' }}>
                        로그인에 실패했어요. 다시 시도해주세요.
                    </p>
                )}

                <button
                    onClick={signInWithGoogle}
                    disabled={loading}
                    className="btn btn-secondary w-full justify-center"
                    style={{ gap: 10, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    <GoogleIcon />
                    {loading ? '연결 중...' : 'Google로 계속하기'}
                </button>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    )
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
        </svg>
    )
}
