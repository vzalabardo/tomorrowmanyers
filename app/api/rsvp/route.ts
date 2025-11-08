import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { rsvpSchema } from '@/lib/validations'

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
    const validatedData = rsvpSchema.parse(body)

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    // Upsert RSVP
    const rsvp = await prisma.rSVP.upsert({
      where: {
        eventId_userId: {
          eventId: validatedData.eventId,
          userId: user.id,
        },
      },
      update: {
        status: validatedData.status,
      },
      create: {
        eventId: validatedData.eventId,
        userId: user.id,
        status: validatedData.status,
      },
    })

    return NextResponse.json(rsvp, { status: 200 })
  } catch (error: any) {
    console.error('RSVP error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar RSVP' },
      { status: 400 }
    )
  }
}