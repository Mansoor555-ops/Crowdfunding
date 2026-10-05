import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { CampaignCard } from '../components/ui/CampaignCard'
import { Reveal } from '../components/ui/Reveal'
import { AnimatedCounter } from '../components/ui/AnimatedCounter'
import { Skeleton } from '../components/ui/Progress'
import { api } from '../services/api'
import {
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Globe,
  Lock,
  ArrowRight,
  Compass,
  Heart,
  Cpu,
  Palette,
  Users,
  Building,
  TreePine,
  GraduationCap
} from 'lucide-react'

export default function Home() {
  const [featuredCampaigns, setFeaturedCampaigns] = useState([])
  const [trendingCampaigns, setTrendingCampaigns] = useState([])
  const [endingSoonCampaigns, setEndingSoonCampaigns] = useState([])
  const [stats, setStats] = useState({ totalRaised: 0, totalBackers: 0, totalCampaigns: 0, fundedCampaigns: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, featuredRes, trendingRes, endingRes] = await Promise.all([
          api.get('/campaigns/stats').catch(() => ({})),
          api.get('/campaigns?limit=3&sort=newest').catch(() => ({ campaigns: [] })),
          api.get('/campaigns?limit=3&sort=trending').catch(() => ({ campaigns: [] })),
          api.get('/campaigns?limit=3&sort=ending-soon').catch(() => ({ campaigns: [] }))
        ])

        if (statsRes.totalRaised !== undefined) setStats(statsRes)
        if (featuredRes.campaigns) setFeaturedCampaigns(featuredRes.campaigns)
        if (trendingRes.campaigns) setTrendingCampaigns(trendingRes.campaigns)
        if (endingRes.campaigns) setEndingSoonCampaigns(endingRes.campaigns)
      } catch (err) {
        console.error('Home page load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const categories = [
    { name: 'Tech', icon: Cpu, count: 'Explore Innovations', desc: 'Hardware, software & gadgets' },
    { name: 'Creative', icon: Palette, count: 'Art & Media', desc: 'Design, film, music & publishing' },
    { name: 'Community', icon: Users, count: 'Local Initiatives', desc: 'Social impact & civic projects' },
    { name: 'Charity', icon: Heart, count: 'Non-profit', desc: 'Direct assistance & global aid' },
    { name: 'Education', icon: GraduationCap, count: 'Learning', desc: 'EdTech, books & scholarships' },
    { name: 'Environment', icon: TreePine, count: 'Sustainability', desc: 'Clean tech & conservation' }
  ]

  return (
    <div className="min-h-screen pt-20">
      {/* Editorial Hero Section */}
      <section className="relative px-6 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-violet/10 text-accent-violet border border-accent-violet/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> The Next Generation Crowdfunding Platform
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-text-ink tracking-tight leading-[1.1]">
                Fund ideas that shape the future.
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-lg text-text-secondary leading-relaxed max-w-xl font-normal">
                Discover breakthrough technology, creative ventures, and community projects. Connect directly with creators and turn bold visions into reality.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/campaigns/new">
                  <Button variant="primary">Start a Campaign</Button>
                </Link>
                <Link to="/discover">
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Compass className="w-4 h-4" /> Explore Campaigns
                  </Button>
                </Link>
              </div>
            </Reveal>

            {/* Key Value Pill Props */}
            <Reveal delay={0.4}>
              <div className="pt-6 border-t border-border-ink/10 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-display font-bold text-text-ink">
                    <AnimatedCounter value={stats.totalRaised || 125000} prefix="$" />
                  </div>
                  <div className="text-xs text-text-muted font-medium mt-1">Total Pledged</div>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-text-ink">
                    <AnimatedCounter value={stats.totalBackers || 840} />
                  </div>
                  <div className="text-xs text-text-muted font-medium mt-1">Backers Worldwide</div>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-text-ink">
                    <AnimatedCounter value={stats.fundedCampaigns || 12} />
                  </div>
                  <div className="text-xs text-text-muted font-medium mt-1">Projects Funded</div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Hero Editorial Featured Card */}
          <div className="lg:col-span-5">
            <Reveal delay={0.3}>
              {loading ? (
                <Skeleton className="w-full h-96 rounded-3xl" />
              ) : featuredCampaigns[0] ? (
                <div className="relative">
                  <div className="absolute -top-3 -left-3 px-4 py-1.5 bg-accent-violet text-white text-xs font-bold rounded-full z-10 shadow-lg uppercase tracking-wider">
                    Featured Campaign
                  </div>
                  <CampaignCard campaign={featuredCampaigns[0]} />
                </div>
              ) : (
                <div className="p-8 bg-surface-white rounded-3xl border border-border-ink/10 text-center">
                  <p className="text-text-secondary text-sm">No featured campaign available right now.</p>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Category Discovery Grid */}
      <section className="px-6 lg:px-12 py-16 bg-surface-white/60 border-y border-border-ink/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl lg:text-3xl font-display font-bold text-text-ink">Explore Categories</h2>
              <p className="text-sm text-text-secondary mt-1">Find campaigns aligned with your passion</p>
            </div>
            <Link to="/discover" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-accent-violet hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon
              return (
                <Link
                  key={idx}
                  to={`/discover?category=${cat.name}`}
                  className="p-5 bg-surface-white rounded-2xl border border-border-ink/10 hover:border-text-ink hover:-translate-y-1 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-violet/10 text-accent-violet flex items-center justify-center mb-3 group-hover:bg-accent-violet group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-text-ink text-base mb-1">{cat.name}</h3>
                  <p className="text-xs text-text-muted">{cat.desc}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trending Campaigns Section */}
      <section className="px-6 lg:px-12 py-20 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-violet mb-1">
              <TrendingUp className="w-4 h-4" /> High Momentum
            </div>
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-text-ink">Trending Projects</h2>
          </div>
          <Link to="/discover?sort=trending" className="flex items-center gap-2 text-sm font-semibold text-accent-violet hover:underline">
            See More Trending <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-96 rounded-3xl" />
            <Skeleton className="h-96 rounded-3xl" />
            <Skeleton className="h-96 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingCampaigns.length > 0 ? (
              trendingCampaigns.map((c) => <CampaignCard key={c._id} campaign={c} />)
            ) : (
              <p className="col-span-3 text-center text-text-secondary py-12">No active trending campaigns found.</p>
            )}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="px-6 lg:px-12 py-20 bg-text-ink text-surface-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-peach mb-2 block">
              Transparent Ecosystem
            </span>
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">How FundRise Works</h2>
            <p className="text-text-muted text-sm leading-relaxed">
              Whether you're launching a campaign or backing a creative dream, FundRise ensures transparency, security, and real accountability at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-accent-peach/20 text-accent-peach flex items-center justify-center font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-display font-bold mb-3">Create & Present</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Creators pitch their vision with rich media, realistic budgets, and defined reward tiers.
              </p>
            </div>

            <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-accent-peach/20 text-accent-peach flex items-center justify-center font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-display font-bold mb-3">Back & Track</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Backers pledge funds securely via Stripe, receive instant receipts, and unlock exclusive rewards.
              </p>
            </div>

            <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-accent-peach/20 text-accent-peach flex items-center justify-center font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-display font-bold mb-3">Fulfill & Deliver</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Funded creators post regular progress updates and request verified payouts for milestone delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Moderation Assurance */}
      <section className="px-6 lg:px-12 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4" /> Platform Trust & Safety
            </div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-text-ink mb-6">
              Built on security, transparency, and accountability.
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-violet/10 text-accent-violet flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-text-ink text-base mb-1">Encrypted Payment Infrastructure</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Powered by Stripe with minor units precision, Webhook signature verification, and zero stored payment credentials.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-violet/10 text-accent-violet flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-text-ink text-base mb-1">Curated Campaign Moderation</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Every project undergoes rigorous administrator review before going active to prevent fraud and misuse.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-violet/10 text-accent-violet flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-text-ink text-base mb-1">Real-time Backer Feeds</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Live funding progress, backer activity feeds, and transparent payout audit logs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-surface-white rounded-3xl border border-border-ink/10 shadow-xl space-y-6">
            <h3 className="text-xl font-display font-bold text-text-ink border-b border-border-ink/10 pb-4">
              Platform Commitment
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              "We believe crowdfunding works best when creators have tools for storytelling and backers have complete financial peace of mind. FundRise V2 brings modern fintech standards to crowdfunding."
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="w-12 h-12 rounded-full bg-accent-violet/20 flex items-center justify-center text-accent-violet font-bold text-lg">
                FR
              </div>
              <div>
                <div className="font-display font-bold text-text-ink text-sm">FundRise Engineering & Design</div>
                <div className="text-xs text-text-muted">Google DeepMind AGY Standards</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-white border-t border-border-ink/10 px-6 lg:px-12 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <span className="font-display text-2xl font-bold text-text-ink">
              FundRise<span className="text-accent-violet">.</span>
            </span>
            <p className="text-sm text-text-secondary">
              A modern, production-grade crowdfunding marketplace for creators and backers worldwide.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-text-ink text-sm uppercase tracking-wider mb-4">Discover</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link to="/discover" className="hover:text-text-ink transition-colors">Tech & Innovation</Link></li>
              <li><Link to="/discover" className="hover:text-text-ink transition-colors">Creative Arts</Link></li>
              <li><Link to="/discover" className="hover:text-text-ink transition-colors">Community Projects</Link></li>
              <li><Link to="/discover" className="hover:text-text-ink transition-colors">Charity & Aid</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-text-ink text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link to="/about" className="hover:text-text-ink transition-colors">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-text-ink transition-colors">How It Works</Link></li>
              <li><Link to="/terms" className="hover:text-text-ink transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-text-ink transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-text-ink text-sm uppercase tracking-wider mb-4">Get Started</h4>
            <div className="space-y-3">
              <Link to="/register" className="block">
                <Button variant="primary" className="w-full text-xs font-bold">Start a Campaign</Button>
              </Link>
              <Link to="/discover" className="block">
                <Button variant="secondary" className="w-full text-xs font-bold">Explore Marketplace</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-border-ink/10 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>© {new Date().getFullYear()} FundRise V2. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/refund-policy" className="hover:underline">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
