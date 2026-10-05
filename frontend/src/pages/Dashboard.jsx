import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PlusCircle, Wallet, ArrowUpRight, Check, AlertCircle, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { user, authFetch } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const [activeTab, setActiveTab] = useState(user?.role === 'creator' ? 'creator' : 'backer')
  
  // Data States
  const [myCampaigns, setMyCampaigns] = useState([])
  const [myDonations, setMyDonations] = useState([])
  const [loading, setLoading] = useState(true)

  // Withdrawal States
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawalState, setWithdrawalState] = useState('input') // 'input' | 'pending' | 'success'
  const [withdrawError, setWithdrawError] = useState('')

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // 1. Fetch campaigns created by user
      const campRes = await authFetch(`/api/campaigns?creator=${user.id || user._id}&status=all`)
      const campData = await campRes.json()
      if (campRes.ok) {
        setMyCampaigns(campData.campaigns || [])
      }

      // 2. Fetch donations made by user
      const donRes = await authFetch('/api/donations/my-donations')
      const donData = await donRes.json()
      if (donRes.ok) {
        setMyDonations(donData.donations || [])
      }
    } catch (err) {
      console.error('Error fetching dashboard details:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals
  const totalRaised = myCampaigns.reduce((acc, curr) => acc + curr.amountRaised, 0)
  const totalBacked = myDonations.reduce((acc, curr) => acc + curr.amount, 0)
  const totalBackers = myCampaigns.reduce((acc, curr) => acc + curr.backersCount, 0)

  // Recharts mock timeline data - accumulation of funds raised
  const chartData = [
    { name: 'Week 1', amount: totalRaised * 0.1 },
    { name: 'Week 2', amount: totalRaised * 0.25 },
    { name: 'Week 3', amount: totalRaised * 0.45 },
    { name: 'Week 4', amount: totalRaised * 0.7 },
    { name: 'Week 5', amount: totalRaised }
  ]

  const handleWithdrawalRequest = (e) => {
    e.preventDefault()
    setWithdrawError('')

    const val = parseFloat(withdrawAmount)
    if (!val || val <= 0) {
      setWithdrawError('Withdrawal amount must be greater than zero')
      return
    }
    if (val > totalRaised) {
      setWithdrawError(`Insufficient funds. Max withdrawable is $${totalRaised.toLocaleString()}`)
      return
    }

    setWithdrawalState('pending')
    
    // Simulate approval delay
    setTimeout(() => {
      setWithdrawalState('success')
    }, 2000)
  }

  if (!user) return null

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-24 space-y-12">
      
      {/* User greeting header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-text-ink/10">
        <div className="space-y-1">
          <span className="text-[12px] font-bold text-accent-violet tracking-widest uppercase">Creator Workspace</span>
          <h1 className="headline-display text-3xl md:text-5xl font-bold tracking-tight text-text-ink">
            Hello, {user.name}
          </h1>
          <p className="text-text-secondary text-sm md:text-base font-body">
            Manage your campaigns, track transactions, and withdraw funds.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-bg-linen border border-text-ink/10 p-1.5 rounded-full self-stretch sm:self-auto justify-around">
          <button
            onClick={() => setActiveTab('creator')}
            className={`px-6 py-2.5 text-xs font-bold rounded-full transition-all ${
              activeTab === 'creator'
                ? 'bg-text-ink text-surface-white'
                : 'text-text-secondary hover:text-text-ink'
            }`}
          >
            Campaign Creator
          </button>
          <button
            onClick={() => setActiveTab('backer')}
            className={`px-6 py-2.5 text-xs font-bold rounded-full transition-all ${
              activeTab === 'backer'
                ? 'bg-text-ink text-surface-white'
                : 'text-text-secondary hover:text-text-ink'
            }`}
          >
            Backer Activity
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-secondary font-medium">
          Loading workspace details...
        </div>
      ) : (
        <>
          {/* TAB 1: CREATOR VIEW */}
          {activeTab === 'creator' && (
            <div className="space-y-10">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <Card variant="app-panel" className="p-8 space-y-2 relative border border-text-ink/10">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Withdrawable Funds</span>
                  <p className="font-display text-4xl font-extrabold text-text-ink">${totalRaised.toLocaleString()}</p>
                  <Button 
                    onClick={() => {
                      setWithdrawAmount('')
                      setWithdrawalState('input')
                      setWithdrawModalOpen(true)
                    }} 
                    variant="nav-secondary" 
                    className="mt-4 flex items-center gap-1.5"
                  >
                    <Wallet size={14} /> Request Payout
                  </Button>
                </Card>

                <Card variant="app-panel" className="p-8 space-y-2 border border-text-ink/10">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Overall Backers</span>
                  <p className="font-display text-4xl font-extrabold text-text-ink">{totalBackers}</p>
                  <span className="text-xs text-emerald-600 font-semibold block mt-4 flex items-center gap-1">
                    <TrendingUp size={14} /> +{totalBackers > 0 ? Math.ceil(totalBackers * 0.1) : 0} new this week
                  </span>
                </Card>

                <Card variant="gradient-feature" className="p-8 space-y-2 flex flex-col justify-between min-h-[160px]">
                  <div>
                    <span className="text-[11px] font-bold text-accent-peach uppercase tracking-wider">Funding Target Status</span>
                    <p className="font-display text-3xl font-extrabold text-surface-white mt-1">Goal Reached</p>
                  </div>
                  <span className="text-xs text-surface-white/70">
                    Live Escrow Accounts Audit Active
                  </span>
                </Card>

              </div>

              {/* Chart & Campaigns list */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Recharts Analytics Line Chart left */}
                <div className="lg:col-span-7 space-y-4">
                  <h2 className="font-display text-xl font-bold tracking-tight text-text-ink">Donation Velocity</h2>
                  <Card variant="app-panel" className="p-6 h-[340px] border border-text-ink/10">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1A182B" opacity={0.05} />
                        <XAxis dataKey="name" stroke="#716F7E" fontSize={11} tickLine={false} />
                        <YAxis stroke="#716F7E" fontSize={11} tickLine={false} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#6E47FF" 
                          strokeWidth={3} 
                          activeDot={{ r: 8, fill: '#FFBB98' }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {/* My Campaigns list right */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-display text-xl font-bold tracking-tight text-text-ink">My Campaigns</h2>
                    <Link to="/campaigns/new">
                      <Button variant="nav-secondary" className="flex items-center gap-1">
                        <PlusCircle size={14} /> Launch
                      </Button>
                    </Link>
                  </div>

                  <Card variant="faq" className="p-0 border border-text-ink/10 divide-y divide-text-ink/5">
                    {myCampaigns.length === 0 ? (
                      <div className="p-8 text-center text-sm text-text-secondary font-medium">
                        You haven't created any campaigns yet.
                      </div>
                    ) : (
                      myCampaigns.map((camp) => (
                        <div key={camp._id} className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={camp.coverImage} 
                              alt={camp.title} 
                              className="w-12 h-12 rounded-xl object-cover border border-text-ink/5"
                            />
                            <div className="text-left">
                              <h4 className="text-sm font-bold text-text-ink line-clamp-1">
                                <Link to={`/campaigns/${camp.slug}`} className="hover:underline">{camp.title}</Link>
                              </h4>
                              <p className="text-xs text-text-secondary">
                                ${camp.amountRaised.toLocaleString()} raised
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                            camp.status === 'active' || camp.status === 'funded'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-red-50 text-red-500'
                          }`}>
                            {camp.status}
                          </span>
                        </div>
                      ))
                    )}
                  </Card>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: BACKER VIEW */}
          {activeTab === 'backer' && (
            <div className="space-y-8 max-w-[800px] mx-auto">
              <h2 className="font-display text-xl font-bold tracking-tight text-text-ink text-left">
                My Backed Campaigns
              </h2>

              <Card variant="faq" className="p-0 border border-text-ink/10 overflow-hidden divide-y divide-text-ink/5">
                {myDonations.length === 0 ? (
                  <div className="p-12 text-center text-sm text-text-secondary font-medium">
                    You haven't backed any campaigns yet. Visit discovery page to support.
                  </div>
                ) : (
                  myDonations.map((don) => (
                    <div key={don._id} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
                      <div className="flex items-center gap-4">
                        <img 
                          src={don.campaign?.coverImage} 
                          alt={don.campaign?.title} 
                          className="w-16 h-16 rounded-2xl object-cover border border-text-ink/10"
                        />
                        <div className="space-y-1">
                          <h4 className="font-display text-lg font-bold text-text-ink leading-tight hover:text-accent-violet transition-colors">
                            <Link to={`/campaigns/${don.campaign?.slug}`}>{don.campaign?.title}</Link>
                          </h4>
                          <span className="text-xs text-text-secondary">
                            Contributed on {new Date(don.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-xs text-text-muted uppercase tracking-wider block">Backed Amount</span>
                          <span className="font-display font-extrabold text-accent-violet text-lg">${don.amount}</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 text-xs px-3.5 py-1.5 rounded-full font-bold">
                          Receipt Signed
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </Card>
            </div>
          )}
        </>
      )}

      {/* 4. WITHDRAWAL POPUP OVERLAY */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-text-ink/65 backdrop-blur-[4px]">
          <Card variant="app-panel" className="w-full max-w-[480px] p-8 space-y-6 relative border border-text-ink/15 shadow-xl animate-scale-up">
            
            <button 
              onClick={() => setWithdrawModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-ink font-semibold"
              disabled={withdrawalState === 'pending'}
            >
              Close
            </button>

            {withdrawalState === 'input' && (
              <form onSubmit={handleWithdrawalRequest} className="space-y-5">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-accent-violet tracking-wider uppercase">Escrow Settlement</span>
                  <h3 className="font-display text-xl font-bold text-text-ink">Request Fund Payout</h3>
                </div>

                {withdrawError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <span className="text-sm font-medium text-red-700">{withdrawError}</span>
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <label className="block text-sm font-semibold text-text-ink">
                    Withdrawal Amount (USD)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet text-[15px] font-medium text-text-ink"
                    placeholder={`Max withdrawable: $${totalRaised}`}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-sm font-semibold text-text-ink">
                    Payout Destination Account
                  </label>
                  <select className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet text-sm font-semibold text-text-ink">
                    <option>Stripe Connected Account (*9941)</option>
                    <option>Standard Checking Account (*8832)</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full h-[52px]"
                >
                  Verify Escrow & Withdraw
                </Button>
              </form>
            )}

            {withdrawalState === 'pending' && (
              <div className="space-y-6 text-center py-6">
                <div className="animate-spin text-accent-violet inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full"></div>
                <div className="space-y-2">
                  <h3 className="font-display text-xl font-bold text-text-ink">Requesting Escrow Verification...</h3>
                  <p className="text-sm text-text-secondary max-w-[320px] mx-auto font-body">
                    Our compliance layer is validating transaction signatures and backer ledgers.
                  </p>
                </div>
              </div>
            )}

            {withdrawalState === 'success' && (
              <div className="space-y-6 text-center py-6">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <Check size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-bold text-text-ink">Withdrawal Approved</h3>
                  <p className="text-sm text-text-secondary max-w-[320px] mx-auto font-body">
                    Mock payout of <span className="font-bold text-accent-violet">${withdrawAmount}</span> was processed successfully and settled to your connected account.
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setWithdrawModalOpen(false)
                    setWithdrawalState('input')
                    fetchDashboardData()
                  }} 
                  variant="primary" 
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            )}

          </Card>
        </div>
      )}

    </div>
  )
}
