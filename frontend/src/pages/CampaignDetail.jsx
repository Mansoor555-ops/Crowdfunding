import React, { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { io } from 'socket.io-client'
import confetti from 'canvas-confetti'
import { Heart, Users, Calendar, AlertCircle, Sparkles, Check } from 'lucide-react'

export default function CampaignDetail() {
  const { slug } = useParams()
  const { user } = useContext(AuthContext)

  const [campaign, setCampaign] = useState(null)
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showStoryExpanded, setShowStoryExpanded] = useState(false)
  const [socket, setSocket] = useState(null)

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

      // Fetch historical donations for this campaign
      const donRes = await fetch(`/api/donations/campaign/${data.campaign._id}`)
      const donData = await donRes.json()
      if (donRes.ok) {
        setDonations(donData.donations || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Socket.io Real-time feed listener
  useEffect(() => {
    if (!campaign) return

    // Connect to websocket server (endpoint read from env or root)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    const newSocket = io(socketUrl, {
      withCredentials: true
    })

    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Socket.io connected to detail page feed.')
      newSocket.emit('join-campaign', campaign._id)
    })

    // Listen for live room donation event broadcasts
    newSocket.on('donation-received', (data) => {
      console.log('Live Room broadcast received:', data)
      
      // 1. Prepend donation to the active visual list
      setDonations((prev) => [
        {
          _id: Math.random().toString(),
          amount: data.amount,
          isAnonymous: !data.donorName || data.donorName === 'Anonymous',
          donor: data.donorName && data.donorName !== 'Anonymous' ? { name: data.donorName } : null,
          createdAt: data.createdAt || new Date().toISOString()
        },
        ...prev
      ])

      // 2. Update local campaign stats instantly
      setCampaign((prevCamp) => {
        if (!prevCamp) return null
        const newRaised = prevCamp.amountRaised + data.amount
        const updatedStatus = newRaised >= prevCamp.fundingGoal && prevCamp.status === 'active' 
          ? 'funded' 
          : prevCamp.status

        return {
          ...prevCamp,
          amountRaised: newRaised,
          backersCount: prevCamp.backersCount + 1,
          status: updatedStatus
        }
      })
    })

    return () => {
      newSocket.emit('leave-campaign', campaign._id)
      newSocket.disconnect()
    }
  }, [campaign?._id])

  const getDaysLeft = (deadlineStr) => {
    const diff = new Date(deadlineStr) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const handleOpenDonation = (amount, tier) => {
    setDonationAmount(amount)
    setRewardTier(tier)
    setCheckoutStep('input')
    setModalOpen(true)
  }

  // Handle Checkout submission
  const handleInitiateDonation = async (e) => {
    e.preventDefault()
    setCheckoutLoading(true)
    setError('')

    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const res = await fetch('/api/donations/intent', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          campaignId: campaign._id,
          amount: parseFloat(donationAmount),
          isAnonymous,
          rewardTier
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate checkout intent')
      }

      setPendingPaymentIntentId(data.paymentIntentId)
      
      // Proceed to mock confirmation screen since Stripe is in test/mock mode
      setCheckoutStep('confirm')
    } catch (err) {
      setError(err.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  // Handle Mock checkout confirmation
  const handleMockConfirmPayment = async () => {
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

      // Success
      setCheckoutStep('success')
      
      // Trigger confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      })

      // Refetch campaign stats in background
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
    <div className="max-w-[1280px] mx-auto px-6 py-24 space-y-16">
      
      {/* 1. Campaign Header Cover layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cover visual & Details left */}
        <div className="lg:col-span-7 space-y-6">
          <span className="bg-accent-violet/10 text-accent-violet text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            {campaign.category}
          </span>
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

      {/* 2. Story details & Live backer list feed */}
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

          {/* Reward tiers grid */}
          {campaign.status === 'active' && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold tracking-tight text-text-ink border-b border-text-ink/5 pb-4">
                Support Tiers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <Card variant="app-panel" className="p-6 flex flex-col justify-between h-full border border-text-ink/10">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-accent-violet uppercase tracking-wider">Tier 1</span>
                    <h3 className="font-display text-lg font-bold text-text-ink">Bronze backer</h3>
                    <p className="text-2xl font-extrabold text-text-ink mt-2">$25 <span className="text-xs font-medium text-text-secondary">or more</span></p>
                    <p className="text-xs text-text-secondary leading-relaxed pt-2">
                      Get a digital certificate of support and updates.
                    </p>
                  </div>
                  <Button onClick={() => handleOpenDonation('25', 'Bronze Backer')} variant="nav-secondary" className="w-full mt-4 h-[38px] text-xs">
                    Select Tier
                  </Button>
                </Card>

                <Card variant="app-panel" className="p-6 flex flex-col justify-between h-full border border-text-ink/10">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-accent-violet uppercase tracking-wider">Tier 2</span>
                    <h3 className="font-display text-lg font-bold text-text-ink">Silver backer</h3>
                    <p className="text-2xl font-extrabold text-text-ink mt-2">$100 <span className="text-xs font-medium text-text-secondary">or more</span></p>
                    <p className="text-xs text-text-secondary leading-relaxed pt-2">
                      Receive early access beta products + visual badges.
                    </p>
                  </div>
                  <Button onClick={() => handleOpenDonation('100', 'Silver Backer')} variant="nav-secondary" className="w-full mt-4 h-[38px] text-xs">
                    Select Tier
                  </Button>
                </Card>

                <Card variant="app-panel" className="p-6 flex flex-col justify-between h-full border border-text-ink/10">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-accent-violet uppercase tracking-wider">Tier 3</span>
                    <h3 className="font-display text-lg font-bold text-text-ink">Gold backer</h3>
                    <p className="text-2xl font-extrabold text-text-ink mt-2">$250 <span className="text-xs font-medium text-text-secondary">or more</span></p>
                    <p className="text-xs text-text-secondary leading-relaxed pt-2">
                      Full VIP access, premium merchandise, and credits listing.
                    </p>
                  </div>
                  <Button onClick={() => handleOpenDonation('250', 'Gold Backer')} variant="nav-secondary" className="w-full mt-4 h-[38px] text-xs">
                    Select Tier
                  </Button>
                </Card>

              </div>
            </div>
          )}
        </div>

        {/* Backer live list feed right */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between border-b border-text-ink/5 pb-4">
            <h2 className="font-display text-xl font-bold tracking-tight text-text-ink">
              Live Backer Feed
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-violet bg-accent-violet/5 py-1 px-2.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-pulse"></span>
              Live Connected
            </div>
          </div>

          <Card variant="faq" className="p-0 border border-text-ink/10 overflow-hidden divide-y divide-text-ink/5">
            {donations.length === 0 ? (
              <div className="p-8 text-center text-sm text-text-secondary font-medium">
                No backers yet. Be the first to back this campaign!
              </div>
            ) : (
              donations.map((d, index) => (
                <div key={d._id || index} className="p-4 flex justify-between items-center text-sm animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-violet/10 text-accent-violet flex items-center justify-center font-bold text-xs">
                      {d.isAnonymous ? 'A' : (d.donor?.name?.slice(0, 2).toUpperCase() || 'B')}
                    </div>
                    <div>
                      <p className="font-bold text-text-ink">
                        {d.isAnonymous ? 'Anonymous Backer' : (d.donor?.name || 'Backer')}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-extrabold text-accent-violet">${d.amount}</span>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

      </div>

      {/* 3. DONATION CHECKOUT MODAL OVERLAY */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-text-ink/65 backdrop-blur-[4px]">
          <Card variant="app-panel" className="w-full max-w-[480px] p-8 space-y-6 relative border border-text-ink/15 shadow-xl animate-scale-up">
            
            {/* Close handler */}
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-ink font-semibold"
            >
              Close
            </button>

            {checkoutStep === 'input' && (
              <form onSubmit={handleInitiateDonation} className="space-y-5">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-accent-violet tracking-wider uppercase">{rewardTier}</span>
                  <h3 className="font-display text-xl font-bold text-text-ink">Secure Your Donation</h3>
                </div>

                {/* Amount input */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-text-ink">
                    Backing Amount (USD)
                  </label>
                  <input
                    type="number"
                    min={5}
                    required
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet text-[15px] font-medium text-text-ink"
                  />
                </div>

                {/* Reward tier descriptor */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-text-ink">
                    Reward Tier Description
                  </label>
                  <input
                    type="text"
                    disabled
                    value={rewardTier}
                    className="w-full px-5 py-3.5 bg-bg-linen/50 rounded-xl border border-text-ink/5 text-[15px] font-medium text-text-secondary"
                  />
                </div>

                {/* Anonymous switch */}
                <label className="flex items-center gap-3 cursor-pointer py-1 select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-text-ink/15 text-accent-violet focus:ring-accent-violet"
                  />
                  <span className="text-sm font-semibold text-text-ink">Donate Anonymously</span>
                </label>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full h-[52px]" 
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'Processing...' : 'Continue to Checkout'}
                </Button>
              </form>
            )}

            {checkoutStep === 'confirm' && (
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 py-1 px-3.5 rounded-full uppercase tracking-wider">
                    Mock Payment Intent Active
                  </span>
                  <h3 className="font-display text-2xl font-bold text-text-ink">Confirm Transaction</h3>
                  <p className="text-sm text-text-secondary max-w-[340px] mx-auto font-body">
                    FundRise is running in test mock mode. Confirming will simulate a successful webhook transaction from Stripe.
                  </p>
                </div>

                <div className="bg-bg-linen p-5 rounded-2xl border border-text-ink/5 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary font-medium">Recipient:</span>
                    <span className="text-text-ink font-semibold">{campaign.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary font-medium">Selected Reward:</span>
                    <span className="text-text-ink font-semibold">{rewardTier}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-text-ink/5 font-bold">
                    <span className="text-text-ink">Total Amount:</span>
                    <span className="text-accent-violet text-lg">${donationAmount}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => setCheckoutStep('input')} variant="secondary" disabled={checkoutLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleMockConfirmPayment} variant="primary" disabled={checkoutLoading}>
                    {checkoutLoading ? 'Verifying...' : 'Pay & Confirm'}
                  </Button>
                </div>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="space-y-6 text-center py-6">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <Check size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-bold text-text-ink">Thank you, Backer!</h3>
                  <p className="text-sm text-text-secondary max-w-[320px] mx-auto font-body">
                    Your mock payment of <span className="font-bold text-accent-violet">${donationAmount}</span> completed successfully! Confetti is in the air.
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setModalOpen(false)
                    setCheckoutStep('input')
                  }} 
                  variant="primary" 
                  className="w-full"
                >
                  Return to Campaign
                </Button>
              </div>
            )}

          </Card>
        </div>
      )}

    </div>
  )
}
