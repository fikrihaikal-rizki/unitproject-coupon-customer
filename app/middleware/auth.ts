export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()
  const authStore = useAuthStore()
  
  

  // If user is not authenticated, redirect to login page (though login is dynamic, so we might need a better logic here)
  // For now, if someone tries to access /registration directly without a session, we redirect.
  if (!user.value) {
    // If we have a stored eventSlug, we can redirect back to /login/[slug]
    if (authStore.eventSlug) {
      return navigateTo(`/login/${authStore.eventSlug}`)
    }
    // Otherwise, we might need a default or error
    return navigateTo('/')
  }
})
