import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/profile'
import { submitOnboarding } from './actions'

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const profile = await getUserProfile(user.id)
    if (profile) redirect('/dashboard')

    const defaultNickname =
        user.user_metadata?.name ??
        user.email?.split('@')[0] ??
        ''

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
            <div
                className="flex flex-col gap-8 p-10 rounded-2xl"
                style={{ background: 'var(--canvas)', border: '1px solid var(--hairline)', width: 400 }}
            >
                {/* Brand */}
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="flex items-center justify-center font-bold text-xl"
                        style={{
                            width: 48, height: 48,
                            borderRadius: 'var(--r-lg)',
                            background: 'var(--primary)',
                            color: 'var(--on-primary)',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        H
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-base" style={{ color: 'var(--ink)' }}>환영합니다!</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--steel)' }}>Hunty에서 사용할 닉네임을 설정해주세요</p>
                    </div>
                </div>

                <form action={submitOnboarding} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium" style={{ color: 'var(--charcoal)' }}>
                            닉네임
                        </label>
                        <input
                            name="nickname"
                            type="text"
                            defaultValue={defaultNickname}
                            maxLength={80}
                            required
                            placeholder="닉네임 입력"
                            className="px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                            style={{
                                border: '1px solid var(--hairline)',
                                background: 'var(--canvas)',
                                color: 'var(--ink)',
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full justify-center mt-2"
                    >
                        시작하기
                    </button>
                </form>
            </div>
        </div>
    )
}
