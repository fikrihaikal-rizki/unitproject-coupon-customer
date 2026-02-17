import { serverSupabaseUser } from "#supabase/server"
import { isWithinInterval } from "date-fns"
import prisma from "~~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  // 1. User Identification
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    })
  }
  const customerId = user.id

  // 2. Payload Extraction
  const body = await readBody(event)
  const { couponSlug } = body

  if (!couponSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: "couponSlug is required",
    })
  }

  // 3. Validation & Guard Logic (Pre-Transaction)
  
  // Fetch everything needed for validation
  const eventCoupon = await prisma.eventCoupon.findUnique({
    where: { slug: couponSlug },
    include: {
      event: true
    }
  })

  if (!eventCoupon) {
    throw createError({
      statusCode: 404,
      statusMessage: "Coupon Not Found",
    })
  }

  // A. Registration Check
  const registration = await prisma.eventRegistration.findUnique({
    where: {
      customerId_eventId: {
        customerId,
        eventId: eventCoupon.eventId,
      },
    },
  })

  if (!registration || registration.status !== "active") {
    throw createError({
      statusCode: 403,
      statusMessage: "Registration Not Found", // Requirement: "Registration Not Found"
    })
  }

  // B. Time Window Check
  const now = new Date()
  const isAllowed = isWithinInterval(now, {
    start: eventCoupon.allowGenerateFrom,
    end: eventCoupon.allowGenerateUntil,
  })

  if (!isAllowed) {
    throw createError({
      statusCode: 403,
      statusMessage: "Generation Period Expired", // Requirement: "Generation Period Expired"
    })
  }

  // C. Duplicate Check (Idempotent)
  const existingCoupon = await prisma.customerCoupon.findFirst({
    where: {
      registrationId: registration.id,
      eventCouponId: eventCoupon.id,
    },
  })

  if (existingCoupon) {
    // Return existing data (idempotent) or 409 Conflict. 
    // Requirement 3.3 says: "If yes, return the existing data (idempotent) or 409 Conflict."
    // Let's return existing data for better UX.
    return existingCoupon
  }

  // 4. Atomic Transaction (Prisma)
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Fetch the latest EventCoupon record within transaction
      const coupon = await tx.eventCoupon.findUnique({
        where: { id: eventCoupon.id },
        select: { id: true, maxQuota: true, totalGenerated: true, slug: true }
      })

      if (!coupon) {
        throw new Error("COUPON_NOT_FOUND")
      }

      // Quota Check
      if (coupon.maxQuota !== null && coupon.totalGenerated >= coupon.maxQuota) {
        throw new Error("QUOTA_FULL")
      }

      // Increment totalGenerated
      await tx.eventCoupon.update({
        where: { id: coupon.id },
        data: {
          totalGenerated: { increment: 1 }
        }
      })

      // QR Data Logic: qrData = EventRegistration.qrCodeData + EventCoupon.slug
      const qrData = registration.qrCodeData + coupon.slug

      // Create new CustomerCoupon
      return await tx.customerCoupon.create({
        data: {
          registrationId: registration.id,
          eventCouponId: coupon.id,
          qrData,
          isRedeemed: false,
        },
      })
    })

    return result
  } catch (error: any) {
    if (error.message === "QUOTA_FULL") {
      throw createError({
        statusCode: 422,
        statusMessage: "Quota Full", // Requirement: "Quota Full"
      })
    }
    
    // Handle Prisma P2002 (Unique constraint) - should be rare but possible in race condition
    if (error.code === 'P2002') {
       const retryExisting = await prisma.customerCoupon.findFirst({
         where: {
           registrationId: registration.id,
           eventCouponId: eventCoupon.id,
         },
       })
       if (retryExisting) return retryExisting
       
       throw createError({
         statusCode: 409,
         statusMessage: "Already Generated", // Requirement: "Already Generated"
       })
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal Server Error",
    })
  }
})
