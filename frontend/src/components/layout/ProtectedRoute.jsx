import React, { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { Skeleton } from '../ui/Progress'

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext)
  const location = useLocation()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
          !
        </div>
        <h1 className="text-3xl font-display font-bold text-text-ink mb-4">Access Restricted</h1>
        <p className="text-text-secondary mb-8">
          You do not have the required permissions to view this area.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/"
            className="px-6 py-3 bg-text-ink text-white font-medium rounded-full hover:opacity-90 transition-all"
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }

  return children
}
