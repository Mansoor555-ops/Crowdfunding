import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input, Textarea, Select, CurrencyInput } from '../components/ui/Input'
import { ImageUploader, GalleryUploader } from '../components/ui/ImageUploader'
import { CampaignCard } from '../components/ui/CampaignCard'
import { api } from '../services/api'
import { Check, Plus, Trash2, ArrowLeft, ArrowRight, Save, ShieldCheck, Lock } from 'lucide-react'

export default function CreateCampaign() {
  const { user, updateUserProfile } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [switchingRole, setSwitchingRole] = useState(false)
  const [autosaveStatus, setAutosaveStatus] = useState('Draft')

  // Campaign State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Tech')
  const [description, setDescription] = useState('')
  const [fundingGoal, setFundingGoal] = useState('100000')
  const [deadline, setDeadline] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })
  const [coverImage, setCoverImage] = useState('')
  const [gallery, setGallery] = useState([])
  const [rewardTiers, setRewardTiers] = useState([
    { title: 'Early Bird Backer', description: 'Exclusive early backer access and digital updates.', minimumAmount: '500', estimatedDelivery: 'Dec 2026' }
  ])

  // Load saved draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('fundrise_campaign_draft')
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        if (draft.title) setTitle(draft.title)
        if (draft.category) setCategory(draft.category)
        if (draft.description) setDescription(draft.description)
        if (draft.fundingGoal) setFundingGoal(draft.fundingGoal)
        if (draft.coverImage) setCoverImage(draft.coverImage)
        if (draft.gallery) setGallery(draft.gallery)
        if (draft.rewardTiers) setRewardTiers(draft.rewardTiers)
      } catch (e) {}
    }
  }, [])

  // Auto-save draft on changes
  useEffect(() => {
    if (title || description || coverImage) {
      setAutosaveStatus('Saving...')
      const timer = setTimeout(() => {
        localStorage.setItem(
          'fundrise_campaign_draft',
          JSON.stringify({ title, category, description, fundingGoal, deadline, coverImage, gallery, rewardTiers })
        )
        setAutosaveStatus('Saved')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [title, category, description, fundingGoal, deadline, coverImage, gallery, rewardTiers])

  const handleRoleUpgrade = async () => {
    setSwitchingRole(true)
    try {
      const res = await api.put('/auth/profile', { role: 'creator' })
      updateUserProfile(res.user)
    } catch (err) {
      alert(err.message || 'Failed to switch account role.')
    } finally {
      setSwitchingRole(false)
    }
  }

  // Strict Role Guard: Only Creator and Admin can access Campaign Wizard
  if (user && user.role === 'donor') {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 max-w-xl mx-auto text-center font-body">
        <div className="p-8 bg-white rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Creator Account Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            You are currently signed in as a <strong>Backer (Donor)</strong>. Only registered Creator accounts are authorized to create and publish campaigns.
          </p>
          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              onClick={handleRoleUpgrade}
              disabled={switchingRole}
              className="w-full font-bold shadow-md shadow-emerald-600/20"
            >
              {switchingRole ? 'Upgrading Account...' : 'Upgrade Account to Creator Mode'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="w-full font-bold"
            >
              Return to Backer Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const addRewardTier = () => {
    setRewardTiers([
      ...rewardTiers,
      { title: '', description: '', minimumAmount: '1000', estimatedDelivery: '' }
    ])
  }

  const removeRewardTier = (index) => {
    setRewardTiers(rewardTiers.filter((_, idx) => idx !== index))
  }

  const updateRewardTier = (index, field, value) => {
    const updated = [...rewardTiers]
    updated[index][field] = value
    setRewardTiers(updated)
  }

  const handleNext = () => {
    setError('')
    if (step === 1) {
      if (title.length < 5) return setError('Title must be at least 5 characters.')
    } else if (step === 2) {
      if (description.length < 20) return setError('Story description must be at least 20 characters.')
    } else if (step === 3) {
      if (!fundingGoal || parseFloat(fundingGoal) < 1) return setError('Funding goal must be at least ₹1.')
      if (!deadline) return setError('Please specify a valid deadline.')
    } else if (step === 5) {
      if (!coverImage) return setError('Please upload a cover image.')
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const parsedGoal = parseFloat(fundingGoal)
      const validRewardTiers = rewardTiers
        .filter((r) => r.title && r.description && parseFloat(r.minimumAmount) > 0)
        .map((r) => ({
          title: r.title,
          description: r.description,
          minimumAmount: parseFloat(r.minimumAmount),
          estimatedDelivery: r.estimatedDelivery || ''
        }))

      const payload = {
        title,
        category,
        description,
        fundingGoal: parsedGoal,
        deadline,
        coverImage,
        gallery,
        rewardTiers: validRewardTiers
      }

      const res = await api.post('/campaigns', payload)
      localStorage.removeItem('fundrise_campaign_draft')

      alert('Campaign created successfully! It is now live on the marketplace.')
      navigate(`/campaigns/${res.campaign.slug}`)
    } catch (err) {
      setError(err.message || 'Failed to submit campaign. Please check required fields.')
    } finally {
      setLoading(false)
    }
  }

  const draftCampaignPreview = {
    title: title || 'Untitled Campaign Title',
    category,
    description: description || 'No project description provided yet.',
    fundingGoal: parseFloat(fundingGoal) || 100000,
    amountRaised: 0,
    deadline: deadline || new Date().toISOString(),
    coverImage: coverImage || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800',
    creator: { name: user?.name || 'Creator', avatar: user?.avatar },
    backersCount: 0,
    status: 'active'
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-12 max-w-5xl mx-auto font-body">
      {/* Step Progress Header */}
      <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
            Creator Campaign Studio • Step {step} of 7
          </span>
          <h1 className="text-3xl font-display font-extrabold text-slate-900">Launch a Campaign</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full self-start">
          <Save className="w-3.5 h-3.5 text-emerald-600" /> {autosaveStatus}
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
          {error}
        </div>
      )}

      {/* Main Wizard Card */}
      <div className="p-8 bg-white rounded-3xl border border-slate-200/90 shadow-xl mb-8 space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-slate-900">1. Basic Campaign Information</h2>
            <Input
              label="Campaign Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. KalaNetra: Preserving Traditional Block Printing Artisans"
              required
            />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={['Tech', 'Creative', 'Community', 'Charity', 'Education', 'Environment', 'Health', 'Business']}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-slate-900">2. Campaign Story & Description</h2>
            <Textarea
              label="Project Story"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your vision, budget breakdown, and why backers should support your campaign..."
              rows={8}
              required
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-slate-900">3. Funding Target & Timeline</h2>
            <CurrencyInput
              label="Target Funding Goal (₹)"
              value={fundingGoal}
              onChange={(e) => setFundingGoal(e.target.value)}
              placeholder="100000"
              required
            />
            <Input
              label="Campaign Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-slate-900">4. Reward Tiers</h2>
              <Button variant="secondary" onClick={addRewardTier} className="h-9 px-4 text-xs font-bold">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Reward Tier
              </Button>
            </div>

            {rewardTiers.map((reward, idx) => (
              <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Tier #{idx + 1}</span>
                  {rewardTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRewardTier(idx)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Reward Title"
                    value={reward.title}
                    onChange={(e) => updateRewardTier(idx, 'title', e.target.value)}
                    placeholder="e.g. Early Supporter Package"
                  />
                  <CurrencyInput
                    label="Minimum Pledge (₹)"
                    value={reward.minimumAmount}
                    onChange={(e) => updateRewardTier(idx, 'minimumAmount', e.target.value)}
                  />
                </div>

                <Textarea
                  label="Tier Description"
                  value={reward.description}
                  onChange={(e) => updateRewardTier(idx, 'description', e.target.value)}
                  placeholder="What deliverables or perks do backers receive?"
                  rows={2}
                />
                <Input
                  label="Estimated Delivery"
                  value={reward.estimatedDelivery}
                  onChange={(e) => updateRewardTier(idx, 'estimatedDelivery', e.target.value)}
                  placeholder="e.g. Nov 2026"
                />
              </div>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-slate-900">5. Campaign Media Upload</h2>
            <ImageUploader
              label="Main Cover Image (URL)"
              value={coverImage}
              onChange={setCoverImage}
            />
            <GalleryUploader
              label="Project Gallery Images"
              value={gallery}
              onChange={setGallery}
            />
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-slate-900">6. Live Card Preview</h2>
            <p className="text-xs text-slate-500">This is how your project card will appear on the discovery marketplace:</p>
            <div className="max-w-sm mx-auto">
              <CampaignCard campaign={draftCampaignPreview} />
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-slate-900">7. Final Review & Launch</h2>
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-2">
              <span className="font-bold block text-sm">Pre-flight Verification Checklist:</span>
              <p>✓ All required fields validated</p>
              <p>✓ Minimum funding goal specified in Indian Rupee (₹)</p>
              <p>✓ Cover image attached</p>
              <p>✓ Automatic verification logs enabled</p>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          {step > 1 ? (
            <Button variant="secondary" onClick={handleBack} className="text-xs font-bold">
              <ArrowLeft className="w-4 h-4 mr-1" /> Previous Step
            </Button>
          ) : <div />}

          {step < 7 ? (
            <Button variant="primary" onClick={handleNext} className="text-xs font-bold shadow-md shadow-emerald-600/20">
              Next Step <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
              className="text-xs font-bold px-8 shadow-lg shadow-emerald-600/30"
            >
              {loading ? 'Publishing Campaign...' : 'Publish Campaign Live'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
