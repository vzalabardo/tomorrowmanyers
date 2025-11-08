import Link from 'next/link'
import EventForm from '@/components/EventForm'
import MagicBackground from '@/components/MagicBackground'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function NewEventPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
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
            <h1 className="text-4xl font-bold text-white mb-2">Crear nuevo evento</h1>
            <p className="text-neutral-400">Organiza algo increíble para tu comunidad</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl p-8">
            <EventForm />
          </div>
        </main>
      </div>
    </>
  )
}