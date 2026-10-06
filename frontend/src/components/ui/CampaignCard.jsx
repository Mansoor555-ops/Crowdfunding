import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Clock, Users, ArrowUpRight } from 'lucide-react'
import { ProgressBar } from './Progress'
import { Badge } from './Badge'
import { Avatar } from './Badge'
import { api } from '../../services/api'

export function CampaignCard({ campaign, onBookmarkToggle, isBookmarkedInitial = false }) {
  const [bookmarked, setBookmarked] = useState(isBookmarkedInitial)
  const [loadingBookmark, setLoadingBookmark] = useState(false)

  if (!campaign) return null

  const percentage = Math.min(Math.round(((campaign.amountRaised || 0) / (campaign.fundingGoal || 1)) * 100), 100)

  // Calculate days remaining
  const now = new Date()
  const deadlineDate = new Date(campaign.deadline)
  const diffTime = deadlineDate - now
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

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
    <div className="group flex flex-col bg-surface-white rounded-3xl border border-border-ink/10 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant={campaign.status}>{campaign.category}</Badge>
        </div>
        <button
          onClick={handleBookmark}
          disabled={loadingBookmark}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-text-ink backdrop-blur-md transition-all shadow-md"
          title={bookmarked ? 'Remove Bookmark' : 'Save Campaign'}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-accent-violet text-accent-violet' : ''}`} />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Creator Header */}
          {campaign.creator && (
            <div className="flex items-center gap-2.5 mb-3">
              <Avatar src={campaign.creator.avatar} name={campaign.creator.name} size="sm" />
              <span className="text-xs font-semibold text-text-secondary truncate">
                {campaign.creator.name}
              </span>
            </div>
          )}

          {/* Title */}
          <Link to={`/campaigns/${campaign.slug}`}>
            <h3 className="text-xl font-display font-bold text-text-ink group-hover:text-accent-violet transition-colors line-clamp-2 leading-snug mb-2">
              {campaign.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-sm text-text-secondary line-clamp-2 mb-6 font-normal leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Progress & Stats */}
        <div>
          <ProgressBar value={campaign.amountRaised} max={campaign.fundingGoal} className="mb-4" />

          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-lg font-display font-bold text-text-ink">₹{(campaign.amountRaised || 0).toLocaleString('en-IN')}</span>
              <span className="text-xs text-text-muted ml-1 font-normal">raised of ₹{(campaign.fundingGoal || 0).toLocaleString('en-IN')}</span>
            </div>
            <span className="text-xs font-bold text-accent-violet bg-accent-violet/10 px-2.5 py-1 rounded-full">
              {percentage}%
            </span>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-ink/10 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-text-muted" />
              <span>{campaign.backersCount || 0} backers</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
