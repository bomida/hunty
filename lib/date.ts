export function getTodayKST(): string {
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}
