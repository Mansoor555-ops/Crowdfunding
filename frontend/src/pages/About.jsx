import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { ShieldCheck, Layers, Sparkles, Heart, Award, ArrowRight } from 'lucide-react'

export default function About() {
  return (
    <div className="pt-[65px] space-y-24 pb-24 text-left max-w-[1280px] mx-auto px-6">
      
      {/* Hero Header */}
      <section className="pt-16 text-center space-y-6 max-w-[850px] mx-auto">
        <Reveal>
          <span className="text-xs font-bold text-accent-violet tracking-widest uppercase bg-accent-violet/5 py-1.5 px-4 rounded-full">
            ABOUT FUNDRISE
          </span>
          <h1 className="headline-display text-4xl md:text-6xl text-text-ink font-extrabold tracking-tight mt-4">
            Crowdfunding built with <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-violet to-accent-deep">editorial precision</span>.
          </h1>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed font-body">
            FundRise was founded on a simple principle: groundbreaking independent ideas deserve a calm, elevated presentation—free from cluttered marketplace noise.
          </p>
        </Reveal>
      </section>

      {/* Mission Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Reveal delay={0.1}>
          <Card variant="app-panel" className="p-8 space-y-4 border border-text-ink/10 h-full">
            <div className="w-12 h-12 rounded-2xl bg-accent-violet/10 text-accent-violet flex items-center justify-center">
              <Layers size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-text-ink">Warm-Linen Design System</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Our linen visual language provides an editorial canvas where campaign photography and typography command full attention.
            </p>
          </Card>
        </Reveal>

        <Reveal delay={0.2}>
          <Card variant="app-panel" className="p-8 space-y-4 border border-text-ink/10 h-full">
            <div className="w-12 h-12 rounded-2xl bg-accent-violet/10 text-accent-violet flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-text-ink">Audited Escrow Security</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Campaign goals are held in audited escrow accounts. Funds are only distributed when campaign targets are successfully achieved.
            </p>
          </Card>
        </Reveal>

        <Reveal delay={0.3}>
          <Card variant="app-panel" className="p-8 space-y-4 border border-text-ink/10 h-full">
            <div className="w-12 h-12 rounded-2xl bg-accent-violet/10 text-accent-violet flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-text-ink">Real-Time Community</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Powered by real-time websockets, creators and backers stay connected with instantaneous milestone alerts and updates.
            </p>
          </Card>
        </Reveal>
      </section>

      {/* Call to action */}
      <section className="pt-8">
        <Card variant="cta-band" className="p-12 text-center space-y-6">
          <h2 className="headline-display text-3xl md:text-5xl font-bold text-text-ink">Ready to bring your project to life?</h2>
          <p className="text-base text-text-ink/80 max-w-[550px] mx-auto">
            Join thousands of backers and creators funding independent technology, art, and community initiatives.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/register">
              <Button variant="primary">Start a Campaign</Button>
            </Link>
            <Link to="/campaigns">
              <Button variant="secondary" className="bg-white/20 border-transparent text-text-ink">Explore Projects</Button>
            </Link>
          </div>
        </Card>
      </section>

    </div>
  )
}
