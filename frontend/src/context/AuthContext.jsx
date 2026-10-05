import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize session from localStorage
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setToken(savedToken)
    }
    setLoading(false)
  }, [])

  // Helper: call API wrapper supporting authentication headers
  const authFetch = async (url, options = {}) => {
    const headers = options.headers || {}
    const activeToken = token || localStorage.getItem('token')
    
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`
    }

    const response = await fetch(url, { ...options, headers })

    // Automatic token refresh handling
    if (response.status === 401) {
      const savedRefreshToken = localStorage.getItem('refreshToken')
      if (savedRefreshToken) {
        try {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: savedRefreshToken })
          })

          if (refreshRes.ok) {
            const data = await refreshRes.json()
            localStorage.setItem('token', data.accessToken)
            setToken(data.accessToken)
            
            // Retry the original request with the fresh token
            headers['Authorization'] = `Bearer ${data.accessToken}`
            return fetch(url, { ...options, headers })
          } else {
            // Refresh token has expired/revoked, force logout
            logout()
          }
        } catch (err) {
          logout()
        }
      }
    }

    return response
  }

  const register = async (name, email, password, role = 'donor') => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      localStorage.setItem('token', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setToken(data.accessToken)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      localStorage.setItem('token', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setToken(data.accessToken)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const savedRefreshToken = localStorage.getItem('refreshToken')
    if (savedRefreshToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: savedRefreshToken })
        })
      } catch (err) {
        console.error('Logout error on backend:', err)
      }
    }

    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const updateUserProfile = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData }
    setUser(newUserData)
    localStorage.setItem('user', JSON.stringify(newUserData))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, authFetch, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
