import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import MagicBackground from '@/components/MagicBackground'
import Avatar from '@/components/Avatar'
import { redirect } from 'next/navigation'
import EventAccordionClient from './EventAccordionClient'
import { revalidatePath } from 'next/cache'
import { syncGoogleCalendarEvents } from '@/lib/google-calendar'

export const dynamic = 'force-dynamic'

async function syncGoogleCalendar() {
  'use server'
  
  try {
    const user = await getCurrentUser()
    if (!user) {
      console.error('❌ No autorizado')
      return
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID
    if (!calendarId) {
      console.error('❌ Google Calendar no configurado')
      return
    }

    console.log('🔄 Sincronizando Google Calendar...')
    const result = await syncGoogleCalendarEvents(calendarId, user.id)
    
    if (result.success) {
      revalidatePath('/')
      console.log(`✅ Sincronización completa: ${result.created} creados, ${result.updated} actualizados`)
    } else {
      console.error('❌ Error en sincronización:', result.error)
    }
  } catch (error) {
    console.error('❌ Error sincronizando:', error)
  }
}

async function getEvents(userId?: string, myEventsOnly = false, showPast = false) {
  const where = myEventsOnly && userId
    ? {
        startAt: showPast ? { lt: new Date() } : { gte: new Date() },
        rsvps: {
          some: {
            userId,
            status: 'yes' as const,
          },
        },
      }
    : {
        startAt: showPast ? { lt: new Date() } : { gte: new Date() },
      }

  return prisma.event.findMany({
    where,
    orderBy: { startAt: showPast ? 'desc' : 'asc' },
    take: 20,
    include: {
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
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ myEvents?: string; past?: string }>
}) {
  const user = await getCurrentUser()
  const params = await searchParams
  const myEventsOnly = params.myEvents === 'true'
  const showPast = params.past === 'true'

  const events = await getEvents(user?.id, myEventsOnly, showPast)

  const eventsWithUserRSVP = events.map((event) => ({
    ...event,
    rsvps: event.rsvps.map((rsvp) => ({
      ...rsvp,
      status: rsvp.status as 'yes' | 'no' | 'maybe',
    })),
    userRSVP: user
      ? event.rsvps.find((rsvp) => rsvp.userId === user.id)
        ? {
            ...event.rsvps.find((rsvp) => rsvp.userId === user.id)!,
            status: event.rsvps.find((rsvp) => rsvp.userId === user.id)!.status as 'yes' | 'no' | 'maybe',
          }
        : null
      : null,
  }))

  async function handleLogout() {
    'use server'
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/auth/logout`, {
      method: 'POST',
    })
    redirect('/login')
  }

  return (
    <>
      <MagicBackground />
      <div className="min-h-screen">
        {/* Navigation */}
        <nav className="sticky top-0 z-40 backdrop-blur-xl bg-black/30 border-b border-white/10">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
                Tomorrowmanyers
              </Link>
              
              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <Link
                      href="/events/new"
                      className="px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/50 text-violet-300 hover:bg-violet-500/30 transition-all duration-200 active:scale-95 font-medium"
                    >
                      + Crear evento
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
                    </Link>
                    <form action={handleLogout}>
                      <button
                        type="submit"
                        className="text-neutral-400 hover:text-white transition-colors text-sm"
                      >
                        Salir
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-neutral-300 hover:text-white transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:from-violet-600 hover:to-purple-700 transition-all duration-200 active:scale-95"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {showPast ? 'Eventos pasados' : 'Próximos eventos'}
            </h1>
            <p className="text-neutral-400 text-lg">
              {showPast ? 'Revive los momentos que ya pasaron' : 'Descubre y participa en eventos increíbles'}
            </p>
          </div>

          {user && (
            <div className="mb-6">
              <div className="flex gap-3 mb-3 flex-wrap">
                <Link
                  href="/"
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    !myEventsOnly && !showPast
                      ? 'bg-violet-500/20 border border-violet-500/50 text-violet-300'
                      : 'bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10'
                  }`}
                >
                  Todos los eventos
                </Link>
                <Link
                  href="/?myEvents=true"
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    myEventsOnly && !showPast
                      ? 'bg-violet-500/20 border border-violet-500/50 text-violet-300'
                      : 'bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10'
                  }`}
                >
                  Mis eventos
                </Link>
                <form action={syncGoogleCalendar}>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-blue-500/20 border border-blue-500/50 text-blue-300 hover:bg-blue-500/30 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                    </svg>
                    Sincronizar Google Calendar
                  </button>
                </form>
              </div>
              <div className="flex gap-3">
                <Link
                  href={myEventsOnly ? '/?myEvents=true' : '/'}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm ${
                    !showPast
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                      : 'bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10'
                  }`}
                >
                  📅 Próximos
                </Link>
                <Link
                  href={myEventsOnly ? '/?myEvents=true&past=true' : '/?past=true'}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm ${
                    showPast
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                      : 'bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10'
                  }`}
                >
                  🕐 Pasados
                </Link>
              </div>
            </div>
          )}

          {events.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {myEventsOnly ? 'No tienes eventos confirmados' : 'No hay eventos próximos'}
              </h3>
              <p className="text-neutral-400 mb-6">
                {myEventsOnly ? 'Explora todos los eventos y confirma tu asistencia' : '¿Por qué no creas el primero?'}
              </p>
              {user && (
                <Link
                  href={myEventsOnly ? '/' : '/events/new'}
                  className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:from-violet-600 hover:to-purple-700 transition-all duration-200 active:scale-95"
                >
                  {myEventsOnly ? 'Ver todos los eventos' : 'Crear evento'}
                </Link>
              )}
            </div>
          ) : (
            <EventAccordionClient events={eventsWithUserRSVP} />
          )}
        </main>
      </div>
    </>
  )
}
