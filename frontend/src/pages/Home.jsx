import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Reveal } from '../components/ui/Reveal'
import { Sparkles, Layers, ShieldCheck, Zap, ChevronDown } from 'lucide-react'

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [activeFaq, setActiveFaq] = useState(null)

  useEffect(() => {
    // Fetch active campaigns from backend
    fetch('/api/campaigns')
      .then((r) => r.json())
      .then((data) => {
        if (data.campaigns && data.campaigns.length > 0) {
          setCampaigns(data.campaigns.slice(0, 3))
        } else {
          // Fallback campaigns for rich layout representation
          setCampaigns([
            {
              id: '1',
              title: 'Orbital Key: The Zero-Gravity EDC Carabiner',
              slug: 'orbital-key-carabiner',
              category: 'Tech',
              fundingGoal: 25000,
              amountRaised: 18450,
              backersCount: 142,
              deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
              coverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'
            },
            {
              id: '2',
              title: 'Linen & Ink: A Minimalist Editorial Magazine',
              slug: 'linen-ink-magazine',
              category: 'Creative',
              fundingGoal: 8000,
              amountRaised: 9400,
              backersCount: 88,
              deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
              coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'
            },
            {
              id: '3',
              title: 'The Clean Canopy: Urban Air Filter Installations',
              slug: 'clean-canopy-filter',
              category: 'Community',
              fundingGoal: 45000,
              amountRaised: 12200,
              backersCount: 95,
              deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString(),
              coverImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800'
            }
          ])
        }
      })
      .catch(() => {
        // Fallback on error
        setCampaigns([
          {
            id: '1',
            title: 'Orbital Key: The Zero-Gravity EDC Carabiner',
            slug: 'orbital-key-carabiner',
            category: 'Tech',
            fundingGoal: 25000,
            amountRaised: 18450,
            backersCount: 142,
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
            coverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'
          },
          {
            id: '2',
            title: 'Linen & Ink: A Minimalist Editorial Magazine',
            slug: 'linen-ink-magazine',
            category: 'Creative',
            fundingGoal: 8000,
            amountRaised: 9400,
            backersCount: 88,
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
            coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'
          },
          {
            id: '3',
            title: 'The Clean Canopy: Urban Air Filter Installations',
            slug: 'clean-canopy-filter',
            category: 'Community',
            fundingGoal: 45000,
            amountRaised: 12200,
            backersCount: 95,
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString(),
            coverImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800'
          }
        ])
      })
  }, [])

  // Calculate days left
  const getDaysLeft = (deadlineStr) => {
    const diff = new Date(deadlineStr) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  // Toggle FAQ accordion
  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const faqData = [
    {
      q: 'How does FundRise protect backers?',
      a: 'We evaluate campaigns for trust benchmarks and secure all funding goals inside escrow accounts. Funds are only distributed to creators upon successful completion of funding goals.'
    },
    {
      q: 'Can I donate anonymously?',
      a: 'Yes, backer identities are secure. When creating a donation, simply check the "Donate Anonymously" option to keep your name hidden on the campaign page feed.'
    },
    {
      q: 'Are there platform fees?',
      a: 'We charge a flat 5% platform fee on successfully funded campaigns. If your campaign does not meet its target goal, all backers are automatically refunded with zero fee penalties.'
    }
  ]

  return (
    <div className="pt-[65px] overflow-hidden space-y-[112px] md:space-y-[112px]">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-[1280px] mx-auto px-6 pt-16 text-center space-y-10">
        <Reveal className="space-y-6 max-w-[900px] mx-auto">
          <span className="text-[12px] font-bold text-accent-violet tracking-widest uppercase bg-accent-violet/5 py-1.5 px-4 rounded-full">
            INTRODUCING FUNDRISE
          </span>
          <h1 className="headline-display text-[50px] md:text-[80px] text-text-ink tracking-tight font-extrabold leading-tight">
            Fund what <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-violet to-accent-deep">moves you</span>.
          </h1>
          <p className="text-[18px] md:text-[20px] text-text-secondary font-body leading-relaxed max-w-[650px] mx-auto">
            A premium crowdfunding ecosystem built on editorial design, real-time live connection feeds, and audited payout systems.
          </p>
        </Reveal>

        {/* Hero CTA Pair */}
        <Reveal delay={0.2} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register">
            <Button variant="primary">Start a Campaign</Button>
          </Link>
          <a href="#discovery">
            <Button variant="secondary">Explore Campaigns</Button>
          </a>
        </Reveal>

        {/* White App-Panel Card Mockup */}
        <Reveal delay={0.3} className="pt-8 max-w-[1080px] mx-auto">
          <Card variant="app-panel" className="p-6 md:p-10 space-y-8 text-left border border-text-ink/10">
            {/* Dashboard Mock Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-text-ink/5 pb-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-accent-violet tracking-widest uppercase">Live Campaign Dashboard</span>
                <h2 className="font-display text-2xl font-bold tracking-tight text-text-ink">Orbital Key: Zero-Gravity Carabiner</h2>
              </div>
              <div className="flex gap-2">
                <span className="bg-emerald-500/10 text-emerald-600 text-xs px-3.5 py-1.5 rounded-full font-bold">Active</span>
                <span className="bg-bg-linen text-text-secondary text-xs px-3.5 py-1.5 rounded-full font-medium">12 Days Left</span>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-bg-linen p-5 rounded-2xl space-y-1.5">
                <span className="text-xs font-semibold text-text-secondary tracking-wider uppercase">Funds Raised</span>
                <p className="font-display text-3xl font-extrabold text-text-ink">$18,450 <span className="text-sm font-medium text-text-secondary">of $25,000</span></p>
                <div className="w-full bg-text-ink/5 h-2.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-gradient-to-r from-accent-violet to-accent-peach h-full rounded-full" style={{ width: '73.8%' }}></div>
                </div>
              </div>

              <div className="bg-bg-linen p-5 rounded-2xl space-y-1">
                <span className="text-xs font-semibold text-text-secondary tracking-wider uppercase">Total Backers</span>
                <p className="font-display text-3xl font-extrabold text-text-ink">142</p>
                <span className="text-xs text-text-secondary font-medium">+18 backers in the last 24h</span>
              </div>

              <div className="bg-bg-linen p-5 rounded-2xl space-y-1">
                <span className="text-xs font-semibold text-text-secondary tracking-wider uppercase">Platform Velocity</span>
                <p className="font-display text-3xl font-extrabold text-text-ink">Highly Trending</p>
                <span className="text-xs text-accent-violet font-semibold flex items-center gap-1">
                  <Zap size={12} fill="currentColor" /> Top 5% this week
                </span>
              </div>
            </div>
          </Card>
        </Reveal>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="w-full bg-gradient-to-r from-accent-violet to-accent-deep text-surface-white py-8">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-sm font-bold tracking-widest uppercase text-accent-peach">Trusted Campaign Partners</span>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-lg font-display font-extrabold tracking-tight opacity-90">
            <span>WIRED</span>
            <span>TECHCRUNCH</span>
            <span>FAST COMPANY</span>
            <span>STRIPE SECURE</span>
          </div>
        </div>
      </section>

      {/* 3. CAMPAIGN DISCOVERY GRID */}
      <section id="discovery" className="max-w-[1280px] mx-auto px-6 scroll-mt-24 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[12px] font-bold text-accent-violet tracking-widest uppercase">Explore Projects</span>
          <h2 className="headline-display text-4xl md:text-5xl font-bold tracking-tight text-text-ink">Discovery Grid</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {campaigns.map((camp, index) => {
            const pct = Math.min(100, Math.round((camp.amountRaised / camp.fundingGoal) * 100))
            const daysLeft = getDaysLeft(camp.deadline)

            return (
              <Reveal key={camp.id || camp._id} delay={index * 0.1} className="h-full">
                <Card variant="app-panel" className="group flex flex-col justify-between border border-text-ink/10 h-full">
                  <div>
                    {/* Cover Image */}
                    <div className="h-[220px] overflow-hidden relative">
                      <img 
                        src={camp.coverImage} 
                        alt={camp.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-4 left-4 bg-white/95 text-text-ink text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                        {camp.category}
                      </span>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 space-y-4">
                      <h3 className="font-display text-[20px] font-medium tracking-tight text-text-ink leading-snug group-hover:text-accent-violet transition-colors">
                        <Link to={`/campaigns/${camp.slug}`}>{camp.title}</Link>
                      </h3>

                      {/* Progress visual bar */}
                      <div className="space-y-1.5">
                        <div className="w-full bg-text-ink/5 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-accent-violet to-accent-peach h-full rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-text-secondary">
                          <span>{pct}% Funded</span>
                          <span>${camp.amountRaised.toLocaleString()} Raised</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Metrics */}
                  <div className="px-6 pb-6 pt-4 border-t border-text-ink/5 flex justify-between items-center text-sm font-medium text-text-secondary">
                    <span><strong>{camp.backersCount}</strong> backers</span>
                    <span><strong>{daysLeft}</strong> days left</span>
                  </div>
                </Card>
              </Reveal>
            )
          })}
        </div>

        <div className="text-center pt-4">
          <Link to="/campaigns">
            <Button variant="secondary">Browse All Campaigns</Button>
          </Link>
        </div>
      </section>

      {/* 4. FEATURE GRID (WHY FUNDRISE) */}
      <section className="max-w-[1280px] mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[12px] font-bold text-accent-violet tracking-widest uppercase">The FundRise Edge</span>
          <h2 className="headline-display text-4xl md:text-5xl font-bold tracking-tight text-text-ink">Designed for creators.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <Reveal className="h-full">
            <Card variant="gradient-feature" className="p-10 space-y-6 min-h-[320px] flex flex-col justify-between">
              <Layers className="text-accent-peach" size={32} />
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold tracking-tight text-surface-white">Premium Editorial Aesthetics</h3>
                <p className="text-[16px] text-surface-white/70 leading-relaxed font-body">
                  Step away from cluttered marketplace interfaces. Our clean formatting gives your campaign the presentation it deserves.
                </p>
              </div>
              <span className="text-xs font-bold text-accent-peach uppercase tracking-wider">Premium Canvas Layout</span>
            </Card>
          </Reveal>

          <Reveal delay={0.1} className="h-full">
            <Card variant="gradient-feature" className="p-10 space-y-6 min-h-[320px] flex flex-col justify-between">
              <Zap className="text-accent-peach" size={32} />
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold tracking-tight text-surface-white">Real-Time Donation Engine</h3>
                <p className="text-[16px] text-surface-white/70 leading-relaxed font-body">
                  Socket.io drives instantaneous backer alerts and donation velocity triggers directly onto creator analytics pages.
                </p>
              </div>
              <span className="text-xs font-bold text-accent-peach uppercase tracking-wider">Real-time alerts</span>
            </Card>
          </Reveal>

          <Reveal className="h-full">
            <Card variant="gradient-feature" className="p-10 space-y-6 min-h-[320px] flex flex-col justify-between">
              <ShieldCheck className="text-accent-peach" size={32} />
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold tracking-tight text-surface-white">Secure Stripe Checkouts</h3>
                <p className="text-[16px] text-surface-white/70 leading-relaxed font-body">
                  We implement automated escrow accounts and webhook resolvers to handle payouts safely.
                </p>
              </div>
              <span className="text-xs font-bold text-accent-peach uppercase tracking-wider">Audited Transactions</span>
            </Card>
          </Reveal>

          <Reveal delay={0.1} className="h-full">
            <Card variant="gradient-feature" className="p-10 space-y-6 min-h-[320px] flex flex-col justify-between">
              <Sparkles className="text-accent-peach" size={32} />
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold tracking-tight text-surface-white">Creator Analytics</h3>
                <p className="text-[16px] text-surface-white/70 leading-relaxed font-body">
                  Custom charting panels present donation demographics, velocities, and timeline targets to creators.
                </p>
              </div>
              <span className="text-xs font-bold text-accent-peach uppercase tracking-wider">MERN Analytics Suite</span>
            </Card>
          </Reveal>

        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-[1280px] mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[12px] font-bold text-accent-violet tracking-widest uppercase">Simplifying Launch</span>
          <h2 className="headline-display text-4xl md:text-5xl font-bold tracking-tight text-text-ink">How it works.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Reveal className="h-full">
            <Card variant="app-panel" className="p-8 space-y-4 h-full">
              <span className="text-xl font-bold text-accent-violet">01</span>
              <h3 className="font-display text-[20px] font-semibold text-text-ink">Create Your Project</h3>
              <p className="text-[15px] text-text-secondary leading-relaxed">
                Fill in your goal targets, categories, rich story updates, and deadline milestones inside our multi-step creation builder.
              </p>
            </Card>
          </Reveal>

          <Reveal delay={0.1} className="h-full">
            <Card variant="gradient-feature" className="p-8 space-y-4 text-left justify-between flex flex-col min-h-[250px] h-full">
              <div>
                <span className="text-xl font-bold text-accent-peach">02</span>
                <h3 className="font-display text-[20px] font-semibold text-surface-white mt-1">Donors Connect</h3>
              </div>
              <div className="py-4 border-y border-white/10 flex items-center justify-around gap-2 text-center text-xs font-semibold">
                <div className="bg-white/10 p-3 rounded-xl">Launch</div>
                <span className="text-accent-peach">→</span>
                <div className="bg-white/10 p-3 rounded-xl">Backer Match</div>
                <span className="text-accent-peach">→</span>
                <div className="bg-white/10 p-3 rounded-xl">payout</div>
              </div>
              <p className="text-[14px] text-surface-white/70">
                Live websockets bridge connection feeds as soon as donors commit.
              </p>
            </Card>
          </Reveal>

          <Reveal delay={0.2} className="h-full">
            <Card variant="app-panel" className="p-8 space-y-4 h-full">
              <span className="text-xl font-bold text-accent-violet">03</span>
              <h3 className="font-display text-[20px] font-semibold text-text-ink">Share & Get Funded</h3>
              <p className="text-[15px] text-text-secondary leading-relaxed">
                Launch public update channels to keep campaign backers involved as campaign velocity increases.
              </p>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* 6. FAQ & CTA BAND */}
      <section id="faq" className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Accordion FAQ Cards */}
        <div className="space-y-4">
          <div className="pb-4">
            <span className="text-[12px] font-bold text-accent-violet tracking-widest uppercase">Support Channels</span>
            <h2 className="headline-display text-4xl font-bold tracking-tight text-text-ink mt-2">Frequently Asked</h2>
          </div>

          <div className="space-y-4">
            {faqData.map((item, idx) => {
              const isOpen = activeFaq === idx
              return (
                <Reveal key={idx} delay={idx * 0.1}>
                  <Card variant="faq" className="p-6 cursor-pointer" onClick={() => toggleFaq(idx)}>
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={`font-display text-[18px] font-semibold transition-colors ${isOpen ? 'text-accent-violet' : 'text-text-ink'}`}>
                        {item.q}
                      </h3>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent-violet' : 'text-text-secondary'}`} />
                    </div>
                    {isOpen && (
                      <p className="text-[15px] text-text-secondary leading-relaxed pt-4 border-t border-text-ink/5 mt-4 animate-fade-in">
                        {item.a}
                      </p>
                    )}
                  </Card>
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* CTA Band */}
        <Reveal delay={0.2} className="w-full">
          <Card variant="cta-band" className="p-8 md:p-12 space-y-6 flex flex-col justify-between min-h-[400px]">
            <div className="space-y-3">
              <span className="text-[12px] font-bold text-text-ink tracking-widest uppercase">Ready to Start?</span>
              <h2 className="headline-display text-[32px] md:text-[44px] text-text-ink font-bold tracking-tight leading-tight">
                Ready to launch your campaign?
              </h2>
              <p className="text-[16px] text-text-ink/80 leading-relaxed font-body max-w-[450px]">
                Set up in minutes. Track payments transparently. Engage backer communities instantly.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Link to="/register">
                <Button variant="primary">Create Campaign</Button>
              </Link>
              <Link to="/campaigns">
                <Button variant="secondary" className="bg-surface-white/20 border-transparent text-text-ink">
                  Explore Projects
                </Button>
              </Link>
            </div>
          </Card>
        </Reveal>

      </section>

      {/* 7. FOOTER */}
      <footer className="w-full bg-bg-linen border-t border-text-ink/5 pt-16 pb-2 relative">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12">
          
          <div className="md:col-span-2 space-y-4">
            <h3 className="headline-display text-2xl font-bold tracking-tight text-text-ink">
              FundRise<span className="text-accent-violet">.</span>
            </h3>
            <p className="text-text-secondary text-sm max-w-[320px] leading-relaxed">
              Premium, MERN-engineered editorial crowdfunding framework for digital creators.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-ink tracking-wider uppercase">Explore</h4>
            <ul className="space-y-2 text-sm text-text-secondary font-medium">
              <li><Link to="/campaigns" className="hover:text-text-ink transition-colors">Campaign Discovery</Link></li>
              <li><Link to="/register" className="hover:text-text-ink transition-colors">Start Campaign</Link></li>
              <li><a href="#how-it-works" className="hover:text-text-ink transition-colors">Platform Scope</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-ink tracking-wider uppercase">Authentication</h4>
            <ul className="space-y-2 text-sm text-text-secondary font-medium">
              <li><Link to="/login" className="hover:text-text-ink transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-text-ink transition-colors">Register</Link></li>
              <li><Link to="/dashboard" className="hover:text-text-ink transition-colors">Creator Dashboard</Link></li>
            </ul>
          </div>

        </div>

        {/* Giant Ghost wordmark */}
        <div className="text-center select-none pointer-events-none opacity-5 overflow-hidden">
          <h1 className="headline-display text-[150px] md:text-[220px] font-black text-text-ink tracking-tighter leading-none translate-y-8">
            FUNDRISE
          </h1>
        </div>
      </footer>

    </div>
  )
}
