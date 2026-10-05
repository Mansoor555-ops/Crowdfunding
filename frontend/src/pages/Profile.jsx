import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { User, Heart, Settings, Check, AlertCircle, Bookmark, Shield } from 'lucide-react'

export default function Profile() {
  const { user, setUser, authFetch } = useContext(AuthContext)
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('settings') // 'settings' | 'bookmarks'
  const [bookmarks, setBookmarks] = useState([])
  const [loadingBookmarks, setLoadingBookmarks] = useState(false)

  // Form states
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else {
      setName(user.name || '')
      setBio(user.bio || '')
      setAvatar(user.avatar || '')
      fetchBookmarks()
    }
  }, [user, navigate])

  const fetchBookmarks = async () => {
    setLoadingBookmarks(true)
    try {
      const res = await authFetch('/api/campaigns/bookmarks/my-bookmarks')
      const data = await res.json()
      if (res.ok) {
        setBookmarks(data.bookmarks || [])
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err)
    } finally {
      setLoadingBookmarks(false)
    }
  }

  const handleRemoveBookmark = async (campaignId) => {
    try {
      const res = await authFetch(`/api/campaigns/${campaignId}/bookmark`, { method: 'POST' })
      if (res.ok) {
        setBookmarks(prev => prev.filter(c => c._id !== campaignId))
      }
    } catch (err) {
      console.error('Error removing bookmark:', err)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    setSaving(true)

    try {
      // Update local storage user session
      const updatedUser = { ...user, name, bio, avatar }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      setMsg({ type: 'success', text: 'Profile settings updated successfully!' })
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update profile settings.' })
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-24 space-y-10 text-left">
      
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-text-ink/10">
        <div className="flex items-center gap-4">
          <img
            src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-2 border-accent-violet/20 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl font-extrabold text-text-ink">{user.name}</h1>
              <span className="text-[10px] font-bold text-accent-violet bg-accent-violet/10 px-2.5 py-1 rounded-full uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-text-secondary">{user.email}</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-bg-linen border border-text-ink/10 p-1.5 rounded-full">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-text-ink text-surface-white'
                : 'text-text-secondary hover:text-text-ink'
            }`}
          >
            <Settings size={14} /> Profile Settings
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-5 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'bookmarks'
                ? 'bg-text-ink text-surface-white'
                : 'text-text-secondary hover:text-text-ink'
            }`}
          >
            <Bookmark size={14} /> Saved Projects ({bookmarks.length})
          </button>
        </div>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* TAB 1: SETTINGS */}
      {activeTab === 'settings' && (
        <Card variant="app-panel" className="p-8 border border-text-ink/10 max-w-[650px]">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <h2 className="font-display text-xl font-bold text-text-ink">Account Preferences</h2>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-ink uppercase tracking-wider block">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-bg-linen rounded-xl border border-text-ink/10 text-sm font-medium text-text-ink focus:outline-none focus:border-accent-violet"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-ink uppercase tracking-wider block">Avatar Photo URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-3 bg-bg-linen rounded-xl border border-text-ink/10 text-sm font-medium text-text-ink focus:outline-none focus:border-accent-violet"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-ink uppercase tracking-wider block">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself..."
                className="w-full px-4 py-3 bg-bg-linen rounded-xl border border-text-ink/10 text-sm font-medium text-text-ink focus:outline-none focus:border-accent-violet resize-none"
              />
            </div>

            <Button type="submit" variant="primary" disabled={saving} className="w-full h-[48px]">
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </form>
        </Card>
      )}

      {/* TAB 2: BOOKMARKS */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-6">
          <h2 className="font-display text-xl font-bold text-text-ink">Saved Campaigns</h2>

          {loadingBookmarks ? (
            <p className="text-text-secondary text-sm">Loading saved projects...</p>
          ) : bookmarks.length === 0 ? (
            <Card variant="faq" className="p-12 text-center text-text-secondary space-y-4">
              <Heart className="mx-auto text-text-muted" size={32} />
              <p className="text-sm font-medium">You haven't saved any campaigns yet.</p>
              <Link to="/campaigns">
                <Button variant="secondary">Browse Projects</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookmarks.map((camp) => (
                <Card key={camp._id} variant="app-panel" className="p-5 flex items-center gap-4 border border-text-ink/10">
                  <img
                    src={camp.coverImage}
                    alt={camp.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-accent-violet uppercase">{camp.category}</span>
                    <h3 className="font-bold text-sm text-text-ink line-clamp-1 hover:text-accent-violet">
                      <Link to={`/campaigns/${camp.slug}`}>{camp.title}</Link>
                    </h3>
                    <p className="text-xs text-text-secondary">${camp.amountRaised?.toLocaleString()} raised</p>
                  </div>
                  <button
                    onClick={() => handleRemoveBookmark(camp._id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors shrink-0"
                    title="Remove from saved"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
