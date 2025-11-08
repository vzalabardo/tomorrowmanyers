import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { eventSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const myEvents = searchParams.get('myEvents') === 'true'

    const user = await getCurrentUser()

    const where = myEvents && user
      ? {
          startAt: { gte: new Date() },
          rsvps: {
            some: {
              userId: user.id,
              status: 'yes',
            },
          },
        }
      : {
          startAt: { gte: new Date() },
        }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startAt: 'asc' },
      take: limit,
      skip: (page - 1) * limit,
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

    // Add user's RSVP status to each event
    const eventsWithUserRSVP = events.map((event) => ({
      ...event,
      userRSVP: user
        ? event.rsvps.find((rsvp) => rsvp.userId === user.id) || null
        : null,
    }))

    return NextResponse.json(eventsWithUserRSVP)
  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: 'Error al obtener eventos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log(' Creating event with data:', body)
    
    const validatedData = eventSchema.parse(body)
    
    const startDate = new Date(validatedData.startAt)
    const endDate = validatedData.endAt ? new Date(validatedData.endAt) : null
    
    console.log(' Parsed dates:', {
      startAt: startDate.toISOString(),
      endAt: endDate?.toISOString(),
      now: new Date().toISOString(),
      isFuture: startDate > new Date()
    })

    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        location: validatedData.location,
        startAt: startDate,
        endAt: endDate,
        createdById: user.id,
      },
    })
    
    console.log(' Event created:', event.id, event.title)

    return NextResponse.json(event, { status: 201 })
  } catch (error: any) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear evento' },
      { status: 400 }
    )
  }
}