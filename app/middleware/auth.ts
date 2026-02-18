import { toast } from "vue-sonner"

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()
  const authStore = useAuthStore()

  if (!user.value || !authStore.customerId) {
    return navigateTo('/')
  }

  if (!authStore.currentEventSlug) {
    return navigateTo('/')
  }

  if (from.path != '/login/' + authStore.currentEventSlug && (to.path == '/registration' || to.path == '/dashboard')) {
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
      if (!status.isRegistered && to.path == '/registration') {
        return;
      }

      if (!status.isRegistered && to.path == '/dashboard') {
        return navigateTo("/registration");
      }

      if (!status.isStarted && status.status === 'completed') {
        return navigateTo("/registration-success");
      } else if (status.isStarted && status.status === 'completed') {
        return navigateTo("/registration-success");
      }

      if (!status.isStarted && status.status === 'active') {
        return navigateTo("/registration-success");
      } else if (status.isStarted && status.status === 'active' && to.path == '/registration') {
        return navigateTo("/dashboard");
      } else if (status.isStarted && status.status === 'active' && to.path == '/dashboard') {
        return;
      } else {
        // Fallback
        return navigateTo("/registration-success");
      }
    } catch (err: any) {
      // If error, maybe clear auth or redirect to home?
      // For now, let's just log and maybe redirect home if critical
      console.error(err);
      return navigateTo("/");
    }
  }
})
