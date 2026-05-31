export default function DashboardLoading() {
    return (
        <>
            {/* topbar */}
            <header className="topbar">
                <div className="crumbs">
                    <span style={{ color: 'var(--stone)' }}>Workspace</span>
                    <span className="sep">/</span>
                    <div className="skeleton" style={{ width: 60, height: 14 }} />
                </div>
            </header>

            <div className="flex flex-col gap-6 p-8 flex-1 min-h-0">
                {/* 인사 */}
                <div className="skeleton" style={{ width: 200, height: 24 }} />

                {/* 통계 카드 */}
                <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="stat">
                            <div className="skeleton" style={{ width: 80, height: 13 }} />
                            <div className="skeleton" style={{ width: 64, height: 48 }} />
                            <div className="skeleton" style={{ width: 120, height: 13 }} />
                        </div>
                    ))}
                </div>

                {/* 섹션 헤더 */}
                <div className="flex flex-col gap-2">
                    <div className="skeleton" style={{ width: 120, height: 16 }} />
                    <div className="skeleton" style={{ width: 200, height: 13 }} />
                </div>

                {/* 칸반 */}
                <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="col" style={{ gap: 10 }}>
                            <div className="col-head" style={{ paddingBottom: 8 }}>
                                <div className="skeleton" style={{ width: 80, height: 14 }} />
                                <div className="skeleton" style={{ width: 28, height: 20, borderRadius: 'var(--r-full)' }} />
                            </div>
                            {Array.from({ length: i === 0 ? 3 : i === 1 ? 2 : 1 }).map((_, j) => (
                                <div key={j} className="card" style={{ gap: 10, cursor: 'default' }}>
                                    <div className="skeleton" style={{ width: '70%', height: 14 }} />
                                    <div className="skeleton" style={{ width: '50%', height: 12 }} />
                                    <div style={{ paddingTop: 10, borderTop: '1px solid var(--hairline-soft)', display: 'flex', justifyContent: 'space-between' }}>
                                        <div className="skeleton" style={{ width: 48, height: 20, borderRadius: 'var(--r-sm)' }} />
                                        <div className="skeleton" style={{ width: 40, height: 12 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
