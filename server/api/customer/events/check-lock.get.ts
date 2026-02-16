import prisma from "~~/server/utils/prisma";
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const query = getQuery(event);
  const eventId = query.eventId as string;

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing eventId",
    });
  }

  // 1. Fetch Event and its Group
  const targetEvent = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      group: true,
    },
  });

  if (!targetEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: "Event not found",
    });
  }

  // If no group or locking is disabled, allow
  if (!targetEvent.group) {
      return { status: "allowed" };
  }
  
  if (targetEvent.group.lockToSingleEvent === false) {
    return { status: "allowed" };
  }

  // 2. Check for existing registrations in the same group
  const existingRegistration = await prisma.eventRegistration.findFirst({
    where: {
      customerId: user.id || user.sub, // Handle both id and sub from supabase user
      event: {
        groupId: targetEvent.groupId,
        id: { not: eventId }, // Exclude current event
      },
      status: { not: "cancelled" }, // Ignore cancelled registrations
    },
    include: {
      event: true,
    },
  });

  if (existingRegistration && existingRegistration.event) {
    return {
      status: "conflict",
      registeredEventName: existingRegistration.event.title,
      registeredEventSlug: existingRegistration.event.slug,
    };
  }

  return { status: "allowed" };
});
