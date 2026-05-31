'use client'

import SidebarNavLink from './SidebarNavLink'
import { logoutAction } from '@/app/(protected)/settings/actions'

const navLinks = [
    {
        href: '/dashboard',
        label: '대시보드',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        ),
    },
    {
        href: '/companies',
        label: '지원 목록',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <line x1="2" y1="6.5" x2="14" y2="6.5" stroke="currentColor" strokeWidth="1.4" />
                <line x1="2" y1="9.5" x2="14" y2="9.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        ),
    },
    {
        href: '/insights',
        label: '인사이트',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2.5 13.5V6M6.5 13.5V3M10.5 13.5V8M14 13.5H2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        href: '/settings',
        label: '설정',
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4" />
                <path
                    d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8L3.4 3.4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                />
            </svg>
        ),
    }
]

type Props = {
    name: string
    email: string
    avatarUrl: string | null
}

export default function Sidebar({ name, email, avatarUrl }: Props) {
    return (
        <aside className="sidebar">
            {/* 브랜드 */}
            <div className="sb-brand">
                <div className="mark">H</div>
                <div className="name">Hunty</div>
            </div>

            {/* 네비게이션 */}
            <div className="sb-section">
                <div className="sb-label">Workspace</div>
                <nav className="sb-nav">
                    {navLinks.map((link) => (
                        <SidebarNavLink
                            key={link.href}
                            href={link.href}
                            icon={link.icon}
                        >
                            {link.label}
                        </SidebarNavLink>
                    ))}
                </nav>
            </div>

            {/* 유저 정보 */}
            <div className="sb-foot">
                <div className="avatar">
                    {avatarUrl
                        ? <img src={avatarUrl} alt={name} width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                        : name[0]
                    }
                </div>
                <div className="who">
                    <b>{name}</b>
                    <small>{email}</small>
                </div>
                <button type="button" className="icon-btn" aria-label="로그아웃" onClick={() => logoutAction()}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        <path d="M10.5 11L14 8l-3.5-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="14" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </aside>
    )
}
