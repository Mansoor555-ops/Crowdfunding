import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Bell, CheckCheck, Sparkles, AlertCircle, ArrowRight } from 'lucide-react'

export default function Notifications() {
  const { user, authFetch } = useContext(AuthContext)
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else {
      fetchNotifications()
    }
  }, [user, navigate])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await authFetch('/api/notifications')
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      const res = await authFetch(`/api/notifications/${id}/read`, { method: 'PUT' })
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error marking notification read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const res = await authFetch('/api/notifications/read-all', { method: 'PUT' })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Error marking all notifications read:', err)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-[850px] mx-auto px-6 py-24 space-y-8 text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-text-ink/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bell className="text-accent-violet" size={20} />
            <span className="text-xs font-bold text-accent-violet tracking-widest uppercase">Activity Notifications</span>
          </div>
          <h1 className="headline-display text-3xl font-extrabold text-text-ink">Notifications</h1>
        </div>

        {unreadCount > 0 && (
          <Button onClick={handleMarkAllRead} variant="nav-secondary" className="text-xs flex items-center gap-1.5">
            <CheckCheck size={14} /> Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <p className="text-sm text-text-secondary">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <Card variant="faq" className="p-12 text-center text-text-secondary space-y-3">
          <Bell className="mx-auto text-text-muted" size={32} />
          <h3 className="font-bold text-base text-text-ink">All caught up!</h3>
          <p className="text-xs max-w-[320px] mx-auto">You have no new notifications right now. Activity on your campaigns or backed projects will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif._id}
              variant="app-panel"
              className={`p-5 flex items-start justify-between gap-4 border transition-colors ${
                notif.isRead ? 'border-text-ink/5 bg-surface-white' : 'border-accent-violet/30 bg-accent-violet/[0.02]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  notif.isRead ? 'bg-bg-linen text-text-muted' : 'bg-accent-violet text-white'
                }`}>
                  <Sparkles size={14} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-text-ink">{notif.title}</h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-accent-violet"></span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-text-muted block pt-1">{new Date(notif.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {notif.link && (
                  <Link to={notif.link}>
                    <Button variant="nav-secondary" className="h-[32px] px-3 text-xs">
                      View <ArrowRight size={12} />
                    </Button>
                  </Link>
                )}
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="text-xs font-bold text-text-secondary hover:text-text-ink p-1"
                    title="Mark read"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  )
}
