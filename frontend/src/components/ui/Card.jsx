import React from 'react'

export function Card({ variant = 'app-panel', className = '', children, ...props }) {
  const baseStyles = 'overflow-hidden transition-all duration-300'
  
  const variants = {
    'gradient-feature': 'bg-gradient-feature-card text-surface-white rounded-card-feature shadow-[0px_20px_48px_0px_rgba(26,24,43,0.12)]',
    'app-panel': 'bg-surface-white text-text-ink rounded-card-feature border border-text-ink/[0.06] shadow-[0px_0px_15.451px_7.725px_rgba(46,30,107,0.04)]',
    'faq': 'bg-surface-white text-text-ink rounded-card-faq border border-text-ink/[0.06] shadow-[0px_3.863px_17.769px_0px_rgba(0,0,0,0.05)]',
    'cta-band': 'bg-gradient-cta-band text-surface-white rounded-card-feature'
  }
  
  const selectedVariant = variants[variant] || variants['app-panel']
  
  return (
    <div 
      className={`${baseStyles} ${selectedVariant} ${className}`} 
      {...props}
    >
      {children}
    </div>
  )
}
