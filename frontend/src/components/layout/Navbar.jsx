import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'
import { AuthContext } from '../../context/AuthContext'
import { Avatar } from '../ui/Badge'
import { Bell, ShieldCheck, PlusCircle, Menu, X, Compass, LayoutDashboard, Bookmark, User as UserIcon, LogOut, Info, BookOpen } from 'lucide-react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
        className={`fixed top-0 left-0 w-full h-[70px] flex items-center justify-between px-4 sm:px-8 md:px-12 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-surface-white/90 backdrop-blur-md border-b border-border-ink/10 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-tight text-text-ink font-bold">
            FundRise<span className="text-accent-violet">.</span>
          </span>
          <span className="text-[10px] font-black uppercase bg-text-ink text-white px-2 py-0.5 rounded-full tracking-wider">
            V2
          </span>
        </Link>

        {/* Navigation Links Center (Desktop) */}
        <div className="hidden lg:flex items-center gap-8">
          <Link
            to="/discover"
            className={`text-sm font-semibold transition-colors ${
              location.pathname === '/discover' ? 'text-accent-violet' : 'text-text-secondary hover:text-text-ink'
            }`}
          >
            Discover
          </Link>
          <Link
            to="/how-it-works"
            className={`text-sm font-semibold transition-colors ${
              location.pathname === '/how-it-works' ? 'text-accent-violet' : 'text-text-secondary hover:text-text-ink'
            }`}
          >
            How It Works
          </Link>
          <Link
            to="/about"
            className={`text-sm font-semibold transition-colors ${
              location.pathname === '/about' ? 'text-accent-violet' : 'text-text-secondary hover:text-text-ink'
            }`}
          >
            About
          </Link>
        </div>

        {/* Action Buttons Right (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
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
                <Button variant="nav-primary" className="text-xs font-bold">
                  Start Campaign
                </Button>
              </Link>

              <Link to="/notifications" className="relative p-2 text-text-secondary hover:text-text-ink transition-colors rounded-full hover:bg-black/5">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent-violet rounded-full border-2 border-white" />
                )}
              </Link>

              <Link to="/dashboard" className="flex items-center gap-2 pl-2">
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
                <Button variant="nav-primary" className="text-xs font-bold">
                  Start a Campaign
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 lg:hidden">
          {user && (
            <Link to="/notifications" className="relative p-2 text-text-secondary">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent-violet rounded-full border-2 border-white" />
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

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden pt-[70px] bg-surface-white flex flex-col justify-between p-6 overflow-y-auto">
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
