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
  Sparkles,
  Zap
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
            ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs'
            : 'bg-white/60 backdrop-blur-md border-b border-slate-200/50'
        }`}
      >
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-display font-black text-sm shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200">
            FR
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl tracking-tight text-slate-900 font-extrabold group-hover:text-emerald-600 transition-colors flex items-center gap-1 leading-none">
              FundRise<span className="text-emerald-500">.</span>
              <span className="text-[10px] font-black uppercase bg-emerald-100/80 text-emerald-800 border border-emerald-200/70 px-1.5 py-0.5 rounded-md tracking-wider">
                V2
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">India's Crowdfunding Marketplace</span>
          </div>
        </Link>

        {/* Navigation Links Center (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/70 shadow-inner">
          <Link
            to="/discover"
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              location.pathname === '/discover'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Discover
          </Link>
          <Link
            to="/how-it-works"
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              location.pathname === '/how-it-works'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            How It Works
          </Link>
          <Link
            to="/about"
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              location.pathname === '/about'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
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
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 text-xs font-medium border border-slate-200 transition-all cursor-pointer"
            title="Quick Search (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xl:inline">Search campaigns...</span>
            <kbd className="px-1.5 py-0.5 bg-white text-[10px] font-bold rounded border border-slate-200 text-slate-400">
              ⌘K
            </kbd>
          </button>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin">
                  <Button variant="nav-secondary" className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1.5 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Admin
                  </Button>
                </Link>
              )}

              {(user.role === 'creator' || user.role === 'admin') && (
                <Link to="/creator">
                  <Button variant="nav-secondary" className="flex items-center gap-1.5 text-xs font-bold">
                    <PlusCircle className="w-4 h-4 text-emerald-600" /> Creator Hub
                  </Button>
                </Link>
              )}

              <Link to="/campaigns/new">
                <Button variant="nav-primary" className="text-xs font-semibold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Start Project
                </Button>
              </Link>

              <Link to="/notifications" className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </Link>

              <Link to="/dashboard" className="flex items-center gap-2 pl-1 hover:opacity-90 transition-opacity">
                <Avatar src={user.avatar} name={user.name} size="sm" />
              </Link>

              <Button variant="nav-secondary" onClick={handleLogoutClick} className="text-xs font-semibold text-slate-600">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="nav-secondary" className="text-xs font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="nav-primary" className="text-xs font-semibold shadow-sm">
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
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            <Search className="w-5 h-5" />
          </button>

          {user && (
            <Link to="/notifications" className="relative p-2 text-slate-600">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* CmdK Quick Search Palette */}
      <CmdKModal isOpen={cmdKOpen} onClose={() => setCmdKOpen(false)} />

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden pt-[72px] bg-white flex flex-col justify-between p-6 overflow-y-auto">
          <div className="space-y-3">
            <Link to="/discover" className="flex items-center gap-3 p-3 text-base font-semibold text-slate-900 rounded-2xl hover:bg-slate-50">
              <Compass className="w-5 h-5 text-emerald-600" /> Discover Campaigns
            </Link>
            <Link to="/how-it-works" className="flex items-center gap-3 p-3 text-base font-semibold text-slate-900 rounded-2xl hover:bg-slate-50">
              <BookOpen className="w-5 h-5 text-emerald-600" /> How It Works
            </Link>
            <Link to="/about" className="flex items-center gap-3 p-3 text-base font-semibold text-slate-900 rounded-2xl hover:bg-slate-50">
              <Info className="w-5 h-5 text-emerald-600" /> About Us
            </Link>

            {user ? (
              <>
                <hr className="border-slate-100 my-2" />
                <Link to="/dashboard" className="flex items-center gap-3 p-3 text-base font-semibold text-slate-900 rounded-2xl hover:bg-slate-50">
                  <LayoutDashboard className="w-5 h-5 text-emerald-600" /> My Dashboard
                </Link>
                <Link to="/profile" className="flex items-center gap-3 p-3 text-base font-semibold text-slate-900 rounded-2xl hover:bg-slate-50">
                  <UserIcon className="w-5 h-5 text-emerald-600" /> Profile & Settings
                </Link>

                {user.role === 'creator' && (
                  <Link to="/creator" className="flex items-center gap-3 p-3 text-base font-semibold text-slate-900 rounded-2xl hover:bg-slate-50">
                    <PlusCircle className="w-5 h-5 text-emerald-600" /> Creator Dashboard
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-3 p-3 text-base font-semibold text-slate-900 rounded-2xl hover:bg-slate-50">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" /> Admin Console
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
            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-3 w-full p-3 text-rose-600 font-semibold text-base rounded-2xl hover:bg-rose-50"
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
