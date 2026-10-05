import React from 'react'

export function Stat({ title, value, change, description, icon: Icon, className = '' }) {
  return (
    <div className={`p-6 bg-surface-white rounded-3xl border border-border-ink/10 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-2xl bg-accent-violet/10 text-accent-violet">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="text-3xl font-display font-bold text-text-ink tracking-tight mb-1">{value}</div>
      {change && (
        <p className={`text-xs font-medium ${change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
          {change} <span className="text-text-muted font-normal">vs last month</span>
        </p>
      )}
      {description && !change && <p className="text-xs text-text-muted">{description}</p>}
    </div>
  )
}

export function DataTable({ columns = [], data = [], emptyMessage = 'No records found', className = '' }) {
  return (
    <div className={`w-full overflow-x-auto bg-surface-white rounded-3xl border border-border-ink/10 shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-ink/10 bg-black/[0.02]">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-ink/10">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-black/[0.01] transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="py-4 px-6 font-medium text-text-ink whitespace-nowrap">
                    {col.cell ? col.cell(row) : row[col.accessorKey]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
