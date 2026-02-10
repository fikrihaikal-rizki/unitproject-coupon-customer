import prisma from "~~/server/utils/prisma";
import { randomBytes } from "crypto";
import { serverSupabaseUser } from "#supabase/server";
import { Prisma } from "~~/prisma/generated/client";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const body = await readBody(event);
  const { eventId, claimSeatValue } = body;


  // Validate inputs
  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Event ID is required",
    });
  }

  if (!claimSeatValue) {
    throw createError({
      statusCode: 400,
      statusMessage: "Claim seat value is required",
    });
  }

  try {
    // Generate unique QR code data
    const qrCodeData = randomBytes(16).toString("hex");

    // Attempt to create the registration with PENDING status
    const findClaimSeat = await prisma.eventRegistration.findFirst({
      where: {
        eventId: eventId,
        customerId: { not: user.sub },
        claimSeatValue: claimSeatValue,
      },
    });

    if (findClaimSeat) {
      await prisma.claimSeatError.create({
        data: {
          eventId: eventId,
          customerId: user.sub,
          triedValue: claimSeatValue,
          errorMessage: "Seat/ID already taken - duplicate entry attempted",
          status: "open",
        },
      });

      throw createError({
        statusCode: 409,
        statusMessage: "Seat/ID already taken - duplicate entry attempted",
      });
    }

    const findRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId: eventId,
        customerId: user.sub,
      },
    });

    if (!findRegistration) {
      let registration = await prisma.eventRegistration.create({
        data: {
          eventId: eventId,
          customerId: user.sub,
          claimSeatValue: claimSeatValue,
          qrCodeData: qrCodeData,
          status: "pending",
        },
      });

      return {
        success: true,
        registrationId: registration.id,
        message: "Seat claimed successfully",
      };
    }

    let registration = await prisma.eventRegistration.update({
      where: {
        id: findRegistration.id,
      },
      data: {
        claimSeatValue: claimSeatValue,
        qrCodeData: qrCodeData,
        status: "pending",
      },
    });

    return {
      success: true,
      registrationId: registration.id,
      message: "Seat claimed successfully",
    };
  } catch (error: any) {
    await prisma.claimSeatError.create({
      data: {
        eventId: eventId,
        customerId: user.sub,
        triedValue: claimSeatValue,
        errorMessage: error.message,
        status: "open",
      },
    });

    // Log unexpected errors
    console.error("Unexpected error in claim-seat:", error);

    // Return 500 Internal Server Error for other errors
    throw createError({
      statusCode: 500,
      statusMessage: "An unexpected error occurred. Please try again.",
    });
  }
});
