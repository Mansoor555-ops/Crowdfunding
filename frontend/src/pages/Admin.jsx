import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ShieldCheck, Eye, Check, Ban, AlertOctagon, Users, DollarSign, Flag, FileText, Search, UserCheck } from 'lucide-react'

export default function Admin() {
  const { user, authFetch } = useContext(AuthContext)
  const navigate = useNavigate()

  // Restrict to admins
  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else if (user.role !== 'admin') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'campaigns' | 'users' | 'payouts' | 'reports' | 'audit'
  const [stats, setStats] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [usersList, setUsersList] = useState([])
  const [payouts, setPayouts] = useState([])
  const [reports, setReports] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  // Rejection modal
  const [rejectionModal, setRejectionModal] = useState({ open: false, type: '', id: '', reason: '' })

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData()
    }
  }, [user, activeTab])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'overview') {
        const res = await authFetch('/api/admin/stats')
        const data = await res.json()
        if (res.ok) setStats(data)
      } else if (activeTab === 'campaigns') {
        const res = await authFetch('/api/admin/campaigns?status=all')
        const data = await res.json()
        if (res.ok) setCampaigns(data.campaigns || [])
      } else if (activeTab === 'users') {
        const res = await authFetch('/api/admin/users')
        const data = await res.json()
        if (res.ok) setUsersList(data.users || [])
      } else if (activeTab === 'payouts') {
        const res = await authFetch('/api/admin/payouts')
        const data = await res.json()
        if (res.ok) setPayouts(data.payouts || [])
      } else if (activeTab === 'reports') {
        const res = await authFetch('/api/admin/reports')
        const data = await res.json()
        if (res.ok) setReports(data.reports || [])
      } else if (activeTab === 'audit') {
        const res = await authFetch('/api/admin/audit-logs')
        const data = await res.json()
        if (res.ok) setAuditLogs(data.logs || [])
      }
    } catch (err) {
      console.error('Error fetching admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCampaignStatus = async (id, status, reason = '') => {
    setMsg('')
    try {
      const res = await authFetch(`/api/admin/campaigns/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason: reason })
      })

      const data = await res.json()
      if (res.ok) {
        setMsg(`Campaign status updated to "${status}"`)
        fetchAdminData()
      } else {
        throw new Error(data.error || 'Failed to update campaign status')
      }
    } catch (err) {
      setMsg(`Error: ${err.message}`)
    }
  }

  const handleToggleUserSuspension = async (id, isSuspended) => {
    setMsg('')
    try {
      const res = await authFetch(`/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuspended: !isSuspended })
      })

      const data = await res.json()
      if (res.ok) {
        setMsg(`User status updated successfully`)
        fetchAdminData()
      } else {
        throw new Error(data.error || 'Failed to update user status')
      }
    } catch (err) {
      setMsg(`Error: ${err.message}`)
    }
  }

  const handleUpdatePayout = async (id, status) => {
    setMsg('')
    try {
      const res = await authFetch(`/api/admin/payouts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const data = await res.json()
      if (res.ok) {
        setMsg(`Payout status updated to "${status}"`)
        fetchAdminData()
      }
    } catch (err) {
      setMsg(`Error: ${err.message}`)
    }
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-24 space-y-10 text-left">
      
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-text-ink/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-accent-violet" size={24} />
          <span className="text-[12px] font-bold text-accent-violet tracking-widest uppercase">Admin Platform</span>
        </div>
        <h1 className="headline-display text-3xl md:text-5xl font-extrabold text-text-ink">
          Administrator Control Center
        </h1>
        <p className="text-text-secondary text-sm font-body">
          Moderate active projects, manage user accounts, approve creator payouts, and inspect immutable audit logs.
        </p>
      </div>

      {msg && (
        <div className="bg-accent-violet/5 border border-accent-violet/20 p-4 rounded-xl text-sm font-semibold text-accent-violet text-center animate-fade-in">
          {msg}
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex bg-bg-linen border border-text-ink/10 p-1.5 rounded-full w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
            activeTab === 'overview' ? 'bg-text-ink text-surface-white' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          Platform Overview
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
            activeTab === 'campaigns' ? 'bg-text-ink text-surface-white' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          Campaign Moderation
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
            activeTab === 'users' ? 'bg-text-ink text-surface-white' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
            activeTab === 'payouts' ? 'bg-text-ink text-surface-white' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          Payout Approvals
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
            activeTab === 'audit' ? 'bg-text-ink text-surface-white' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Loading admin dashboard...</p>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <Card variant="app-panel" className="p-6 space-y-2 border border-text-ink/10">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Total Users</span>
                <p className="font-display text-3xl font-extrabold text-text-ink">{stats.totalUsers}</p>
                <p className="text-xs text-text-secondary">{stats.creatorsCount} Creators · {stats.backersCount} Backers</p>
              </Card>

              <Card variant="app-panel" className="p-6 space-y-2 border border-text-ink/10">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Total Campaigns</span>
                <p className="font-display text-3xl font-extrabold text-text-ink">{stats.totalCampaigns}</p>
                <p className="text-xs text-emerald-600 font-bold">{stats.activeCampaigns} Active · {stats.pendingCampaigns} Pending</p>
              </Card>

              <Card variant="app-panel" className="p-6 space-y-2 border border-text-ink/10">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Total Volume Raised</span>
                <p className="font-display text-3xl font-extrabold text-accent-violet">${stats.totalRaised?.toLocaleString()}</p>
              </Card>

              <Card variant="app-panel" className="p-6 space-y-2 border border-text-ink/10">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Pending Payouts</span>
                <p className="font-display text-3xl font-extrabold text-amber-600">{stats.pendingPayoutsCount}</p>
              </Card>
            </div>
          )}

          {/* TAB 2: CAMPAIGN MODERATION */}
          {activeTab === 'campaigns' && (
            <Card variant="faq" className="overflow-hidden border border-text-ink/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-bg-linen border-b border-text-ink/5 font-bold text-text-ink">
                      <th className="p-4">Title</th>
                      <th className="p-4">Creator</th>
                      <th className="p-4">Goal</th>
                      <th className="p-4">Raised</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-text-ink/5">
                    {campaigns.map((camp) => (
                      <tr key={camp._id} className="hover:bg-bg-linen/30 transition-colors">
                        <td className="p-4 font-bold text-text-ink">
                          <Link to={`/campaigns/${camp.slug}`} className="hover:underline">{camp.title}</Link>
                        </td>
                        <td className="p-4 text-xs font-semibold">{camp.creator?.name || 'Creator'}</td>
                        <td className="p-4 font-semibold">${camp.fundingGoal?.toLocaleString()}</td>
                        <td className="p-4 font-semibold text-accent-violet">${camp.amountRaised?.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                            camp.status === 'active' || camp.status === 'funded' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {camp.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {camp.status === 'pending_review' || camp.status === 'draft' ? (
                            <Button
                              onClick={() => handleUpdateCampaignStatus(camp._id, 'active')}
                              variant="nav-primary"
                              className="bg-emerald-600 border-emerald-600 text-xs h-[32px] px-3"
                            >
                              Approve
                            </Button>
                          ) : null}

                          {camp.status === 'active' && (
                            <Button
                              onClick={() => handleUpdateCampaignStatus(camp._id, 'cancelled')}
                              variant="nav-secondary"
                              className="text-red-500 border-red-200 text-xs h-[32px] px-3"
                            >
                              Cancel Listing
                            </Button>
                          )}
                          <Link to={`/campaigns/${camp.slug}`}>
                            <Button variant="nav-secondary" className="h-[32px] px-2.5 text-xs"><Eye size={12} /></Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 3: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <Card variant="faq" className="overflow-hidden border border-text-ink/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-bg-linen border-b border-text-ink/5 font-bold text-text-ink">
                      <th className="p-4">User Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-text-ink/5">
                    {usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-bg-linen/30 transition-colors">
                        <td className="p-4 font-bold text-text-ink">{u.name}</td>
                        <td className="p-4 text-xs text-text-secondary">{u.email}</td>
                        <td className="p-4">
                          <span className="text-[10px] font-bold bg-accent-violet/10 text-accent-violet px-2.5 py-1 rounded-full uppercase">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            u.isSuspended ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {u.isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {u.role !== 'admin' && (
                            <Button
                              onClick={() => handleToggleUserSuspension(u._id, u.isSuspended)}
                              variant="nav-secondary"
                              className={`h-[32px] px-3 text-xs ${u.isSuspended ? 'text-emerald-600' : 'text-red-500'}`}
                            >
                              {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 4: PAYOUT APPROVALS */}
          {activeTab === 'payouts' && (
            <Card variant="faq" className="overflow-hidden border border-text-ink/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-bg-linen border-b border-text-ink/5 font-bold text-text-ink">
                      <th className="p-4">Creator</th>
                      <th className="p-4">Campaign</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Platform Fee</th>
                      <th className="p-4">Net Payout</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-text-ink/5">
                    {payouts.map((p) => (
                      <tr key={p._id} className="hover:bg-bg-linen/30 transition-colors">
                        <td className="p-4 font-bold text-text-ink">{p.creator?.name}</td>
                        <td className="p-4 text-xs font-semibold">{p.campaign?.title}</td>
                        <td className="p-4 font-bold">${p.amount}</td>
                        <td className="p-4 text-xs text-red-500">-${p.platformFee}</td>
                        <td className="p-4 font-bold text-emerald-600">${p.netAmount}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {p.status === 'requested' && (
                            <>
                              <Button
                                onClick={() => handleUpdatePayout(p._id, 'approved')}
                                variant="nav-primary"
                                className="bg-emerald-600 border-emerald-600 text-xs h-[32px] px-3"
                              >
                                Approve Payout
                              </Button>
                              <Button
                                onClick={() => handleUpdatePayout(p._id, 'rejected')}
                                variant="nav-secondary"
                                className="text-red-500 text-xs h-[32px] px-3"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <Card variant="faq" className="overflow-hidden border border-text-ink/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-bg-linen border-b border-text-ink/5 font-bold text-text-ink">
                      <th className="p-4">Actor</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Target Type</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-text-ink/5 font-mono text-xs">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-bg-linen/30 transition-colors">
                        <td className="p-4 font-bold text-text-ink">{log.actor?.name || 'System'}</td>
                        <td className="p-4 font-bold text-accent-violet">{log.action}</td>
                        <td className="p-4 text-text-secondary">{log.targetType} ({log.targetId?.slice(-6)})</td>
                        <td className="p-4 text-text-muted">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

    </div>
  )
}
