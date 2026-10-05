import React from 'react'

export function Button({ variant = 'primary', className = '', children, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center font-body transition-color-border transition-press focus:outline-none disabled:opacity-50 disabled:pointer-events-none'
  
  const variants = {
    primary: 'bg-text-ink hover:opacity-80 text-surface-white rounded-button-pill h-[56px] px-10 border border-text-ink text-[16px] font-semibold tracking-wide',
    secondary: 'bg-transparent border border-text-ink hover:opacity-85 text-text-ink rounded-button-pill h-[56px] px-10 text-[16px] font-semibold tracking-wide',
    'ghost-link': 'bg-transparent text-accent-violet hover:opacity-80 rounded-[14px] h-[62px] px-6 text-[15px] font-semibold',
    'nav-primary': 'bg-text-ink hover:opacity-83 text-surface-white rounded-button-pill h-[40px] px-6 text-[14px] font-semibold',
    'nav-secondary': 'bg-transparent border border-text-ink/15 hover:border-text-ink hover:bg-text-ink/5 text-text-ink rounded-button-pill h-[40px] px-6 text-[14px] font-semibold'
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
