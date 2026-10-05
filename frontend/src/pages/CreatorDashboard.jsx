import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PlusCircle, Wallet, ArrowUpRight, Check, AlertCircle, TrendingUp, Layers, Users, RefreshCw } from 'lucide-react'

export default function CreatorDashboard() {
  const { user, authFetch } = useContext(AuthContext)
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'campaigns' | 'backers' | 'payouts'
  const [stats, setStats] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [backers, setBackers] = useState([])
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)

  // Payout Modal state
  const [payoutModalOpen, setPayoutModalOpen] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [payoutAmount, setPayoutAmount] = useState('')
  const [destinationAccount, setDestinationAccount] = useState('Stripe Connected Account (*9941)')
  const [payoutSubmitting, setPayoutSubmitting] = useState(false)
  const [payoutError, setPayoutError] = useState('')
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else {
      fetchCreatorData()
    }
  }, [user, navigate])

  const fetchCreatorData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Stats
      const statsRes = await authFetch('/api/creator/stats')
      const statsData = await statsRes.json()
      if (statsRes.ok) setStats(statsData)

      // 2. Fetch Campaigns
      const campRes = await authFetch('/api/creator/campaigns')
      const campData = await campRes.json()
      if (campRes.ok) setCampaigns(campData.campaigns || [])

      // 3. Fetch Backers
      const backRes = await authFetch('/api/creator/backers')
      const backData = await backRes.json()
      if (backRes.ok) setBackers(backData.donations || [])

      // 4. Fetch Payouts
      const payRes = await authFetch('/api/creator/payouts')
      const payData = await payRes.json()
      if (payRes.ok) setPayouts(payData.payouts || [])
    } catch (err) {
      console.error('Error fetching creator dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayoutSubmit = async (e) => {
    e.preventDefault()
    setPayoutError('')
    setPayoutSuccessMsg('')
    setPayoutSubmitting(true)

    try {
      const res = await authFetch('/api/creator/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: selectedCampaignId || (campaigns[0]?._id),
          amount: parseFloat(payoutAmount),
          destinationAccount
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payout request')
      }

      setPayoutSuccessMsg(`Payout request of $${payoutAmount} submitted successfully! Status: Under Review.`)
      setPayoutAmount('')
      fetchCreatorData()
    } catch (err) {
      setPayoutError(err.message)
    } finally {
      setPayoutSubmitting(false)
    }
  }

  if (!user) return null

  const chartData = [
    { name: 'Week 1', amount: (stats?.totalRaised || 0) * 0.15 },
    { name: 'Week 2', amount: (stats?.totalRaised || 0) * 0.35 },
    { name: 'Week 3', amount: (stats?.totalRaised || 0) * 0.65 },
    { name: 'Week 4', amount: (stats?.totalRaised || 0) }
  ]

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-24 space-y-10 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-text-ink/10">
        <div className="space-y-1">
          <span className="text-xs font-bold text-accent-violet tracking-widest uppercase">Creator Workspace</span>
          <h1 className="headline-display text-3xl md:text-5xl font-extrabold text-text-ink">
            Creator Hub
          </h1>
          <p className="text-xs md:text-sm text-text-secondary">
            Manage projects, publish updates, view backer ledgers, and request payout settlements.
          </p>
        </div>

        <Link to="/campaigns/new">
          <Button variant="primary" className="flex items-center gap-1.5 h-[48px] text-xs">
            <PlusCircle size={16} /> Create Campaign
          </Button>
        </Link>
      </div>

      {/* Workspace Tabs */}
      <div className="flex bg-bg-linen border border-text-ink/10 p-1.5 rounded-full w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
            activeTab === 'overview' ? 'bg-text-ink text-surface-white' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          Overview & Velocity
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
            activeTab === 'campaigns' ? 'bg-text-ink text-surface-white' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          My Campaigns ({campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab('backers')}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
            activeTab === 'backers' ? 'bg-text-ink text-surface-white' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          Backer Ledger ({backers.length})
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
            activeTab === 'payouts' ? 'bg-text-ink text-surface-white' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          Payouts & Settlement
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Loading workspace details...</p>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-10">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                <Card variant="app-panel" className="p-6 space-y-2 border border-text-ink/10">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Gross Raised</span>
                  <p className="font-display text-3xl font-extrabold text-text-ink">${stats?.totalRaised?.toLocaleString()}</p>
                </Card>

                <Card variant="app-panel" className="p-6 space-y-2 border border-text-ink/10">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Total Backers</span>
                  <p className="font-display text-3xl font-extrabold text-text-ink">{stats?.totalBackers}</p>
                </Card>

                <Card variant="app-panel" className="p-6 space-y-2 border border-text-ink/10">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Active Projects</span>
                  <p className="font-display text-3xl font-extrabold text-accent-violet">{stats?.activeCampaigns}</p>
                </Card>

                <Card variant="gradient-feature" className="p-6 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-accent-peach uppercase tracking-wider">Available Balance</span>
                    <p className="font-display text-3xl font-extrabold text-white">${stats?.availableBalance?.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (campaigns.length > 0) setSelectedCampaignId(campaigns[0]._id)
                      setPayoutModalOpen(true)
                    }}
                    className="text-xs font-bold text-white bg-white/20 py-1.5 px-3 rounded-full hover:bg-white/30 transition-colors w-fit flex items-center gap-1"
                  >
                    <Wallet size={12} /> Request Payout
                  </button>
                </Card>

              </div>

              {/* Chart */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-text-ink">Funding Accumulation Chart</h3>
                <Card variant="app-panel" className="p-6 h-[320px] border border-text-ink/10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1A182B" opacity={0.05} />
                      <XAxis dataKey="name" stroke="#716F7E" fontSize={11} />
                      <YAxis stroke="#716F7E" fontSize={11} />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#6E47FF" strokeWidth={3} activeDot={{ r: 8, fill: '#FFBB98' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: MY CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <Card variant="faq" className="overflow-hidden border border-text-ink/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-bg-linen border-b border-text-ink/5 font-bold text-text-ink">
                        <th className="p-4">Title</th>
                        <th className="p-4">Goal</th>
                        <th className="p-4">Raised</th>
                        <th className="p-4">Backers</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-text-ink/5">
                      {campaigns.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-text-secondary">No campaigns created yet.</td>
                        </tr>
                      ) : (
                        campaigns.map((camp) => (
                          <tr key={camp._id} className="hover:bg-bg-linen/40 transition-colors">
                            <td className="p-4 font-bold text-text-ink">
                              <Link to={`/campaigns/${camp.slug}`} className="hover:underline">{camp.title}</Link>
                            </td>
                            <td className="p-4">${camp.fundingGoal?.toLocaleString()}</td>
                            <td className="p-4 font-bold text-accent-violet">${camp.amountRaised?.toLocaleString()}</td>
                            <td className="p-4">{camp.backersCount}</td>
                            <td className="p-4">
                              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                                camp.status === 'active' || camp.status === 'funded' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {camp.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <Link to={`/campaigns/${camp.slug}`}>
                                <Button variant="nav-secondary" className="h-[32px] px-3 text-xs">View</Button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: BACKER LEDGER */}
          {activeTab === 'backers' && (
            <div className="space-y-6">
              <Card variant="faq" className="overflow-hidden border border-text-ink/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-bg-linen border-b border-text-ink/5 font-bold text-text-ink">
                        <th className="p-4">Backer Name</th>
                        <th className="p-4">Campaign</th>
                        <th className="p-4">Pledged Amount</th>
                        <th className="p-4">Reward Tier</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-text-ink/5">
                      {backers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-text-secondary">No backer transactions recorded yet.</td>
                        </tr>
                      ) : (
                        backers.map((b) => (
                          <tr key={b._id} className="hover:bg-bg-linen/40 transition-colors text-text-secondary">
                            <td className="p-4 font-bold text-text-ink">
                              {b.isAnonymous ? 'Anonymous Backer' : (b.donor?.name || 'Guest')}
                            </td>
                            <td className="p-4 font-medium">{b.campaign?.title || 'Campaign'}</td>
                            <td className="p-4 font-extrabold text-accent-violet">${b.amount}</td>
                            <td className="p-4 text-xs">{b.rewardTier || 'Standard'}</td>
                            <td className="p-4 text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: PAYOUTS */}
          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-xl font-bold text-text-ink">Payout Requests History</h3>
                <Button
                  onClick={() => setPayoutModalOpen(true)}
                  variant="primary"
                  className="h-[38px] text-xs flex items-center gap-1.5"
                >
                  <Wallet size={14} /> Request New Payout
                </Button>
              </div>

              <Card variant="faq" className="overflow-hidden border border-text-ink/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-bg-linen border-b border-text-ink/5 font-bold text-text-ink">
                        <th className="p-4">Campaign</th>
                        <th className="p-4">Requested Gross</th>
                        <th className="p-4">Platform Fee (5%)</th>
                        <th className="p-4">Net Payout</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-text-ink/5">
                      {payouts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-text-secondary">No payout requests submitted yet.</td>
                        </tr>
                      ) : (
                        payouts.map((p) => (
                          <tr key={p._id} className="hover:bg-bg-linen/40 transition-colors text-text-secondary">
                            <td className="p-4 font-bold text-text-ink">{p.campaign?.title || 'Campaign'}</td>
                            <td className="p-4">${p.amount}</td>
                            <td className="p-4 text-xs text-red-500">-${p.platformFee}</td>
                            <td className="p-4 font-extrabold text-emerald-600">${p.netAmount}</td>
                            <td className="p-4">
                              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                                p.status === 'paid' || p.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* PAYOUT REQUEST MODAL */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-text-ink/65 backdrop-blur-[4px]">
          <Card variant="app-panel" className="w-full max-w-[480px] p-8 space-y-6 relative border border-text-ink/15 shadow-2xl animate-scale-up">
            
            <button 
              onClick={() => setPayoutModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-ink font-semibold text-sm"
            >
              Close
            </button>

            <form onSubmit={handleRequestPayoutSubmit} className="space-y-5">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-accent-violet tracking-wider uppercase">Fund Settlement</span>
                <h3 className="font-display text-2xl font-bold text-text-ink">Request Escrow Payout</h3>
              </div>

              {payoutError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                  <span className="text-xs font-medium text-red-700">{payoutError}</span>
                </div>
              )}

              {payoutSuccessMsg && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-start gap-3">
                  <Check className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                  <span className="text-xs font-medium text-emerald-700">{payoutSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-text-ink uppercase tracking-wider">
                  Select Campaign
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-linen rounded-xl border border-text-ink/10 text-sm font-semibold text-text-ink focus:outline-none"
                >
                  {campaigns.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} (${c.amountRaised} raised)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-text-ink uppercase tracking-wider">
                  Payout Amount (USD)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet text-sm font-bold text-text-ink"
                  placeholder={`Max balance: $${stats?.availableBalance || 0}`}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-text-ink uppercase tracking-wider">
                  Payout Destination Account
                </label>
                <input
                  type="text"
                  required
                  value={destinationAccount}
                  onChange={(e) => setDestinationAccount(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-linen rounded-xl border border-text-ink/10 text-sm font-medium text-text-ink focus:outline-none"
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                disabled={payoutSubmitting}
                className="w-full h-[52px]"
              >
                {payoutSubmitting ? 'Submitting Request...' : 'Submit Payout Request'}
              </Button>
            </form>

          </Card>
        </div>
      )}

    </div>
  )
}
