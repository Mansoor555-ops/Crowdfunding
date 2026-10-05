import React, { useState } from 'react'
import { Card } from '../components/ui/Card'

export default function Legal() {
  const [tab, setTab] = useState('terms') // 'terms' | 'privacy' | 'refund'

  return (
    <div className="pt-[65px] space-y-12 pb-24 text-left max-w-[1080px] mx-auto px-6">
      
      {/* Header */}
      <section className="pt-16 space-y-4">
        <span className="text-xs font-bold text-accent-violet tracking-widest uppercase bg-accent-violet/5 py-1.5 px-4 rounded-full">
          LEGAL & TRUST POLICY
        </span>
        <h1 className="headline-display text-4xl md:text-5xl text-text-ink font-extrabold tracking-tight">
          Platform Governance & Terms
        </h1>
        <p className="text-sm text-text-secondary">Last updated: October 2026. Please review our platform policies below.</p>
      </section>

      {/* Tabs Switcher */}
      <div className="flex bg-bg-linen border border-text-ink/10 p-1.5 rounded-full w-fit">
        <button
          onClick={() => setTab('terms')}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
            tab === 'terms' ? 'bg-text-ink text-surface-white' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          Terms of Service
        </button>
        <button
          onClick={() => setTab('privacy')}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
            tab === 'privacy' ? 'bg-text-ink text-surface-white' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setTab('refund')}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
            tab === 'refund' ? 'bg-text-ink text-surface-white' : 'text-text-secondary hover:text-text-ink'
          }`}
        >
          Refund Policy
        </button>
      </div>

      {/* Content card */}
      <Card variant="app-panel" className="p-8 space-y-6 border border-text-ink/10 font-body text-sm text-text-secondary leading-relaxed">
        {tab === 'terms' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-text-ink">1. Terms of Service</h2>
            <p>Welcome to FundRise. By creating a creator or backer account, you agree to comply with our platform terms. FundRise operates as a crowdfunding platform matching backers with independent campaign creators.</p>
            <h3 className="font-bold text-text-ink pt-2">Campaign Creator Obligations</h3>
            <p>Creators are required to accurately represent their project, fulfill stated reward tiers in good faith, and provide transparent progress updates to campaign backers.</p>
            <h3 className="font-bold text-text-ink pt-2">Platform Fees & Escrow</h3>
            <p>FundRise charges a 5% platform fee on successfully funded campaigns. If a campaign fails to meet its funding goal before the specified deadline, backer contributions are safely returned.</p>
          </div>
        )}

        {tab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-text-ink">2. Privacy Policy</h2>
            <p>Your privacy is paramount. FundRise collects minimal necessary user information (name, email, encrypted password credentials) to operate backer accounting and campaign management.</p>
            <h3 className="font-bold text-text-ink pt-2">Anonymous Backing</h3>
            <p>When selecting the Anonymous Backing option, your personal name and profile link are suppressed from public campaign backer streams and search indexes.</p>
          </div>
        )}

        {tab === 'refund' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-text-ink">3. Refund Policy</h2>
            <p>FundRise enforces automatic backer protection policies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Unsuccessful Campaigns:</strong> If an active campaign does not meet 100% of its target goal before the deadline expires, all pledged contributions are fully refunded.</li>
              <li><strong>Cancelled Projects:</strong> If a campaign is cancelled by moderation due to policy violations, funds held in escrow are returned to backers.</li>
            </ul>
          </div>
        )}
      </Card>

    </div>
  )
}
