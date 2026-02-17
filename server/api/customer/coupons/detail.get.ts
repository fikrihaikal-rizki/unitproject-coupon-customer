import prisma from "~~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  const { eventSlug, couponSlug, customerId } = getQuery(event)

  if (!eventSlug || !couponSlug || !customerId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    })
  }

  // 1. Get Event and Coupon
  const eventDetails = await prisma.event.findUnique({
    where: { slug: String(eventSlug) },
    select: { id: true, title: true, slug: true }
  })

  if (!eventDetails) throw createError({ statusCode: 404, statusMessage: "Event not found" })

  const eventCoupon = await prisma.eventCoupon.findUnique({
    where: { slug: String(couponSlug) },
  })

  if (!eventCoupon) throw createError({ statusCode: 404, statusMessage: "Coupon not found" })

  // 2. Find Registration
  const registration = await prisma.eventRegistration.findUnique({
    where: {
      customerId_eventId: {
        customerId: String(customerId),
        eventId: eventDetails.id,
      },
    },
  })

  if (!registration) throw createError({ statusCode: 403, statusMessage: "Not registered" })

  // 3. Find CustomerCoupon
  const customerCoupon = await prisma.customerCoupon.findFirst({
    where: {
      registrationId: registration.id,
      eventCouponId: eventCoupon.id,
    },
  })

  return {
    event: eventDetails,
    coupon: eventCoupon,
    customerCoupon: customerCoupon || null,
  }
})
