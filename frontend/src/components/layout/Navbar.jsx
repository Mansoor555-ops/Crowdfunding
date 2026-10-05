import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mock authentication check for Phase 8 (will connect to AuthContext in Phase 9)
  const userString = localStorage.getItem('user')
  const user = userString ? JSON.parse(userString) : null

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
    window.location.reload()
  }

  return (
    <nav className={`fixed top-0 left-0 w-full h-[65px] flex items-center justify-between px-6 md:px-12 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-bg-linen/85 backdrop-blur-[7px] border-b border-text-ink/5 shadow-sm' 
        : 'bg-transparent'
    }`}>
      {/* Brand Wordmark Left */}
      <Link to="/" className="flex items-center gap-2">
        <span className="headline-display text-[22px] tracking-[-0.04em] text-text-ink font-bold">
          FundRise<span className="font-accent italic text-accent-violet">.</span>
        </span>
      </Link>

      {/* Nav Links Center/Right */}
      <div className="hidden md:flex items-center gap-8">
        <Link to="/campaigns" className="text-[15px] font-medium text-text-secondary hover:text-text-ink transition-colors">
          Explore
        </Link>
        <a href="#how-it-works" className="text-[15px] font-medium text-text-secondary hover:text-text-ink transition-colors">
          How It Works
        </a>
        <a href="#faq" className="text-[15px] font-medium text-text-secondary hover:text-text-ink transition-colors">
          FAQ
        </a>
      </div>

      {/* Action Buttons Far Right */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/dashboard">
              <Button variant="nav-secondary">Dashboard</Button>
            </Link>
            <Button variant="nav-primary" onClick={handleLogout}>
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="nav-secondary">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="nav-primary">Start a Campaign</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
