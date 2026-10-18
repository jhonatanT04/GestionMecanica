import { WarningCircle } from '@phosphor-icons/react'

export function ErrorBanner({ error }: { error: Error }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <WarningCircle size={18} weight="fill" className="mt-px shrink-0" aria-hidden="true" />
      <p>No se pudo cargar la información desde la API: {error.message}</p>
    </div>
  )
}
