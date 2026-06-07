'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CodeItem } from '@/lib/supabase/codes'
import type { SavePayload } from '@/app/(protected)/companies/new/actions'
import { APPLY_STATUS_VARIANT } from '@/lib/codes'

/* ── BtnSpinner ──────────────────────────────────────────────────────── */

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

/* ── Icons ───────────────────────────────────────────────────────────── */

function IconWarn() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M6 3.5v3M6 8.2v.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    )
}

function IconPlus() {
    return (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    )
}

function IconClose() {
    return (
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    )
}


/* ── BadgeRadio ──────────────────────────────────────────────────────── */

type RadioOption = { value: string; label: string; variant?: string }

function BadgeRadio({
    name,
    options,
    value,
    onChange,
}: {
    name: string
    options: RadioOption[]
    value: string
    onChange: (v: string) => void
}) {
    return (
        <div className="badge-group" role="radiogroup" aria-label={name}>
            {options.map(opt => (
                <label key={opt.value}>
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={() => onChange(opt.value)}
                    />
                    <span
                        className="badge-pill"
                        data-variant={opt.variant ?? ''}
                    >
                        {opt.label}
                    </span>
                </label>
            ))}
        </div>
    )
}

/* ── FieldHintIcon ────────────────────────────────────────────────────── */

function FieldHintIcon({ text }: { text: string }) {
    return (
        <span className="relative group inline-flex items-center ml-1" style={{ verticalAlign: 'middle', cursor: 'default' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" style={{ color: 'var(--stone)', flexShrink: 0 }}>
                <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6.5 4v3.5M6.5 9v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span
                className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                style={{ background: 'var(--ink-deep)', color: 'var(--on-dark)' }}
                role="tooltip"
            >
                {text}
            </span>
        </span>
    )
}

/* ── Field wrapper ────────────────────────────────────────────────────── */

function Field({
    label,
    required,
    optional,
    children,
    error,
    caption,
    hint,
    htmlFor,
    disabled,
}: {
    label: string
    required?: boolean
    optional?: boolean
    children: React.ReactNode
    error?: string
    caption?: string
    hint?: string
    htmlFor?: string
    disabled?: boolean
}) {
    return (
        <div className={`nf-field${disabled ? ' is-disabled' : ''}`}>
            <label className="nf-label" htmlFor={htmlFor}>
                {label}
                {required && <span className="nf-req" aria-label="필수">*</span>}
                {hint && <FieldHintIcon text={hint} />}
            </label>
            {children}
            {error
                ? <div className="nf-err"><IconWarn />{error}</div>
                : caption
                    ? <div className="nf-caption">{caption}</div>
                    : null}
        </div>
    )
}

/* ── Date masker (YYYY-MM-DD 자동 포맷) ─────────────────────────────── */

function maskDate(raw: string): string {
    const d = raw.replace(/\D/g, '').slice(0, 8)
    if (d.length <= 4) return d
    if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`
}

/* ── Main Component ──────────────────────────────────────────────────── */

const MEMO_MAX = 300

type FormState = {
    company: string
    status: string
    position: string
    platform: string
    platformOther: string
    employment: string
    deadline: string
    interviewDate: string
    memo: string
    workType: string
    jobPostUrl: string
    requirements: string
    benefits: string
    questions: { q: string; a: string }[]
}

type Props = {
    statusCodes: CodeItem[]
    platformCodes: CodeItem[]
    contractCodes: CodeItem[]
    initialStatus?: string
    initialData?: Partial<FormState>
    mode?: 'create' | 'edit'
    saveAction: (payload: SavePayload) => Promise<{ error: string } | void>
    deleteAction?: () => Promise<void>
}

export default function NewApplicationForm({
    statusCodes,
    platformCodes,
    contractCodes,
    initialStatus,
    initialData,
    mode = 'create',
    saveAction,
    deleteAction,
}: Props) {
    const router = useRouter()

    const statusOptions  = statusCodes.map(c => ({ value: c.sub_code, label: c.code_name, variant: APPLY_STATUS_VARIANT[c.sub_code] }))
    const platformOptions = platformCodes.map(c => ({ value: c.sub_code, label: c.code_name }))
    const contractOptions = contractCodes.map(c => ({ value: c.sub_code, label: c.code_name }))

    const validStatuses = new Set(statusOptions.map(o => o.value))
    const defaultStatus = (initialStatus && validStatuses.has(initialStatus))
        ? initialStatus
        : (statusOptions[0]?.value ?? 'APPLY')

    const EMPTY: FormState = {
        company: initialData?.company ?? '',
        status: initialData?.status ?? defaultStatus,
        position: initialData?.position ?? '',
        platform: initialData?.platform ?? '',
        platformOther: initialData?.platformOther ?? '',
        employment: initialData?.employment ?? '',
        deadline: initialData?.deadline ?? '',
        interviewDate: initialData?.interviewDate ?? '',
        memo: initialData?.memo ?? '',
        workType: initialData?.workType ?? '',
        jobPostUrl: initialData?.jobPostUrl ?? '',
        requirements: initialData?.requirements ?? '',
        benefits: initialData?.benefits ?? '',
        questions: initialData?.questions ?? [],
    }

    const [form, setForm] = useState<FormState>(EMPTY)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        document.querySelectorAll<HTMLTextAreaElement>('.qa-text').forEach(el => {
            el.style.height = '1px'
            el.style.height = Math.max(42, el.scrollHeight) + 'px'
        })
    }, [])
    const [toast, setToast] = useState(false)
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
        setForm(f => ({ ...f, [k]: v }))
        if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n })
    }

    const addQuestion = () =>
        setForm(f => ({ ...f, questions: [...f.questions, { q: '', a: '' }] }))

    const updateQuestion = (i: number, key: 'q' | 'a', val: string) =>
        setForm(f => {
            const next = [...f.questions]
            next[i] = { ...next[i], [key]: val }
            return { ...f, questions: next }
        })

    const removeQuestion = (i: number) =>
        setForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }))

    const memoLen = [...form.memo].length
    const memoOver = memoLen > MEMO_MAX

    const showToast = useCallback(() => {
        setToast(true)
        if (toastTimer.current) clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setToast(false), 2400)
    }, [])

    const onSave = async () => {
        const next: Record<string, string> = {}
        if (!form.company.trim()) next.company = '회사명을 입력해주세요'
        if (memoOver) next.memo = `메모는 ${MEMO_MAX}자 이내로 작성해주세요`
        setErrors(next)
        if (Object.keys(next).length > 0) return

        setSaving(true)
        try {
            const result = await saveAction({ ...form })
            if (result?.error) {
                setErrors({ _form: result.error })
                setSaving(false)
                return
            }
            showToast()
        } catch (e) {
            if (isRedirectError(e)) throw e
            setErrors({ _form: '저장에 실패했어요. 잠시 후 다시 시도해주세요.' })
            setSaving(false)
        }
    }

    const onCancel = () => router.push('/companies')

    return (
        <>
            {/* 상단 바 */}
            <header className="topbar">
                <nav className="crumbs">
                    <Link href="/dashboard" style={{ color: 'var(--steel)', textDecoration: 'none' }}>
                        Workspace
                    </Link>
                    <span className="sep">/</span>
                    <Link href="/companies" style={{ color: 'var(--steel)', textDecoration: 'none' }}>
                        지원 목록
                    </Link>
                    <span className="sep">/</span>
                    <b>{mode === 'edit' ? '지원 수정' : '지원 추가'}</b>
                </nav>
            </header>

            {/* 페이지 본문 */}
            <div className="ap-page">

                {/* Notion 스타일 제목 입력 */}
                <div className="title-block">
                    <input
                        id="company"
                        className={`title-input${errors.company ? ' is-error' : ''}`}
                        type="text"
                        placeholder="회사명을 입력하세요"
                        value={form.company}
                        onChange={e => setField('company', e.target.value)}
                        autoComplete="off"
                        aria-label="회사명 (필수)"
                        aria-required="true"
                    />
                    {errors.company && (
                        <div className="title-err"><IconWarn />{errors.company}</div>
                    )}
                </div>

                {/* 폼 섹션들 */}
                <div className="nf-form">

                    {/* ── Section 1 : 기본 정보 ─────────────────────────── */}
                    <section className="nf-section">
                        <div className="nf-sec-head">
                            <div className="nf-sec-title">기본 정보</div>
                        </div>
                        <div className="nf-sec-rule" />

                        <div className="nf-sec-body">
                            <div className="nf-grid-2">

                                {/* 왼쪽 열 */}
                                <div className="nf-col">
                                    <Field label="지원 상태" required>
                                        <BadgeRadio
                                            name="status"
                                            options={statusOptions}
                                            value={form.status}
                                            onChange={v => setField('status', v)}
                                        />
                                    </Field>

                                    <Field label="지원 포지션" optional htmlFor="position">
                                        <input
                                            id="position"
                                            className="input"
                                            type="text"
                                            placeholder="예) Product Designer"
                                            value={form.position}
                                            onChange={e => setField('position', e.target.value)}
                                            autoComplete="off"
                                        />
                                    </Field>

                                    <Field label="지원 플랫폼" optional>
                                        <BadgeRadio
                                            name="platform"
                                            options={platformOptions}
                                            value={form.platform}
                                            onChange={v => setField('platform', v)}
                                        />
                                        {form.platform === 'ETC' && (
                                            <input
                                                className="input"
                                                type="text"
                                                placeholder="플랫폼명을 직접 입력하세요"
                                                value={form.platformOther}
                                                onChange={e => setField('platformOther', e.target.value)}
                                                style={{ marginTop: 10 }}
                                                autoComplete="off"
                                            />
                                        )}
                                    </Field>

                                    <Field label="계약 형태" optional>
                                        <BadgeRadio
                                            name="employment"
                                            options={contractOptions}
                                            value={form.employment}
                                            onChange={v => setField('employment', v)}
                                        />
                                    </Field>
                                </div>

                                {/* 오른쪽 열 */}
                                <div className="nf-col">
                                    <Field label="마감일" optional htmlFor="deadline">
                                        <input
                                            id="deadline"
                                            className="input"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="YYYY-MM-DD"
                                            maxLength={10}
                                            value={form.deadline}
                                            autoComplete="off"
                                            onChange={e => setField('deadline', maskDate(e.target.value))}
                                        />
                                    </Field>

                                    <Field
                                        label="면접일"
                                        optional
                                        htmlFor="interviewDate"
                                        caption="다음 회차 면접이 확정되면 이 날짜를 업데이트해주세요"
                                    >
                                        <input
                                            id="interviewDate"
                                            className="input"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="YYYY-MM-DD"
                                            maxLength={10}
                                            value={form.interviewDate}
                                            autoComplete="off"
                                            onChange={e => setField('interviewDate', maskDate(e.target.value))}
                                        />
                                    </Field>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Section 2 : 채용 공고 정보 ───────────────────── */}
                    <section className="nf-section">
                        <div className="nf-sec-head">
                            <div className="nf-sec-title">채용 공고 정보</div>
                        </div>
                        <div className="nf-sec-rule" />

                        <div className="nf-sec-body">
                            <div className="nf-grid-2">
                                <div className="nf-col">
                                    <Field label="근무형태" optional htmlFor="workType">
                                        <input
                                            id="workType"
                                            className="input"
                                            type="text"
                                            placeholder="예) 하이브리드 (주 2회 출근)"
                                            value={form.workType}
                                            onChange={e => setField('workType', e.target.value)}
                                            autoComplete="off"
                                        />
                                    </Field>
                                    <Field label="자격요건" optional htmlFor="requirements">
                                        <textarea
                                            id="requirements"
                                            className="nf-textarea qa-text"
                                            placeholder="예) 3년 이상의 프로덕트 디자인 경력, Figma 능숙"
                                            value={form.requirements}
                                            onChange={e => {
                                                setField('requirements', e.target.value)
                                                const el = e.target
                                                el.style.height = '1px'
                                                el.style.height = Math.max(42, el.scrollHeight) + 'px'
                                            }}
                                        />
                                    </Field>
                                </div>
                                <div className="nf-col">
                                    <Field label="채용정보 링크" optional htmlFor="jobPostUrl" hint="Ctrl+클릭 또는 Cmd+클릭으로 링크 열기">
                                        <input
                                            id="jobPostUrl"
                                            className="input"
                                            type="url"
                                            placeholder="예) wanted.co.kr/wd/123456"
                                            value={form.jobPostUrl}
                                            onChange={e => setField('jobPostUrl', e.target.value)}
                                            autoComplete="off"
                                            onClick={e => {
                                                if ((e.ctrlKey || e.metaKey) && form.jobPostUrl.trim()) {
                                                    e.preventDefault()
                                                    const url = form.jobPostUrl.trim()
                                                    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank', 'noopener,noreferrer')
                                                }
                                            }}
                                        />
                                    </Field>
                                    <Field label="복지 및 혜택" optional htmlFor="benefits">
                                        <textarea
                                            id="benefits"
                                            className="nf-textarea qa-text"
                                            placeholder="예) 자율 출퇴근, 식대 지원, 도서 구입비"
                                            value={form.benefits}
                                            onChange={e => {
                                                setField('benefits', e.target.value)
                                                const el = e.target
                                                el.style.height = '1px'
                                                el.style.height = Math.max(42, el.scrollHeight) + 'px'
                                            }}
                                        />
                                    </Field>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Section 3 : 면접 질문 ─────────────────────────── */}
                    <section className="nf-section">
                        <div className="nf-sec-head">
                            <div className="nf-sec-title">면접 질문</div>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={addQuestion}
                            >
                                <IconPlus />
                                행 추가
                            </button>
                        </div>
                        <div className="nf-sec-rule" />

                        {form.questions.length === 0 ? (
                            <div className="qa-empty">
                                면접 질문을 추가하고 답변을 미리 정리해보세요
                            </div>
                        ) : (
                            <div className="qa-list">
                                {form.questions.map((row, i) => (
                                    <div className="qa-row" key={i}>
                                        <textarea
                                            className="nf-textarea qa-text"
                                            placeholder="면접 질문을 입력하세요"
                                            value={row.q}
                                            onChange={e => {
                                                updateQuestion(i, 'q', e.target.value)
                                                const el = e.target
                                                el.style.height = '1px'
                                                el.style.height = Math.max(42, el.scrollHeight) + 'px'
                                            }}
                                        />
                                        <textarea
                                            className="nf-textarea qa-text"
                                            placeholder="답변을 입력하세요"
                                            value={row.a}
                                            onChange={e => {
                                                updateQuestion(i, 'a', e.target.value)
                                                const el = e.target
                                                el.style.height = '1px'
                                                el.style.height = Math.max(42, el.scrollHeight) + 'px'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="icon-btn"
                                            aria-label={`${i + 1}번 질문 삭제`}
                                            onClick={() => removeQuestion(i)}
                                        >
                                            <IconClose />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ── Section 4 : 메모 ─────────────────────────────── */}
                    <section className="nf-section">
                        <div className="nf-sec-head">
                            <div className="nf-sec-title">면접 후 회고</div>
                        </div>
                        <div className="nf-sec-rule" />

                        <div className="nf-sec-body">
                            <div className="nf-field">
                                <div className="textarea-wrap">
                                    <textarea
                                        className={`nf-textarea${errors.memo || memoOver ? ' is-error' : ''}`}
                                        placeholder="자유롭게 기록하세요 (300자 이내)"
                                        value={form.memo}
                                        onChange={e => setField('memo', e.target.value)}
                                    />
                                    <div className={`char-count${memoOver ? ' over' : ''}`}>
                                        {memoLen} / {MEMO_MAX}
                                    </div>
                                </div>
                                {errors.memo && (
                                    <div className="nf-err"><IconWarn />{errors.memo}</div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ── 폼 레벨 에러 ──────────────────────────────────── */}
                    {errors._form && (
                        <div className="nf-err" style={{ justifyContent: 'flex-end' }}>
                            <IconWarn />{errors._form}
                        </div>
                    )}

                    {/* ── 하단 버튼 ─────────────────────────────────────── */}
                    <div className="nf-form-foot">
                        {mode === 'edit' && deleteAction && (
                            <button
                                type="button"
                                className="btn btn-danger-outline"
                                onClick={() => setDeleteModalOpen(true)}
                                disabled={saving || deleting}
                                style={{ marginRight: 'auto' }}
                            >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 4.5h10M6 4.5v-1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M4.5 4.5l.5 8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                삭제
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onCancel}
                            disabled={saving}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={onSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <BtnSpinner />
                                    저장 중…
                                </>
                            ) : '저장하기'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 삭제 확인 모달 ─────────────────────────────────────── */}
            {mode === 'edit' && deleteAction && (
                <div
                    className={`modal-backdrop${deleteModalOpen ? ' open' : ''}`}
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => { if (e.target === e.currentTarget) setDeleteModalOpen(false) }}
                >
                    <div className="modal">
                        <div className="modal-icon">
                            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                                <path d="M3 4.5h10M6 4.5v-1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M4.5 4.5l.5 8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3>지원 내역을 삭제할까요?</h3>
                        <p className="modal-desc">
                            <b>{form.company || '이 지원'}</b>의 모든 데이터가 영구 삭제되며, 복구할 수 없어요.
                        </p>
                        <div className="modal-foot">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setDeleteModalOpen(false)}
                                disabled={deleting}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                disabled={deleting}
                                onClick={async () => {
                                    setDeleting(true)
                                    await deleteAction()
                                }}
                            >
                                {deleting ? (
                                    <>
                                        <BtnSpinner />
                                        삭제 중…
                                    </>
                                ) : '삭제'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
                <span className="dot" aria-hidden="true" />
                {mode === 'edit' ? '지원 내역이 수정되었습니다' : '지원 내역이 저장되었습니다'}
            </div>
        </>
    )
}
