import { type InputHTMLAttributes, forwardRef, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface FieldWrapperProps {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
  htmlFor?: string
}

export function FieldWrapper({ label, hint, error, children, htmlFor }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <span className="text-xs font-medium text-ember-600 dark:text-ember-400">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-400">{hint}</span>
      ) : null}
    </div>
  )
}

const baseFieldClasses =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-brand-500/20'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, error, icon, id, ...props },
  ref,
) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} htmlFor={id}>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(baseFieldClasses, icon && 'pl-10', error && 'border-ember-400', className)}
          {...props}
        />
      </div>
    </FieldWrapper>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, hint, error, id, ...props },
  ref,
) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} htmlFor={id}>
      <textarea
        ref={ref}
        id={id}
        className={cn(baseFieldClasses, 'min-h-[90px] resize-y', error && 'border-ember-400', className)}
        {...props}
      />
    </FieldWrapper>
  )
})

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, hint, error, id, children, ...props },
  ref,
) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} htmlFor={id}>
      <select
        ref={ref}
        id={id}
        className={cn(baseFieldClasses, 'appearance-none bg-no-repeat pr-8', error && 'border-ember-400', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundPosition: 'right 0.75rem center',
        }}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  )
})
