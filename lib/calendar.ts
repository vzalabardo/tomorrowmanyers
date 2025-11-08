import { format } from 'date-fns'

interface EventData {
  title: string
  description?: string
  location?: string
  startAt: Date
  endAt?: Date | null
}

/**
 * Generate Google Calendar URL
 * Opens Google Calendar with pre-filled event data
 */
export function generateGoogleCalendarUrl(event: EventData): string {
  const formatDateForGoogle = (date: Date) => {
    // Format: YYYYMMDDTHHmmssZ
    return format(date, "yyyyMMdd'T'HHmmss'Z'")
  }

  const startDate = formatDateForGoogle(event.startAt)
  const endDate = event.endAt 
    ? formatDateForGoogle(event.endAt)
    : formatDateForGoogle(new Date(event.startAt.getTime() + 60 * 60 * 1000)) // +1 hour default

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description || '',
    location: event.location || '',
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generate iCal file content (.ics)
 * Can be downloaded and imported to any calendar app
 */
export function generateICalFile(event: EventData): string {
  const formatDateForICal = (date: Date) => {
    // Format: YYYYMMDDTHHmmssZ
    return format(date, "yyyyMMdd'T'HHmmss'Z'")
  }

  const startDate = formatDateForICal(event.startAt)
  const endDate = event.endAt
    ? formatDateForICal(event.endAt)
    : formatDateForICal(new Date(event.startAt.getTime() + 60 * 60 * 1000))

  const now = formatDateForICal(new Date())
  
  // Generate unique ID
  const uid = `${now}@tomorrowmanyers.app`

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tomorrowmanyers//Event//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')

  return ical
}

/**
 * Download iCal file
 */
export function downloadICalFile(event: EventData, filename: string = 'event.ics') {
  const icalContent = generateICalFile(event)
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}