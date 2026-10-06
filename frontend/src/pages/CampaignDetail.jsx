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
  Heart,
  Users,
  Clock,
  Bookmark,
  Share2,
  Check,
  ShieldCheck,
  Flag,
  Send,
  Package,
  Award,
  Sparkles,
  ArrowRight
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
  const [showStickyBar, setShowStickyBar] = useState(false)

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
  const [donationAmount, setDonationAmount] = useState('500')
  const [selectedReward, setSelectedReward] = useState(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [donationStep, setDonationStep] = useState('amount') // 'amount' | 'payment' | 'success'
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [completedDonation, setCompletedDonation] = useState(null)

  // Comment Input
  const [newComment, setNewComment] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function loadCampaign() {
      setLoading(true)
      setError('')
      try {
        const data = await api.get(`/campaigns/${slug}`)
        setCampaign(data.campaign)

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

  // Socket.io Real-time Donation Stream
  useEffect(() => {
    if (!campaign?._id) return

    const socket = io('/', { path: '/socket.io' })
    socket.emit('join-campaign', campaign._id)

    socket.on('donation-received', (data) => {
      setCampaign((prev) => prev ? {
        ...prev,
        amountRaised: (prev.amountRaised || 0) + (data.amount || 0),
        backersCount: (prev.backersCount || 0) + 1
      } : prev)

      setDonations((prev) => [data, ...prev])
    })

    return () => {
      socket.emit('leave-campaign', campaign._id)
      socket.disconnect()
    }
  }, [campaign?._id])

  const handleBookmarkToggle = async () => {
    if (!user) {
      alert('Please log in to save campaigns.')
      return
    }
    try {
      const res = await api.post(`/campaigns/${campaign._id}/bookmark`)
      setIsBookmarked(res.bookmarked)
    } catch (err) {
      console.error('Bookmark error:', err)
    }
  }

  const handleInitiateDonation = (rewardTier = null) => {
    setSelectedReward(rewardTier)
    if (rewardTier) {
      setDonationAmount(rewardTier.minimumAmount.toString())
    }
    setDonationStep('amount')
    setDonationModalOpen(true)
  }

  const handleProcessPayment = async () => {
    const amt = parseFloat(donationAmount)
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid pledge amount.')
      return
    }

    setPaymentLoading(true)
    try {
      const intentRes = await api.post('/donations/create-payment-intent', {
        campaignId: campaign._id,
        amount: amt,
        rewardTierId: selectedReward?._id
      })

      const confirmRes = await api.post('/donations/webhook-mock', {
        paymentIntentId: intentRes.paymentIntentId,
        isAnonymous
      })

      setCompletedDonation(confirmRes.donation)
      setDonationStep('success')

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
    } catch (err) {
      alert(err.message || 'Payment processing failed. Please try again.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setCommentSubmitting(true)
    try {
      const res = await api.post(`/campaigns/${campaign._id}/comments`, { content: newComment })
      setComments((prev) => [res.comment, ...prev])
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
      <div className="max-w-7xl mx-auto px-6 py-28 space-y-8 font-body">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-[450px] w-full rounded-3xl" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center font-body">
        <EmptyState
          title="Campaign Not Found"
          description={error || 'The requested campaign could not be located or has been archived.'}
          action={
            <Link to="/discover">
              <Button variant="primary">Explore Marketplace</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const percentage = Math.min(Math.round(((campaign.amountRaised || 0) / (campaign.fundingGoal || 1)) * 100), 100)
  const deadlineDate = new Date(campaign.deadline)
  const daysRemaining = Math.max(0, Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24)))

  const presetAmounts = ['500', '1000', '2500', '5000', '10000']

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-12 max-w-7xl mx-auto font-body">
      {/* Campaign Header Title */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-3">
          <Badge variant={campaign.status} className="bg-emerald-50 text-emerald-700 border-emerald-200">
            {campaign.category}
          </Badge>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            Created by <strong className="text-slate-900">{campaign.creator?.name || 'Verified Creator'}</strong>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
          {campaign.title}
        </h1>
      </div>

      {/* Main Campaign Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        {/* Left Column: Cover Media Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-video rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
            <img src={campaign.coverImage} alt={campaign.title} className="w-full h-full object-cover" />
          </div>

          {campaign.gallery && campaign.gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {campaign.gallery.map((img, idx) => (
                <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-slate-200">
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Funding Panel Card */}
        <div className="lg:col-span-5">
          <div className="p-8 bg-white rounded-3xl border border-slate-200/90 shadow-xl sticky top-28 space-y-6">
            <div>
              <ProgressBar value={campaign.amountRaised} max={campaign.fundingGoal} className="h-3 mb-4" />
              <div className="text-4xl font-display font-extrabold text-slate-900 mb-1">
                ₹{(campaign.amountRaised || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                pledged of ₹{(campaign.fundingGoal || 0).toLocaleString('en-IN')} goal ({percentage}%)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
              <div>
                <div className="text-2xl font-display font-bold text-slate-900">{campaign.backersCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Backers Pledged</div>
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-slate-900">{daysRemaining}</div>
                <div className="text-xs text-slate-500 font-medium">Days Remaining</div>
              </div>
            </div>

            {/* Main Action CTAs */}
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={() => handleInitiateDonation()}
                disabled={campaign.status !== 'active'}
                className="w-full h-14 text-base font-bold shadow-lg shadow-emerald-600/20"
              >
                {campaign.status === 'active' ? 'Back This Project' : 'Campaign Closed'}
              </Button>

              <div className="flex gap-3">
                <button
                  onClick={handleBookmarkToggle}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                  {isBookmarked ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" /> Share
                </button>
              </div>
            </div>

            {/* Trust Assurance Badge */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> All-or-nothing guarantee
              </div>
              {user && (
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
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
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
              <h3 className="text-2xl font-display font-bold text-slate-900">About This Project</h3>
              <div className="prose max-w-none text-slate-600 leading-relaxed space-y-4 whitespace-pre-line text-base">
                {campaign.description}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-6">
              {campaign.rewardTiers && campaign.rewardTiers.length > 0 ? (
                campaign.rewardTiers.map((reward, idx) => (
                  <div key={idx} className="p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xl font-display font-bold text-slate-900">{reward.title}</h4>
                        <span className="text-lg font-bold text-emerald-700">₹{(reward.minimumAmount || 0).toLocaleString('en-IN')}+</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-6">{reward.description}</p>
                      {reward.estimatedDelivery && (
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-4">
                          <Package className="w-4 h-4 text-emerald-600" /> Estimated Delivery: {reward.estimatedDelivery}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => handleInitiateDonation(reward)}
                      disabled={campaign.status !== 'active'}
                      className="w-full text-xs font-bold"
                    >
                      Pledge ₹{(reward.minimumAmount || 0).toLocaleString('en-IN')} Tier
                    </Button>
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
                  <div key={upd._id} className="p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-display font-bold text-slate-900">{upd.title}</h4>
                      <span className="text-xs text-slate-400">{new Date(upd.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{upd.content}</p>
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
              <form onSubmit={handlePostComment} className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? 'Join the community discussion...' : 'Please sign in to post a comment.'}
                  disabled={!user}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!user || commentSubmitting || !newComment.trim()}
                    className="h-10 px-5 text-xs font-bold"
                  >
                    <Send className="w-3.5 h-3.5" /> Post Comment
                  </Button>
                </div>
              </form>

              {/* Comments Stream */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comm) => (
                    <div key={comm._id} className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex gap-4">
                      <Avatar src={comm.user?.avatar} name={comm.user?.name || 'Backer'} size="md" />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-slate-900 text-sm">{comm.user?.name || 'Anonymous Backer'}</span>
                          <span className="text-[11px] text-slate-400">{new Date(comm.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{comm.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No comments yet" description="Be the first backer to start a conversation with the creator!" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Creator Bio Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">About the Creator</h4>
            <div className="flex items-center gap-3">
              <Avatar src={campaign.creator?.avatar} name={campaign.creator?.name || 'Creator'} size="lg" />
              <div>
                <h5 className="font-display font-bold text-slate-900 text-base">{campaign.creator?.name || 'Verified Creator'}</h5>
                <p className="text-xs text-slate-500">{campaign.creator?.email}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verified creator on FundRise Marketplace. Direct communications and milestone updates guaranteed.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Donate Floating Bar */}
      {showStickyBar && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-3xl bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700 flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="hidden sm:block truncate">
            <h4 className="font-display font-bold text-sm text-white truncate">{campaign.title}</h4>
            <span className="text-xs text-emerald-400 font-medium">
              ₹{(campaign.amountRaised || 0).toLocaleString('en-IN')} raised ({percentage}%)
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="primary"
              onClick={() => handleInitiateDonation()}
              disabled={campaign.status !== 'active'}
              className="h-11 px-6 text-xs font-bold shadow-md shadow-emerald-600/30 shrink-0"
            >
              Back This Project
            </Button>
          </div>
        </div>
      )}

      {/* Donation Modal Flow */}
      <Modal isOpen={donationModalOpen} onClose={() => setDonationModalOpen(false)} title="Back This Project">
        {donationStep === 'amount' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Pledge Amount (₹)</label>
              <CurrencyInput
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="Enter custom amount"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Select Preset Tier</label>
              <div className="flex flex-wrap gap-2">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDonationAmount(amt)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      donationAmount === amt
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ₹{parseInt(amt).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <Checkbox
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              label="Make my pledge anonymous on public backer list"
            />

            <Button variant="primary" onClick={() => setDonationStep('payment')} className="w-full">
              Proceed to Payment Confirmation
            </Button>
          </div>
        )}

        {donationStep === 'payment' && (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider block mb-1">Total Pledge</span>
              <span className="text-3xl font-display font-extrabold text-emerald-900">
                ₹{parseFloat(donationAmount || '0').toLocaleString('en-IN')}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Your pledge is processed via simulated UPI/Card Razorpay gateway with end-to-end encryption.
            </p>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setDonationStep('amount')} className="w-1/2">
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleProcessPayment}
                disabled={paymentLoading}
                className="w-1/2"
              >
                {paymentLoading ? 'Processing...' : 'Confirm Pledge'}
              </Button>
            </div>
          </div>
        )}

        {donationStep === 'success' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900">Pledge Complete!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Thank you for supporting this campaign! An official digital receipt has been saved to your dashboard.
            </p>
            <Button variant="primary" onClick={() => setDonationModalOpen(false)} className="w-full">
              Close & View Campaign
            </Button>
          </div>
        )}
      </Modal>

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
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            options={[
              { label: 'Fraud or Misleading Information', value: 'fraud' },
              { label: 'Copyright / Intellectual Property Violation', value: 'copyright' },
              { label: 'Inappropriate or Harmful Content', value: 'inappropriate' },
              { label: 'Other Concern', value: 'other' }
            ]}
          />
          <Textarea
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={4}
            required
          />
          <Button variant="primary" type="submit" disabled={reportSubmitting} className="w-full bg-rose-600 hover:bg-rose-700">
            {reportSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
