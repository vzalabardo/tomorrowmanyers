import { google } from 'googleapis'

export function getCalendarClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

  if (!serviceAccountEmail || !serviceAccountKey) {
    throw new Error('Google Calendar credentials not configured')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: serviceAccountKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  })

  return google.calendar({ version: 'v3', auth })
}

export async function fetchGoogleCalendarEvents(
  calendarId: string,
  timeMin?: Date,
  timeMax?: Date
) {
  try {
    const calendar = getCalendarClient()

    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin?.toISOString() || new Date().toISOString(),
      timeMax: timeMax?.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 100,
    })

    const events = response.data.items || []

    return events.map((event) => ({
      googleId: event.id!,
      title: event.summary || 'Sin título',
      description: event.description || null,
      location: event.location || null,
      startAt: event.start?.dateTime
        ? new Date(event.start.dateTime)
        : event.start?.date
        ? new Date(event.start.date)
        : new Date(),
      endAt: event.end?.dateTime
        ? new Date(event.end.dateTime)
        : event.end?.date
        ? new Date(event.end.date)
        : null,
    }))
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error)
    throw error
  }
}

export async function syncGoogleCalendarEvents(
  calendarId: string,
  defaultUserId: string
) {
  const { prisma } = await import('./db')

  try {
    const timeMin = new Date()
    const timeMax = new Date()
    timeMax.setMonth(timeMax.getMonth() + 6)

    const googleEvents = await fetchGoogleCalendarEvents(calendarId, timeMin, timeMax)

    let created = 0
    let updated = 0

    for (const googleEvent of googleEvents) {
      const existingEvent = await prisma.event.findFirst({
        where: { googleCalendarId: googleEvent.googleId },
      })

      if (existingEvent) {
        await prisma.event.update({
          where: { id: existingEvent.id },
          data: {
            title: googleEvent.title,
            description: googleEvent.description,
            location: googleEvent.location,
            startAt: googleEvent.startAt,
            endAt: googleEvent.endAt,
          },
        })
        updated++
      } else {
        await prisma.event.create({
          data: {
            title: googleEvent.title,
            description: googleEvent.description,
            location: googleEvent.location,
            startAt: googleEvent.startAt,
            endAt: googleEvent.endAt,
            createdById: defaultUserId,
            googleCalendarId: googleEvent.googleId,
          },
        })
        created++
      }
    }

    return { success: true, created, updated, total: googleEvents.length }
  } catch (error) {
    console.error('Error syncing:', error)
    return { success: false, error: String(error), created: 0, updated: 0, total: 0 }
  }
}