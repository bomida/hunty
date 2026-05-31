import Link from 'next/link'

export default function Home() {
    return (
        <div className="bg-canvas text-ink text-[15px] leading-[1.55] antialiased">

            {/* ============ Nav ============ */}
            <header className="sticky top-0 z-50 bg-canvas border-b border-hairline px-8 max-[720px]:px-5">
                <div className="max-w-[1200px] mx-auto h-16 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-[10px]">
                        <div className="w-[30px] h-[30px] rounded-lg bg-primary text-white grid place-items-center font-bold text-[13px] tracking-[-0.5px]">H</div>
                        <span className="font-semibold text-[15px] text-ink tracking-[-0.3px]">Hunty</span>
                    </div>
                    <nav className="flex items-center gap-1 ml-9 flex-1">
                        {[['#features', '기능'], ['#how', '사용 방법'], ['#faq', 'FAQ']].map(([href, label]) => (
                            <a key={href} href={href} className="font-medium text-[12px] text-slate px-3 py-2 rounded-md">{label}</a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-[10px]">
                        <Link href="/login" className="btn btn-ghost">로그인</Link>
                        <Link href="/login" className="btn btn-primary">무료로 시작하기</Link>
                    </div>
                </div>
            </header>

            {/* ============ Hero ============ */}
            <section className="bg-canvas px-8 pt-24 pb-16 border-b border-hairline max-[1024px]:pt-14 max-[1024px]:pb-10 max-[1024px]:px-5">
                <div className="max-w-[1200px] mx-auto grid grid-cols-[1.05fr_minmax(420px,1.4fr)] gap-16 items-center [&>*]:min-w-0 max-[1024px]:grid-cols-1 max-[1024px]:gap-10">
                    {/* Left */}
                    <div>
                        <div className="inline-flex items-center gap-2 text-[12px] font-semibold leading-none uppercase tracking-[1.2px] text-primary-deep bg-tint-lavender px-3 py-[7px] rounded-full mb-6">
                            <span className="w-[6px] h-[6px] rounded-full bg-primary shrink-0" />
                            구직자를 위한 면접 노트
                        </div>
                        <h1 className="m-0 mb-5 text-[52px] font-semibold leading-[1.2] tracking-[-1.5px] text-ink max-[720px]:text-[42px] max-[720px]:tracking-[-1px]">
                            지원부터 면접까지,<br />
                            <em className="not-italic text-primary">한 곳에서</em> 정리해요.
                        </h1>
                        <p className="m-0 mb-8 text-[14px] leading-[1.55] text-slate max-w-[480px]">
                            흩어진 채용 공고와 면접 일정, 결과 알림까지 — Hunty 한 곳에 모아 관리하세요.
                            무엇을 어디까지 했는지, 다음에 뭘 해야 할지가 한눈에 보입니다.
                        </p>
                        <div className="flex gap-[10px] items-center flex-wrap">
                            <Link href="/login" className="btn btn-primary text-[13px] px-[22px] py-[13px]">무료로 시작하기</Link>
                        </div>
                        <div className="mt-6 flex items-center gap-[14px] text-[13px] text-steel flex-wrap">
                            {['결제 불필요', '1분 안에 가입', '개인 데이터 암호화'].map(text => (
                                <span key={text} className="inline-flex items-center gap-[6px]">
                                    <span className="text-brand-green flex"><CheckSm /></span>
                                    {text}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right - Kanban Preview */}
                    <div className="relative bg-surface border border-hairline rounded-2xl p-[18px] shadow-[var(--shadow-kanban)] w-full">
                        {/* Window bar */}
                        <div className="flex items-center gap-[6px] px-1 pb-[14px]">
                            <span className="w-[10px] h-[10px] rounded-full bg-[#f17a7a]" />
                            <span className="w-[10px] h-[10px] rounded-full bg-[#f5c75e]" />
                            <span className="w-[10px] h-[10px] rounded-full bg-[#7dc28a]" />
                            <span className="ml-[14px] font-medium text-[10px] leading-none text-steel bg-canvas border border-hairline px-[10px] py-[6px] rounded-md">hunty.app</span>
                        </div>

                        {/* Columns */}
                        <div className="grid gap-[10px] [grid-template-columns:repeat(auto-fit,minmax(148px,1fr))] [&>*]:min-w-0 max-[360px]:grid-cols-1">
                            <KanbanCol title="지원 완료" dotColor="var(--steel)" count={3} cards={[
                                { name: '라인플러스', pos: 'Brand Designer', status: 'applied' },
                                { name: '배달의민족', pos: 'Product Manager', status: 'applied' },
                                { name: '야놀자', pos: 'Designer · Mid', status: 'applied' },
                            ]} />
                            <KanbanCol title="면접 예정" dotColor="var(--brand-orange)" count={3} cards={[
                                { name: '노션 코리아', pos: 'Product Designer · Senior', status: 'interview', dday: 'D-2', ddayVariant: 'urgent' },
                                { name: '당근', pos: 'Product Designer', status: 'interview', dday: 'D-5', ddayVariant: 'soon' },
                                { name: '무신사', pos: 'Sr. Product Designer', status: 'interview', dday: 'D-12', ddayVariant: 'later' },
                            ]} />
                            <KanbanCol title="결과 대기" dotColor="var(--primary)" count={2} cards={[
                                { name: '토스', pos: 'Frontend Engineer', status: 'waiting' },
                                { name: '리디', pos: 'UX Designer', status: 'waiting' },
                            ]} />
                        </div>

                        {/* Float: 합격 알림 */}
                        <div className="absolute left-[-22px] top-12 bg-canvas border border-hairline rounded-xl shadow-[var(--shadow-float)] px-[14px] py-3 flex items-center gap-[10px] font-medium text-[13px] leading-[1.2] max-[1024px]:hidden">
                            <div className="w-8 h-8 rounded-lg bg-tint-mint text-brand-green grid place-items-center shrink-0">
                                <CheckSm />
                            </div>
                            <div>
                                <div className="font-semibold text-ink">우아한형제들 합격</div>
                                <div className="text-[11px] text-steel mt-[2px]">방금 전</div>
                            </div>
                        </div>

                        {/* Float: 면접 D-2 알림 */}
                        <div className="absolute right-[-18px] bottom-12 bg-canvas border border-hairline rounded-xl shadow-[var(--shadow-float)] px-[14px] py-3 flex items-center gap-[10px] font-medium text-[13px] leading-[1.2] max-[1024px]:hidden">
                            <div className="w-8 h-8 rounded-lg bg-tint-peach text-brand-orange grid place-items-center shrink-0 text-[16px]">📅</div>
                            <div>
                                <div className="font-semibold text-ink">노션 코리아 면접</div>
                                <div className="text-[11px] text-steel mt-[2px]">D-2 · 5개 질문 준비됨</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ Features ============ */}
            <section id="features" className="px-8 py-24 bg-canvas max-[720px]:py-16 max-[720px]:px-5">
                <div className="max-w-[1200px] mx-auto">
                    <div className="max-w-[640px] mb-12">
                        <div className={kickerCls}>기능</div>
                        <h2 className={h2Cls}>흩어진 채용 정보가, 한눈에 정리됩니다.</h2>
                        <p className={ledeCls}>엑셀과 노션, 캘린더 사이에서 떠도는 정보들을 Hunty 하나로 모아 보세요.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
                        {FEATURES.map(f => (
                            <article key={f.title} className="bg-canvas border border-hairline rounded-xl px-6 py-7 flex flex-col gap-[14px]">
                                <div className="w-10 h-10 rounded-lg grid place-items-center" style={{ background: f.iconBg, color: f.iconColor }}>{f.icon}</div>
                                <h3 className="m-0 text-lg font-semibold leading-[1.3] text-ink tracking-[-0.2px]">{f.title}</h3>
                                <p className="m-0 text-[13px] text-slate leading-[1.55]">{f.desc}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ How it works ============ */}
            <section id="how" className="px-8 py-24 bg-surface max-[720px]:py-16 max-[720px]:px-5">
                <div className="max-w-[1200px] mx-auto">
                    <div className="max-w-[640px] mb-12">
                        <div className={kickerCls}>사용 방법</div>
                        <h2 className={h2Cls}>3단계면 충분합니다.</h2>
                        <p className={ledeCls}>복잡한 설정은 없어요. 가입하고, 카드 한 장 추가하고, 그대로 사용하세요.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
                        {STEPS.map((s, i) => (
                            <article key={i} className="bg-canvas border border-hairline rounded-xl p-7">
                                <div className="inline-flex items-center justify-center w-[34px] h-[34px] bg-ink-deep text-white rounded-full text-[12px] font-semibold leading-none mb-[18px]">{i + 1}</div>
                                <h3 className="m-0 mb-2 text-lg font-semibold leading-[1.3] text-ink tracking-[-0.2px]">{s.title}</h3>
                                <p className="m-0 text-[13px] text-slate leading-[1.55]">{s.desc}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ Split: 면접 노트 ============ */}
            <section className="px-8 py-24 bg-canvas max-[720px]:py-16 max-[720px]:px-5">
                <div className="max-w-[1200px] mx-auto grid grid-cols-[1fr_minmax(380px,1.1fr)] gap-14 items-center [&>*]:min-w-0 max-[900px]:grid-cols-1 max-[900px]:gap-8">
                    <div>
                        <div className={kickerCls}>면접 노트</div>
                        <h2 className="m-0 mb-[14px] text-[32px] max-[720px]:text-[30px] font-semibold leading-[1.15] tracking-[-1px] max-[720px]:tracking-[-0.5px] text-ink">회사별로 면접 기록을<br />쌓아 두세요.</h2>
                        <p className="m-0 mb-12 text-[13px] text-slate leading-[1.55]">받은 질문, 잘한 답변, 아쉬웠던 점을 회사별 노트로 정리합니다. 같은 회사 다음 라운드에서 빠르게 다시 꺼내 보고, 다른 회사 면접 준비에도 그대로 쓸 수 있어요.</p>
                        <div className="grid grid-cols-2 gap-[14px]">
                            {STATS.map(stat => (
                                <div key={stat.label} className="bg-canvas border border-hairline rounded-xl p-[18px]">
                                    <div className="text-[32px] font-semibold leading-[1.1] tracking-[-0.5px]" style={{ color: stat.color }}>{stat.num}</div>
                                    <div className="text-[11px] text-steel mt-[6px]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Note preview */}
                    <div className="bg-canvas border border-hairline rounded-2xl p-6 shadow-[var(--shadow-card)] flex flex-col gap-[18px] w-full">
                        <div className="flex items-center gap-3 pb-[18px] border-b border-hairline-soft">
                            <div className="w-10 h-10 rounded-lg bg-ink-deep text-white grid place-items-center text-[16px] font-semibold shrink-0">노</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-semibold leading-[1.2] text-ink tracking-[-0.2px]">노션 코리아</div>
                                <div className="text-[12px] text-steel mt-[3px]">Product Designer · Senior</div>
                            </div>
                            <span className="shrink-0 text-[11px] font-semibold leading-none bg-tint-peach text-brand-orange-deep px-2 py-[3px] rounded-[6px]">2차 면접</span>
                        </div>
                        <div>
                            <div className="text-[11px] font-semibold leading-none uppercase tracking-[1.2px] text-stone mb-3">질문 & 응답</div>
                            <ul className="list-none m-0 p-0 flex flex-col gap-[14px]">
                                {NOTE_QAS.map((qa, i) => (
                                    <li key={i} className={`flex flex-col gap-[6px] pb-[14px] ${i < NOTE_QAS.length - 1 ? 'border-b border-dashed border-hairline' : ''}`}>
                                        <div className="flex gap-[10px] items-start text-[12px] leading-[1.55]">
                                            <span className="shrink-0 text-[11px] font-semibold leading-none px-[7px] py-1 rounded min-w-[24px] text-center mt-[1px] bg-tint-lavender text-primary-deep">Q{i + 1}</span>
                                            <span className="text-charcoal font-medium">{qa.q}</span>
                                        </div>
                                        <div className="flex gap-[10px] items-start text-[12px] leading-[1.55]">
                                            <span className="shrink-0 text-[11px] font-semibold leading-none px-[7px] py-1 rounded min-w-[24px] text-center mt-[1px] bg-tint-mint text-brand-green">A{i + 1}</span>
                                            <span className="text-slate">{qa.a}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <div className="text-[11px] font-semibold leading-none uppercase tracking-[1.2px] text-stone mb-[10px]">면접 후 회고</div>
                            <p className="m-0 text-[12px] leading-[1.6] text-charcoal bg-surface border border-hairline rounded-lg px-4 py-[14px]">직무 질문은 잘 대답했으나, 협업 사례에서 구체적인 지표를 제시하지 못한 게 아쉬움. 다음부터는 주요 프로젝트별 KPI 숫자를 미리 정리해 두기.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ FAQ ============ */}
            <section id="faq" className="px-8 py-24 bg-surface max-[720px]:py-16 max-[720px]:px-5">
                <div className="max-w-[1200px] mx-auto">
                    <div className="max-w-[640px] mb-12">
                        <div className={kickerCls}>자주 묻는 질문</div>
                        <h2 className={h2Cls}>궁금하실 만한 것들.</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-[14px] max-[720px]:grid-cols-1">
                        {FAQS.map(f => (
                            <div key={f.q} className="border-t border-hairline py-5">
                                <h3 className="m-0 mb-2 text-base font-semibold leading-[1.4] text-ink tracking-[-0.2px]">{f.q}</h3>
                                <p className="m-0 text-sm text-slate leading-[1.6]">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ Final CTA ============ */}
            <section className="px-8 py-24 bg-brand-navy text-white text-center max-[720px]:py-16 max-[720px]:px-5">
                <div className="max-w-[760px] mx-auto">
                    <h2 className="m-0 mb-4 text-[44px] max-[720px]:text-[30px] font-semibold leading-[1.2] tracking-[-1px] text-balance">
                        이번 면접 시즌은,<br />Hunty와 함께 정리해요.
                    </h2>
                    <p className="m-0 mb-8 text-[17px] text-[#bcc4d8] leading-[1.55]">
                        가입하는 데 1분, 카드 한 장 만드는 데 30초. 오늘 시작한 정리가, 다음 합격을 만듭니다.
                    </p>
                    <div className="inline-flex gap-[10px] flex-wrap justify-center">
                        <Link href="/login" className="btn btn-primary bg-white text-brand-navy border-white">무료로 시작하기</Link>
                        <Link href="/login" className="btn text-white border border-white/30 bg-transparent">로그인</Link>
                    </div>
                </div>
            </section>

            {/* ============ Footer ============ */}
            <footer className="bg-canvas border-t border-hairline px-8 py-10 max-[720px]:px-5">
                <div className="max-w-[1200px] mx-auto flex justify-between items-center gap-6 flex-wrap text-[11px] text-steel">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-primary text-white grid place-items-center font-bold text-[12px]">H</div>
                        <span className="font-semibold text-ink text-[12px]">Hunty</span>
                        <span>© 2026 Hunty Inc.</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="text-steel">이용약관</a>
                        <a href="#" className="text-steel">개인정보 처리방침</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

// ── Kanban column component ──────────────────────────────────────────
type CardData = {
    name: string
    pos: string
    status: string
    dday?: string
    ddayVariant?: string
}

function getDdayCls(variant?: string) {
    if (variant === 'urgent') return 'inline-flex items-center justify-center text-[10px] font-semibold leading-none px-[6px] py-[2px] rounded-full border whitespace-nowrap tracking-[0.2px] shrink-0 bg-brand-orange text-white border-brand-orange'
    if (variant === 'soon') return 'inline-flex items-center justify-center text-[10px] font-semibold leading-none px-[6px] py-[2px] rounded-full border whitespace-nowrap tracking-[0.2px] shrink-0 bg-tint-yellow-bold text-brand-brown border-tint-yellow-bold'
    return 'inline-flex items-center justify-center text-[10px] font-semibold leading-none px-[6px] py-[2px] rounded-full border whitespace-nowrap tracking-[0.2px] shrink-0 bg-surface text-steel border-hairline'
}

function getTagCls(status: string) {
    if (status === 'interview') return 'inline-flex items-center gap-[5px] text-[10px] font-semibold leading-[1.3] px-[7px] py-[2px] rounded w-fit bg-tint-peach text-brand-orange-deep'
    if (status === 'waiting') return 'inline-flex items-center gap-[5px] text-[10px] font-semibold leading-[1.3] px-[7px] py-[2px] rounded w-fit bg-tint-lavender text-brand-purple-800'
    return 'inline-flex items-center gap-[5px] text-[10px] font-semibold leading-[1.3] px-[7px] py-[2px] rounded w-fit bg-tint-gray text-charcoal'
}

function KanbanCol({ title, dotColor, count, cards }: { title: string; dotColor: string; count: number; cards: CardData[] }) {
    return (
        <div className="bg-surface-soft border border-hairline rounded-xl p-[10px] flex flex-col gap-2 min-h-[280px]">
            <div className="flex items-center gap-2 text-[12px] font-semibold leading-none text-ink px-1 pb-[6px] pt-[2px]">
                <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: dotColor }} />
                {title}
                <span className="ml-auto text-[11px] font-semibold text-steel bg-canvas border border-hairline px-[7px] py-[1px] rounded-full">{count}</span>
            </div>
            {cards.map(c => (
                <div key={c.name} className={`bg-canvas rounded-lg p-[10px] flex flex-col gap-[6px] border ${c.ddayVariant === 'urgent' ? 'border-brand-orange shadow-[var(--shadow-urgent)]' : 'border-hairline'}`}>
                    <div className="flex justify-between items-start gap-[6px]">
                        <div className="min-w-0">
                            <div className="text-[13px] font-semibold leading-[1.3] text-ink tracking-[-0.1px] whitespace-nowrap overflow-hidden text-ellipsis">{c.name}</div>
                            <div className="text-[11px] leading-[1.3] text-steel mt-[6px]">{c.pos}</div>
                        </div>
                        {c.dday && <span className={getDdayCls(c.ddayVariant)}>{c.dday}</span>}
                    </div>
                    <span className={getTagCls(c.status)}>
                        <span className="w-[5px] h-[5px] rounded-full bg-current" />
                        {title}
                    </span>
                </div>
            ))}
        </div>
    )
}

// ── Icon helpers ──────────────────────────────────────────────────────
function CheckSm() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
            <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

// ── Shared class strings ──────────────────────────────────────────────
const kickerCls = 'text-[11px] font-semibold leading-none uppercase tracking-[1.2px] text-primary mb-[14px]'
const h2Cls = 'm-0 mb-[14px] text-[32px] max-[720px]:text-[30px] font-semibold leading-[1.15] tracking-[-1px] max-[720px]:tracking-[-0.5px] text-ink'
const ledeCls = 'm-0 text-[13px] text-slate leading-[1.55]'

// ── Data ──────────────────────────────────────────────────────────────
const FEATURES = [
    {
        title: '칸반 보드로 상태 한눈에',
        desc: '지원 완료부터 결과 대기까지 — 드래그 하나로 단계를 옮기고, 진행 상황을 한 화면에서 파악하세요.',
        iconBg: 'var(--tint-lavender)', iconColor: 'var(--primary)',
        icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="2.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" /><rect x="11.5" y="2.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" /><rect x="2.5" y="11.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" /><rect x="11.5" y="11.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" /></svg>,
    },
    {
        title: '면접 D-day 자동 계산',
        desc: '면접 일정을 등록하면 D-day와 알림이 자동으로 잡힙니다. 임박한 일정은 카드가 직접 알려줘요.',
        iconBg: 'var(--tint-peach)', iconColor: 'var(--brand-orange)',
        icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="4.5" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M6.5 2.5v4M13.5 2.5v4M3 9h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    },
    {
        title: '면접 노트 질문 기록',
        desc: '받은 질문과 회고를 회사별로 모아 두면, 다음 면접에서 똑같이 막히는 일이 줄어듭니다.',
        iconBg: 'var(--tint-mint)', iconColor: 'var(--brand-green)',
        icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4h9l3 3v9H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M7 10.5h6M7 13.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    },
    {
        title: '지원 이력 자동 정리',
        desc: '플랫폼, 직무, 마감일까지 카드 한 장에. 며칠 전에 어디 지원했는지 더 이상 찾아 헤매지 마세요.',
        iconBg: 'var(--tint-sky)', iconColor: 'var(--link-blue)',
        icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10c0-3.9 3.1-7 7-7s7 3.1 7 7-3.1 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    },
    {
        title: '결과 알림과 회고',
        desc: '합격·불합격이 정해지면 회고 템플릿이 자동으로 열려요. 다음 라운드를 위한 가장 좋은 준비입니다.',
        iconBg: 'var(--tint-rose)', iconColor: 'var(--brand-pink-deep)',
        icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10l3 3 11-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    },
    {
        title: '주간 인사이트 리포트',
        desc: '이번 주 지원 횟수, 응답률, 면접 통과율 — 내 활동 데이터를 깔끔한 리포트로 받아 보세요.',
        iconBg: 'var(--tint-yellow)', iconColor: 'var(--brand-orange-deep)',
        icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M7 10h6M7 7h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    },
]

const STEPS = [
    { title: '이메일로 가입', desc: '이메일과 닉네임만 있으면 바로 시작할 수 있어요. 한 번도 떠나지 않고 끝까지 가입할 수 있습니다.' },
    { title: '지원 카드 만들기', desc: '회사명, 직무, 플랫폼만 적어 두세요. 면접 일정과 D-day는 등록하는 순간 자동으로 계산됩니다.' },
    { title: '상태에 맞게 이동', desc: '지원 완료 → 면접 예정 → 결과 대기. 드래그만으로 상태를 바꾸고, 결과가 정해지면 회고를 남겨요.' },
]

const STATS = [
    { num: '3.2배', label: '면접 기록을 더 자주 남깁니다', color: 'var(--primary)' },
    { num: '+38%', label: '면접 재지원 합격률 향상', color: 'var(--brand-green)' },
    { num: '12분', label: '면접 직전 재확인 시간', color: 'var(--ink)' },
    { num: '무제한', label: '회사별 노트 개수', color: 'var(--ink)' },
]

const NOTE_QAS = [
    {
        q: '가장 기억에 남는 프로젝트와, 그 중에서 직접 내린 판단은?',
        a: '결제 플로우 리뉴얼 프로젝트. 데이터 근거로 5단계를 3단계로 줄이자고 제안 → 전환율 +12%.',
    },
    {
        q: '협업 과정에서 의견이 맞지 않을 때 어떻게 풀어가나요?',
        a: '먼저 상대 입장에서 이유를 정리한 다음, 사용자 데이터를 근거로 같이 결정한다고 답변.',
    },
    {
        q: '디자인에서 수치를 다뤄본 경험이 있다면?',
        a: 'A/B 테스트로 CTA 위치를 검증해 클릭률 +8% 개선한 경험을 사례로 제시.',
    },
]

const FAQS = [
    { q: 'Hunty는 정말 무료인가요?', a: '네. 개인 구직 활동에 필요한 모든 기능을 무료로 제공하고 있어요. 이메일과 닉네임만 있으면 바로 시작할 수 있습니다.' },
    { q: '내 데이터는 안전한가요?', a: '개인 정보와 면접 노트는 모두 암호화되어 저장되며, 다른 사용자에게 공유되지 않습니다.' },
    { q: '기존 엑셀 파일을 옮길 수 있나요?', a: 'CSV 파일을 그대로 드래그해서 가져오면, 자동으로 회사·직무·상태가 카드로 변환됩니다.' },
    { q: '회사별 면접 노트도 보관되나요?', a: '네. 회사별로 질문·답변·회고를 무제한 쌓아둘 수 있고, 면접 직전 언제든 다시 펼쳐 볼 수 있어요.' },
]
