import prisma from "~~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  const { eventId, customerId, filter } = getQuery(event)

  if (!eventId || !customerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing eventId or customerId',
    })
  }

  // Find Registration (to get customer coupons)
  const registration = await prisma.eventRegistration.findUnique({
    where: {
      customerId_eventId: {
        customerId: String(customerId),
        eventId: String(eventId),
      },
    },
    include: {
      coupon: true
    }
  })

  // Get all active event coupons
  const eventCoupons = await prisma.eventCoupon.findMany({
    where: {
      eventId: String(eventId),
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  })

  const now = new Date()

  const coupons = eventCoupons.map(coupon => {
    const userCoupon = registration?.coupon?.find(c => c.eventCouponId === coupon.id)
    
    let status = 'available'
    
    if (userCoupon) {
      if (userCoupon.isRedeemed) {
        status = 'redeemed'
      } else if (new Date(coupon.redeemUntil) < now) {
        status = 'expired'
      } else {
        status = 'active'
      }
    } else {
      if (new Date(coupon.allowGenerateUntil) < now) {
        status = 'missed'
      } else if (new Date(coupon.allowGenerateFrom) > now) {
        status = 'upcoming'
      } else {
        status = 'available'
      }
    }

    return {
      ...coupon,
      userCoupon: userCoupon || null,
      status, // active, redeemed, expired, available, upcoming, missed
    }
  })

  if (filter) {
    return coupons.filter(c => c.status === filter)
  }

  return coupons
})
