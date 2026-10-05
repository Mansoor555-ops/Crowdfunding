import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ShieldAlert } from 'lucide-react'

export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await login(email, password)
    if (res.success) {
      navigate('/dashboard')
    } else {
      setError(res.error || 'Invalid credentials. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-linen flex items-center justify-center px-6 py-24">
      <Card variant="app-panel" className="w-full max-w-[480px] p-8 md:p-12 border border-text-ink/10">
        
        {/* Wordmark logo & Title */}
        <div className="text-center space-y-2 mb-8">
          <Link to="/" className="headline-display text-[26px] tracking-[-0.04em] text-text-ink font-bold">
            FundRise<span className="font-accent italic text-accent-violet">.</span>
          </Link>
          <h2 className="font-display text-[20px] font-semibold text-text-ink tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-sm text-text-secondary">
            Welcome back to the dispatch
          </p>
        </div>

        {/* Error Message banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 mb-6">
            <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={16} />
            <span className="text-sm font-medium text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div className="space-y-2">
            <label className="block text-[14px] font-semibold text-text-ink" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet text-[15px] font-medium text-text-ink transition-colors"
              placeholder="name@domain.com"
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[14px] font-semibold text-text-ink" htmlFor="password">
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet text-[15px] font-medium text-text-ink transition-colors"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Action */}
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full mt-2" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Redirect toggle */}
        <div className="mt-8 text-center text-sm font-medium text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-violet hover:underline">
            Create an account
          </Link>
        </div>

      </Card>
    </div>
  )
}
