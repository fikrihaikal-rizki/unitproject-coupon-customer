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

      // Logic:
      // pending -> /registration
      // completed -> /registration-success
      // active -> /dashboard

      if (!status.status || status.status === 'pending') {
        return navigateTo("/registration");
      } else if (status.status === 'completed') {
        return navigateTo("/registration-success");
      } else if (status.status === 'active') {
        return navigateTo("/dashboard");
      } else {
        // Fallback for unknown status or if status is missing but isRegistered is true
        if (status.isRegistered) {
          return navigateTo("/registration-success");
        }
      }
    } catch (err: any) {
      // If error, maybe clear auth or redirect to home?
      // For now, let's just log and maybe redirect home if critical
      console.error(err);
      return navigateTo("/");
    }
  }
})
