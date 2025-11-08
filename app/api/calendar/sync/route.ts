import { NextResponse } from 'next/server'
import { syncGoogleCalendarEvents } from '@/lib/google-calendar'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const calendarId = process.env.GOOGLE_CALENDAR_ID

    if (!calendarId) {
      return NextResponse.json(
        { error: 'Google Calendar ID not configured' },
        { status: 500 }
      )
    }

    console.log('🔄 Syncing Google Calendar...')
    const result = await syncGoogleCalendarEvents(calendarId, user.id)

    console.log('✅ Sync complete:', result)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('❌ Sync error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync calendar' },
      { status: 500 }
    )
  }
}