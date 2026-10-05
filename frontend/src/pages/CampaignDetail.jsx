import React, { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ShareModal } from '../components/ui/ShareModal'
import { io } from 'socket.io-client'
import confetti from 'canvas-confetti'
import { Heart, Users, Calendar, AlertCircle, Sparkles, Check, Share2, MessageSquare, Send, Package, Clock } from 'lucide-react'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export default function CampaignDetail() {
  const { slug } = useParams()
  const { user, authFetch } = useContext(AuthContext)

  const [campaign, setCampaign] = useState(null)
  const [donations, setDonations] = useState([])
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('story') // 'story' | 'community'
  const [showStoryExpanded, setShowStoryExpanded] = useState(false)

  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false)

  // Donation Modal States
  const [modalOpen, setModalOpen] = useState(false)
  const [donationAmount, setDonationAmount] = useState('25')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [rewardTier, setRewardTier] = useState('Standard Backer')
  
  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState('input') // 'input' | 'confirm' | 'success'
  const [pendingPaymentIntentId, setPendingPaymentIntentId] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  // Fetch campaign and donation history
  useEffect(() => {
    fetchCampaignDetails()
  }, [slug])

  const fetchCampaignDetails = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/campaigns/${slug}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch campaign details')
      }

      setCampaign(data.campaign)

      // Fetch historical donations
      const donRes = await fetch(`/api/donations/campaign/${data.campaign._id}`)
      const donData = await donRes.json()
      if (donRes.ok) {
        setDonations(donData.donations || [])
      }

      // Fetch comments
      const commRes = await fetch(`/api/campaigns/${data.campaign._id}/comments`)
      const commData = await commRes.json()
      if (commRes.ok) {
        setComments(commData.comments || [])
      }

      // Check bookmark status if logged in
      if (user) {
        const bmRes = await authFetch('/api/campaigns/bookmarks/my-bookmarks')
        const bmData = await bmRes.json()
        if (bmRes.ok) {
          const isBm = (bmData.bookmarks || []).some(b => b._id === data.campaign._id)
          setIsBookmarked(isBm)
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Socket.io Real-time connection to campaign room
  useEffect(() => {
    if (!campaign?._id) return

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    newSocket.emit('join-campaign', campaign._id)

    newSocket.on('donation-received', (data) => {
      setCampaign((prev) => ({
        ...prev,
        amountRaised: prev.amountRaised + data.amount,
        backersCount: prev.backersCount + 1
      }))

      setDonations((prev) => [
        {
          _id: Date.now().toString(),
          amount: data.amount,
          donor: data.donor,
          isAnonymous: data.isAnonymous,
          createdAt: data.timestamp
        },
        ...prev
      ])
    })

    return () => {
      newSocket.disconnect()
    }
  }, [campaign?._id])

  const handleToggleBookmark = async () => {
    if (!user) {
      alert('Please log in to save campaigns.')
      return
    }

    try {
      const res = await authFetch(`/api/campaigns/${campaign._id}/bookmark`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setIsBookmarked(data.bookmarked)
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err)
    }
  }

  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    if (!user) {
      alert('Please log in to post comments.')
      return
    }

    setPostingComment(true)
    try {
      const res = await authFetch(`/api/campaigns/${campaign._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText })
      })

      const data = await res.json()
      if (res.ok) {
        setComments((prev) => [data.comment, ...prev])
        setCommentText('')
      } else {
        alert(data.error || 'Failed to post comment')
      }
    } catch (err) {
      console.error('Error posting comment:', err)
    } finally {
      setPostingComment(false)
    }
  }

  const getDaysLeft = (deadlineStr) => {
    const diff = new Date(deadlineStr) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const handleOpenDonation = (amount = '25', tier = 'Standard Backer') => {
    setDonationAmount(amount)
    setRewardTier(tier)
    setCheckoutStep('input')
    setModalOpen(true)
  }

  const handleInitiateCheckout = async (e) => {
    e.preventDefault()
    setCheckoutLoading(true)
    setError('')

    const numAmount = parseFloat(donationAmount)
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid donation amount')
      setCheckoutLoading(false)
      return
    }

    try {
      const headers = { 'Content-Type': 'application/json' }
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`
      }

      const res = await fetch('/api/donations/intent', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          campaignId: campaign._id,
          amount: numAmount,
          isAnonymous,
          rewardTier
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment intent')
      }

      setPendingPaymentIntentId(data.paymentIntentId)
      setCheckoutStep('confirm')
    } catch (err) {
      setError(err.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleConfirmMockCheckout = async () => {
    setCheckoutLoading(true)
    setError('')

    try {
      const res = await fetch('/api/donations/mock-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: pendingPaymentIntentId
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process checkout transaction')
      }

      setCheckoutStep('success')
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      })

      setTimeout(fetchCampaignDetails, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-32 text-center space-y-4">
        <div className="animate-spin text-accent-violet inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full"></div>
        <p className="text-text-secondary font-medium">Loading campaign details...</p>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-32 text-center space-y-4">
        <AlertCircle className="mx-auto text-red-500" size={32} />
        <h3 className="font-display text-xl font-bold text-text-ink">Error Loading Campaign</h3>
        <p className="text-sm text-text-secondary">{error || 'Campaign not found'}</p>
        <Link to="/campaigns">
          <Button variant="secondary">Back to Discovery</Button>
        </Link>
      </div>
    )
  }

  const pct = Math.min(100, Math.round((campaign.amountRaised / campaign.fundingGoal) * 100))
  const daysLeft = getDaysLeft(campaign.deadline)

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-24 space-y-16 text-left">
      
      {/* 1. Campaign Header Cover layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cover visual & Details left */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <span className="bg-accent-violet/10 text-accent-violet text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              {campaign.category}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleBookmark}
                className={`p-2.5 rounded-full border transition-colors ${
                  isBookmarked
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'bg-white border-text-ink/10 text-text-secondary hover:text-text-ink'
                }`}
                title={isBookmarked ? 'Remove from saved' : 'Save campaign'}
              >
                <Heart size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => setShareModalOpen(true)}
                className="p-2.5 rounded-full border bg-white border-text-ink/10 text-text-secondary hover:text-text-ink transition-colors"
                title="Share campaign"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <h1 className="headline-display text-3xl md:text-5xl font-bold tracking-tight text-text-ink leading-tight">
            {campaign.title}
          </h1>

          <div className="h-[360px] md:h-[480px] rounded-card-feature overflow-hidden border border-text-ink/10 relative">
            <img 
              src={campaign.coverImage} 
              alt={campaign.title} 
              className="w-full h-full object-cover"
            />
            {campaign.status === 'funded' && (
              <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                <Sparkles size={14} /> Funded Goal Met
              </span>
            )}
          </div>
        </div>

        {/* Campaign Metrics & Action widget right */}
        <div className="lg:col-span-5">
          <Card variant="app-panel" className="p-8 space-y-8 border border-text-ink/10">
            <div className="space-y-6">
              {/* Progress visual */}
              <div className="space-y-2">
                <div className="w-full bg-text-ink/5 h-3 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-accent-violet to-accent-peach h-full rounded-full" style={{ width: `${pct}%` }}></div>
                </div>
                <div className="flex justify-between text-sm font-bold text-text-secondary">
                  <span>{pct}% Funded</span>
                  <span>Goal: ${campaign.fundingGoal.toLocaleString()}</span>
                </div>
              </div>

              {/* Grid values */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-text-ink/5">
                <div className="text-left space-y-0.5">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Raised</span>
                  <p className="font-display text-2xl font-extrabold text-text-ink">${campaign.amountRaised.toLocaleString()}</p>
                </div>
                <div className="text-left space-y-0.5">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Backers</span>
                  <p className="font-display text-2xl font-extrabold text-text-ink">{campaign.backersCount}</p>
                </div>
                <div className="text-left space-y-0.5">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Days Left</span>
                  <p className="font-display text-2xl font-extrabold text-text-ink">{daysLeft}</p>
                </div>
              </div>
            </div>

            {/* Back action */}
            {campaign.status === 'active' ? (
              <Button 
                onClick={() => handleOpenDonation('25', 'Standard Backer')} 
                variant="primary" 
                className="w-full h-[60px]"
              >
                Back This Project
              </Button>
            ) : (
              <Button variant="secondary" className="w-full h-[60px] opacity-60 pointer-events-none" disabled>
                Funding Closed
              </Button>
            )}

            {/* Creator profile */}
            <div className="flex items-center gap-3 pt-4 border-t border-text-ink/5">
              <img 
                src={campaign.creator.avatar} 
                alt={campaign.creator.name} 
                className="w-10 h-10 rounded-full object-cover border border-text-ink/10"
              />
              <div className="text-left">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Project Creator</span>
                <p className="text-sm font-semibold text-text-ink">{campaign.creator.name}</p>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Navigation Tabs (Story vs Community Q&A) */}
      <div className="border-b border-text-ink/10 flex gap-8 text-sm font-bold">
        <button
          onClick={() => setActiveTab('story')}
          className={`pb-4 transition-colors relative ${
            activeTab === 'story' ? 'text-accent-violet' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          Campaign Story & Tiers
          {activeTab === 'story' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-violet"></div>}
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`pb-4 transition-colors relative flex items-center gap-2 ${
            activeTab === 'community' ? 'text-accent-violet' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          Community Discussion ({comments.length})
          {activeTab === 'community' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-violet"></div>}
        </button>
      </div>

      {/* TAB 1: STORY & REWARDS */}
      {activeTab === 'story' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Story details left */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold tracking-tight text-text-ink border-b border-text-ink/5 pb-4">
                Project Description
              </h2>
              <div className={`text-[16px] text-text-secondary leading-relaxed font-body transition-all ${
                showStoryExpanded ? 'line-clamp-none' : 'line-clamp-6'
              }`}>
                <p className="whitespace-pre-line">{campaign.description}</p>
              </div>
              
              <button 
                onClick={() => setShowStoryExpanded(!showStoryExpanded)}
                className="text-accent-violet hover:underline text-sm font-bold block pt-2"
              >
                {showStoryExpanded ? 'Show less' : 'Read full story'}
              </button>
            </div>

            {/* Reward Tiers Grid */}
            <div className="space-y-6 pt-6 border-t border-text-ink/5">
              <h3 className="font-display text-xl font-bold text-text-ink">Select a Reward Tier</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <Card variant="faq" className="p-6 space-y-4 border border-text-ink/10 hover:border-accent-violet/50 transition-colors flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-accent-violet bg-accent-violet/10 px-2.5 py-1 rounded-full uppercase">Starter Tier</span>
                    <h4 className="font-bold text-lg text-text-ink">Pledge $25 or more</h4>
                    <p className="text-xs text-text-secondary">Standard Backer Edition — Includes digital wall of fame listing & early backer newsletter updates.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-[11px] font-semibold text-text-muted">
                      <span className="flex items-center gap-1"><Clock size={12} /> Est. Dec 2026</span>
                      <span className="flex items-center gap-1"><Package size={12} /> Ships Worldwide</span>
                    </div>
                    <Button 
                      onClick={() => handleOpenDonation('25', 'Standard Backer')} 
                      variant="secondary" 
                      className="w-full text-xs h-[42px]"
                    >
                      Pledge $25
                    </Button>
                  </div>
                </Card>

                <Card variant="faq" className="p-6 space-y-4 border border-accent-violet/30 bg-accent-violet/[0.02] flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-white bg-accent-violet px-2.5 py-1 rounded-full uppercase">Popular Tier</span>
                    <h4 className="font-bold text-lg text-text-ink">Pledge $100 or more</h4>
                    <p className="text-xs text-text-secondary">Silver Collector's Edition — Includes physical backer gift set, custom laser engraved nameplate, and early batch shipping.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-[11px] font-semibold text-accent-violet">
                      <span className="flex items-center gap-1"><Clock size={12} /> Est. Nov 2026</span>
                      <span className="flex items-center gap-1"><Package size={12} /> 18 Remaining</span>
                    </div>
                    <Button 
                      onClick={() => handleOpenDonation('100', 'Silver Backer')} 
                      variant="primary" 
                      className="w-full text-xs h-[42px]"
                    >
                      Pledge $100
                    </Button>
                  </div>
                </Card>

              </div>
            </div>
          </div>

          {/* Live backer feed right */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="font-display text-xl font-bold tracking-tight text-text-ink">
              Live Backer Stream
            </h3>

            <Card variant="faq" className="p-0 border border-text-ink/10 overflow-hidden divide-y divide-text-ink/5 max-h-[460px] overflow-y-auto">
              {donations.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-secondary">
                  No backer donations recorded yet. Be the first to support!
                </div>
              ) : (
                donations.map((don) => (
                  <div key={don._id} className="p-4 flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent-violet/10 text-accent-violet font-bold flex items-center justify-center text-xs shrink-0">
                        {don.isAnonymous ? 'A' : (don.donor?.name?.charAt(0) || 'B')}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-ink">
                          {don.isAnonymous ? 'Anonymous Backer' : (don.donor?.name || 'Guest Backer')}
                        </p>
                        <span className="text-[10px] text-text-muted">
                          {new Date(don.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="font-display font-bold text-accent-violet text-sm">
                      +${don.amount}
                    </span>
                  </div>
                ))
              )}
            </Card>
          </div>

        </div>
      )}

      {/* TAB 2: COMMUNITY & DISCUSSION */}
      {activeTab === 'community' && (
        <div className="max-w-[800px] space-y-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text-ink">
            Backer Discussion ({comments.length})
          </h2>

          {/* Comment Post Form */}
          {user ? (
            <Card variant="app-panel" className="p-6 border border-text-ink/10">
              <form onSubmit={handlePostComment} className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span className="text-xs font-bold text-text-ink">Post a comment as {user.name}</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ask a question or leave feedback for the creator..."
                  className="w-full p-4 bg-bg-linen rounded-xl border border-text-ink/10 text-sm font-medium text-text-ink focus:outline-none focus:border-accent-violet resize-none"
                />
                <Button type="submit" variant="primary" disabled={postingComment} className="h-[40px] px-5 text-xs font-bold flex items-center gap-1.5">
                  <Send size={14} /> {postingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </form>
            </Card>
          ) : (
            <Card variant="faq" className="p-6 text-center space-y-2">
              <p className="text-xs font-medium text-text-secondary">Sign in to join the discussion and post questions to the creator.</p>
              <Link to="/login">
                <Button variant="secondary" className="h-[36px] text-xs">Sign In</Button>
              </Link>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-xs text-text-secondary">No comments posted yet. Start the conversation!</p>
            ) : (
              comments.map((comm) => (
                <Card key={comm._id} variant="app-panel" className="p-6 border border-text-ink/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={comm.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                        alt={comm.user?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-text-ink flex items-center gap-2">
                          {comm.user?.name || 'Community Member'}
                          {comm.user?.role === 'creator' && (
                            <span className="text-[9px] font-extrabold bg-accent-violet text-white px-2 py-0.5 rounded-full uppercase">Creator</span>
                          )}
                        </p>
                        <span className="text-[10px] text-text-muted">{new Date(comm.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed font-body">{comm.text}</p>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      <ShareModal
        campaign={campaign}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* 4. DONATION BACKING CHECKOUT POPUP MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-text-ink/65 backdrop-blur-[4px]">
          <Card variant="app-panel" className="w-full max-w-[480px] p-8 space-y-6 relative border border-text-ink/15 shadow-2xl animate-scale-up">
            
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-ink font-semibold"
              disabled={checkoutLoading}
            >
              Close
            </button>

            {/* STEP 1: Enter donation details */}
            {checkoutStep === 'input' && (
              <form onSubmit={handleInitiateCheckout} className="space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-accent-violet tracking-wider uppercase">Support Campaign</span>
                  <h3 className="font-display text-2xl font-bold text-text-ink">Back This Project</h3>
                  <p className="text-xs text-text-secondary">Pledge for reward tier: <span className="font-bold text-text-ink">{rewardTier}</span></p>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <span className="text-xs font-medium text-red-700">{error}</span>
                  </div>
                )}

                <div className="space-y-2 text-left">
                  <label className="block text-xs font-bold text-text-ink uppercase tracking-wider">
                    Pledge Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                    <input
                      type="number"
                      min={1}
                      required
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet text-lg font-bold text-text-ink"
                    />
                  </div>
                </div>

                {/* Anonymous checkbox */}
                <div className="flex items-center gap-3 text-left p-4 bg-bg-linen rounded-xl border border-text-ink/5">
                  <input
                    type="checkbox"
                    id="anon"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 accent-accent-violet rounded cursor-pointer"
                  />
                  <label htmlFor="anon" className="text-xs font-semibold text-text-ink cursor-pointer">
                    Donate Anonymously (Hide my name on backer list)
                  </label>
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={checkoutLoading}
                  className="w-full h-[52px]"
                >
                  {checkoutLoading ? 'Initializing Checkout...' : 'Proceed to Checkout'}
                </Button>
              </form>
            )}

            {/* STEP 2: Stripe Mock Confirm Simulator */}
            {checkoutStep === 'confirm' && (
              <div className="space-y-6 text-center">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-accent-violet tracking-wider uppercase">Stripe Test Checkout</span>
                  <h3 className="font-display text-2xl font-bold text-text-ink">Confirm Payment</h3>
                  <p className="text-xs text-text-secondary">Amount: <span className="font-bold text-text-ink">${donationAmount} USD</span></p>
                </div>

                <div className="p-5 bg-bg-linen rounded-2xl space-y-2 border border-text-ink/5 text-left text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-text-muted">PaymentIntent:</span>
                    <span className="font-bold text-text-ink">{pendingPaymentIntentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Gateway:</span>
                    <span className="font-bold text-emerald-600">Stripe Test Engine</span>
                  </div>
                </div>

                <Button 
                  onClick={handleConfirmMockCheckout} 
                  variant="primary" 
                  disabled={checkoutLoading}
                  className="w-full h-[52px]"
                >
                  {checkoutLoading ? 'Processing Webhook Signal...' : 'Simulate Payment Confirmation'}
                </Button>
              </div>
            )}

            {/* STEP 3: Success state */}
            {checkoutStep === 'success' && (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <Check size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-bold text-text-ink">Thank You for Backing!</h3>
                  <p className="text-xs text-text-secondary max-w-[320px] mx-auto font-body">
                    Your contribution of <span className="font-bold text-accent-violet">${donationAmount}</span> has been processed and logged on the campaign backer stream.
                  </p>
                </div>
                <Button 
                  onClick={() => setModalOpen(false)} 
                  variant="primary" 
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            )}

          </Card>
        </div>
      )}

    </div>
  )
}
