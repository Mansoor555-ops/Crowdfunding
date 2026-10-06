import React from 'react'

export function Stat({ title, value, change, description, icon: Icon, className = '' }) {
  return (
    <div className={`p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="text-3xl font-display font-bold text-slate-900 tracking-tight mb-1">{value}</div>
      {change && (
        <p className={`text-xs font-medium ${change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
          {change} <span className="text-slate-400 font-normal">vs last month</span>
        </p>
      )}
      {description && !change && <p className="text-xs text-slate-400">{description}</p>}
    </div>
  )
}

export function DataTable({ columns = [], data = [], emptyMessage = 'No records found', className = '' }) {
  return (
    <div className={`w-full overflow-x-auto bg-white rounded-3xl border border-slate-200/90 shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse text-sm font-body">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap">
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
