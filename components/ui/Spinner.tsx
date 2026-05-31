export default function Spinner({ label = '불러오는 중...' }: { label?: string }) {
    return (
        <div className="flex flex-col items-center justify-center flex-1 gap-3" style={{ minHeight: 240 }}>
            <div className="spinner" />
            <span style={{ fontSize: 13, color: 'var(--stone)' }}>{label}</span>
        </div>
    )
}
