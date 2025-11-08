'use client'

import { useRouter } from 'next/navigation'
import RSVPToggle from '@/components/RSVPToggle'

interface RSVPClientProps {
  eventId: string
  currentStatus?: 'yes' | 'no' | 'maybe'
}

export default function RSVPClient({ eventId, currentStatus }: RSVPClientProps) {
  const router = useRouter()

  const handleRSVPUpdate = async (status: 'yes' | 'no' | 'maybe') => {
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

  return <RSVPToggle eventId={eventId} currentStatus={currentStatus} onUpdate={handleRSVPUpdate} />
}