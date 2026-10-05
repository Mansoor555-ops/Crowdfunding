import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Stat, DataTable } from '../components/ui/DataTable'
import { Tabs } from '../components/ui/Tabs'
import { CampaignCard } from '../components/ui/CampaignCard'
import { Modal } from '../components/ui/Modal'
import { Skeleton, EmptyState } from '../components/ui/Progress'
import { Badge } from '../components/ui/Badge'
import { api } from '../services/api'
import { Heart, Bookmark, Receipt, ShieldCheck, ArrowUpRight, FileText, Download } from 'lucide-react'

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const [activeTab, setActiveTab] = useState('backed')
  const [donations, setDonations] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  // Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  useEffect(() => {
    async function loadBackerData() {
      setLoading(true)
      try {
        const [donRes, bmRes] = await Promise.all([
          api.get('/donations/my-donations').catch(() => ({ donations: [] })),
          api.get('/campaigns/bookmarks/my-bookmarks').catch(() => ({ bookmarks: [] }))
        ])

        setDonations(donRes.donations || [])
        setBookmarks(bmRes.bookmarks || [])
      } catch (err) {
        console.error('Backer dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) loadBackerData()
  }, [user])

  const totalContributed = donations.reduce((acc, d) => acc + (d.amount || 0), 0)
  const uniqueCampaignsBacked = new Set(donations.map((d) => d.campaign?._id)).size

  const handleOpenReceipt = (donation) => {
    setSelectedReceipt(donation)
    setReceiptModalOpen(true)
  }

  const donationColumns = [
    {
      header: 'Campaign Title',
      accessorKey: 'campaign',
      cell: (row) => (
        <Link to={`/campaigns/${row.campaign?.slug}`} className="font-bold text-text-ink hover:text-accent-violet transition-colors">
          {row.campaign?.title || 'FundRise Campaign'}
        </Link>
      )
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (row) => <span className="font-bold text-emerald-600">${row.amount}</span>
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      header: 'Receipt #',
      accessorKey: 'receiptNumber',
      cell: (row) => <span className="font-mono text-xs text-text-secondary">{row.receiptNumber || 'FR-OFFICIAL'}</span>
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => handleOpenReceipt(row)}
          className="px-3 py-1 bg-black/5 hover:bg-black/10 rounded-full text-xs font-semibold text-text-ink flex items-center gap-1"
        >
          <Receipt className="w-3.5 h-3.5 text-accent-violet" /> View Receipt
        </button>
      )
    }
  ]

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-violet block mb-1">
            Backer Command Center
          </span>
          <h1 className="text-3xl font-display font-bold text-text-ink">Welcome back, {user?.name}</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/discover" className="px-5 py-2.5 bg-text-ink text-white rounded-full text-xs font-bold hover:opacity-90">
            Explore Campaigns
          </Link>
          {(user?.role === 'creator' || user?.role === 'admin') && (
            <Link to="/creator" className="px-5 py-2.5 bg-accent-violet/10 text-accent-violet rounded-full text-xs font-bold hover:bg-accent-violet/20">
              Creator Hub
            </Link>
          )}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Stat title="Total Pledged" value={`$${totalContributed.toLocaleString()}`} icon={Heart} />
        <Stat title="Campaigns Backed" value={uniqueCampaignsBacked.toString()} icon={ShieldCheck} />
        <Stat title="Saved Bookmarks" value={bookmarks.length.toString()} icon={Bookmark} />
      </div>

      {/* Tabs Filter */}
      <div className="mb-8">
        <Tabs
          tabs={[
            { id: 'backed', label: `Backed Campaigns (${uniqueCampaignsBacked})` },
            { id: 'bookmarks', label: `Bookmarks (${bookmarks.length})` },
            { id: 'donations', label: `Donation History (${donations.length})` }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      ) : (
        <>
          {activeTab === 'backed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {donations.length > 0 ? (
                donations
                  .filter((d, idx, self) => self.findIndex((t) => t.campaign?._id === d.campaign?._id) === idx)
                  .map((d) => d.campaign && <CampaignCard key={d.campaign._id} campaign={d.campaign} />)
              ) : (
                <div className="col-span-3">
                  <EmptyState
                    title="No backed campaigns yet"
                    description="You haven't backed any campaigns so far. Explore active projects and support creators!"
                    action={
                      <Link to="/discover" className="px-6 py-2.5 bg-text-ink text-white text-xs font-bold rounded-full">
                        Discover Campaigns
                      </Link>
                    }
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookmarks.length > 0 ? (
                bookmarks.map((campaign) => (
                  <CampaignCard
                    key={campaign._id}
                    campaign={campaign}
                    isBookmarkedInitial={true}
                    onBookmarkToggle={(id, bookmarked) => {
                      if (!bookmarked) setBookmarks(bookmarks.filter((b) => b._id !== id))
                    }}
                  />
                ))
              ) : (
                <div className="col-span-3">
                  <EmptyState
                    title="No bookmarks saved"
                    description="Click the bookmark icon on any campaign card to save it for later review."
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'donations' && (
            <DataTable columns={donationColumns} data={donations} emptyMessage="No donation transactions on record." />
          )}
        </>
      )}

      {/* Official Receipt Viewer Modal */}
      <Modal isOpen={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} title="Official Donation Receipt">
        {selectedReceipt && (
          <div className="space-y-6 p-2">
            <div className="text-center pb-6 border-b border-border-ink/10">
              <span className="font-display text-2xl font-bold text-text-ink">
                FundRise<span className="text-accent-violet">.</span>
              </span>
              <p className="text-xs text-text-muted mt-1">Official Crowdfunding Tax & Transaction Receipt</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-text-muted font-medium block">Receipt Number</span>
                <span className="font-mono font-bold text-text-ink">{selectedReceipt.receiptNumber || 'FR-OFFICIAL-1002'}</span>
              </div>
              <div>
                <span className="text-text-muted font-medium block">Date & Time</span>
                <span className="font-bold text-text-ink">{new Date(selectedReceipt.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-text-muted font-medium block">Donor Name</span>
                <span className="font-bold text-text-ink">{selectedReceipt.isAnonymous ? 'Anonymous Backer' : user?.name}</span>
              </div>
              <div>
                <span className="text-text-muted font-medium block">Pledge Status</span>
                <span className="font-bold text-emerald-600 uppercase">Succeeded</span>
              </div>
            </div>

            <div className="p-4 bg-black/[0.02] rounded-2xl border border-border-ink/10 space-y-2">
              <span className="text-xs text-text-muted font-medium block">Campaign Title</span>
              <div className="font-display font-bold text-text-ink text-base">{selectedReceipt.campaign?.title}</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-accent-violet/10 rounded-2xl border border-accent-violet/20">
              <span className="font-display font-bold text-text-ink text-sm">Total Contribution</span>
              <span className="font-display font-bold text-accent-violet text-2xl">${selectedReceipt.amount} USD</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-text-ink text-white rounded-full text-xs font-bold flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
