import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

export function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div className={`flex border-b border-border-ink/10 space-x-8 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const key = typeof tab === 'object' ? tab.id : tab
        const label = typeof tab === 'object' ? tab.label : tab
        const count = typeof tab === 'object' ? tab.count : undefined
        const isActive = activeTab === key

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`pb-4 px-1 text-sm font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
              isActive
                ? 'border-text-ink text-text-ink'
                : 'border-transparent text-text-secondary hover:text-text-ink hover:border-border-ink/20'
            }`}
          >
            {label}
            {count !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-text-ink text-white' : 'bg-border-ink/10 text-text-secondary'
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
    <div className={`flex items-center justify-center gap-2 py-6 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-full border border-border-ink/15 text-text-ink hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${
            page === currentPage
              ? 'bg-text-ink text-surface-white'
              : 'text-text-secondary hover:bg-black/5'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full border border-border-ink/15 text-text-ink hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}

export function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center space-x-2 text-xs text-text-secondary mb-6">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="text-text-muted">/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-text-ink transition-colors font-medium">
              {item.label}
            </a>
          ) : (
            <span className="text-text-ink font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
