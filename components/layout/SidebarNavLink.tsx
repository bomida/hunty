'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarNavLinkProps {
    href: string
    icon: React.ReactNode
    children: React.ReactNode
    badge?: string
}

export default function SidebarNavLink({
    href,
    icon,
    children,
    badge,
}: SidebarNavLinkProps) {
    const pathname = usePathname()
    const isActive = pathname === href || pathname.startsWith(href + '/')

    return (
        <Link
            href={href}
            className={`sb-link ${isActive ? 'is-active' : ''}`}
        >
            <span className="ico">{icon}</span>
            {children}
            {badge && <span className="badge">{badge}</span>}
        </Link>
    )
}