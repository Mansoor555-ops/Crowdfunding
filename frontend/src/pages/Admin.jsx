import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ShieldCheck, Eye, ToggleLeft, Ban, AlertOctagon } from 'lucide-react'

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

  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminCampaigns()
    }
  }, [user])

  const fetchAdminCampaigns = async () => {
    setLoading(true)
    try {
      const res = await authFetch('/api/campaigns?status=all&limit=20')
      const data = await res.json()
      if (res.ok) {
        setCampaigns(data.campaigns || [])
      }
    } catch (err) {
      console.error('Error fetching admin campaigns:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    setMsg('')
    try {
      const res = await authFetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const data = await res.json()
      if (res.ok) {
        setMsg(`Campaign status updated successfully to "${status}"`)
        fetchAdminCampaigns()
      } else {
        throw new Error(data.error || 'Failed to update campaign')
      }
    } catch (err) {
      setMsg(`Error: ${err.message}`)
    }
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-24 space-y-10">
      
      {/* Admin header */}
      <div className="space-y-2 pb-6 border-b border-text-ink/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-accent-violet" size={24} />
          <span className="text-[12px] font-bold text-accent-violet tracking-widest uppercase">Compliance & Auditing</span>
        </div>
        <h1 className="headline-display text-3xl md:text-5xl font-bold tracking-tight text-text-ink">
          Administrator Control Center
        </h1>
        <p className="text-text-secondary text-sm md:text-base font-body">
          Moderate active projects, evaluate goals, and manage campaign listings.
        </p>
      </div>

      {msg && (
        <div className="bg-accent-violet/5 border border-accent-violet/20 p-4 rounded-xl text-sm font-semibold text-accent-violet text-center animate-fade-in">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-text-secondary font-medium">
          Loading moderation dashboard...
        </div>
      ) : (
        <Card variant="faq" className="overflow-hidden border border-text-ink/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-bg-linen border-b border-text-ink/5 text-text-ink font-bold">
                  <th className="p-4 font-semibold">Campaign Title</th>
                  <th className="p-4 font-semibold">Creator</th>
                  <th className="p-4 font-semibold">Goal Target</th>
                  <th className="p-4 font-semibold">Raised Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-text-ink/5">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-secondary font-medium">
                      No campaigns registered in database.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((camp) => (
                    <tr key={camp._id} className="hover:bg-bg-linen/30 transition-colors text-text-secondary">
                      {/* Title */}
                      <td className="p-4 font-bold text-text-ink">
                        <Link to={`/campaigns/${camp.slug}`} className="hover:underline">{camp.title}</Link>
                      </td>
                      
                      {/* Creator */}
                      <td className="p-4 font-medium text-xs">
                        {camp.creator?.name || 'Unknown'}<br />
                        <span className="text-text-muted">{camp.creator?.email || 'N/A'}</span>
                      </td>

                      {/* Goal */}
                      <td className="p-4 font-semibold text-text-ink">
                        ${camp.fundingGoal.toLocaleString()}
                      </td>

                      {/* Raised */}
                      <td className="p-4 font-semibold text-text-ink">
                        ${camp.amountRaised.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                          camp.status === 'active' || camp.status === 'funded'
                            ? 'bg-emerald-50 text-emerald-600'
                            : camp.status === 'draft'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-red-50 text-red-500'
                        }`}>
                          {camp.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-2">
                        {camp.status === 'draft' && (
                          <Button 
                            onClick={() => handleUpdateStatus(camp._id, 'active')}
                            variant="nav-primary"
                            className="bg-emerald-600 border-emerald-600 text-xs h-[32px] px-4"
                          >
                            Approve
                          </Button>
                        )}
                        
                        {(camp.status === 'active' || camp.status === 'draft') && (
                          <Button 
                            onClick={() => handleUpdateStatus(camp._id, 'cancelled')}
                            variant="nav-secondary"
                            className="text-red-500 border-red-200 hover:bg-red-50 text-xs h-[32px] px-4"
                          >
                            Flag / Cancel
                          </Button>
                        )}

                        <Link to={`/campaigns/${camp.slug}`}>
                          <Button variant="nav-secondary" className="h-[32px] px-3.5">
                            <Eye size={12} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </div>
  )
}
