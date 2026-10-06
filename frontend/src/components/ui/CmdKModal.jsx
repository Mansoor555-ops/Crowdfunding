import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './Modal'
import { Search, Compass, Sparkles, ArrowRight, TrendingUp } from 'lucide-react'
import { api } from '../../services/api'

export function CmdKModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          setQuery('')
          setResults([])
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await api.get(`/campaigns?search=${encodeURIComponent(query)}&limit=5`)
        setResults(data.campaigns || [])
      } catch (err) {
        console.error('CmdK search error:', err)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (slug) => {
    onClose()
    navigate(`/campaigns/${slug}`)
  }

  const quickLinks = [
    { label: 'Explore All Campaigns', href: '/discover', icon: Compass },
    { label: 'Start a Campaign', href: '/campaigns/new', icon: Sparkles },
    { label: 'Trending Innovation', href: '/discover?sort=trending', icon: TrendingUp }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" className="!p-0 overflow-hidden">
      <div className="p-4 border-b border-border-ink/10 flex items-center gap-3">
        <Search className="w-5 h-5 text-accent-violet flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search campaigns by title, craft, or category... (Press Esc to close)"
          className="w-full bg-transparent text-base font-medium text-text-ink placeholder:text-text-muted focus:outline-none"
          autoFocus
        />
        <kbd className="hidden sm:inline-block px-2 py-1 bg-black/5 text-[10px] font-bold text-text-muted rounded-md border border-border-ink/10">
          ESC
        </kbd>
      </div>

      <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
        {loading ? (
          <div className="py-8 text-center text-xs font-semibold text-text-muted animate-pulse">
            Searching FundRise marketplace...
          </div>
        ) : query.trim() ? (
          results.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2 block">
                Campaign Results
              </span>
              {results.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleSelect(c.slug)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-accent-violet/5 hover:border-accent-violet/20 border border-transparent cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img src={c.coverImage} alt={c.title} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-display font-bold text-sm text-text-ink group-hover:text-accent-violet transition-colors">
                        {c.title}
                      </h4>
                      <p className="text-xs text-text-muted">
                        ₹{(c.amountRaised || 0).toLocaleString('en-IN')} raised of ₹{(c.fundingGoal || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent-violet group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs font-semibold text-text-muted">
              No matching campaigns found for "{query}".
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2 block mb-2">
                Quick Shortcuts
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {quickLinks.map((link, idx) => {
                  const Icon = link.icon
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onClose()
                        navigate(link.href)
                      }}
                      className="flex items-center gap-2.5 p-3 rounded-2xl bg-black/[0.02] hover:bg-black/5 text-xs font-bold text-text-ink transition-all text-left"
                    >
                      <Icon className="w-4 h-4 text-accent-violet" />
                      <span>{link.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
