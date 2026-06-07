'use client'

import { useState, useEffect, useRef, useActionState, useTransition } from 'react'

function BtnSpinner() {
    return (
        <svg
            width="13" height="13" viewBox="0 0 13 13" fill="none"
            style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}
            aria-hidden="true"
        >
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
            <path d="M6.5 1.5a5 5 0 0 1 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    )
}

type ActionResult = { error?: string; success?: boolean } | null

type Props = {
    nickname: string
    email: string
    alarmDDay: number
    appCount: number
    updateNicknameAction: (prev: ActionResult, formData: FormData) => Promise<ActionResult>
    updateAlarmAction: (prev: ActionResult, formData: FormData) => Promise<ActionResult>
    logoutAction: () => Promise<void>
    deleteAccountAction: (prev: ActionResult, formData: FormData) => Promise<ActionResult>
}

const ALARM_OPTIONS = [
    { value: 1, label: 'D-1' },
    { value: 3, label: 'D-3' },
    { value: 5, label: 'D-5' },
    { value: 7, label: 'D-7' },
    { value: 0, label: '알림 끔' },
]

export default function SettingsForm({
    nickname,
    email,
    alarmDDay,
    appCount,
    updateNicknameAction,
    updateAlarmAction,
    logoutAction,
    deleteAccountAction,
}: Props) {
    // ── Nickname ─────────────────────────────────────────────────
    const [nicknameResult, nicknameFormAction, nicknameIsPending] = useActionState(
        updateNicknameAction,
        null,
    )
    const [nicknameValue, setNicknameValue] = useState(nickname)
    const [savedNickname, setSavedNickname] = useState(nickname)
    const nicknameDirty = nicknameValue !== savedNickname
    const nicknameValid = /^[가-힣a-zA-Z0-9]{2,12}$/.test(nicknameValue)

    // ── Alarm ─────────────────────────────────────────────────────
    const [currentAlarm, setCurrentAlarm] = useState(alarmDDay)
    const [savedAlarm, setSavedAlarm] = useState(alarmDDay)
    const [isPendingAlarm, startAlarmTransition] = useTransition()
    const alarmDirty = currentAlarm !== savedAlarm

    function handleAlarmSave() {
        startAlarmTransition(async () => {
            const fd = new FormData()
            fd.set('alarm_d_day', String(currentAlarm))
            const result = await updateAlarmAction(null, fd)
            if (result?.success) {
                setSavedAlarm(currentAlarm)
                showToast('알림 설정을 저장했어요.')
            }
        })
    }

    // ── Logout ────────────────────────────────────────────────────
    const [isPendingLogout, startLogoutTransition] = useTransition()

    // ── Delete modal ──────────────────────────────────────────────
    const [deleteResult, deleteFormAction, deleteIsPending] = useActionState(
        deleteAccountAction,
        null,
    )
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState('')

    // ── Toast ─────────────────────────────────────────────────────
    const [toastMsg, setToastMsg] = useState('')
    const [toastVisible, setToastVisible] = useState(false)
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    function showToast(msg: string) {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        setToastMsg(msg)
        setToastVisible(true)
        toastTimerRef.current = setTimeout(() => setToastVisible(false), 2500)
    }

    useEffect(() => {
        if (nicknameResult?.success) {
            showToast('저장되었어요.')
        }
    }, [nicknameResult])

    // ── nickname help text ────────────────────────────────────────
    function getNicknameHelp() {
        if (nicknameResult?.error) return { text: nicknameResult.error, cls: 'error' }
        if (!nicknameValid && nicknameDirty) return { text: '한글·영문·숫자 2~12자로 입력해주세요.', cls: 'warn' }
        return { text: '한글·영문·숫자 2~12자, 자유롭게 바꿀 수 있어요.', cls: '' }
    }
    const nicknameHelp = getNicknameHelp()

    return (
        <>
            <div className="flex flex-col gap-6 p-8" style={{ maxWidth: 780 }}>

                <h1 className="text-xl font-semibold" style={{ color: 'var(--ink)', letterSpacing: '-0.3px' }}>
                    설정
                </h1>

                {/* ── 프로필 ── */}
                <section className="section">
                    <div className="section-head">
                        <div>
                            <div className="title">
                                <span className="ico">
                                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="5.5" r="2.8" stroke="currentColor" strokeWidth="1.4" />
                                        <path d="M2.5 14c.7-2.6 2.9-4.3 5.5-4.3s4.8 1.7 5.5 4.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                    </svg>
                                </span>
                                프로필
                            </div>
                            <div className="desc">대시보드와 알림에 표시되는 정보예요.</div>
                        </div>
                    </div>

                    <div className="section-body">
                        {/* Avatar + meta */}
                        <div className="profile-id">
                            <div className="avatar-lg">{savedNickname[0]}</div>
                            <div className="meta">
                                <b>{savedNickname}</b>
                                <small>{email}</small>
                            </div>
                        </div>

                        {/* Nickname row */}
                        <form action={nicknameFormAction} onSubmit={() => setSavedNickname(nicknameValue)}>
                            <div className="row">
                                <div className="row-label">
                                    닉네임
                                    <small>대시보드 인사말에 사용돼요</small>
                                </div>
                                <div className="row-control">
                                    <div className="field">
                                        <input
                                            className="input"
                                            type="text"
                                            name="nickname"
                                            value={nicknameValue}
                                            maxLength={12}
                                            placeholder="닉네임 입력"
                                            onChange={(e) => setNicknameValue(e.target.value)}
                                        />
                                    </div>
                                    <div className={`help ${nicknameHelp.cls}`}>{nicknameHelp.text}</div>
                                    <div className="savebar">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={!nicknameDirty || !nicknameValid || nicknameIsPending}
                                        >
                                            {nicknameIsPending ? <><BtnSpinner />저장 중…</> : '저장'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Email row */}
                        <div className="row">
                            <div className="row-label">
                                이메일
                                <small>로그인에 사용돼요</small>
                            </div>
                            <div className="row-control">
                                <div className="field">
                                    <input className="input" type="email" value={email} readOnly />
                                </div>
                                <div className="help">이메일은 변경할 수 없어요.</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 알림 설정 ── */}
                <section className="section">
                    <div className="section-head">
                        <div>
                            <div className="title">
                                <span className="ico">
                                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                        <path d="M4 7a4 4 0 1 1 8 0c0 3 1 4 1 4H3s1-1 1-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                                        <path d="M6.5 13a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                    </svg>
                                </span>
                                알림 설정
                            </div>
                            <div className="desc">면접 D-day가 다가오면 이메일과 푸시로 알려드려요.</div>
                        </div>
                    </div>

                    <div className="section-body">
                        <div className="row" style={{ borderTop: 0, paddingTop: 0 }}>
                            <div className="row-label">
                                D-day 알림 기준일
                                <small>면접일 며칠 전부터 알릴까요?</small>
                            </div>
                            <div className="row-control">
                                <div className="seg" role="radiogroup" aria-label="D-day 알림 기준일">
                                    {ALARM_OPTIONS.map(({ value, label }) => (
                                        <label key={value}>
                                            <input
                                                type="radio"
                                                name="alarm_d_day"
                                                value={value}
                                                checked={currentAlarm === value}
                                                onChange={() => setCurrentAlarm(value)}
                                            />
                                            <span className="seg-pill">{label}</span>
                                        </label>
                                    ))}
                                </div>

                                {currentAlarm > 0 && (
                                    <div className="notif-preview">
                                        <div className="bell">
                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                                <path d="M4 7a4 4 0 1 1 8 0c0 3 1 4 1 4H3s1-1 1-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                                                <path d="M6.5 13a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <b>{savedNickname}</b>님, 면접이 곧 시작돼요
                                            <span className="dday urgent" style={{ marginLeft: 6 }}>
                                                D-{currentAlarm}
                                            </span>
                                            <div style={{ fontSize: 12, color: 'var(--steel)', marginTop: 2 }}>
                                                현재 기준일에 받게 될 알림 예시예요.
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {currentAlarm === 0 && (
                                    <div className="notif-preview">
                                        <div className="bell" style={{ background: 'var(--tint-gray)', color: 'var(--steel)' }}>
                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                                <path d="M4 7a4 4 0 1 1 8 0c0 3 1 4 1 4H3s1-1 1-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                                                <path d="M6.5 13a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                                <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                        <div style={{ color: 'var(--steel)' }}>
                                            알림이 꺼졌어요. 면접일이 다가오면 알림을 받아요.
                                        </div>
                                    </div>
                                )}

                                <div className="savebar">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleAlarmSave}
                                        disabled={!alarmDirty || isPendingAlarm}
                                    >
                                        {isPendingAlarm ? <><BtnSpinner />저장 중…</> : '저장'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 계정 ── */}
                <section className="section">
                    <div className="section-head">
                        <div>
                            <div className="title">
                                <span className="ico">
                                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                        <path d="M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                    </svg>
                                </span>
                                계정
                            </div>
                            <div className="desc">이 기기에서 Hunty를 로그아웃해요.</div>
                        </div>
                    </div>

                    <div className="section-body">
                        <div className="account-row">
                            <div className="label">
                                로그아웃
                                <small>다시 로그인하기 전까지 알림이 일시 중지돼요.</small>
                            </div>
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                disabled={isPendingLogout}
                                onClick={() =>
                                    startLogoutTransition(async () => {
                                        await logoutAction()
                                    })
                                }
                            >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                    <path d="M6 2.5H3.5v11H6M11 5l3 3-3 3M14 8H6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {isPendingLogout ? '로그아웃 중…' : '로그아웃'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── 위험 구역 ── */}
                <section className="section danger">
                    <div className="section-head">
                        <div>
                            <div className="title">
                                <span className="ico">
                                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 2.5L14 13H2L8 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                                        <path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                        <circle cx="8" cy="11" r=".8" fill="currentColor" />
                                    </svg>
                                </span>
                                위험 구역
                            </div>
                            <div className="desc">이 작업은 되돌릴 수 없어요. 신중하게 진행해주세요.</div>
                        </div>
                    </div>

                    <div className="section-body">
                        <div className="account-row">
                            <div className="label">
                                회원 탈퇴
                                <small>
                                    지원 내역 {appCount}건이 모두 영구 삭제돼요.
                                </small>
                            </div>
                            <button
                                type="button"
                                className="btn btn-sm btn-danger-outline"
                                onClick={() => {
                                    setDeleteConfirm('')
                                    setDeleteModalOpen(true)
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 4.5h10M6 4.5v-1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M4.5 4.5l.5 8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                회원 탈퇴
                            </button>
                        </div>
                    </div>
                </section>

            </div>

            {/* ── 탈퇴 확인 모달 ── */}
            <div
                className={`modal-backdrop ${deleteModalOpen ? 'open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
                onClick={(e) => {
                    if (e.target === e.currentTarget) setDeleteModalOpen(false)
                }}
            >
                <div className="modal">
                    <div className="modal-icon">
                        <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2.5L14 13H2L8 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                            <path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            <circle cx="8" cy="11" r=".8" fill="currentColor" />
                        </svg>
                    </div>
                    <h3 id="delete-modal-title">정말 탈퇴하시겠어요?</h3>
                    <p className="modal-desc">
                        <b>{email}</b> 계정과 연결된 모든 데이터가 즉시 삭제되며, 복구할 수 없어요.
                    </p>
                    <ul>
                        <li>지원 내역 <b>{appCount}건</b></li>
                        <li>D-day 알림 설정</li>
                        <li>모든 카드와 첨부 파일</li>
                    </ul>

                    <form action={deleteFormAction}>
                        <label style={{ fontSize: 13, color: 'var(--charcoal)', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            확인을 위해{' '}
                            <span
                                style={{
                                    fontFamily: "'SF Mono', ui-monospace, Menlo, Consolas, monospace",
                                    background: 'var(--surface)',
                                    padding: '1px 6px',
                                    borderRadius: 'var(--r-xs)',
                                    color: 'var(--error-deep)',
                                    fontWeight: 600,
                                }}
                            >
                                탈퇴
                            </span>
                            를 입력해주세요.
                            <input
                                className="input"
                                type="text"
                                name="confirm"
                                placeholder="탈퇴"
                                autoComplete="off"
                                value={deleteConfirm}
                                onChange={(e) => setDeleteConfirm(e.target.value)}
                            />
                        </label>
                        {deleteResult?.error && (
                            <div className="help error" style={{ marginTop: 4 }}>
                                {deleteResult.error}
                            </div>
                        )}
                        <div className="modal-foot">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className="btn btn-danger"
                                disabled={deleteConfirm !== '탈퇴' || deleteIsPending}
                            >
                                {deleteIsPending ? '삭제 중…' : '영구 삭제'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── Toast ── */}
            <div className={`toast ${toastVisible ? 'show' : ''}`}>
                <span className="check">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8.5l3.5 3.5 6.5-7" stroke="var(--brand-green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
                {toastMsg}
            </div>
        </>
    )
}
