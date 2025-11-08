import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import MagicBackground from '@/components/MagicBackground'
import EventForm from '@/components/EventForm'

export const dynamic = 'force-dynamic'

async function getEvent(id: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      startAt: true,
      endAt: true,
      createdById: true,
    },
  })

  if (!event) {
    return null
  }

  // Check if user is the creator
  if (event.createdById !== userId) {
    return null
  }

  return event
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const event = await getEvent(id, user.id)

  if (!event) {
    notFound()
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
          <Link href={`/events/${id}`} className="text-violet-400 hover:text-violet-300 mb-6 inline-block">
            ← Volver al evento
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Editar evento</h1>
            <p className="text-neutral-400">Modifica los detalles de tu evento</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl p-8">
            <EventForm
              mode="edit"
              eventId={id}
              initialData={{
                title: event.title,
                description: event.description || undefined,
                location: event.location || undefined,
                startAt: event.startAt,
                endAt: event.endAt,
              }}
            />
          </div>
        </main>
      </div>
    </>
  )
}