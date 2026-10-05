import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ShieldAlert, FileText, DollarSign, Image } from 'lucide-react'

export default function CreateCampaign() {
  const { user, authFetch } = useContext(AuthContext)
  const navigate = useNavigate()

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Tech')
  const [fundingGoal, setFundingGoal] = useState('')
  const [deadline, setDeadline] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [gallery, setGallery] = useState('')

  const nextStep = () => {
    // Basic validations per step
    if (step === 1) {
      if (title.length < 5) {
        setError('Title must be at least 5 characters long')
        return
      }
      if (description.length < 20) {
        setError('Description must be at least 20 characters long')
        return
      }
    } else if (step === 2) {
      if (!fundingGoal || parseFloat(fundingGoal) <= 0) {
        setError('Funding goal must be a positive number')
        return
      }
      if (!deadline || new Date(deadline) <= new Date()) {
        setError('Deadline must be in the future')
        return
      }
    }
    setError('')
    setStep(step + 1)
  }

  const prevStep = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Final checks
    if (!coverImage.startsWith('http')) {
      setError('Cover Image must be a valid URL starting with http/https')
      setLoading(false)
      return
    }

    const galleryArray = gallery
      ? gallery.split(',').map((url) => url.trim()).filter((url) => url.startsWith('http'))
      : []

    try {
      const res = await authFetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          fundingGoal: parseFloat(fundingGoal),
          deadline,
          coverImage,
          gallery: galleryArray
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create campaign')
      }

      navigate(`/campaigns/${data.campaign.slug}`)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-bg-linen flex items-center justify-center px-6 py-24">
      <Card variant="app-panel" className="w-full max-w-[600px] p-8 md:p-12 border border-text-ink/10">
        
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center pb-6 border-b border-text-ink/5 mb-8">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-accent-violet tracking-widest uppercase">Start a Campaign</span>
            <h2 className="font-display text-xl font-bold tracking-tight text-text-ink">Launch your Project</h2>
          </div>
          <div className="flex gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${step >= 1 ? 'bg-accent-violet' : 'bg-text-ink/10'}`}></span>
            <span className={`w-2.5 h-2.5 rounded-full ${step >= 2 ? 'bg-accent-violet' : 'bg-text-ink/10'}`}></span>
            <span className={`w-2.5 h-2.5 rounded-full ${step >= 3 ? 'bg-accent-violet' : 'bg-text-ink/10'}`}></span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 mb-6">
            <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={16} />
            <span className="text-sm font-medium text-red-700">{error}</span>
          </div>
        )}

        {/* STEP 1: Basic Campaign Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-text-ink mb-2">
              <FileText size={18} className="text-accent-violet" />
              <span className="text-sm font-bold uppercase tracking-wider text-text-secondary">Step 1: Campaign details</span>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-ink" htmlFor="title">
                Campaign Title
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet text-[15px] font-medium text-text-ink transition-colors"
                placeholder="e.g. Linen & Ink: A Minimalist Editorial Magazine"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-ink" htmlFor="category">
                Campaign Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet text-[15px] font-medium text-text-ink transition-colors"
              >
                <option value="Tech">Technology</option>
                <option value="Creative">Creative / Art</option>
                <option value="Community">Community</option>
                <option value="Charity">Charity / NGO</option>
                <option value="Education">Education</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-ink" htmlFor="description">
                Description & Story
              </label>
              <textarea
                id="description"
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet text-[15px] font-medium text-text-ink transition-colors"
                placeholder="Describe your project, funding purpose, and reward milestones..."
              />
            </div>

            <Button onClick={nextStep} variant="primary" className="w-full">
              Continue
            </Button>
          </div>
        )}

        {/* STEP 2: Financial targets & Timelines */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-text-ink mb-2">
              <DollarSign size={18} className="text-accent-violet" />
              <span className="text-sm font-bold uppercase tracking-wider text-text-secondary">Step 2: Financials & Deadline</span>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-ink" htmlFor="goal">
                Funding Goal (USD)
              </label>
              <input
                id="goal"
                type="number"
                min={1}
                required
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
                className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet text-[15px] font-medium text-text-ink transition-colors"
                placeholder="e.g. 25000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-ink" htmlFor="deadline">
                Campaign Deadline
              </label>
              <input
                id="deadline"
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet text-[15px] font-medium text-text-ink transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={prevStep} variant="secondary" type="button">
                Back
              </Button>
              <Button onClick={nextStep} variant="primary" type="button">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Images & Publishing */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-text-ink mb-2">
              <Image size={18} className="text-accent-violet" />
              <span className="text-sm font-bold uppercase tracking-wider text-text-secondary">Step 3: Visual Assets</span>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-ink" htmlFor="cover">
                Cover Image URL
              </label>
              <input
                id="cover"
                type="url"
                required
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet text-[15px] font-medium text-text-ink transition-colors"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-ink" htmlFor="gallery">
                Gallery Images URLs (comma-separated, optional)
              </label>
              <textarea
                id="gallery"
                rows={3}
                value={gallery}
                onChange={(e) => setGallery(e.target.value)}
                className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet text-[15px] font-medium text-text-ink transition-colors"
                placeholder="https://image1.com, https://image2.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={prevStep} variant="secondary" type="button" disabled={loading}>
                Back
              </Button>
              <Button onClick={handleSubmit} variant="primary" type="submit" disabled={loading}>
                {loading ? 'Publishing...' : 'Launch Campaign'}
              </Button>
            </div>
          </div>
        )}

      </Card>
    </div>
  )
}
