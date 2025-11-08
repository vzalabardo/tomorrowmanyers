'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MagicBackground from '@/components/MagicBackground'
import Avatar from '@/components/Avatar'
import Toast from '@/components/Toast'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setUser(data)
      setFormData({
        name: data.name,
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || '',
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Error al actualizar perfil')
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      setToast({ message: '¡Perfil actualizado!', type: 'success' })
    } catch (error: any) {
      setToast({ message: error.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <MagicBackground />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Cargando...</div>
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <MagicBackground />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Error al cargar perfil</div>
        </div>
      </>
    )
  }

  return (
    <>
      <MagicBackground />
      <div className="min-h-screen">
        <nav className="sticky top-0 z-40 backdrop-blur-xl bg-black/30 border-b border-white/10">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
              Tomorrowmanyers
            </Link>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/" className="text-violet-400 hover:text-violet-300 mb-4 inline-block">
              ← Volver a eventos
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Mi perfil</h1>
          </div>

          <div className="space-y-6">
            {/* Profile Info Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <Avatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                  <p className="text-neutral-400">{user.email}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-neutral-300 mb-2">
                    Biografía
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                    placeholder="Cuéntanos sobre ti..."
                    rows={4}
                  />
                </div>

                <div>
                  <label htmlFor="avatarUrl" className="block text-sm font-medium text-neutral-300 mb-2">
                    URL del avatar
                  </label>
                  <input
                    type="url"
                    id="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    placeholder="https://ejemplo.com/avatar.jpg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:from-violet-600 hover:to-purple-700 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}