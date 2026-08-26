import type { ReactNode } from 'react'

export function Th({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase ${className}`}>
      {children}
    </th>
  )
}

export function TableStatusRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-slate-400">
        {children}
      </td>
    </tr>
  )
}

export function TableLoadingRow({ colSpan }: { colSpan: number }) {
  return (
    <TableStatusRow colSpan={colSpan}>
      <span className="inline-flex items-center gap-2">
        <Spinner />
        Cargando...
      </span>
    </TableStatusRow>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 animate-spin text-accent-500 ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}
