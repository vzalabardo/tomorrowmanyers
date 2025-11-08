import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { eventSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

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

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    const eventWithUserRSVP = {
      ...event,
      userRSVP: user
        ? event.rsvps.find((rsvp) => rsvp.userId === user.id) || null
        : null,
    }

    return NextResponse.json(eventWithUserRSVP)
  } catch (error) {
    console.error('Get event error:', error)
    return NextResponse.json(
      { error: 'Error al obtener evento' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if event exists and user is the creator
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      select: { createdById: true },
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    if (existingEvent.createdById !== user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar este evento' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = eventSchema.parse(body)

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        location: validatedData.location,
        startAt: new Date(validatedData.startAt),
        endAt: validatedData.endAt ? new Date(validatedData.endAt) : null,
      },
    })

    return NextResponse.json(updatedEvent)
  } catch (error: any) {
    console.error('Update event error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar evento' },
      { status: 400 }
    )
  }
}