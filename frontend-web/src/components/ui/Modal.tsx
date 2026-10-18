import { X } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-surface p-6 shadow-xl shadow-slate-950/10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
