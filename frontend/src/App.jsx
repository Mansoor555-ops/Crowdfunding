import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/layout/Navbar'
import { ToastContainer } from './components/ui/Toast'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Discover from './pages/Discover'
import CreateCampaign from './pages/CreateCampaign'
import CampaignDetail from './pages/CampaignDetail'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import CreatorDashboard from './pages/CreatorDashboard'
import Admin from './pages/Admin'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import Legal from './pages/Legal'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-bg-linen text-text-ink flex flex-col justify-between selection:bg-accent-violet/10 selection:text-accent-violet">
          {/* Header Navigation */}
          <Navbar />

          {/* Real-time Global Toast Container */}
          <ToastContainer />
          
          {/* Main Routing Content */}
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/campaigns" element={<Discover />} />
              <Route path="/campaigns/new" element={<CreateCampaign />} />
              <Route path="/campaigns/:slug" element={<CampaignDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/terms" element={<Legal />} />
              <Route path="/privacy" element={<Legal />} />
              <Route path="/refund-policy" element={<Legal />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* User / Backer Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />

              {/* Creator Hub Routes */}
              <Route path="/creator" element={<CreatorDashboard />} />
              <Route path="/creator/payouts" element={<CreatorDashboard />} />

              {/* Admin Platform Routes */}
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
