import prisma from "~~/server/utils/prisma"
import { randomBytes } from'crypto'

import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const body = await readBody(event)
  const { eventId, claimSeatValue, questionnaireAnswers } = body

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID is required',
    })
  }

  // 1. Create/Update Event Registration
  // Generate a unique QR code data
  const qrCodeData = randomBytes(16).toString('hex')

  const registration = await prisma.eventRegistration.upsert({
    where: {
      customerId_eventId: {
        customerId: user.id,
        eventId: eventId
      }
    },
    update: {
      claimSeatValue: claimSeatValue || '',
      status: 'active'
    },
    create: {
      customerId: user.id,
      eventId: eventId,
      claimSeatValue: claimSeatValue || '',
      qrCodeData: qrCodeData,
      status: 'active'
    }
  })

  // 2. Bulk insert Questionnaire Answers if any
  if (questionnaireAnswers && Array.isArray(questionnaireAnswers) && questionnaireAnswers.length > 0) {
    // Delete existing answers for this registration if any to avoid duplicates on retry
    await prisma.questionnaireAnswer.deleteMany({
      where: { registrationId: registration.id }
    })

    await prisma.questionnaireAnswer.createMany({
      data: questionnaireAnswers.map((ans: any) => ({
        registrationId: registration.id,
        questionId: ans.questionId,
        answerValue: String(ans.answerValue)
      }))
    })
  }

  return {
    success: true,
    registration
  }
})
