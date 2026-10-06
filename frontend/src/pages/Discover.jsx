import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CampaignCard } from '../components/ui/CampaignCard'
import { SearchInput, Select } from '../components/ui/Input'
import { Pagination } from '../components/ui/Tabs'
import { Skeleton, EmptyState } from '../components/ui/Progress'
import { api } from '../services/api'
import { Filter, X, SlidersHorizontal, Sparkles } from 'lucide-react'

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [campaigns, setCampaigns] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)

  const categories = ['All', 'Tech', 'Creative', 'Community', 'Charity', 'Education', 'Health', 'Environment', 'Business']

  const sortOptions = [
    { label: '✨ Newest Launched', value: 'newest' },
    { label: '🔥 Trending & Popular', value: 'trending' },
    { label: '⏳ Ending Soonest', value: 'ending-soon' }
  ]

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true)
      try {
        let endpoint = `/campaigns?page=${page}&limit=9&sort=${sort}`
        if (category && category !== 'All') endpoint += `&category=${encodeURIComponent(category)}`
        if (search) endpoint += `&search=${encodeURIComponent(search)}`

        const data = await api.get(endpoint)
        setCampaigns(data.campaigns || [])
        if (data.pagination) {
          setTotalPages(data.pagination.pages || 1)
          setTotalCount(data.pagination.total || 0)
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCampaigns()
  }, [category, search, sort, page])

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value && value !== 'All') {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.set('page', '1') // reset page on filter change
    setSearchParams(newParams)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    updateParam('search', searchInput)
  }

  const clearAllFilters = () => {
    setSearchInput('')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-12 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-2">
          Crowdfunding Marketplace
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-tight mb-3">
          Discover Active Projects
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
          Support independent creators, green technology founders, and grassroots initiatives across India.
        </p>
      </div>

      {/* Filter Toolbar Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm mb-10 space-y-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by project name, creator, or keywords..."
            />
          </div>
          <div className="w-full sm:w-64">
            <Select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              options={sortOptions}
            />
          </div>
        </form>

        {/* Category Pills */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            {categories.map((cat) => {
              const active = (category === cat) || (cat === 'All' && !category)
              return (
                <button
                  key={cat}
                  onClick={() => updateParam('category', cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {(category || search) && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex-shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{totalCount}</span> campaigns
        </p>
      </div>

      {/* Campaign Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[420px] rounded-3xl" />
          <Skeleton className="h-[420px] rounded-3xl" />
          <Skeleton className="h-[420px] rounded-3xl" />
          <Skeleton className="h-[420px] rounded-3xl" />
          <Skeleton className="h-[420px] rounded-3xl" />
          <Skeleton className="h-[420px] rounded-3xl" />
        </div>
      ) : campaigns.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => updateParam('page', newPage.toString())}
          />
        </>
      ) : (
        <EmptyState
          title="No projects found"
          description="We couldn't find any campaigns matching your criteria. Try adjusting your search query or category filters."
          action={
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              Reset All Filters
            </button>
          }
        />
      )}
    </div>
  )
}
