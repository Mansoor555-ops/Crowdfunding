import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'
import { AuthContext } from '../../context/AuthContext'
import { Avatar } from '../ui/Badge'
import { CmdKModal } from '../ui/CmdKModal'
import {
  Bell,
  ShieldCheck,
  PlusCircle,
  Menu,
  X,
  Compass,
  LayoutDashboard,
  Bookmark,
  User as UserIcon,
  LogOut,
  Info,
  BookOpen,
  Search,
  Sparkles
} from 'lucide-react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cmdKOpen, setCmdKOpen] = useState(false)
  const { user, logout } = useContext(AuthContext)
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const res = await fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
          if (res.ok) {
            const data = await res.json()
            if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount)
          }
        } catch (err) {
          // ignore error
        }
      }
      fetchUnread()
    }
  }, [user, location.pathname])

  const handleLogoutClick = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full h-[72px] flex items-center justify-between px-4 sm:px-8 md:px-12 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-surface-white/85 backdrop-blur-md border-b border-border-ink/10 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-accent-violet text-white flex items-center justify-center font-display font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
            FR
          </div>
          <span className="font-display text-2xl tracking-tight text-text-ink font-bold group-hover:text-accent-violet transition-colors">
            FundRise<span className="text-accent-violet">.</span>
          </span>
          <span className="text-[9px] font-black uppercase bg-accent-violet/10 text-accent-violet border border-accent-violet/20 px-2 py-0.5 rounded-full tracking-wider">
            V2
          </span>
        </Link>

        {/* Navigation Links Center (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-black/[0.03] p-1.5 rounded-full border border-border-ink/10">
          <Link
            to="/discover"
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
              location.pathname === '/discover'
                ? 'bg-surface-white text-text-ink shadow-sm'
                : 'text-text-secondary hover:text-text-ink'
            }`}
          >
            Discover
          </Link>
          <Link
            to="/how-it-works"
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
              location.pathname === '/how-it-works'
                ? 'bg-surface-white text-text-ink shadow-sm'
                : 'text-text-secondary hover:text-text-ink'
            }`}
          >
            How It Works
          </Link>
          <Link
            to="/about"
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
              location.pathname === '/about'
                ? 'bg-surface-white text-text-ink shadow-sm'
                : 'text-text-secondary hover:text-text-ink'
            }`}
          >
            About
          </Link>
        </div>

        {/* Action Buttons Right (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Cmd+K Quick Search Trigger Button */}
          <button
            onClick={() => setCmdKOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 hover:bg-black/10 text-text-secondary hover:text-text-ink text-xs font-medium border border-border-ink/10 transition-all"
            title="Quick Search (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-accent-violet" />
            <span className="hidden xl:inline">Search Marketplace...</span>
            <kbd className="px-1.5 py-0.5 bg-surface-white text-[10px] font-bold rounded border border-border-ink/10 text-text-muted">
              ⌘K
            </kbd>
          </button>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin">
                  <Button variant="nav-secondary" className="text-accent-violet border-accent-violet/30 flex items-center gap-1.5 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" /> Admin Console
                  </Button>
                </Link>
              )}

              {(user.role === 'creator' || user.role === 'admin') && (
                <Link to="/creator">
                  <Button variant="nav-secondary" className="flex items-center gap-1.5 text-xs font-bold">
                    <PlusCircle className="w-4 h-4 text-accent-violet" /> Creator Hub
                  </Button>
                </Link>
              )}

              <Link to="/campaigns/new">
                <Button variant="nav-primary" className="text-xs font-bold shadow-md hover:shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Start Campaign
                </Button>
              </Link>

              <Link to="/notifications" className="relative p-2 text-text-secondary hover:text-text-ink transition-colors rounded-full hover:bg-black/5">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent-violet rounded-full border-2 border-white animate-pulse" />
                )}
              </Link>

              <Link to="/dashboard" className="flex items-center gap-2 pl-1">
                <Avatar src={user.avatar} name={user.name} size="sm" />
              </Link>

              <Button variant="nav-secondary" onClick={handleLogoutClick} className="text-xs font-semibold">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="nav-secondary" className="text-xs font-bold">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="nav-primary" className="text-xs font-bold shadow-md">
                  Start a Campaign
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu & Search Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setCmdKOpen(true)}
            className="p-2 rounded-xl text-text-secondary hover:bg-black/5"
          >
            <Search className="w-5 h-5" />
          </button>

          {user && (
            <Link to="/notifications" className="relative p-2 text-text-secondary">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent-violet rounded-full border-2 border-white animate-pulse" />
              )}
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-text-ink hover:bg-black/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* CmdK Quick Search Palette */}
      <CmdKModal isOpen={cmdKOpen} onClose={() => setCmdKOpen(false)} />

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden pt-[72px] bg-surface-white flex flex-col justify-between p-6 overflow-y-auto">
          <div className="space-y-4">
            <Link to="/discover" className="flex items-center gap-3 p-3 text-base font-semibold text-text-ink rounded-2xl hover:bg-black/5">
              <Compass className="w-5 h-5 text-accent-violet" /> Discover Campaigns
            </Link>
            <Link to="/how-it-works" className="flex items-center gap-3 p-3 text-base font-semibold text-text-ink rounded-2xl hover:bg-black/5">
              <BookOpen className="w-5 h-5 text-accent-violet" /> How It Works
            </Link>
            <Link to="/about" className="flex items-center gap-3 p-3 text-base font-semibold text-text-ink rounded-2xl hover:bg-black/5">
              <Info className="w-5 h-5 text-accent-violet" /> About Us
            </Link>

            {user ? (
              <>
                <hr className="border-border-ink/10 my-2" />
                <Link to="/dashboard" className="flex items-center gap-3 p-3 text-base font-semibold text-text-ink rounded-2xl hover:bg-black/5">
                  <LayoutDashboard className="w-5 h-5 text-accent-violet" /> My Dashboard
                </Link>
                <Link to="/profile" className="flex items-center gap-3 p-3 text-base font-semibold text-text-ink rounded-2xl hover:bg-black/5">
                  <UserIcon className="w-5 h-5 text-accent-violet" /> Profile & Settings
                </Link>

                {user.role === 'creator' && (
                  <Link to="/creator" className="flex items-center gap-3 p-3 text-base font-semibold text-text-ink rounded-2xl hover:bg-black/5">
                    <PlusCircle className="w-5 h-5 text-accent-violet" /> Creator Dashboard
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-3 p-3 text-base font-semibold text-text-ink rounded-2xl hover:bg-black/5">
                    <ShieldCheck className="w-5 h-5 text-accent-violet" /> Admin Console
                  </Link>
                )}

                <Link to="/campaigns/new" className="block mt-4">
                  <Button variant="primary" className="w-full">Start a Campaign</Button>
                </Link>
              </>
            ) : (
              <div className="pt-6 space-y-3">
                <Link to="/login" className="block">
                  <Button variant="secondary" className="w-full">Sign In</Button>
                </Link>
                <Link to="/register" className="block">
                  <Button variant="primary" className="w-full">Start a Campaign</Button>
                </Link>
              </div>
            )}
          </div>

          {user && (
            <div className="pt-6 border-t border-border-ink/10">
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-3 w-full p-3 text-red-600 font-semibold text-base rounded-2xl hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
