'use client'

import { useRouter } from 'next/navigation'
import EventAccordion from '@/components/EventAccordion'

interface EventAccordionClientProps {
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
}

export default function EventAccordionClient({ events }: EventAccordionClientProps) {
  const router = useRouter()

  const handleRSVPUpdate = async (eventId: string, status: 'yes' | 'no' | 'maybe') => {
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, status }),
      })

      if (!res.ok) {
        throw new Error('Error al actualizar RSVP')
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating RSVP:', error)
      throw error
    }
  }

  return <EventAccordion events={events} onRSVPUpdate={handleRSVPUpdate} />
}