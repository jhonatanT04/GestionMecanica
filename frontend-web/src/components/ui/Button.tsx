import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-accent-600 text-on-accent hover:bg-accent-700 disabled:bg-accent-600/40',
  secondary: 'border border-slate-300 text-slate-700 hover:border-slate-400 disabled:text-slate-400',
  ghost: 'text-slate-500 hover:text-slate-900 disabled:text-slate-300',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-[color,background-color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  )
}
