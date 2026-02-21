import prisma from "~~/server/utils/prisma"
import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { slug, email, fullName, customerId } = body

  if (!slug || !email || !customerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: slug, email, or customerId',
    })
  }

  // 1. Upsert Customer
  const customer = await prisma.customer.upsert({
    where: { id: customerId },
    update: {
      email,
      fullName: fullName || undefined,
    },
    create: {
      id: customerId,
      email,
      fullName: fullName || '',
    },
  })

  // 2. Fetch Event
  const eventDetails = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      startAt: true,
      endAt: true,
      isActive: true,
    }
  })

  if (!eventDetails) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Event not found',
    })
  }

  if (!eventDetails.isActive) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event is not active',
    })
  }

  // 3. Check Registration Status
  const registration = await prisma.eventRegistration.findUnique({
    select: {
      claimSeatValue: true,
      status: true,
      blacklistedUntil: true
    },
    where: {
      customerId_eventId: {
        customerId: customer.id,
        eventId: eventDetails.id,
      },
    }
  })

  return {
    customer,
    event: eventDetails,
    eventRegistration: registration,
  }
})
