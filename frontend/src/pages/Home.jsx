import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  TreePine,
  GraduationCap,
  Search,
  CheckCircle2,
  Sliders,
  DollarSign,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react'

export default function Home() {
  const [featuredCampaigns, setFeaturedCampaigns] = useState([])
  const [trendingCampaigns, setTrendingCampaigns] = useState([])
  const [endingSoonCampaigns, setEndingSoonCampaigns] = useState([])
  const [stats, setStats] = useState({ totalRaised: 0, totalBackers: 0, totalCampaigns: 0, fundedCampaigns: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('trending')
  const [calculatorAmount, setCalculatorAmount] = useState(2500)
  const navigate = useNavigate()

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
    { name: 'Tech', icon: Cpu, desc: 'Hardware, software & gadgets', color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
    { name: 'Creative', icon: Palette, desc: 'Design, film, music & crafts', color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { name: 'Community', icon: Users, desc: 'Social impact & civic causes', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { name: 'Charity', icon: Heart, desc: 'Direct relief & non-profit', color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { name: 'Education', icon: GraduationCap, desc: 'EdTech, books & STEM kits', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { name: 'Environment', icon: TreePine, desc: 'Clean tech & sustainability', color: 'text-teal-600 bg-teal-50 border-teal-100' }
  ]

  const popularTags = ['Jaipur Handloom', 'Solar Microgrid', 'Clay Kulhad', 'Indic Gaming', 'River Cleanup']

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Impact Estimator Logic
  const getImpactDescription = (amount) => {
    if (amount < 1000) return 'Provides 20+ biodegradable clay kulhads to local tea stalls.'
    if (amount < 5000) return 'Funds 1 solar lantern unit for an off-grid Himalayan household.'
    if (amount < 15000) return 'Supports 3 handloom weaver artisan training workshops in Rajasthan.'
    return 'Powers a full solar microgrid installation phase or river plastic interceptor boat.'
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-50 text-slate-900 font-body">
      {/* Editorial Hero Section */}
      <section className="relative px-6 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto overflow-hidden">
        {/* Decorative Ambient Background Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-200/40 via-teal-100/30 to-indigo-100/40 blur-3xl pointer-events-none rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-8">
            <Reveal>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                India's Crowdfunding Marketplace
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Back ambitious ideas that shape <span className="text-gradient-emerald">India's future.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
                Discover heritage craftspeople, green tech startups, independent indie games, and grassroots community causes across India.
              </p>
            </Reveal>

            {/* Quick Hero Search Input */}
            <Reveal delay={0.25}>
              <form onSubmit={handleHeroSearchSubmit} className="flex items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-md max-w-xl hover:border-slate-300 transition-all">
                <Search className="w-5 h-5 text-emerald-600 ml-3 mr-2" />
                <input
                  type="text"
                  placeholder="Search Jaipur textile, Solar grid, Clay kulhad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
                <Button variant="primary" type="submit" className="h-10 px-5 text-xs font-semibold shrink-0">
                  Search
                </Button>
              </form>

              {/* Popular Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-3">
                <span className="text-xs font-semibold text-slate-400">Popular:</span>
                {popularTags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(`/discover?search=${encodeURIComponent(tag)}`)}
                    className="text-xs font-medium text-slate-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200/70 hover:border-emerald-200 px-2.5 py-1 rounded-lg transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/campaigns/new">
                  <Button variant="primary" className="shadow-lg shadow-emerald-600/20">
                    <Sparkles className="w-4 h-4" /> Start a Campaign
                  </Button>
                </Link>
                <Link to="/discover">
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-600" /> Explore All Projects
                  </Button>
                </Link>
              </div>
            </Reveal>

            {/* Live Metrics Counter Bar */}
            <Reveal delay={0.4}>
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                    <AnimatedCounter value={stats.totalRaised || 1468500} prefix="₹" />
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Total Pledged in India</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                    <AnimatedCounter value={stats.totalBackers || 910} />
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Active Backers</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                    <AnimatedCounter value={stats.fundedCampaigns || 12} />
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Successful Projects</div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Hero Featured Campaign Card */}
          <div className="lg:col-span-5">
            <Reveal delay={0.3}>
              {loading ? (
                <Skeleton className="w-full h-[420px] rounded-3xl" />
              ) : featuredCampaigns[0] ? (
                <div className="relative group">
                  <div className="absolute -top-3 -left-3 px-3.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold rounded-full z-10 shadow-lg uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Spotlight Project
                  </div>
                  <CampaignCard campaign={featuredCampaigns[0]} />
                </div>
              ) : (
                <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
                  <p className="text-slate-500 text-sm">No featured campaign available right now.</p>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Category Discovery Bar */}
      <section className="px-6 lg:px-12 py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900">Explore by Category</h2>
              <p className="text-xs text-slate-500 mt-1">Support causes and creative ventures aligned with your vision</p>
            </div>
            <Link to="/discover" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors">
              Browse All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon
              return (
                <Link
                  key={idx}
                  to={`/discover?category=${cat.name}`}
                  className="p-5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border transition-colors ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-slate-900 text-base mb-1 group-hover:text-emerald-700 transition-colors">{cat.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{cat.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tabbed Project Showcase Section */}
      <section className="px-6 lg:px-12 py-20 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
              <TrendingUp className="w-4 h-4" /> Live Community Marketplace
            </div>
            <h2 className="text-3xl font-display font-extrabold text-slate-900">Featured Campaigns</h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-300/50">
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'trending' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔥 Trending
            </button>
            <button
              onClick={() => setActiveTab('ending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ending' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⏳ Ending Soon
            </button>
            <button
              onClick={() => setActiveTab('newest')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'newest' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✨ Newly Launched
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-96 rounded-3xl" />
            <Skeleton className="h-96 rounded-3xl" />
            <Skeleton className="h-96 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeTab === 'trending' && trendingCampaigns.map((c) => <CampaignCard key={c._id} campaign={c} />)}
            {activeTab === 'ending' && endingSoonCampaigns.map((c) => <CampaignCard key={c._id} campaign={c} />)}
            {activeTab === 'newest' && featuredCampaigns.map((c) => <CampaignCard key={c._id} campaign={c} />)}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/discover">
            <Button variant="secondary" className="px-8 font-bold">
              View All Active Projects <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Interactive Backer Impact Estimator */}
      <section className="px-6 lg:px-12 py-20 bg-emerald-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-800/80 px-3 py-1 rounded-full border border-emerald-700 inline-block">
              Interactive Backer Estimator
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold leading-tight">
              See the tangible impact of your pledge.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every Indian Rupee backed goes directly towards real material costs, artisan wages, clean technology hardware, or community relief.
            </p>

            {/* Quick Amount Selector Chips */}
            <div className="space-y-4 pt-2">
              <label className="text-xs font-semibold text-slate-300">Select Pledge Amount:</label>
              <div className="flex flex-wrap gap-3">
                {[500, 2500, 10000, 50000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCalculatorAmount(amt)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      calculatorAmount === amt
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                        : 'bg-emerald-800/50 hover:bg-emerald-800 text-emerald-100 border-emerald-700'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-8 bg-emerald-950/90 rounded-3xl border border-emerald-700/60 shadow-2xl backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-4">
                <span className="text-xs font-semibold text-emerald-400">Pledge Contribution</span>
                <span className="text-3xl font-display font-extrabold text-emerald-300">
                  ₹{calculatorAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tangible Outcome Deliverable</h4>
                <p className="text-base font-semibold text-white leading-relaxed">
                  "{getImpactDescription(calculatorAmount)}"
                </p>
              </div>

              <div className="pt-4 border-t border-emerald-800/80 flex items-center justify-between text-xs text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Direct Transfer
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Razorpay Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust, Security & Moderation Assurance */}
      <section className="px-6 lg:px-12 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Security & Accountability
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 leading-tight">
              Built on transparency and verified trust.
            </h2>

            <div className="space-y-6 pt-2">
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-base mb-1">UPI & Card Payment Safeguards</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Powered by Razorpay & Stripe integration with webhook transaction signatures and instant digital receipts.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-base mb-1">Curated Campaign Moderation</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Every project undergoes strict administrator verification before going live to prevent fraud.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 text-base mb-1">Live Updates & Transparent Feeds</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Creators post regular progress updates and backers track exactly when milestone rewards are shipped.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
            <h3 className="text-lg font-display font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" /> Platform Guarantee
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              "We believe crowdfunding works best when creators have tools for storytelling and backers have complete financial peace of mind. FundRise V2 brings modern fintech standards to crowdfunding across India."
            </p>
            <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                FR
              </div>
              <div>
                <div className="font-display font-bold text-slate-900 text-sm">FundRise Core Platform</div>
                <div className="text-xs text-slate-400 font-medium">Google DeepMind AGY Engineering</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 lg:px-12 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-display font-black text-xs">
                FR
              </div>
              <span className="font-display text-2xl font-extrabold text-slate-900">
                FundRise<span className="text-emerald-500">.</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              India's premier production-grade crowdfunding marketplace for independent creators, green tech, and community ventures.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider mb-4">Discover</h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><Link to="/discover?category=Tech" className="hover:text-emerald-600 transition-colors">Tech & CleanTech</Link></li>
              <li><Link to="/discover?category=Creative" className="hover:text-emerald-600 transition-colors">Heritage Crafts & Arts</Link></li>
              <li><Link to="/discover?category=Community" className="hover:text-emerald-600 transition-colors">Community Causes</Link></li>
              <li><Link to="/discover?category=Education" className="hover:text-emerald-600 transition-colors">EdTech & STEM Kits</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><Link to="/about" className="hover:text-emerald-600 transition-colors">About FundRise</Link></li>
              <li><Link to="/how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</Link></li>
              <li><Link to="/discover" className="hover:text-emerald-600 transition-colors">Explore Projects</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider mb-4">Start Project</h4>
            <div className="space-y-3">
              <Link to="/campaigns/new" className="block">
                <Button variant="primary" className="w-full text-xs font-semibold">Start a Campaign</Button>
              </Link>
              <Link to="/discover" className="block">
                <Button variant="secondary" className="w-full text-xs font-semibold">Explore Marketplace</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} FundRise Marketplace. All rights reserved.</p>
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
