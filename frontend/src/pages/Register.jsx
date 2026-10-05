import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ShieldAlert, User, Heart } from 'lucide-react'

export default function Register() {
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('donor') // creator or donor
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    const res = await register(name, email, password, role)
    if (res.success) {
      navigate('/dashboard')
    } else {
      setError(res.error || 'Registration failed. Please check the fields.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-linen flex items-center justify-center px-6 py-24">
      <Card variant="app-panel" className="w-full max-w-[500px] p-8 md:p-12 border border-text-ink/10">
        
        {/* Logo and Headings */}
        <div className="text-center space-y-2 mb-8">
          <Link to="/" className="headline-display text-[26px] tracking-[-0.04em] text-text-ink font-bold">
            FundRise<span className="font-accent italic text-accent-violet">.</span>
          </Link>
          <h2 className="font-display text-[20px] font-semibold text-text-ink tracking-tight">
            Create your account
          </h2>
          <p className="text-sm text-text-secondary">
            Join the premium MERN crowdfunding dispatch
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 mb-6">
            <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={16} />
            <span className="text-sm font-medium text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name field */}
          <div className="space-y-1.5">
            <label className="block text-[14px] font-semibold text-text-ink" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet text-[15px] font-medium text-text-ink transition-colors"
              placeholder="Mansoor Ahmed"
            />
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
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
          <div className="space-y-1.5">
            <label className="block text-[14px] font-semibold text-text-ink" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-bg-linen rounded-xl border border-text-ink/10 focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet text-[15px] font-medium text-text-ink transition-colors"
              placeholder="Min. 6 characters"
            />
          </div>

          {/* Role selector layout (Creator vs Donor toggle chips) */}
          <div className="space-y-2">
            <label className="block text-[14px] font-semibold text-text-ink">
              Choose your profile focus
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Donor Option */}
              <div 
                onClick={() => setRole('donor')}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  role === 'donor'
                    ? 'border-accent-violet bg-accent-violet/5 ring-1 ring-accent-violet'
                    : 'border-text-ink/10 bg-transparent hover:bg-text-ink/5'
                }`}
              >
                <Heart className={role === 'donor' ? 'text-accent-violet' : 'text-text-secondary'} size={18} />
                <div>
                  <p className="text-sm font-bold text-text-ink">Backer</p>
                  <p className="text-xs text-text-secondary">I want to support</p>
                </div>
              </div>

              {/* Creator Option */}
              <div 
                onClick={() => setRole('creator')}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  role === 'creator'
                    ? 'border-accent-violet bg-accent-violet/5 ring-1 ring-accent-violet'
                    : 'border-text-ink/10 bg-transparent hover:bg-text-ink/5'
                }`}
              >
                <User className={role === 'creator' ? 'text-accent-violet' : 'text-text-secondary'} size={18} />
                <div>
                  <p className="text-sm font-bold text-text-ink">Creator</p>
                  <p className="text-xs text-text-secondary">I want to fundraise</p>
                </div>
              </div>
            </div>
          </div>

          {/* Register Action CTA */}
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full mt-4" 
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Redirect sign in */}
        <div className="mt-8 text-center text-sm font-medium text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-violet hover:underline">
            Sign in
          </Link>
        </div>

      </Card>
    </div>
  )
}
