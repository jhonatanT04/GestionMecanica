import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`border-t border-slate-200 pt-8 ${className}`}>{children}</div>
}
