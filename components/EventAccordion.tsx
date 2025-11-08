'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'
import Avatar from './Avatar'
import RSVPToggle from './RSVPToggle'
import Link from 'next/link'
import { generateGoogleCalendarUrl } from '@/lib/calendar'

interface EventAccordionProps {
  events: Array<{
    id: string
    title: string
    description?: string | null
    location?: string | null
    startAt: Date
    endAt?: Date | null
    _count: {
      rsvps: number
    }
    rsvps: Array<{
      status: 'yes' | 'no' | 'maybe'
      user: {
        id: string
        name: string
        avatarUrl?: string | null
      }
    }>
    userRSVP?: {
      status: 'yes' | 'no' | 'maybe'
    } | null
  }>
  onRSVPUpdate: (eventId: string, status: 'yes' | 'no' | 'maybe') => Promise<void>
}

export default function EventAccordion({ events, onRSVPUpdate }: EventAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const formatDate = (date: Date) => {
    return formatInTimeZone(date, 'Europe/Madrid', "EEE, d MMM HH:mm", { locale: es })
  }

  const getCounts = (rsvps: Array<{ status: 'yes' | 'no' | 'maybe' }>) => {
    return {
      yes: rsvps.filter((r) => r.status === 'yes').length,
      maybe: rsvps.filter((r) => r.status === 'maybe').length,
      no: rsvps.filter((r) => r.status === 'no').length,
    }
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const isExpanded = expandedId === event.id
        const counts = getCounts(event.rsvps)
        const attendees = event.rsvps.filter((r) => r.status === 'yes')
        const googleCalendarUrl = generateGoogleCalendarUrl({
          title: event.title,
          description: event.description || undefined,
          location: event.location || undefined,
          startAt: event.startAt,
          endAt: event.endAt,
        })

        return (
          <div
            key={event.id}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : event.id)}
              className="w-full p-6 text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-violet-300 text-sm mb-3">{formatDate(event.startAt)}</p>
                  <div className="flex gap-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                      Van ({counts.yes})
                    </span>
                    <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                      Quizás ({counts.maybe})
                    </span>
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                      No van ({counts.no})
                    </span>
                  </div>
                </div>
                <div className="text-neutral-400">
                  <svg
                    className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="px-6 pb-6 space-y-4 border-t border-white/10 pt-4">
                {/* Google Calendar Button */}
                <div className="flex gap-3">
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/50 text-blue-300 hover:bg-blue-500/30 transition-all duration-200 active:scale-95 font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                    </svg>
                    Añadir a Google Calendar
                  </a>
                  <Link
                    href={`/events/${event.id}`}
                    className="px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/50 text-violet-300 hover:bg-violet-500/30 transition-all duration-200 active:scale-95 font-medium flex items-center gap-2 text-sm"
                  >
                    Ver detalles
                  </Link>
                </div>
                {event.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-400 mb-1">Descripción</h4>
                    <p className="text-neutral-200">{event.description}</p>
                  </div>
                )}

                {event.location && (
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-400 mb-1">Lugar</h4>
                    <p className="text-neutral-200">{event.location}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-neutral-400 mb-3">Tu respuesta</h4>
                  <RSVPToggle
                    eventId={event.id}
                    currentStatus={event.userRSVP?.status}
                    onUpdate={(status) => onRSVPUpdate(event.id, status)}
                  />
                </div>

                {attendees.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-400 mb-3">
                      Asistentes confirmados ({attendees.length})
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {attendees.map((rsvp) => (
                        <div key={rsvp.user.id} className="flex items-center gap-2">
                          <Avatar name={rsvp.user.name} avatarUrl={rsvp.user.avatarUrl} size="sm" />
                          <span className="text-sm text-neutral-300">{rsvp.user.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href={`/events/${event.id}`}
                  className="inline-block px-6 py-2 rounded-xl bg-violet-500/20 border border-violet-500/50 text-violet-300 hover:bg-violet-500/30 transition-all duration-200 active:scale-95 font-medium"
                >
                  Ver detalle completo →
                </Link>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}