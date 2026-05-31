import Spinner from '@/components/ui/Spinner'

export default function CompaniesLoading() {
    return (
        <>
            <header className="topbar">
                <div className="crumbs">
                    <span style={{ color: 'var(--stone)' }}>Workspace</span>
                    <span className="sep">/</span>
                    <div className="skeleton" style={{ width: 60, height: 14 }} />
                </div>
            </header>
            <Spinner />
        </>
    )
}
