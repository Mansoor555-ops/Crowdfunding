import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { Sparkles, X } from 'lucide-react'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    socket.on('new-donation', (data) => {
      if (data && data.campaignTitle) {
        const id = Date.now()
        const newToast = {
          id,
          title: data.campaignTitle,
          amount: data.amount,
          donorName: data.isAnonymous ? 'An anonymous donor' : (data.donorName || 'A generous backer')
        }

        setToasts((prev) => [newToast, ...prev.slice(0, 4)]) // Keep max 5 toasts

        // Auto remove after 5 seconds
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 5000)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-[380px] w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-text-ink text-surface-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-start justify-between gap-3 animate-slide-in font-body text-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-violet to-accent-peach flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="space-y-0.5">
              <p className="font-bold text-surface-white text-xs">
                {toast.donorName} <span className="text-accent-peach font-extrabold">+${toast.amount}</span>
              </p>
              <p className="text-xs text-white/70 line-clamp-1">
                Backed <span className="text-white font-medium">{toast.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
