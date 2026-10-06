import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Stat, DataTable } from '../components/ui/DataTable'
import { Tabs } from '../components/ui/Tabs'
import { Modal } from '../components/ui/Modal'
import { Input, CurrencyInput, Textarea, Select } from '../components/ui/Input'
import { Skeleton, EmptyState } from '../components/ui/Progress'
import { Badge, Avatar } from '../components/ui/Badge'
import { api } from '../services/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PlusCircle, Wallet, TrendingUp, Users, Package } from 'lucide-react'

export default function CreatorDashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({ totalRaised: 0, totalBackers: 0, totalCampaigns: 0, activeCampaigns: 0, availableBalance: 0 })
  const [campaigns, setCampaigns] = useState([])
  const [backers, setBackers] = useState([])
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)

  // Payout Modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false)
  const [payoutCampaignId, setPayoutCampaignId] = useState('')
  const [payoutAmount, setPayoutAmount] = useState('')
  const [destinationAccount, setDestinationAccount] = useState('Stripe Direct Connect (*9921)')
  const [payoutLoading, setPayoutLoading] = useState(false)

  // Update Publisher Modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [targetCampaignId, setTargetCampaignId] = useState('')
  const [updateTitle, setUpdateTitle] = useState('')
  const [updateContent, setUpdateContent] = useState('')
  const [updateLoading, setUpdateLoading] = useState(false)

  useEffect(() => {
    async function loadCreatorData() {
      setLoading(true)
      try {
        const [statsRes, campRes, backRes, payRes] = await Promise.all([
          api.get('/creator/stats').catch(() => ({})),
          api.get('/creator/campaigns').catch(() => ({ campaigns: [] })),
          api.get('/creator/backers').catch(() => ({ donations: [] })),
          api.get('/creator/payouts').catch(() => ({ payouts: [] }))
        ])

        if (statsRes.totalRaised !== undefined) setStats(statsRes)
        setCampaigns(campRes.campaigns || [])
        setBackers(backRes.donations || [])
        setPayouts(payRes.payouts || [])
      } catch (err) {
        console.error('Creator data load error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) loadCreatorData()
  }, [user])

  const handlePayoutSubmit = async (e) => {
    e.preventDefault()
    setPayoutLoading(true)
    try {
      const amt = parseFloat(payoutAmount)
      if (isNaN(amt) || amt <= 0) throw new Error('Enter a valid payout amount.')
      if (amt > stats.availableBalance) throw new Error(`Requested amount exceeds available balance of $${stats.availableBalance}`)

      const res = await api.post('/creator/payouts', {
        campaignId: payoutCampaignId || campaigns[0]?._id,
        amount: amt,
        destinationAccount
      })

      alert('Payout request submitted successfully for administrator review.')
      setPayouts([res.payout, ...payouts])
      setPayoutModalOpen(false)
      setPayoutAmount('')
    } catch (err) {
      alert(err.message || 'Failed to submit payout request.')
    } finally {
      setPayoutLoading(false)
    }
  }

  const handlePublishUpdate = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)
    try {
      await api.post(`/campaigns/${targetCampaignId}/updates`, {
        title: updateTitle,
        content: updateContent
      })
      alert('Campaign update published! All project backers will receive a notification.')
      setUpdateModalOpen(false)
      setUpdateTitle('')
      setUpdateContent('')
    } catch (err) {
      alert(err.message || 'Failed to publish update.')
    } finally {
      setUpdateLoading(false)
    }
  }

  const chartData = [
    { month: 'Jan', raised: Math.round(stats.totalRaised * 0.15) },
    { month: 'Feb', raised: Math.round(stats.totalRaised * 0.35) },
    { month: 'Mar', raised: Math.round(stats.totalRaised * 0.6) },
    { month: 'Apr', raised: Math.round(stats.totalRaised * 0.8) },
    { month: 'May', raised: stats.totalRaised }
  ]

  const backerColumns = [
    {
      header: 'Backer Name',
      accessorKey: 'donor',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.donor?.avatar} name={row.isAnonymous ? 'Anonymous' : row.donor?.name || 'Backer'} size="sm" />
          <span className="font-semibold text-text-ink">{row.isAnonymous ? 'Anonymous Backer' : row.donor?.name || 'Backer'}</span>
        </div>
      )
    },
    {
      header: 'Campaign',
      accessorKey: 'campaign',
      cell: (row) => <span className="font-medium text-text-secondary">{row.campaign?.title}</span>
    },
    {
      header: 'Pledge Amount',
      accessorKey: 'amount',
      cell: (row) => <span className="font-bold text-emerald-600">${row.amount}</span>
    },
    {
      header: 'Reward Tier',
      accessorKey: 'rewardTier',
      cell: (row) => <Badge variant="info">{row.rewardTier || 'Standard Pledge'}</Badge>
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: (row) => new Date(row.createdAt).toLocaleDateString()
    }
  ]

  const payoutColumns = [
    {
      header: 'Request Date',
      accessorKey: 'createdAt',
      cell: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      header: 'Requested Amount',
      accessorKey: 'amount',
      cell: (row) => <span className="font-bold text-text-ink">${row.amount}</span>
    },
    {
      header: 'Platform Fee (5%)',
      accessorKey: 'platformFee',
      cell: (row) => <span className="text-red-600 font-medium">-${row.platformFee}</span>
    },
    {
      header: 'Net Payable',
      accessorKey: 'netAmount',
      cell: (row) => <span className="font-bold text-emerald-600">${row.netAmount}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <Badge variant={row.status}>{row.status}</Badge>
    }
  ]

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-violet block mb-1">
            Creator Hub & Studio
          </span>
          <h1 className="text-3xl font-display font-bold text-text-ink">Creator Workspace</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setPayoutCampaignId(campaigns[0]?._id || '')
              setPayoutModalOpen(true)
            }}
            className="px-5 py-2.5 bg-emerald-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-800"
          >
            <Wallet className="w-4 h-4" /> Request Payout
          </button>
          <Link to="/campaigns/new" className="px-5 py-2.5 bg-text-ink text-white rounded-full text-xs font-bold flex items-center gap-1.5 hover:opacity-90">
            <PlusCircle className="w-4 h-4" /> Create Campaign
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Stat title="Total Raised" value={`$${stats.totalRaised.toLocaleString()}`} icon={TrendingUp} />
        <Stat title="Total Backers" value={stats.totalBackers.toString()} icon={Users} />
        <Stat title="Active Projects" value={stats.activeCampaigns.toString()} icon={Package} />
        <Stat title="Available Balance" value={`$${stats.availableBalance.toLocaleString()}`} icon={Wallet} />
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview & Growth' },
            { id: 'campaigns', label: `My Campaigns (${campaigns.length})` },
            { id: 'backers', label: `Backer Ledger (${backers.length})` },
            { id: 'payouts', label: `Payout Requests (${payouts.length})` }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab Panels */}
      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="p-8 bg-surface-white rounded-3xl border border-border-ink/10 shadow-sm space-y-6">
              <h3 className="text-xl font-display font-bold text-text-ink">Funding Growth Over Time</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Area type="monotone" dataKey="raised" stroke="#6E47FF" fill="#6E47FF" fillOpacity={0.15} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.length > 0 ? (
                campaigns.map((c) => (
                  <div key={c._id} className="p-6 bg-surface-white rounded-3xl border border-border-ink/10 flex flex-col justify-between space-y-4 shadow-sm">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <Badge variant={c.status}>{c.status}</Badge>
                        <span className="text-xs font-bold text-accent-violet">${c.amountRaised} raised</span>
                      </div>
                      <h4 className="font-display font-bold text-text-ink text-lg line-clamp-1 mb-2">{c.title}</h4>
                      <p className="text-xs text-text-secondary line-clamp-2">{c.description}</p>
                    </div>

                    <div className="pt-4 border-t border-border-ink/10 flex gap-2">
                      <Link to={`/campaigns/${c.slug}`} className="flex-1">
                        <button className="w-full py-2 bg-black/5 hover:bg-black/10 rounded-full text-xs font-semibold text-text-ink">
                          View Page
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setTargetCampaignId(c._id)
                          setUpdateModalOpen(true)
                        }}
                        className="flex-1 py-2 bg-text-ink hover:opacity-90 text-white rounded-full text-xs font-semibold"
                      >
                        Publish Update
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3">
                  <EmptyState title="No campaigns created yet" description="Click 'Create Campaign' above to launch your first project!" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'backers' && (
            <DataTable columns={backerColumns} data={backers} emptyMessage="No backer contributions recorded yet." />
          )}

          {activeTab === 'payouts' && (
            <DataTable columns={payoutColumns} data={payouts} emptyMessage="No payout requests submitted yet." />
          )}
        </>
      )}

      {/* Payout Request Modal */}
      <Modal isOpen={payoutModalOpen} onClose={() => setPayoutModalOpen(false)} title="Request Payout Withdrawal">
        <form onSubmit={handlePayoutSubmit} className="space-y-6">
          <div className="p-4 bg-accent-violet/10 rounded-2xl border border-accent-violet/20 text-xs space-y-1">
            <span className="font-bold text-accent-violet block">Available Balance: ${stats.availableBalance.toLocaleString()}</span>
            <p className="text-text-secondary">Platform fee of 5% will be automatically deducted upon approval.</p>
          </div>

          {campaigns.length > 0 && (
            <Select
              label="Select Campaign"
              value={payoutCampaignId}
              onChange={(e) => setPayoutCampaignId(e.target.value)}
              options={campaigns.map((c) => ({ label: c.title, value: c._id }))}
            />
          )}

          <CurrencyInput
            label="Payout Amount ($)"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            placeholder="0.00"
            required
          />

          <Input
            label="Destination Payout Account"
            value={destinationAccount}
            onChange={(e) => setDestinationAccount(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setPayoutModalOpen(false)}
              className="px-5 py-2.5 rounded-full border border-border-ink/20 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={payoutLoading}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
            >
              {payoutLoading ? 'Submitting...' : 'Submit Payout Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Publish Campaign Update Modal */}
      <Modal isOpen={updateModalOpen} onClose={() => setUpdateModalOpen(false)} title="Publish Backer Update">
        <form onSubmit={handlePublishUpdate} className="space-y-4">
          <Input
            label="Update Title"
            value={updateTitle}
            onChange={(e) => setUpdateTitle(e.target.value)}
            placeholder="e.g. Prototype Manufacturing Milestone Achieved!"
            required
          />
          <Textarea
            label="Update Content"
            value={updateContent}
            onChange={(e) => setUpdateContent(e.target.value)}
            placeholder="Write your update to your backers..."
            rows={5}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setUpdateModalOpen(false)}
              className="px-5 py-2.5 rounded-full border border-border-ink/20 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateLoading}
              className="px-6 py-2.5 bg-text-ink text-white rounded-full text-xs font-bold hover:opacity-90 disabled:opacity-50"
            >
              {updateLoading ? 'Publishing...' : 'Publish Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
