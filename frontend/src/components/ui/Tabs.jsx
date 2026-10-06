import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div className={`flex border-b border-slate-200/90 space-x-8 overflow-x-auto no-scrollbar font-body ${className}`}>
      {tabs.map((tab) => {
        const key = typeof tab === 'object' ? tab.id : tab
        const label = typeof tab === 'object' ? tab.label : tab
        const count = typeof tab === 'object' ? tab.count : undefined
        const isActive = activeTab === key

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`pb-4 px-1 text-sm font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              isActive
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {label}
            {count !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function Pagination({ currentPage, totalPages, onPageChange, className = '' }) {
  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-center gap-2 py-6 font-body ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            page === currentPage
              ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6 font-body">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="text-slate-300">/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-slate-900 transition-colors font-medium">
              {item.label}
            </a>
          ) : (
            <span className="text-slate-900 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
