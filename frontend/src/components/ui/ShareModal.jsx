import React, { useState } from 'react'
import { Card } from './Card'
import { Copy, Check, Share2, X } from 'lucide-react'

export function ShareModal({ campaign, isOpen, onClose }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !campaign) return null

  const shareUrl = window.location.href

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const shareText = `Check out "${campaign.title}" on FundRise!`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-text-ink/60 backdrop-blur-[4px]">
      <Card variant="app-panel" className="w-full max-w-[460px] p-8 space-y-6 relative border border-text-ink/15 shadow-2xl animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-ink p-1 rounded-full"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-accent-violet/10 text-accent-violet flex items-center justify-center mx-auto">
            <Share2 size={24} />
          </div>
          <h3 className="font-display text-2xl font-bold text-text-ink">Share Campaign</h3>
          <p className="text-xs text-text-secondary">Spread the word to help {campaign.title} reach its funding goal.</p>
        </div>

        {/* Campaign Preview Mini Card */}
        <div className="p-4 bg-bg-linen rounded-2xl flex items-center gap-3 border border-text-ink/5">
          <img
            src={campaign.coverImage}
            alt={campaign.title}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
          />
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-text-ink line-clamp-1">{campaign.title}</h4>
            <p className="text-xs text-accent-violet font-semibold">${campaign.amountRaised?.toLocaleString()} raised</p>
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-2 text-left">
          <label className="text-xs font-bold text-text-ink uppercase tracking-wider">Campaign Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-4 py-2.5 bg-bg-linen rounded-xl border border-text-ink/10 text-xs text-text-ink font-mono focus:outline-none"
            />
            <Button
              onClick={handleCopy}
              variant="primary"
              className="h-[40px] px-4 text-xs font-bold shrink-0 flex items-center gap-1.5"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 bg-text-ink text-white rounded-full text-xs font-bold text-center hover:opacity-90 transition-opacity"
          >
            Share on X / Twitter
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 bg-emerald-600 text-white rounded-full text-xs font-bold text-center hover:opacity-90 transition-opacity"
          >
            Share on WhatsApp
          </a>
        </div>
      </Card>
    </div>
  )
}
