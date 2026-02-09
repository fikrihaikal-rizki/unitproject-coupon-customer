import prisma from "~~/server/utils/prisma"

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
  const { registrationId, eventId, questionnaireAnswers } = body

  if (!registrationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Registration ID is required',
    })
  }

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID is required',
    })
  }

  // Transaction to ensure data consistency
  const result = await prisma.$transaction(async (tx) => {
    // Verify the registration exists and belongs to this user
    const existingRegistration = await tx.eventRegistration.findUnique({
      where: { id: registrationId }
    })

    if (!existingRegistration) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Registration not found',
      })
    }

    if (existingRegistration.customerId !== user.sub) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You are not authorized to update this registration',
      })
    }

    if (existingRegistration.eventId !== eventId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Event ID mismatch',
      })
    }

    // Update the registration status from 'pending' to 'completed'
    const registration = await tx.eventRegistration.update({
      where: { id: registrationId },
      data: {
        status: 'completed',
      }
    })

    // Handle Questionnaire Answers
    if (questionnaireAnswers && Array.isArray(questionnaireAnswers)) {
      // Delete existing answers for this registration
      await tx.questionnaireAnswer.deleteMany({
        where: { registrationId: registration.id }
      })

      if (questionnaireAnswers.length > 0) {
        await tx.questionnaireAnswer.createMany({
          data: questionnaireAnswers.map((ans: any) => ({
            registrationId: registration.id,
            questionId: ans.questionId,
            answerValue: String(ans.answerValue)
          }))
        })
      }
    }

    return registration
  })

  return {
    success: true,
    registration: result
  }
})
