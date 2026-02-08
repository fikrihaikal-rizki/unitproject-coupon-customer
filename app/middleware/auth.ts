export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()
  const authStore = useAuthStore()

  if (!user.value) {
    if (authStore.eventSlug) {
      return navigateTo(`/login/${authStore.eventSlug}`)
    }

    return navigateTo('/')
  }
})
