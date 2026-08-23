export function ErrorBanner({ error }: { error: Error }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      No se pudo cargar la información desde la API: {error.message}
    </div>
  )
}
