'use client'

import { useState } from 'react'

interface RSVPToggleProps {
  eventId: string
  currentStatus?: 'yes' | 'no' | 'maybe' | null
  onUpdate: (status: 'yes' | 'no' | 'maybe') => Promise<void>
}

export default function RSVPToggle({
  eventId,
  currentStatus,
  onUpdate,
}: RSVPToggleProps) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleClick = async (newStatus: 'yes' | 'no' | 'maybe') => {
    setLoading(true)
    try {
      await onUpdate(newStatus)
      setStatus(newStatus)
    } catch (error) {
      console.error('Error updating RSVP:', error)
    } finally {
      setLoading(false)
    }
  }

  const buttonClass = (btnStatus: 'yes' | 'no' | 'maybe') => {
    const baseClass =
      'px-4 py-2 rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50'
    const activeClass = {
      yes: 'bg-green-500/20 border-green-500/50 text-green-400',
      no: 'bg-red-500/20 border-red-500/50 text-red-400',
      maybe: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    }[btnStatus]
    const inactiveClass = 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'

    return `${baseClass} border ${status === btnStatus ? activeClass : inactiveClass}`
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => handleClick('yes')}
        disabled={loading}
        className={buttonClass('yes')}
      >
        ✓ Voy
      </button>
      <button
        onClick={() => handleClick('maybe')}
        disabled={loading}
        className={buttonClass('maybe')}
      >
        ? Quizás
      </button>
      <button
        onClick={() => handleClick('no')}
        disabled={loading}
        className={buttonClass('no')}
      >
        ✗ No voy
      </button>
    </div>
  )
}