'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Toast from './Toast'

interface EventFormProps {
  mode?: 'create' | 'edit'
  eventId?: string
  initialData?: {
    title: string
    description?: string
    location?: string
    startAt: Date
    endAt?: Date | null
  }
}

export default function EventForm({ mode = 'create', eventId, initialData }: EventFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startAt: '',
    endAt: '',
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Load initial data for edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Convert Date to datetime-local format (YYYY-MM-DDTHH:mm)
      const formatDateTimeLocal = (date: Date) => {
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }

      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        location: initialData.location || '',
        startAt: formatDateTimeLocal(initialData.startAt),
        endAt: initialData.endAt ? formatDateTimeLocal(initialData.endAt) : '',
      })
    }
  }, [mode, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert datetime-local to ISO 8601
      const body = {
        title: formData.title,
        description: formData.description || undefined,
        location: formData.location || undefined,
        startAt: formData.startAt ? new Date(formData.startAt).toISOString() : '',
        endAt: formData.endAt ? new Date(formData.endAt).toISOString() : undefined,
      }

      const url = mode === 'edit' ? `/api/events/${eventId}` : '/api/events'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Error al ${mode === 'edit' ? 'actualizar' : 'crear'} el evento`)
      }

      const successMessage = mode === 'edit' ? '¡Evento actualizado!' : '¡Evento creado!'
      setToast({ message: successMessage, type: 'success' })
      setTimeout(() => {
        router.push(mode === 'edit' ? `/events/${eventId}` : '/')
        router.refresh()
      }, 1000)
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-2">
            Título del evento *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            placeholder="Ej: Cervezas en Malasaña"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
            placeholder="Detalles del evento..."
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-neutral-300 mb-2">
            Lugar
          </label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            placeholder="Ej: Bar La Vaca, Calle Pez 15"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startAt" className="block text-sm font-medium text-neutral-300 mb-2">
              Fecha y hora de inicio *
            </label>
            <input
              type="datetime-local"
              id="startAt"
              value={formData.startAt}
              onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="endAt" className="block text-sm font-medium text-neutral-300 mb-2">
              Fecha y hora de fin
            </label>
            <input
              type="datetime-local"
              id="endAt"
              value={formData.endAt}
              onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:from-violet-600 hover:to-purple-700 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
        >
          {loading
            ? (mode === 'edit' ? 'Actualizando...' : 'Creando...')
            : (mode === 'edit' ? 'Actualizar evento' : 'Crear evento')
          }
        </button>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}