export function encodeId(id: number): string {
    return btoa(String(id)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function decodeId(slug: string): number | null {
    try {
        const padded = slug.replace(/-/g, '+').replace(/_/g, '/')
        const padding = (4 - (padded.length % 4)) % 4
        const n = parseInt(atob(padded + '='.repeat(padding)), 10)
        return Number.isInteger(n) && n > 0 ? n : null
    } catch {
        return null
    }
}
