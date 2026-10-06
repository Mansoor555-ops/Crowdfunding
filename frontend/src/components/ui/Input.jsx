import React, { forwardRef } from 'react'
import { Search } from 'lucide-react'

export const Input = forwardRef(({ label, error, helperText, className = '', ...props }, ref) => {
  return (
    <div className="w-full font-body">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-white border ${
          error ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
        } rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none transition-all ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-400">{helperText}</p>}
    </div>
  )
})
Input.displayName = 'Input'

export const Textarea = forwardRef(({ label, error, helperText, className = '', rows = 4, ...props }, ref) => {
  return (
    <div className="w-full font-body">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full px-4 py-3 bg-white border ${
          error ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
        } rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none transition-all ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-400">{helperText}</p>}
    </div>
  )
})
Textarea.displayName = 'Textarea'

export const Select = forwardRef(({ label, error, options = [], className = '', ...props }, ref) => {
  return (
    <div className="w-full font-body">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-4 py-3 bg-white border ${
          error ? 'border-rose-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
        } rounded-xl text-slate-900 text-sm focus:outline-none transition-all ${className}`}
        {...props}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value !== undefined ? opt.value : opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'

export const CurrencyInput = forwardRef(({ label, error, symbol = '₹', className = '', ...props }, ref) => {
  return (
    <div className="w-full font-body">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <span className="absolute left-4 text-slate-400 font-semibold text-lg">{symbol}</span>
        <input
          ref={ref}
          type="number"
          step="any"
          className={`w-full pl-9 pr-4 py-3 bg-white border ${
            error ? 'border-rose-500' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
          } rounded-xl text-slate-900 font-semibold text-lg placeholder:text-slate-400 focus:outline-none transition-all ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  )
})
CurrencyInput.displayName = 'CurrencyInput'

export const SearchInput = forwardRef(({ className = '', ...props }, ref) => {
  return (
    <div className="relative w-full font-body">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        ref={ref}
        type="text"
        className={`w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  )
})
SearchInput.displayName = 'SearchInput'

export const Checkbox = forwardRef(({ label, className = '', ...props }, ref) => {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 select-none ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
        {...props}
      />
      {label}
    </label>
  )
})
Checkbox.displayName = 'Checkbox'

export const Switch = forwardRef(({ checked, onChange, label, description, className = '' }, ref) => {
  return (
    <div className={`flex items-center justify-between gap-4 font-body ${className}`}>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-semibold text-slate-900">{label}</p>}
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
      )}
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-emerald-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
})
Switch.displayName = 'Switch'
