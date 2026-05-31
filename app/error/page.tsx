'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const MESSAGES: Record<string, { title: string; desc: string }> = {
    server: {
        title: '서버에 연결할 수 없어요',
        desc: '서비스가 일시적으로 중단됐거나 네트워크 문제가 있습니다.\n잠시 후 다시 시도해주세요.',
    },
    auth: {
        title: '로그인에 실패했어요',
        desc: '인증 과정에서 문제가 발생했습니다.\n다시 시도해주세요.',
    },
}

function ErrorContent() {
    const params = useSearchParams()
    const reason = params.get('reason') ?? 'server'
    const { title, desc } = MESSAGES[reason] ?? MESSAGES.server

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
            <div
                className="flex flex-col items-center gap-6 p-10 rounded-2xl text-center"
                style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)', width: 360 }}
            >
                <div
                    className="flex items-center justify-center text-2xl"
                    style={{ width: 52, height: 52, borderRadius: 'var(--r-xl)', background: 'var(--tint-rose)' }}
                >
                    ⚠️
                </div>

                <div className="flex flex-col gap-2">
                    <p className="font-semibold text-base" style={{ color: 'var(--ink)' }}>{title}</p>
                    <p className="text-sm whitespace-pre-line" style={{ color: 'var(--steel)' }}>{desc}</p>
                </div>

                <a href="/login" className="btn btn-primary w-full justify-center" style={{ textDecoration: 'none' }}>
                    로그인으로 돌아가기
                </a>
            </div>
        </div>
    )
}

export default function ErrorPage() {
    return (
        <Suspense>
            <ErrorContent />
        </Suspense>
    )
}
