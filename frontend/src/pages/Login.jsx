import React, { useState, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ShieldAlert } from 'lucide-react'
import { api } from '../services/api'

export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await login(email, password)
    if (res.success) {
      navigate(from, { replace: true })
    } else {
      setError(res.error || 'Invalid credentials. Please try again.')
      setLoading(false)
    }
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setForgotLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail })
      setForgotMsg(res.message || 'Password reset request sent.')
    } catch (err) {
      setForgotMsg(err.message || 'Failed to submit reset request.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-linen flex items-center justify-center px-6 py-28">
      <div className="w-full max-w-md bg-surface-white p-8 sm:p-10 rounded-3xl border border-border-ink/10 shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="font-display text-3xl font-bold text-text-ink tracking-tight">
            FundRise<span className="text-accent-violet">.</span>
          </Link>
          <h2 className="text-xl font-display font-bold text-text-ink">Welcome back</h2>
          <p className="text-xs text-text-secondary">Sign in to access your crowdfunding dashboard</p>
        </div>

        {/* Quick Demo Credentials */}
        <div className="bg-bg-linen/80 border border-border-ink/10 p-3.5 rounded-2xl space-y-2">
          <p className="text-[11px] font-semibold text-text-secondary">Quick Demo Sign-In (Click to auto-fill):</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setEmail('creator@fundrise.com'); setPassword('password123'); }}
              className="px-2.5 py-1 bg-accent-violet/10 text-accent-violet text-[11px] font-bold rounded-lg hover:bg-accent-violet/20 transition-colors"
            >
              Creator
            </button>
            <button
              type="button"
              onClick={() => { setEmail('donor@fundrise.com'); setPassword('password123'); }}
              className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 text-[11px] font-bold rounded-lg hover:bg-emerald-500/20 transition-colors"
            >
              Backer
            </button>
            <button
              type="button"
              onClick={() => { setEmail('admin@fundrise.com'); setPassword('password123'); }}
              className="px-2.5 py-1 bg-amber-500/10 text-amber-800 text-[11px] font-bold rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-xs text-red-700">
            <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-xs font-semibold text-accent-violet hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-xs text-text-secondary pt-4 border-t border-border-ink/10">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-violet font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal isOpen={forgotModalOpen} onClose={() => setForgotModalOpen(false)} title="Reset Your Password">
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <p className="text-xs text-text-secondary">
            Enter your email address and we will generate a password reset link.
          </p>
          <Input
            label="Account Email"
            type="email"
            required
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            placeholder="name@example.com"
          />

          {forgotMsg && <p className="text-xs font-semibold text-emerald-600">{forgotMsg}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="px-5 py-2.5 rounded-full border border-border-ink/20 text-xs font-bold"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={forgotLoading}
              className="px-5 py-2.5 bg-text-ink text-white rounded-full text-xs font-bold hover:opacity-90 disabled:opacity-50"
            >
              {forgotLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
