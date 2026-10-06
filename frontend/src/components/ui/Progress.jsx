import React from 'react'
import { FolderOpen, AlertCircle, RefreshCw } from 'lucide-react'

export function ProgressBar({ value = 0, max = 100, className = '', barClassName = '' }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={`w-full bg-slate-100 rounded-full h-2.5 overflow-hidden ${className}`}>
      <div
        className={`h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-xs ${barClassName}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-200/70 rounded-2xl ${className}`} />
  )
}

export function EmptyState({ title = 'No projects found', description = 'Try adjusting your search query or filters.', action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100 shadow-xs">
        <FolderOpen className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-display font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', description = 'An unexpected error occurred while loading content.', onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 bg-rose-50/60 rounded-3xl border border-rose-200 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 border border-rose-200 shadow-xs">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-display font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md mb-6">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-all shadow-sm shadow-rose-600/20"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      )}
    </div>
  )
}
