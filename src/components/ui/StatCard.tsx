import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  tone?: 'brand' | 'ember' | 'leaf' | 'violet' | 'amber'
  trend?: string
}

const toneClasses = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
  ember: 'bg-ember-50 text-ember-600 dark:bg-ember-500/10 dark:text-ember-300',
  leaf: 'bg-leaf-50 text-leaf-600 dark:bg-leaf-500/10 dark:text-leaf-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
}

export function StatCard({ icon: Icon, label, value, tone = 'brand', trend }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition-transform hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="rounded-full bg-leaf-50 px-2 py-0.5 text-xs font-semibold text-leaf-600 dark:bg-leaf-500/10 dark:text-leaf-300">
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}
