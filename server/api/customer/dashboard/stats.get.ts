import prisma from "~~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  const { eventId, customerId } = getQuery(event)

  if (!eventId || !customerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing eventId or customerId',
    })
  }

  // Find Registration
  const registration = await prisma.eventRegistration.findUnique({
    where: {
      customerId_eventId: {
        customerId: String(customerId),
        eventId: String(eventId),
      },
    },
    include: {
      coupon: {
        include: {
          eventCoupon: true
        }
      }
    }
  })

  if (!registration) {
    return {
      generated: 0,
      redeemed: 0,
      missed: 0
    }
  }

  const generated = await prisma.customerCoupon.count({
    where: {
      registrationId: registration.id,
    },
  })

  const redeemed = await prisma.customerCoupon.count({
    where: {
      registrationId: registration.id,
      isRedeemed: true,
    },
  })

  // Missed Logic:
  // 1. Coupons user could have generated but period ended
  // 2. Coupons user generated but redemption period ended without redemption

  // Get all event coupons for this event
  const allCoupons = await prisma.eventCoupon.findMany({
    where: {
      eventId: String(eventId),
      isActive: true,
    }
  })

  const now = new Date()
  let missed = 0

  for (const coupon of allCoupons) {
    const userCoupon = registration.coupon.find(c => c.eventCouponId === coupon.id)
    
    if (userCoupon) {
      if (!userCoupon.isRedeemed && coupon.redeemUntil < now) {
        missed++
      }
    } else {
      if (coupon.allowGenerateUntil < now) {
        missed++
      }
    }
  }

  return {
    generated,
    redeemed,
    missed
  }
})
