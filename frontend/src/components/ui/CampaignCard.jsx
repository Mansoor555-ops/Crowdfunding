import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Clock, Users, ShieldCheck, Heart } from 'lucide-react'
import { ProgressBar } from './Progress'
import { Badge, Avatar } from './Badge'
import { api } from '../../services/api'

export function CampaignCard({ campaign, onBookmarkToggle, isBookmarkedInitial = false }) {
  const [bookmarked, setBookmarked] = useState(isBookmarkedInitial)
  const [loadingBookmark, setLoadingBookmark] = useState(false)

  if (!campaign) return null

  const percentage = Math.min(Math.round(((campaign.amountRaised || 0) / (campaign.fundingGoal || 1)) * 100), 100)
  const now = new Date()
  const deadlineDate = new Date(campaign.deadline)
  const daysRemaining = Math.max(0, Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24)))

  const categoryDotColors = {
    Tech: 'bg-cyan-500 text-cyan-700 bg-cyan-50 border-cyan-200',
    Creative: 'bg-purple-500 text-purple-700 bg-purple-50 border-purple-200',
    Community: 'bg-emerald-500 text-emerald-700 bg-emerald-50 border-emerald-200',
    Charity: 'bg-rose-500 text-rose-700 bg-rose-50 border-rose-200',
    Education: 'bg-amber-500 text-amber-700 bg-amber-50 border-amber-200',
    Environment: 'bg-teal-500 text-teal-700 bg-teal-50 border-teal-200',
    Health: 'bg-blue-500 text-blue-700 bg-blue-50 border-blue-200',
    Business: 'bg-indigo-500 text-indigo-700 bg-indigo-50 border-indigo-200'
  }

  const categoryStyle = categoryDotColors[campaign.category] || 'bg-emerald-500 text-emerald-700 bg-emerald-50 border-emerald-200'

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    setLoadingBookmark(true)
    try {
      const res = await api.post(`/campaigns/${campaign._id}/bookmark`)
      setBookmarked(res.bookmarked)
      if (onBookmarkToggle) onBookmarkToggle(campaign._id, res.bookmarked)
    } catch (err) {
      console.error('Bookmark toggle error:', err)
    } finally {
      setLoadingBookmark(false)
    }
  }

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1">
      {/* Cover Image Frame */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3.5 left-3.5 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs flex items-center gap-1.5 ${categoryStyle}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {campaign.category}
          </span>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          disabled={loadingBookmark}
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 backdrop-blur-md transition-all shadow-sm active:scale-90 border border-slate-200/50"
          title={bookmarked ? 'Remove Bookmark' : 'Save Campaign'}
        >
          <Bookmark className={`w-4 h-4 transition-colors ${bookmarked ? 'fill-emerald-600 text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Creator Micro Tag */}
          {campaign.creator && (
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 truncate">
                <Avatar src={campaign.creator.avatar} name={campaign.creator.name} size="sm" />
                <span className="text-xs font-medium text-slate-600 truncate">
                  {campaign.creator.name}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
              </span>
            </div>
          )}

          {/* Title */}
          <Link to={`/campaigns/${campaign.slug}`}>
            <h3 className="text-base font-display font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug mb-2">
              {campaign.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-5 leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Progress & Stats */}
        <div>
          <ProgressBar value={campaign.amountRaised} max={campaign.fundingGoal} className="mb-3.5" />

          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-base font-display font-bold text-slate-900">₹{(campaign.amountRaised || 0).toLocaleString('en-IN')}</span>
              <span className="text-xs text-slate-400 ml-1 font-normal">of ₹{(campaign.fundingGoal || 0).toLocaleString('en-IN')}</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {percentage}%
            </span>
          </div>

          {/* Card Footer Metadata */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{campaign.backersCount || 0} backers</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
