import React from 'react'
import { FolderOpen, AlertCircle, RefreshCw } from 'lucide-react'

export function ProgressBar({ value = 0, max = 100, className = '', barClassName = '' }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={`w-full bg-border-ink/10 rounded-full h-2.5 overflow-hidden ${className}`}>
      <div
        className={`h-full bg-accent-violet rounded-full transition-all duration-500 ease-out ${barClassName}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-border-ink/10 rounded-xl ${className}`} />
  )
}

export function EmptyState({ title = 'No data found', description = 'Try adjusting your search or filters.', action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 bg-surface-white rounded-3xl border border-dashed border-border-ink/20 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-accent-violet/10 text-accent-violet flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-display font-bold text-text-ink mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', description = 'An unexpected error occurred while loading content.', onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 bg-red-50/50 rounded-3xl border border-red-200 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-display font-bold text-red-950 mb-2">{title}</h3>
      <p className="text-sm text-red-700 max-w-md mb-6">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      )}
    </div>
  )
}
