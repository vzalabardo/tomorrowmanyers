import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import MagicBackground from '@/components/MagicBackground'
import Avatar from '@/components/Avatar'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'
import RSVPClient from './RSVPClient'
import { generateGoogleCalendarUrl } from '@/lib/calendar'

export const dynamic = 'force-dynamic'

async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: { rsvps: true },
      },
      rsvps: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  })

  return event
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  const event = await getEvent(id)

  if (!event) {
    notFound()
  }

  const userRSVP = user
    ? event.rsvps.find((rsvp) => rsvp.userId === user.id)
    : null

  const formatDate = (date: Date) => {
    return formatInTimeZone(date, 'Europe/Madrid', "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
  }

  const getCounts = () => {
    return {
      yes: event.rsvps.filter((r) => r.status === 'yes').length,
      maybe: event.rsvps.filter((r) => r.status === 'maybe').length,
      no: event.rsvps.filter((r) => r.status === 'no').length,
    }
  }

  const counts = getCounts()
  const attendees = event.rsvps.filter((r) => r.status === 'yes')
  const isCreator = user?.id === event.createdBy.id

  // Generate Google Calendar URL
  const googleCalendarUrl = generateGoogleCalendarUrl({
    title: event.title,
    description: event.description || undefined,
    location: event.location || undefined,
    startAt: event.startAt,
    endAt: event.endAt,
  })

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

        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="text-violet-400 hover:text-violet-300">
              ← Volver a eventos
            </Link>
            {isCreator && (
              <Link
                href={`/events/${id}/edit`}
                className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 transition-all duration-200 active:scale-95 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar evento
              </Link>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl p-8 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl font-bold text-white">{event.title}</h1>
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/50 text-blue-300 hover:bg-blue-500/30 transition-all duration-200 active:scale-95 font-medium flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                  </svg>
                  Añadir a Google Calendar
                </a>
              </div>
              <div className="flex items-center gap-3 text-violet-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-lg">{formatDate(event.startAt)}</span>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Descripción</h2>
                <p className="text-neutral-300 leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Lugar</h2>
                <div className="flex items-center gap-2 text-neutral-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>
              </div>
            )}

            {/* Organizer */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">Organizador</h2>
              <div className="flex items-center gap-3">
                <Avatar name={event.createdBy.name} avatarUrl={event.createdBy.avatarUrl} size="md" />
                <span className="text-neutral-300 font-medium">{event.createdBy.name}</span>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">Asistencia</h2>
              <div className="flex gap-4 flex-wrap">
                <div className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/50">
                  <span className="text-green-400 font-semibold text-lg">{counts.yes}</span>
                  <span className="text-green-300 ml-2">Van</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/50">
                  <span className="text-yellow-400 font-semibold text-lg">{counts.maybe}</span>
                  <span className="text-yellow-300 ml-2">Quizás</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/50">
                  <span className="text-red-400 font-semibold text-lg">{counts.no}</span>
                  <span className="text-red-300 ml-2">No van</span>
                </div>
              </div>
            </div>

            {/* RSVP */}
            {user && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Tu respuesta</h2>
                <RSVPClient eventId={event.id} currentStatus={userRSVP?.status as 'yes' | 'no' | 'maybe' | undefined} />
              </div>
            )}

            {/* Attendees */}
            {attendees.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">
                  Asistentes confirmados ({attendees.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attendees.map((rsvp) => (
                    <div
                      key={rsvp.user.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <Avatar name={rsvp.user.name} avatarUrl={rsvp.user.avatarUrl} size="sm" />
                      <span className="text-neutral-300">{rsvp.user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}