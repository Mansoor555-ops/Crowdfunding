import React, { useState } from 'react'
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { api } from '../../services/api'

export function ImageUploader({ label, value, onChange, error, className = '' }) {
  const [loading, setLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be under 5MB.')
      return
    }

    setLoading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const data = await api.post('/uploads', formData)
      if (data.url) {
        onChange(data.url)
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload image.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-border-ink/15 group aspect-video max-h-64 bg-black/5 flex items-center justify-center">
          <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-3 right-3 p-2 bg-text-ink/80 hover:bg-text-ink text-white rounded-full backdrop-blur-sm transition-all shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed ${
          error || uploadError ? 'border-red-400 bg-red-50/50' : 'border-border-ink/20 hover:border-text-ink bg-surface-white'
        } rounded-3xl cursor-pointer transition-all`}>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={loading} />
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-accent-violet">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-semibold">Uploading to server...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-accent-violet/10 text-accent-violet rounded-full mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-text-ink mb-1">Click to upload image</p>
              <p className="text-xs text-text-muted">PNG, JPG, WebP up to 5MB</p>
            </div>
          )}
        </label>
      )}

      {(error || uploadError) && (
        <p className="mt-1.5 text-xs text-red-500 font-medium">{error || uploadError}</p>
      )}
    </div>
  )
}

export function GalleryUploader({ images = [], onChange, label, className = '' }) {
  const [loading, setLoading] = useState(false)

  const handleAddImage = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setLoading(true)
    try {
      const uploadedUrls = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('image', file)
        const data = await api.post('/uploads', formData)
        if (data.url) uploadedUrls.push(data.url)
      }
      onChange([...images, ...uploadedUrls])
    } catch (err) {
      console.error('Gallery upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = (index) => {
    onChange(images.filter((_, idx) => idx !== index))
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
          {label}
        </label>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {images.map((imgUrl, idx) => (
          <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-border-ink/15 group">
            <img src={imgUrl} alt={`Gallery item ${idx}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-2 right-2 p-1 bg-text-ink/80 text-white rounded-full hover:bg-red-600 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-white border border-border-ink/20 rounded-xl text-sm font-semibold text-text-ink cursor-pointer hover:bg-black/5 transition-all">
        <input type="file" accept="image/*" multiple onChange={handleAddImage} className="hidden" disabled={loading} />
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-accent-violet" /> : <ImageIcon className="w-4 h-4 text-accent-violet" />}
        {loading ? 'Uploading images...' : 'Add Gallery Images'}
      </label>
    </div>
  )
}
