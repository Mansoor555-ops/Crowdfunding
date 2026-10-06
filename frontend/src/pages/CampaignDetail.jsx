import React, { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { ProgressBar, Skeleton, EmptyState } from '../components/ui/Progress'
import { Badge, Avatar } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input, CurrencyInput, Textarea, Checkbox, Select } from '../components/ui/Input'
import { Tabs } from '../components/ui/Tabs'
import { ShareModal } from '../components/ui/ShareModal'
import { api } from '../services/api'
import { io } from 'socket.io-client'
import confetti from 'canvas-confetti'
import {
  Bookmark,
  Share2,
  ShieldCheck,
  Flag,
  Send,
  Package
} from 'lucide-react'

export default function CampaignDetail() {
  const { slug } = useParams()
  const { user } = useContext(AuthContext)

  const [campaign, setCampaign] = useState(null)
  const [donations, setDonations] = useState([])
  const [comments, setComments] = useState([])
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('story') // 'story' | 'rewards' | 'updates' | 'comments'

  // Social & Bookmark
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState('fraud')
  const [reportDetails, setReportDetails] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)

  // Donation Modal & Flow
  const [donationModalOpen, setDonationModalOpen] = useState(false)
  const [donationAmount, setDonationAmount] = useState('25')
  const [selectedReward, setSelectedReward] = useState(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [donationStep, setDonationStep] = useState('amount') // 'amount' | 'payment' | 'success'
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [completedDonation, setCompletedDonation] = useState(null)

  // Comment Input
  const [newComment, setNewComment] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  useEffect(() => {
    async function loadCampaign() {
      setLoading(true)
      setError('')
      try {
        const data = await api.get(`/campaigns/${slug}`)
        setCampaign(data.campaign)

        // Load parallel resources
        const [donRes, commRes, updRes] = await Promise.all([
          api.get(`/donations/campaign/${data.campaign._id}`).catch(() => ({ donations: [] })),
          api.get(`/campaigns/${data.campaign._id}/comments`).catch(() => ({ comments: [] })),
          api.get(`/campaigns/${data.campaign._id}/updates`).catch(() => ({ updates: [] }))
        ])

        setDonations(donRes.donations || [])
        setComments(commRes.comments || [])
        setUpdates(updRes.updates || [])

        if (user) {
          const bmRes = await api.get('/campaigns/bookmarks/my-bookmarks').catch(() => ({ bookmarks: [] }))
          setIsBookmarked((bmRes.bookmarks || []).some((b) => b._id === data.campaign._id))
        }
      } catch (err) {
        setError(err.message || 'Campaign not found.')
      } finally {
        setLoading(false)
      }
    }
    loadCampaign()
  }, [slug, user])

  // Socket.io for live donation notifications
  useEffect(() => {
    if (!campaign) return

    const socket = io('/', { path: '/socket.io' })
    socket.emit('join-campaign', campaign._id)

    socket.on('donation-received', (data) => {
      setCampaign((prev) => {
        if (!prev) return prev
        const newAmount = prev.amountRaised + data.amount
        return {
          ...prev,
          amountRaised: newAmount,
          backersCount: prev.backersCount + 1
        }
      })
      setDonations((prev) => [data, ...prev])
    })

    return () => {
      socket.emit('leave-campaign', campaign._id)
      socket.disconnect()
    }
  }, [campaign?._id])

  const handleBookmarkToggle = async () => {
    if (!user) return alert('Please sign in to bookmark campaigns.')
    try {
      const res = await api.post(`/campaigns/${campaign._id}/bookmark`)
      setIsBookmarked(res.bookmarked)
    } catch (err) {
      alert('Failed to update bookmark')
    }
  }

  const handleInitiateDonation = (rewardTier = null) => {
    if (rewardTier) {
      setSelectedReward(rewardTier)
      setDonationAmount(rewardTier.minimumAmount.toString())
    }
    setDonationStep('amount')
    setDonationModalOpen(true)
  }

  const handleConfirmPayment = async () => {
    setPaymentLoading(true)
    try {
      const amountNum = parseFloat(donationAmount)
      if (isNaN(amountNum) || amountNum < 1) {
        throw new Error('Please enter a valid donation amount of at least $1.')
      }

      // Step 1: Create Intent
      const intentData = await api.post('/donations/intent', {
        campaignId: campaign._id,
        amount: amountNum,
        isAnonymous,
        rewardTier: selectedReward ? selectedReward.title : undefined
      })

      // Step 2: Confirm mock payment
      const confirmData = await api.post('/donations/mock-confirm', {
        paymentIntentId: intentData.paymentIntentId
      })

      // Trigger Confetti
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })

      setCompletedDonation(confirmData)
      setDonationStep('success')
    } catch (err) {
      alert(err.message || 'Payment processing failed.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!user) return alert('Please sign in to join the conversation.')

    setCommentSubmitting(true)
    try {
      const res = await api.post(`/campaigns/${campaign._id}/comments`, { text: newComment })
      setComments([res.comment, ...comments])
      setNewComment('')
    } catch (err) {
      alert(err.message || 'Failed to post comment.')
    } finally {
      setCommentSubmitting(false)
    }
  }

  const handleReportSubmit = async (e) => {
    e.preventDefault()
    setReportSubmitting(true)
    try {
      await api.post(`/campaigns/${campaign._id}/report`, {
        reason: reportReason,
        details: reportDetails
      })
      alert('Thank you. Your report has been submitted to platform moderators.')
      setReportModalOpen(false)
      setReportDetails('')
    } catch (err) {
      alert(err.message || 'Failed to submit report.')
    } finally {
      setReportSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-28 space-y-8">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-[450px] w-full rounded-3xl" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <EmptyState
          title="Campaign Not Found"
          description={error || 'The requested campaign could not be located or has been archived.'}
          action={
            <Link to="/discover" className="px-6 py-3 bg-text-ink text-white rounded-full text-xs font-bold">
              Explore Marketplace
            </Link>
          }
        />
      </div>
    )
  }

  const percentage = Math.min(Math.round(((campaign.amountRaised || 0) / (campaign.fundingGoal || 1)) * 100), 100)
  const deadlineDate = new Date(campaign.deadline)
  const daysRemaining = Math.max(0, Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Campaign Header Title */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-3">
          <Badge variant={campaign.status}>{campaign.category}</Badge>
          <span className="text-xs text-text-muted font-medium">Created by {campaign.creator?.name || 'Verified Creator'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-text-ink tracking-tight leading-tight">
          {campaign.title}
        </h1>
      </div>

      {/* Main Campaign Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        {/* Left Column: Cover Media Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-video rounded-3xl overflow-hidden bg-black/5 border border-border-ink/10 shadow-sm">
            <img src={campaign.coverImage} alt={campaign.title} className="w-full h-full object-cover" />
          </div>

          {campaign.gallery && campaign.gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {campaign.gallery.map((img, idx) => (
                <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-border-ink/10">
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Funding Panel Card */}
        <div className="lg:col-span-5">
          <div className="p-8 bg-surface-white rounded-3xl border border-border-ink/10 shadow-lg sticky top-28 space-y-6">
            <div>
              <ProgressBar value={campaign.amountRaised} max={campaign.fundingGoal} className="h-3 mb-4" />
              <div className="text-4xl font-display font-bold text-text-ink mb-1">
                ${(campaign.amountRaised || 0).toLocaleString()}
              </div>
              <p className="text-xs text-text-muted font-medium">
                pledged of ${(campaign.fundingGoal || 0).toLocaleString()} goal ({percentage}%)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-border-ink/10">
              <div>
                <div className="text-2xl font-display font-bold text-text-ink">{campaign.backersCount || 0}</div>
                <div className="text-xs text-text-muted font-medium">Backers Pledged</div>
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-text-ink">{daysRemaining}</div>
                <div className="text-xs text-text-muted font-medium">Days Remaining</div>
              </div>
            </div>

            {/* Main Action CTAs */}
            <div className="space-y-3">
              <button
                onClick={() => handleInitiateDonation()}
                disabled={campaign.status !== 'active'}
                className="w-full py-4 bg-text-ink hover:opacity-90 disabled:opacity-50 text-white font-display font-bold rounded-full text-base tracking-wide transition-all shadow-md"
              >
                {campaign.status === 'active' ? 'Back This Project' : 'Campaign Closed'}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleBookmarkToggle}
                  className="flex-1 py-3 px-4 rounded-full border border-border-ink/15 text-text-ink font-semibold text-xs flex items-center justify-center gap-2 hover:bg-black/5 transition-all"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-accent-violet text-accent-violet' : ''}`} />
                  {isBookmarked ? 'Bookmarked' : 'Save'}
                </button>
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="flex-1 py-3 px-4 rounded-full border border-border-ink/15 text-text-ink font-semibold text-xs flex items-center justify-center gap-2 hover:bg-black/5 transition-all"
                >
                  <Share2 className="w-4 h-4 text-accent-violet" /> Share
                </button>
              </div>
            </div>

            {/* Trust Assurance Badge */}
            <div className="flex items-center justify-between text-xs text-text-muted pt-2">
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> All-or-nothing fundraising
              </div>
              {user && (
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="text-text-muted hover:text-red-600 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Flag className="w-3 h-3" /> Report
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8">
        <Tabs
          tabs={[
            { id: 'story', label: 'Story & Details' },
            { id: 'rewards', label: `Rewards (${campaign.rewardTiers?.length || 0})` },
            { id: 'updates', label: `Updates (${updates.length})` },
            { id: 'comments', label: `Comments (${comments.length})` }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          {activeTab === 'story' && (
            <div className="bg-surface-white p-8 rounded-3xl border border-border-ink/10 space-y-6">
              <h3 className="text-2xl font-display font-bold text-text-ink">About This Campaign</h3>
              <div className="prose max-w-none text-text-secondary leading-relaxed space-y-4 whitespace-pre-line text-base">
                {campaign.description}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-6">
              {campaign.rewardTiers && campaign.rewardTiers.length > 0 ? (
                campaign.rewardTiers.map((reward, idx) => (
                  <div key={idx} className="p-8 bg-surface-white rounded-3xl border border-border-ink/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xl font-display font-bold text-text-ink">{reward.title}</h4>
                        <span className="text-lg font-bold text-accent-violet">${reward.minimumAmount}+</span>
                      </div>
                      <p className="text-sm text-text-secondary mb-6">{reward.description}</p>
                      {reward.estimatedDelivery && (
                        <div className="text-xs text-text-muted flex items-center gap-1.5 mb-4">
                          <Package className="w-4 h-4 text-accent-violet" /> Estimated Delivery: {reward.estimatedDelivery}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleInitiateDonation(reward)}
                      disabled={campaign.status !== 'active'}
                      className="w-full py-3 bg-text-ink hover:opacity-90 text-white rounded-full font-semibold text-sm transition-all"
                    >
                      Select ${reward.minimumAmount} Tier
                    </button>
                  </div>
                ))
              ) : (
                <EmptyState title="No reward tiers specified" description="The creator has not listed specific reward tiers for this campaign." />
              )}
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-6">
              {updates.length > 0 ? (
                updates.map((upd) => (
                  <div key={upd._id} className="p-8 bg-surface-white rounded-3xl border border-border-ink/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-display font-bold text-text-ink">{upd.title}</h4>
                      <span className="text-xs text-text-muted">{new Date(upd.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">{upd.content}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="No creator updates yet" description="The campaign creator hasn't published any updates recently." />
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-8">
              {/* Comment Input Form */}
              <form onSubmit={handlePostComment} className="p-6 bg-surface-white rounded-3xl border border-border-ink/10 space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? 'Join the community discussion...' : 'Please sign in to post a comment.'}
                  disabled={!user}
                  rows={3}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!user || commentSubmitting || !newComment.trim()}
                    className="px-6 py-2.5 bg-text-ink text-white rounded-full text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" /> Post Comment
                  </button>
                </div>
              </form>

              {/* Comments Stream */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comm) => (
                    <div key={comm._id} className="p-6 bg-surface-white rounded-2xl border border-border-ink/10 flex gap-4">
                      <Avatar src={comm.user?.avatar} name={comm.user?.name || 'Backer'} size="md" />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-text-ink text-sm">{comm.user?.name || 'Backer'}</span>
                          <span className="text-xs text-text-muted">{new Date(comm.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-text-secondary">{comm.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No comments yet" description="Be the first backer to leave a message of support!" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Creator Info Sidebar Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-surface-white rounded-3xl border border-border-ink/10 space-y-4">
            <h4 className="font-display font-bold text-text-ink text-sm uppercase tracking-wider">Campaign Creator</h4>
            <div className="flex items-center gap-4">
              <Avatar src={campaign.creator?.avatar} name={campaign.creator?.name} size="lg" />
              <div>
                <h5 className="font-display font-bold text-text-ink text-base">{campaign.creator?.name}</h5>
                <span className="text-xs text-emerald-600 font-semibold">Verified Creator</span>
              </div>
            </div>
            {campaign.creator?.bio && <p className="text-xs text-text-secondary">{campaign.creator.bio}</p>}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={campaign.title}
        url={window.location.href}
      />

      {/* Report Modal */}
      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Report Campaign">
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <Select
            label="Reason for reporting"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            options={[
              { label: 'Potential Fraud / Scam', value: 'fraud' },
              { label: 'Misleading Description', value: 'misleading' },
              { label: 'Prohibited Content', value: 'prohibited_content' },
              { label: 'Copyright / Duplicate', value: 'duplicate' },
              { label: 'Inappropriate Content', value: 'inappropriate' }
            ]}
          />
          <Textarea
            label="Detailed Explanation"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            placeholder="Please specify why this campaign violates platform rules..."
            rows={4}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setReportModalOpen(false)}
              className="px-5 py-2.5 rounded-full border border-border-ink/20 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reportSubmitting}
              className="px-5 py-2.5 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700 disabled:opacity-50"
            >
              {reportSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Donation Checkout Modal */}
      <Modal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        title={donationStep === 'success' ? 'Contribution Confirmed!' : 'Back This Project'}
        maxWidth="max-w-lg"
      >
        {donationStep === 'amount' && (
          <div className="space-y-6">
            <CurrencyInput
              label="Contribution Amount (USD)"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
            />

            {selectedReward && (
              <div className="p-4 bg-accent-violet/10 rounded-2xl border border-accent-violet/20 text-xs text-text-ink space-y-1">
                <span className="font-bold text-accent-violet block">Selected Reward: {selectedReward.title}</span>
                <p>{selectedReward.description}</p>
              </div>
            )}

            <Checkbox
              label="Make my contribution anonymous to the public"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />

            <button
              onClick={handleConfirmPayment}
              disabled={paymentLoading}
              className="w-full py-4 bg-text-ink text-white font-display font-bold rounded-full text-sm hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {paymentLoading ? 'Processing Payment...' : 'Confirm Pledging'}
            </button>
          </div>
        )}

        {donationStep === 'success' && completedDonation && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-text-ink mb-2">Thank you for your support!</h3>
              <p className="text-sm text-text-secondary">
                Your pledge of <span className="font-bold text-text-ink">${donationAmount}</span> to "{campaign.title}" has been successfully recorded.
              </p>
            </div>

            <div className="p-4 bg-black/5 rounded-2xl text-xs text-text-secondary space-y-1 text-left font-mono">
              <div>Receipt Number: {completedDonation.receipt?.receiptNumber || 'FR-GENERATED'}</div>
              <div>Status: Succeeded</div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDonationModalOpen(false)}
                className="px-6 py-3 bg-text-ink text-white font-semibold rounded-full text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
