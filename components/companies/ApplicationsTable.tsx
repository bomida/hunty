'use client'

import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Application } from '@/lib/supabase/applications'

export type StatusMap = Record<string, { label: string; variant: string }>
export type PlatformMap = Record<string, string>

function formatDate(dateStr: string | null): string {
    if (!dateStr || dateStr.length !== 8) return '-'
    return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`
}

function formatDateTime(iso: string): string {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

type Props = {
    data: Application[]
    statusMap: StatusMap
    platformMap: PlatformMap
}

export default function ApplicationsTable({ data, statusMap, platformMap }: Props) {
    const router = useRouter()
    const [sorting, setSorting] = useState<SortingState>([{ id: 'insert_time', desc: true }])

    const columnHelper = createColumnHelper<Application>()

    const columns = useMemo(() => [
        columnHelper.accessor('company_name', {
            header: '회사명',
            cell: info => (
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{info.getValue()}</span>
            ),
        }),
        columnHelper.accessor('apply_position', {
            header: '포지션',
            cell: info => (
                <span style={{ color: 'var(--slate)' }}>{info.getValue() || '-'}</span>
            ),
        }),
        columnHelper.accessor('apply_status', {
            header: '상태',
            cell: info => {
                const tag = statusMap[info.getValue()] ?? { label: info.getValue(), variant: 'applied' }
                return (
                    <span className={`tag ${tag.variant}`}>
                        <span className="dot" />
                        {tag.label}
                    </span>
                )
            },
        }),
        columnHelper.accessor('apply_platform', {
            header: '플랫폼',
            enableSorting: false,
            cell: info => {
                const app = info.row.original
                const label = app.apply_platform === 'ETC'
                    ? (app.apply_platform_memo || '기타')
                    : (platformMap[app.apply_platform ?? ''] ?? app.apply_platform ?? '-')
                return <span className="plat">{label}</span>
            },
        }),
        columnHelper.accessor('insert_time', {
            header: '지원일',
            cell: info => (
                <span style={{ color: 'var(--slate)' }}>{formatDateTime(info.getValue())}</span>
            ),
        }),
        columnHelper.accessor('interview_date', {
            header: '면접일',
            cell: info => (
                <span style={{ color: 'var(--slate)' }}>{formatDate(info.getValue())}</span>
            ),
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [statusMap, platformMap])

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: { pagination: { pageSize: 15 } },
    })

    const { pageIndex, pageSize } = table.getState().pagination
    const pageCount = table.getPageCount()
    const totalRows = data.length
    const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1
    const to = Math.min((pageIndex + 1) * pageSize, totalRows)

    return (
        <div className="flex flex-col gap-4">
            {/* 테이블 */}
            <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--canvas)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        {table.getHeaderGroups().map(hg => (
                            <tr key={hg.id} style={{ borderBottom: '1px solid var(--hairline)', background: 'var(--surface-soft)' }}>
                                {hg.headers.map(header => (
                                    <th
                                        key={header.id}
                                        style={{
                                            padding: '10px 16px',
                                            textAlign: 'left',
                                            fontWeight: 600,
                                            color: 'var(--stone)',
                                            fontSize: 11,
                                            letterSpacing: '0.5px',
                                            textTransform: 'uppercase',
                                            whiteSpace: 'nowrap',
                                            cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                            userSelect: 'none',
                                        }}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <span className="flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                <span style={{ opacity: header.column.getIsSorted() ? 1 : 0.3 }}>
                                                    {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} style={{ padding: '48px', textAlign: 'center', color: 'var(--stone)' }}>
                                    지원 데이터가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr
                                    key={row.id}
                                    style={{ borderBottom: '1px solid var(--hairline-soft)', cursor: 'pointer' }}
                                    onClick={() => router.push(`/companies/${row.original.application_id}`)}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-soft)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '' }}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} style={{ padding: '13px 16px' }}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-between">
                <span style={{ fontSize: 13, color: 'var(--steel)' }}>
                    {totalRows === 0 ? '0건' : `${from}–${to} / 전체 ${totalRows}건`}
                </span>
                <div className="flex items-center gap-1">
                    <button className="icon-square" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} style={{ opacity: table.getCanPreviousPage() ? 1 : 0.35, fontSize: 14 }} title="첫 페이지">«</button>
                    <button className="icon-square" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} style={{ opacity: table.getCanPreviousPage() ? 1 : 0.35, fontSize: 14 }} title="이전 페이지">‹</button>
                    {Array.from({ length: pageCount }, (_, i) => i)
                        .filter(i => Math.abs(i - pageIndex) <= 2)
                        .map(i => (
                            <button
                                key={i}
                                onClick={() => table.setPageIndex(i)}
                                style={{
                                    minWidth: 32, height: 36,
                                    borderRadius: 'var(--r-md)',
                                    border: '1px solid var(--hairline-strong)',
                                    background: i === pageIndex ? 'var(--ink-deep)' : 'transparent',
                                    color: i === pageIndex ? 'var(--on-dark)' : 'var(--ink)',
                                    fontSize: 13, fontWeight: i === pageIndex ? 600 : 500,
                                    cursor: 'pointer', padding: '0 8px',
                                    transition: 'background 0.15s ease',
                                }}
                            >
                                {i + 1}
                            </button>
                        ))
                    }
                    <button className="icon-square" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} style={{ opacity: table.getCanNextPage() ? 1 : 0.35, fontSize: 14 }} title="다음 페이지">›</button>
                    <button className="icon-square" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()} style={{ opacity: table.getCanNextPage() ? 1 : 0.35, fontSize: 14 }} title="마지막 페이지">»</button>
                </div>
            </div>
        </div>
    )
}
