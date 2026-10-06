import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Input, Textarea, Select } from '../components/ui/Input'
import { ImageUploader } from '../components/ui/ImageUploader'
import { Avatar, Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Tabs } from '../components/ui/Tabs'
import { api } from '../services/api'
import { ShieldCheck, User as UserIcon, Sparkles } from 'lucide-react'

export default function Profile() {
  const { user, updateUserProfile } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const [activeTab, setActiveTab] = useState('profile')
  const [name, setName] = useState(user?.name || '')
  const [role, setRole] = useState(user?.role || 'donor')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordErr, setPasswordErr] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setRole(user.role || 'donor')
      setBio(user.bio || '')
      setAvatar(user.avatar || '')
    }
  }, [user])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg('')
    try {
      const res = await api.put('/auth/profile', { name, role, bio, avatar })
      updateUserProfile(res.user)
      setProfileMsg('Profile and account role updated successfully.')
    } catch (err) {
      setProfileMsg(err.message || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordErr('')
    setPasswordMsg('')

    if (newPassword !== confirmPassword) {
      return setPasswordErr('New passwords do not match.')
    }

    if (newPassword.length < 6) {
      return setPasswordErr('New password must be at least 6 characters.')
    }

    setSavingPassword(true)
    try {
      const res = await api.post('/auth/change-password', { currentPassword, newPassword })
      setPasswordMsg(res.message || 'Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordErr(err.message || 'Failed to change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-12 max-w-4xl mx-auto font-body">
      {/* Header Profile Summary */}
      <div className="p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm mb-10 flex flex-col sm:flex-row items-center gap-6">
        <Avatar src={avatar} name={name} size="xl" />
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-display font-bold text-slate-900">{name}</h1>
            <Badge variant="active" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              {role === 'donor' ? 'Backer (Donor)' : role === 'creator' ? 'Verified Creator' : 'Administrator'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">{user?.email}</p>
          {bio && <p className="text-xs text-slate-600 pt-1 max-w-md">{bio}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <Tabs
          tabs={[
            { id: 'profile', label: 'Profile & Account Role' },
            { id: 'security', label: 'Security & Password' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <h3 className="text-xl font-display font-bold text-slate-900">Account Details & Role</h3>

          {profileMsg && <p className="text-xs font-semibold text-emerald-600">{profileMsg}</p>}

          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />

          {/* Account Role Selector */}
          {user?.role !== 'admin' && (
            <Select
              label="Account Role Type"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { label: '🎁 Backer Account (Fund projects, save bookmarks & receive rewards)', value: 'donor' },
                { label: '🚀 Creator Account (Create campaigns, post updates & request payouts)', value: 'creator' }
              ]}
            />
          )}

          <ImageUploader label="Avatar Photo" value={avatar} onChange={setAvatar} />
          <Textarea label="Bio Summary" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={savingProfile}
              className="px-8 font-bold"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <h3 className="text-xl font-display font-bold text-slate-900">Change Password</h3>

          {passwordMsg && <p className="text-xs font-semibold text-emerald-600">{passwordMsg}</p>}
          {passwordErr && <p className="text-xs font-semibold text-rose-600">{passwordErr}</p>}

          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={savingPassword}
              className="px-8 font-bold"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
