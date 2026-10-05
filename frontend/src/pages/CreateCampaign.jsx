import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input, Textarea, Select, CurrencyInput } from '../components/ui/Input'
import { ImageUploader, GalleryUploader } from '../components/ui/ImageUploader'
import { CampaignCard } from '../components/ui/CampaignCard'
import { api } from '../services/api'
import { Check, Plus, Trash2, ArrowLeft, ArrowRight, Save, Sparkles, ShieldCheck } from 'lucide-react'

export default function CreateCampaign() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [autosaveStatus, setAutosaveStatus] = useState('Draft')

  // Campaign State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Tech')
  const [description, setDescription] = useState('')
  const [fundingGoal, setFundingGoal] = useState('10000')
  const [deadline, setDeadline] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })
  const [coverImage, setCoverImage] = useState('')
  const [gallery, setGallery] = useState([])
  const [rewardTiers, setRewardTiers] = useState([
    { title: 'Early Bird Backer', description: 'Exclusive early backer access and digital updates.', minimumAmount: '25', estimatedDelivery: 'Dec 2026' }
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

  const addRewardTier = () => {
    setRewardTiers([
      ...rewardTiers,
      { title: '', description: '', minimumAmount: '50', estimatedDelivery: '' }
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
      if (!fundingGoal || parseFloat(fundingGoal) < 1) return setError('Funding goal must be at least $1.')
      if (!deadline) return setError('Please specify a valid deadline.')
    } else if (step === 5) {
      if (!coverImage) return setError('Please upload a cover image.')
    }
    setStep(step + 1)
  }

  const handlePrev = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (isDraft = false) => {
    setError('')
    setLoading(true)

    try {
      const payload = {
        title,
        category,
        description,
        fundingGoal: parseFloat(fundingGoal),
        deadline,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        gallery,
        rewardTiers: rewardTiers.map(r => ({
          ...r,
          minimumAmount: parseFloat(r.minimumAmount || '1')
        })),
        status: isDraft ? 'draft' : 'pending_review'
      }

      const res = await api.post('/campaigns', payload)
      localStorage.removeItem('fundrise_campaign_draft')
      alert(isDraft ? 'Draft saved successfully!' : 'Campaign submitted successfully for admin review!')
      navigate(`/campaigns/${res.campaign.slug}`)
    } catch (err) {
      setError(err.message || 'Failed to save campaign.')
    } finally {
      setLoading(false)
    }
  }

  const stepsList = [
    { num: 1, label: 'Basics' },
    { num: 2, label: 'Story' },
    { num: 3, label: 'Funding' },
    { num: 4, label: 'Rewards' },
    { num: 5, label: 'Media' },
    { num: 6, label: 'Preview' },
    { num: 7, label: 'Submit' }
  ]

  const mockPreviewCampaign = {
    _id: 'preview',
    title: title || 'Untitled Campaign',
    slug: 'preview',
    category,
    description: description || 'No story details entered yet.',
    fundingGoal: parseFloat(fundingGoal || '10000'),
    amountRaised: 0,
    backersCount: 0,
    deadline: deadline || new Date().toISOString(),
    coverImage: coverImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    creator: { name: user?.name || 'Creator', avatar: user?.avatar },
    status: 'draft'
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 lg:px-12 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-border-ink/10 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-violet block">
            Campaign Creator Wizard
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-ink">Launch Your Campaign</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-text-muted bg-surface-white px-3 py-1.5 rounded-full border border-border-ink/10">
          <Save className="w-3.5 h-3.5 text-accent-violet" /> Autosave: {autosaveStatus}
        </div>
      </div>

      {/* Progress Steps Header */}
      <div className="flex items-center justify-between mb-10 overflow-x-auto pb-4 no-scrollbar">
        {stepsList.map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                s.num === step
                  ? 'bg-text-ink text-white shadow-md'
                  : s.num < step
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-black/5 text-text-muted'
              }`}
            >
              {s.num < step ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-xs font-semibold whitespace-nowrap ${s.num === step ? 'text-text-ink' : 'text-text-muted'}`}>
              {s.label}
            </span>
            {s.num < 7 && <div className="w-6 h-px bg-border-ink/10 hidden sm:block" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-medium text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Wizard Form Panels */}
      <div className="bg-surface-white p-8 sm:p-10 rounded-3xl border border-border-ink/10 shadow-sm mb-8">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-text-ink">1. Project Basics</h3>
            <Input
              label="Campaign Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Orbital Key: Zero-Gravity EDC Carabiner"
              required
            />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={['Tech', 'Creative', 'Community', 'Charity', 'Education', 'Health', 'Environment', 'Business']}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-text-ink">2. Campaign Story</h3>
            <Textarea
              label="Detailed Pitch & Story"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why your campaign matters, budget details, timeline, and goals..."
              rows={8}
              required
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-text-ink">3. Funding & Timeline</h3>
            <CurrencyInput
              label="Funding Goal (USD)"
              value={fundingGoal}
              onChange={(e) => setFundingGoal(e.target.value)}
              required
            />
            <Input
              label="Campaign Deadline Date"
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
              <h3 className="text-xl font-display font-bold text-text-ink">4. Reward Tiers</h3>
              <button
                type="button"
                onClick={addRewardTier}
                className="px-4 py-2 bg-black/5 hover:bg-black/10 text-text-ink rounded-full text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Tier
              </button>
            </div>

            {rewardTiers.map((reward, idx) => (
              <div key={idx} className="p-6 bg-black/[0.02] rounded-2xl border border-border-ink/10 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-text-ink">Reward Tier #{idx + 1}</h4>
                  {rewardTiers.length > 1 && (
                    <button onClick={() => removeRewardTier(idx)} className="text-red-500 hover:text-red-700 text-xs">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Input
                  label="Tier Title"
                  value={reward.title}
                  onChange={(e) => updateRewardTier(idx, 'title', e.target.value)}
                  placeholder="e.g. Early Bird Pass"
                />
                <Textarea
                  label="Tier Description"
                  value={reward.description}
                  onChange={(e) => updateRewardTier(idx, 'description', e.target.value)}
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-4">
                  <CurrencyInput
                    label="Minimum Amount"
                    value={reward.minimumAmount}
                    onChange={(e) => updateRewardTier(idx, 'minimumAmount', e.target.value)}
                  />
                  <Input
                    label="Estimated Delivery"
                    value={reward.estimatedDelivery}
                    onChange={(e) => updateRewardTier(idx, 'estimatedDelivery', e.target.value)}
                    placeholder="Dec 2026"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-text-ink">5. Media & Uploads</h3>
            <ImageUploader label="Primary Cover Image" value={coverImage} onChange={setCoverImage} />
            <GalleryUploader label="Additional Gallery Images" images={gallery} onChange={setGallery} />
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-text-ink">6. Preview Card</h3>
            <p className="text-xs text-text-secondary">This is how your campaign will appear on the Discover marketplace:</p>
            <div className="max-w-md mx-auto">
              <CampaignCard campaign={mockPreviewCampaign} />
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 bg-accent-violet/10 text-accent-violet rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-display font-bold text-text-ink">Ready for Submission</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Submit your campaign for platform review. Administrators will review content guidelines before making it active.
            </p>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="px-6 py-3 rounded-full border border-border-ink/20 text-xs font-bold text-text-ink hover:bg-black/5"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="px-8 py-3 bg-text-ink text-white rounded-full text-xs font-bold hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={handlePrev}
            className="px-6 py-3 rounded-full border border-border-ink/20 text-xs font-bold text-text-ink flex items-center gap-2 hover:bg-black/5"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
        ) : <div />}

        {step < 7 && (
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-text-ink text-white rounded-full text-xs font-bold flex items-center gap-2 hover:opacity-90"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
