import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Stat, DataTable } from '../components/ui/DataTable'
import { Tabs } from '../components/ui/Tabs'
import { Modal } from '../components/ui/Modal'
import { Input, Select, Textarea } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Progress'
import { Badge, Avatar } from '../components/ui/Badge'
import { api } from '../services/api'
import { ShieldCheck, Users, DollarSign, AlertTriangle } from 'lucide-react'

export default function Admin() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
    else if (user.role !== 'admin') navigate('/dashboard')
  }, [user, navigate])

  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({ totalUsers: 0, totalCampaigns: 0, activeCampaigns: 0, pendingCampaigns: 0, totalRaised: 0, pendingPayoutsCount: 0, pendingReportsCount: 0 })
  const [campaigns, setCampaigns] = useState([])
  const [usersList, setUsersList] = useState([])
  const [payouts, setPayouts] = useState([])
  const [reports, setReports] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Rejection/Reason Modal state
  const [actionModal, setActionModal] = useState({ open: false, type: '', id: '', title: '', reason: '' })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true)
      try {
        if (activeTab === 'overview') {
          const res = await api.get('/admin/stats').catch(() => ({}))
          if (res.totalUsers !== undefined) setStats(res)
        } else if (activeTab === 'campaigns') {
          const res = await api.get('/admin/campaigns?status=all').catch(() => ({ campaigns: [] }))
          setCampaigns(res.campaigns || [])
        } else if (activeTab === 'users') {
          const res = await api.get('/admin/users').catch(() => ({ users: [] }))
          setUsersList(res.users || [])
        } else if (activeTab === 'payouts') {
          const res = await api.get('/admin/payouts').catch(() => ({ payouts: [] }))
          setPayouts(res.payouts || [])
        } else if (activeTab === 'reports') {
          const res = await api.get('/admin/reports').catch(() => ({ reports: [] }))
          setReports(res.reports || [])
        } else if (activeTab === 'audit') {
          const res = await api.get('/admin/audit-logs').catch(() => ({ logs: [] }))
          setAuditLogs(res.logs || [])
        }
      } catch (err) {
        console.error('Admin data load error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user && user.role === 'admin') loadAdminData()
  }, [user, activeTab])

  const handleUpdateCampaignStatus = async (id, status, rejectionReason = '') => {
    try {
      await api.put(`/admin/campaigns/${id}/status`, { status, rejectionReason })
      setCampaigns(campaigns.map((c) => (c._id === id ? { ...c, status, rejectionReason } : c)))
      setActionModal({ open: false, type: '', id: '', title: '', reason: '' })
      alert(`Campaign status updated to ${status}.`)
    } catch (err) {
      alert(err.message || 'Failed to update campaign status.')
    }
  }

  const handleToggleUserSuspension = async (userId, isSuspended) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isSuspended })
      setUsersList(usersList.map((u) => (u._id === userId ? { ...u, isSuspended } : u)))
      alert(`User ${isSuspended ? 'suspended' : 'unsuspended'} successfully.`)
    } catch (err) {
      alert(err.message || 'Failed to update user status.')
    }
  }

  const handleUpdatePayoutStatus = async (payoutId, status, rejectionReason = '') => {
    try {
      await api.put(`/admin/payouts/${payoutId}/status`, { status, rejectionReason })
      setPayouts(payouts.map((p) => (p._id === payoutId ? { ...p, status, rejectionReason } : p)))
      setActionModal({ open: false, type: '', id: '', title: '', reason: '' })
      alert(`Payout status updated to ${status}.`)
    } catch (err) {
      alert(err.message || 'Failed to update payout status.')
    }
  }

  const handleUpdateReportStatus = async (reportId, status) => {
    try {
      await api.put(`/admin/reports/${reportId}/status`, { status })
      setReports(reports.map((r) => (r._id === reportId ? { ...r, status } : r)))
      alert(`Report status updated to ${status}.`)
    } catch (err) {
      alert(err.message || 'Failed to update report status.')
    }
  }

  const campaignColumns = [
    {
      header: 'Campaign Title',
      accessorKey: 'title',
      cell: (row) => (
        <Link to={`/campaigns/${row.slug}`} className="font-bold text-text-ink hover:text-accent-violet">
          {row.title}
        </Link>
      )
    },
    {
      header: 'Creator',
      accessorKey: 'creator',
      cell: (row) => row.creator?.name || 'Unknown'
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (row) => <Badge variant="info">{row.category}</Badge>
    },
    {
      header: 'Funding Goal',
      accessorKey: 'fundingGoal',
      cell: (row) => `$${row.fundingGoal?.toLocaleString()}`
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <Badge variant={row.status}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          {row.status === 'pending_review' && (
            <>
              <button
                onClick={() => handleUpdateCampaignStatus(row._id, 'active')}
                className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700"
              >
                Approve
              </button>
              <button
                onClick={() => setActionModal({ open: true, type: 'reject_campaign', id: row._id, title: row.title, reason: '' })}
                className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700"
              >
                Reject
              </button>
            </>
          )}
          {row.status === 'active' && (
            <button
              onClick={() => handleUpdateCampaignStatus(row._id, 'cancelled', 'Cancelled by administrator.')}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold hover:bg-red-200"
            >
              Cancel
            </button>
          )}
        </div>
      )
    }
  ]

  const userColumns = [
    {
      header: 'User Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} name={row.name} size="sm" />
          <span className="font-semibold text-text-ink">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: (row) => row.email
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: (row) => <Badge variant={row.role === 'admin' ? 'active' : 'info'}>{row.role}</Badge>
    },
    {
      header: 'Status',
      accessorKey: 'isSuspended',
      cell: (row) => <Badge variant={row.isSuspended ? 'rejected' : 'active'}>{row.isSuspended ? 'Suspended' : 'Active'}</Badge>
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => handleToggleUserSuspension(row._id, !row.isSuspended)}
          disabled={row.role === 'admin'}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all disabled:opacity-30 ${
            row.isSuspended ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          {row.isSuspended ? 'Unsuspend' : 'Suspend'}
        </button>
      )
    }
  ]

  const payoutColumns = [
    {
      header: 'Creator',
      accessorKey: 'creator',
      cell: (row) => row.creator?.name || 'Unknown'
    },
    {
      header: 'Campaign',
      accessorKey: 'campaign',
      cell: (row) => row.campaign?.title || 'Unknown'
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (row) => <span className="font-bold text-text-ink">${row.amount}</span>
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
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          {row.status === 'requested' && (
            <>
              <button
                onClick={() => handleUpdatePayoutStatus(row._id, 'approved')}
                className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700"
              >
                Approve Payout
              </button>
              <button
                onClick={() => setActionModal({ open: true, type: 'reject_payout', id: row._id, title: row.campaign?.title || '', reason: '' })}
                className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700"
              >
                Reject Payout
              </button>
            </>
          )}
        </div>
      )
    }
  ]

  const reportColumns = [
    {
      header: 'Campaign',
      accessorKey: 'campaign',
      cell: (row) => row.campaign?.title || 'Reported Campaign'
    },
    {
      header: 'Reason',
      accessorKey: 'reason',
      cell: (row) => <Badge variant="pending">{row.reason}</Badge>
    },
    {
      header: 'Details',
      accessorKey: 'details',
      cell: (row) => <span className="text-xs text-text-secondary line-clamp-2">{row.details}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <Badge variant={row.status}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleUpdateReportStatus(row._id, 'reviewed')}
                className="px-3 py-1 bg-text-ink text-white rounded-full text-xs font-bold"
              >
                Mark Reviewed
              </button>
              <button
                onClick={() => handleUpdateReportStatus(row._id, 'dismissed')}
                className="px-3 py-1 bg-black/5 text-text-ink rounded-full text-xs font-bold"
              >
                Dismiss
              </button>
            </>
          )}
        </div>
      )
    }
  ]

  const auditColumns = [
    {
      header: 'Timestamp',
      accessorKey: 'createdAt',
      cell: (row) => new Date(row.createdAt).toLocaleString()
    },
    {
      header: 'Actor',
      accessorKey: 'actor',
      cell: (row) => row.actor?.email || 'System'
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (row) => <span className="font-mono text-xs font-bold text-accent-violet">{row.action}</span>
    },
    {
      header: 'Target Type',
      accessorKey: 'targetType',
      cell: (row) => row.targetType
    }
  ]

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-violet block mb-1">
            Platform Administration Console
          </span>
          <h1 className="text-3xl font-display font-bold text-text-ink">Admin Control Center</h1>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Stat title="Total Users" value={stats.totalUsers.toString()} icon={Users} />
        <Stat title="Total Campaigns" value={stats.totalCampaigns.toString()} icon={ShieldCheck} />
        <Stat title="Total Pledged" value={`$${stats.totalRaised.toLocaleString()}`} icon={DollarSign} />
        <Stat title="Pending Moderation" value={stats.pendingCampaigns.toString()} icon={AlertTriangle} />
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <Tabs
          tabs={[
            { id: 'overview', label: 'Platform Summary' },
            { id: 'campaigns', label: `Campaign Queue (${stats.pendingCampaigns} pending)` },
            { id: 'users', label: 'User Directory' },
            { id: 'payouts', label: `Payout Requests (${stats.pendingPayoutsCount})` },
            { id: 'reports', label: `Flagged Reports (${stats.pendingReportsCount})` },
            { id: 'audit', label: 'Immutable Audit Log' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="p-8 bg-surface-white rounded-3xl border border-border-ink/10 space-y-6">
              <h3 className="text-xl font-display font-bold text-text-ink">Platform Status & Security Overview</h3>
              <p className="text-sm text-text-secondary">
                All platform actions, payouts, and status transitions are recorded in the immutable audit log.
              </p>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <DataTable columns={campaignColumns} data={campaigns} emptyMessage="No campaigns matching filter." />
          )}

          {activeTab === 'users' && (
            <DataTable columns={userColumns} data={usersList} emptyMessage="No user records found." />
          )}

          {activeTab === 'payouts' && (
            <DataTable columns={payoutColumns} data={payouts} emptyMessage="No payout requests found." />
          )}

          {activeTab === 'reports' && (
            <DataTable columns={reportColumns} data={reports} emptyMessage="No flagged campaign reports." />
          )}

          {activeTab === 'audit' && (
            <DataTable columns={auditColumns} data={auditLogs} emptyMessage="No audit logs available." />
          )}
        </>
      )}

      {/* Rejection / Action Reason Modal */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, type: '', id: '', title: '', reason: '' })}
        title="Specify Rejection Reason"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-secondary">
            Please enter a mandatory rejection reason to inform the creator regarding "{actionModal.title}":
          </p>
          <Textarea
            value={actionModal.reason}
            onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
            placeholder="Reason for rejection or cancellation..."
            rows={4}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setActionModal({ open: false, type: '', id: '', title: '', reason: '' })}
              className="px-5 py-2.5 border border-border-ink/20 rounded-full text-xs font-bold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!actionModal.reason.trim()) return alert('Please enter a reason.')
                if (actionModal.type === 'reject_campaign') {
                  handleUpdateCampaignStatus(actionModal.id, 'rejected', actionModal.reason)
                } else if (actionModal.type === 'reject_payout') {
                  handleUpdatePayoutStatus(actionModal.id, 'rejected', actionModal.reason)
                }
              }}
              className="px-5 py-2.5 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
