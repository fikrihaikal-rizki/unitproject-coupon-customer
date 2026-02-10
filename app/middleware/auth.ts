import { toast } from "vue-sonner"

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()
  const authStore = useAuthStore()

  if (!user.value) {
    return navigateTo('/')
  }

  if (!authStore.currentEventSlug) {
    return navigateTo('/')
  }
})
