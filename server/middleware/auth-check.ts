import prisma from "~~/server/utils/prisma"
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Only handle API requests
  if (!event.path.startsWith('/api')) return

  const user = await serverSupabaseUser(event)
  if (!user) return

  const now = new Date()

  try {
    // Find blacklisted registrations for this customer that have expired
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        customerId: user.id,
        status: 'blacklisted',
        blacklistedUntil: {
          lt: now
        }
      },
      select: {
        id: true
      }
    })

    // Bulk update to active
    if (registrations.length > 0) {
      await prisma.eventRegistration.updateMany({
        where: {
          id: {
            in: registrations.map(r => r.id)
          }
        },
        data: {
          status: 'active',
          blacklistedUntil: null
        }
      })
      
      console.log(`[LazyRestore] Updated ${registrations.length} registrations to active for user ${user.id}`)
    }
  } catch (error) {
    console.error('[LazyRestore] Error updating registrations:', error)
  }
})
