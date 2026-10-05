import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react'

export default function Discover() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const categories = ['Tech', 'Creative', 'Community', 'Charity', 'Education']

  useEffect(() => {
    fetchCampaigns()
  }, [category, sort, page])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      let url = `/api/campaigns?page=${page}&sort=${sort}&limit=6`
      if (category) url += `&category=${category}`
      if (search) url += `&search=${encodeURIComponent(search)}`

      const res = await fetch(url)
      const data = await res.json()
      
      if (res.ok) {
        setCampaigns(data.campaigns || [])
        setTotalPages(data.pagination ? data.pagination.pages : 1)
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchCampaigns()
  }

  const handleClearFilters = () => {
    setSearch('')
    setCategory('')
    setSort('newest')
    setPage(1)
  }

  const getDaysLeft = (deadlineStr) => {
    const diff = new Date(deadlineStr) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-24 space-y-10">
      
      {/* Header section */}
      <div className="space-y-2">
        <span className="text-[12px] font-bold text-accent-violet tracking-widest uppercase">Browse Campaigns</span>
        <h1 className="headline-display text-4xl md:text-5xl font-bold tracking-tight text-text-ink">
          Explore FundRise Campaigns
        </h1>
        <p className="text-text-secondary text-base md:text-lg max-w-[600px] font-body">
          Find and support causes, creative designs, and next-generation technologies.
        </p>
      </div>

      {/* Filter and search bar layout */}
      <Card variant="app-panel" className="p-4 md:p-6 border border-text-ink/10">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search box input */}
          <div className="relative w-full lg:max-w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-12 pr-4 py-3 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet text-sm font-medium text-text-ink transition-colors"
            />
          </div>

          {/* Filters controls */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* Sort Selection dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-text-secondary" />
              <select
                value={sort}
                onChange={(e) => {
                  setPage(1)
                  setSort(e.target.value)
                }}
                className="px-4 py-2.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet text-xs font-semibold text-text-ink transition-colors"
              >
                <option value="newest">Newest Launch</option>
                <option value="trending">Trending (Backers)</option>
                <option value="ending-soon">Ending Soon</option>
              </select>
            </div>

            {/* Clear filters Button */}
            {(search || category || sort !== 'newest') && (
              <Button 
                type="button" 
                variant="nav-secondary" 
                onClick={handleClearFilters}
                className="h-[38px] px-4 py-1 text-xs"
              >
                Clear Filters
              </Button>
            )}
            
            <Button type="submit" variant="nav-primary" className="h-[38px] px-6 text-xs">
              Search
            </Button>
          </div>
        </form>

        {/* Category filter chips */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-text-ink/5">
          <span 
            onClick={() => {
              setPage(1)
              setCategory('')
            }}
            className={`cursor-pointer px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              category === ''
                ? 'bg-text-ink text-surface-white'
                : 'bg-bg-linen text-text-secondary hover:bg-text-ink/5'
            }`}
          >
            All Categories
          </span>
          {categories.map((cat) => (
            <span
              key={cat}
              onClick={() => {
                setPage(1)
                setCategory(cat)
              }}
              className={`cursor-pointer px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                category === cat
                  ? 'bg-text-ink text-surface-white'
                  : 'bg-bg-linen text-text-secondary hover:bg-text-ink/5'
              }`}
            >
              {cat}
            </span>
          ))}
        </div>
      </Card>

      {/* Campaigns Listing */}
      {loading ? (
        // Skeleton Loaders (Warm-linen Shimmer effect)
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="bg-surface-white rounded-card-feature border border-text-ink/[0.06] overflow-hidden space-y-6 pb-6 animate-pulse">
              <div className="h-[220px] bg-bg-linen/60"></div>
              <div className="px-6 space-y-4">
                <div className="h-6 bg-bg-linen/60 w-3/4 rounded-md"></div>
                <div className="space-y-2">
                  <div className="h-2.5 bg-bg-linen/60 rounded-full"></div>
                  <div className="h-4 bg-bg-linen/60 w-1/2 rounded-md"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        // Empty state page representation
        <div className="text-center py-20 bg-white border border-text-ink/5 rounded-card-feature space-y-4">
          <RefreshCw className="mx-auto text-text-muted animate-spin" size={32} />
          <h3 className="font-display text-xl font-semibold text-text-ink">No campaigns found</h3>
          <p className="text-sm text-text-secondary max-w-[320px] mx-auto font-body">
            We couldn't find any campaigns matching your search variables. Try adjusting your query filters.
          </p>
        </div>
      ) : (
        // Grid cards rendering
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {campaigns.map((camp, index) => {
            const pct = Math.min(100, Math.round((camp.amountRaised / camp.fundingGoal) * 100))
            const daysLeft = getDaysLeft(camp.deadline)

            return (
              <Reveal key={camp._id} delay={index * 0.05} className="h-full">
                <Card 
                  variant="app-panel" 
                  className="group flex flex-col justify-between border border-text-ink/10 h-full hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(26,24,43,0.06)] transition-all duration-300"
                >
                  <div>
                    {/* Cover Image */}
                    <div className="h-[220px] overflow-hidden relative">
                      <img 
                        src={camp.coverImage} 
                        alt={camp.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-4 left-4 bg-white/95 text-text-ink text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                        {camp.category}
                      </span>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 space-y-4">
                      <h3 className="font-display text-[20px] font-medium tracking-tight text-text-ink leading-snug group-hover:text-accent-violet transition-colors">
                        <Link to={`/campaigns/${camp.slug}`}>{camp.title}</Link>
                      </h3>

                      {/* Progress visual bar */}
                      <div className="space-y-1.5">
                        <div className="w-full bg-text-ink/5 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-accent-violet to-accent-peach h-full rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-text-secondary">
                          <span>{pct}% Funded</span>
                          <span>${camp.amountRaised.toLocaleString()} Raised</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Metrics */}
                  <div className="px-6 pb-6 pt-4 border-t border-text-ink/5 flex justify-between items-center text-sm font-medium text-text-secondary">
                    <span><strong>{camp.backersCount}</strong> backers</span>
                    <span><strong>{daysLeft}</strong> days left</span>
                  </div>
                </Card>
              </Reveal>
            )
          })}
        </div>
      )}

      {/* Pagination control footer */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-6">
          <Button
            variant="nav-secondary"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="h-[38px]"
          >
            Prev
          </Button>
          <span className="text-xs font-bold text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="nav-secondary"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="h-[38px]"
          >
            Next
          </Button>
        </div>
      )}
      
    </div>
  )
}
