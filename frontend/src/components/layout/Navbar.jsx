import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { User, Bookmark } from 'lucide-react'

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

      {/* Nav Links Center */}
      <div className="hidden md:flex items-center gap-8">
        <Link to="/campaigns" className="text-[15px] font-medium text-text-secondary hover:text-text-ink transition-colors">
          Explore
        </Link>
        <Link to="/#how-it-works" className="text-[15px] font-medium text-text-secondary hover:text-text-ink transition-colors">
          How It Works
        </Link>
        <Link to="/#faq" className="text-[15px] font-medium text-text-secondary hover:text-text-ink transition-colors">
          FAQ
        </Link>
      </div>

      {/* Action Buttons Far Right */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/profile">
              <Button variant="nav-secondary" className="flex items-center gap-1.5 px-3">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                  alt={user.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="hidden sm:inline text-xs font-bold">{user.name?.split(' ')[0]}</span>
              </Button>
            </Link>
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
