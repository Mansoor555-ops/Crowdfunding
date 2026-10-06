import React from 'react'

export function Button({ variant = 'primary', className = '', children, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 cursor-pointer font-body transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 disabled:pointer-events-none select-none'
  
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-xl shadow-emerald-600/20 active:scale-[0.98] rounded-xl h-12 px-6 text-sm font-semibold tracking-wide',
    secondary: 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-xs hover:border-slate-300 active:scale-[0.98] rounded-xl h-12 px-6 text-sm font-semibold tracking-wide',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-xl shadow-indigo-600/20 active:scale-[0.98] rounded-xl h-12 px-6 text-sm font-semibold tracking-wide',
    outline: 'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-100 hover:text-slate-900 rounded-xl h-12 px-6 text-sm font-semibold',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl h-10 px-4 text-sm font-medium',
    'ghost-link': 'bg-transparent text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl h-10 px-4 text-sm font-semibold',
    'nav-primary': 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 rounded-xl h-9 px-4 text-xs font-semibold',
    'nav-secondary': 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl h-9 px-4 text-xs font-semibold'
  }
  
  const selectedVariant = variants[variant] || variants.primary
  
  return (
    <button 
      className={`${baseStyles} ${selectedVariant} ${className}`} 
      {...props}
    >
      {children}
    </button>
  )
}
