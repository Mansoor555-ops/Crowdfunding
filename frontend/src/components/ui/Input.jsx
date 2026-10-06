import React, { forwardRef } from 'react'
import { Search } from 'lucide-react'

export const Input = forwardRef(({ label, error, helperText, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-surface-white border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-border-ink/15 focus:border-text-ink focus:ring-1 focus:ring-text-ink'
        } rounded-xl text-text-ink placeholder:text-text-muted focus:outline-none transition-all ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-text-muted">{helperText}</p>}
    </div>
  )
})
Input.displayName = 'Input'

export const Textarea = forwardRef(({ label, error, helperText, className = '', rows = 4, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full px-4 py-3 bg-surface-white border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-border-ink/15 focus:border-text-ink focus:ring-1 focus:ring-text-ink'
        } rounded-xl text-text-ink placeholder:text-text-muted focus:outline-none transition-all ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-text-muted">{helperText}</p>}
    </div>
  )
})
Textarea.displayName = 'Textarea'

export const Select = forwardRef(({ label, error, options = [], className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-4 py-3 bg-surface-white border ${
          error ? 'border-red-500' : 'border-border-ink/15 focus:border-text-ink focus:ring-1 focus:ring-text-ink'
        } rounded-xl text-text-ink focus:outline-none transition-all ${className}`}
        {...props}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value !== undefined ? opt.value : opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'

export const CurrencyInput = forwardRef(({ label, error, symbol = '₹', className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <span className="absolute left-4 text-text-secondary font-semibold text-lg">{symbol}</span>
        <input
          ref={ref}
          type="number"
          step="any"
          className={`w-full pl-9 pr-4 py-3 bg-surface-white border ${
            error ? 'border-red-500' : 'border-border-ink/15 focus:border-text-ink focus:ring-1 focus:ring-text-ink'
          } rounded-xl text-text-ink font-semibold text-lg placeholder:text-text-muted focus:outline-none transition-all ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
})
CurrencyInput.displayName = 'CurrencyInput'

export const SearchInput = forwardRef(({ className = '', ...props }, ref) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
      <input
        ref={ref}
        type="text"
        className={`w-full pl-11 pr-4 py-2.5 bg-surface-white border border-border-ink/15 rounded-full text-sm text-text-ink placeholder:text-text-muted focus:border-text-ink focus:outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  )
})
SearchInput.displayName = 'SearchInput'

export const Checkbox = forwardRef(({ label, className = '', ...props }, ref) => {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer text-sm font-medium text-text-ink select-none ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        className="w-4 h-4 text-accent-violet rounded border-border-ink/20 focus:ring-accent-violet focus:ring-offset-0"
        {...props}
      />
      {label}
    </label>
  )
})
Checkbox.displayName = 'Checkbox'

export const Switch = forwardRef(({ checked, onChange, label, description, className = '' }, ref) => {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-semibold text-text-ink">{label}</p>}
          {description && <p className="text-xs text-text-secondary">{description}</p>}
        </div>
      )}
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-accent-violet' : 'bg-border-ink/20'
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
