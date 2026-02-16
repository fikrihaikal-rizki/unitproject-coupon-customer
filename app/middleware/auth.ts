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

  if (to.path == '/registration') {
    console.log(authStore.currentEventId)
    console.log('registration')
    try {
      const { data: loginCheck, error: loginError } = await useFetch(
        "/api/auth/login-check",
        {
          method: "POST",
          body: {
            slug: authStore.currentEventSlug,
            email: user.value.email,
            fullName: user.value.user_metadata?.full_name,
            customerId: user.value.sub,
          },
        },
      );

      if (loginError.value) {
        throw new Error(
          loginError.value.statusMessage || "Failed to sync user data",
        );
      }

      if (!loginCheck.value) {
        throw new Error("Data not found, Failed to sync user data");
      }

      const loginCheckResult = loginCheck.value as any;

      const status = loginCheckResult.registrationStatus;

      if (!status.isRegistered) {
        return navigateTo("/registration");
      } else if (!status.isStarted && status.isRegistered) {
        return navigateTo("/registration-success");
      } else {
        return navigateTo("/registration-success");
      }
    } catch (err: any) {
      return navigateTo("/");
    }
  }
})
