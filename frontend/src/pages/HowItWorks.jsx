import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'

export default function HowItWorks() {
  return (
    <div className="pt-[65px] space-y-20 pb-24 text-left max-w-[1280px] mx-auto px-6">
      
      {/* Header */}
      <section className="pt-16 text-center space-y-6 max-w-[850px] mx-auto">
        <Reveal>
          <span className="text-xs font-bold text-accent-violet tracking-widest uppercase bg-accent-violet/5 py-1.5 px-4 rounded-full">
            PLATFORM GUIDE
          </span>
          <h1 className="headline-display text-4xl md:text-6xl text-text-ink font-extrabold tracking-tight mt-4">
            How FundRise works.
          </h1>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed font-body">
            Whether you are launching an independent project or backing an innovative creator, here is how our ecosystem works.
          </p>
        </Reveal>
      </section>

      {/* Creator Steps */}
      <section className="space-y-8">
        <div className="border-b border-text-ink/10 pb-4">
          <span className="text-xs font-bold text-accent-violet uppercase tracking-wider">For Creators</span>
          <h2 className="font-display text-3xl font-bold text-text-ink mt-1">Launching Your Project</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card variant="app-panel" className="p-6 space-y-3 border border-text-ink/10">
            <span className="font-display text-3xl font-extrabold text-accent-violet">01</span>
            <h3 className="font-bold text-lg text-text-ink">Build Draft</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Define your funding goal, campaign story, reward tiers, and upload media in our multi-step creation wizard.
            </p>
          </Card>

          <Card variant="app-panel" className="p-6 space-y-3 border border-text-ink/10">
            <span className="font-display text-3xl font-extrabold text-accent-violet">02</span>
            <h3 className="font-bold text-lg text-text-ink">Compliance Review</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Submit your draft to our compliance team for moderation review to ensure community trust benchmarks.
            </p>
          </Card>

          <Card variant="app-panel" className="p-6 space-y-3 border border-text-ink/10">
            <span className="font-display text-3xl font-extrabold text-accent-violet">03</span>
            <h3 className="font-bold text-lg text-text-ink">Go Live & Engage</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Launch your campaign to the community, post project updates, and respond to backer Q&A comments.
            </p>
          </Card>

          <Card variant="app-panel" className="p-6 space-y-3 border border-text-ink/10">
            <span className="font-display text-3xl font-extrabold text-accent-violet">04</span>
            <h3 className="font-bold text-lg text-text-ink">Fund Settlement</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              When your goal target is reached, request escrow payouts directly to your connected bank account.
            </p>
          </Card>
        </div>
      </section>

      {/* Backer Steps */}
      <section className="space-y-8 pt-6">
        <div className="border-b border-text-ink/10 pb-4">
          <span className="text-xs font-bold text-accent-violet uppercase tracking-wider">For Backers</span>
          <h2 className="font-display text-3xl font-bold text-text-ink mt-1">Supporting Causes You Love</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="app-panel" className="p-6 space-y-3 border border-text-ink/10">
            <span className="font-display text-3xl font-extrabold text-accent-peach">01</span>
            <h3 className="font-bold text-lg text-text-ink">Discover Campaigns</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Filter by category, funding status, or search terms to find campaigns that resonate with you.
            </p>
          </Card>

          <Card variant="app-panel" className="p-6 space-y-3 border border-text-ink/10">
            <span className="font-display text-3xl font-extrabold text-accent-peach">02</span>
            <h3 className="font-bold text-lg text-text-ink">Pledge & Select Reward</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Choose a reward tier or custom pledge amount. Opt for public or anonymous backing.
            </p>
          </Card>

          <Card variant="app-panel" className="p-6 space-y-3 border border-text-ink/10">
            <span className="font-display text-3xl font-extrabold text-accent-peach">03</span>
            <h3 className="font-bold text-lg text-text-ink">Track Progress</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Receive real-time progress alerts, milestone updates, and printable receipts in your backer dashboard.
            </p>
          </Card>
        </div>
      </section>

    </div>
  )
}
