import React from 'react'

export function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    default: 'bg-border-ink/10 text-text-ink',
    active: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    pending: 'bg-amber-100 text-amber-800 border border-amber-300',
    funded: 'bg-purple-100 text-purple-800 border border-purple-300',
    rejected: 'bg-red-100 text-red-800 border border-red-300',
    draft: 'bg-gray-100 text-gray-700 border border-gray-300',
    info: 'bg-blue-100 text-blue-800 border border-blue-300'
  }

  const selectedVariant = variants[variant] || variants.default

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${selectedVariant} ${className}`}
    >
      {children}
    </span>
  )
}

export function Avatar({ src, name = 'User', size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl'
  }

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  if (src && !src.includes('default.png')) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover border border-border-ink/10 ${className}`}
        onError={(e) => { e.target.style.display = 'none' }}
      />
    )
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-accent-violet/10 text-accent-violet font-bold flex items-center justify-center border border-accent-violet/20 select-none ${className}`}
    >
      {initials}
    </div>
  )
}
