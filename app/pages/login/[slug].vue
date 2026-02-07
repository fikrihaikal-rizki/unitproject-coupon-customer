<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const authStore = useAuthStore();

const { data: event, error: eventError } = await useFetch(
  `/api/events/${slug}`,
);

const loading = ref(false);
const errorMsg = ref("");

// Handle Google Login
const loginWithGoogle = async () => {
  loading.value = true;
  errorMsg.value = "";

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + `/login/${slug}`,
    },
  });

  if (error) {
    errorMsg.value = error.message;
    loading.value = false;
  }
};

// Check status and sync after login
const syncUserAndRedirect = async () => {
  if (!user.value) return;

  loading.value = true;
  try {
    const { data, error } = await useFetch("/api/auth/login-check", {
      method: "POST",
      body: {
        slug,
        email: user.value.email,
        fullName: user.value.user_metadata?.full_name,
        customerId: user.value.sub,
      },
    });

    if (error.value) {
      throw new Error(error.value.statusMessage || "Failed to sync user data");
    }

    if (data.value) {
      authStore.setAuthData({
        eventId: data.value.event.id,
        customerId: data.value.customer.id,
        eventSlug: slug,
        customer: data.value.customer,
      });

      const status = data.value.registrationStatus;

      if (!status.isRegistered) {
        return navigateTo("/registration");
      } else if (!status.isStarted) {
        return navigateTo("/registration-success");
      } else {
        return navigateTo("/");
      }
    }
  } catch (err: any) {
    errorMsg.value = err.message || "An error occurred during synchronization";
  } finally {
    loading.value = false;
  }
};

// Watch for user changes (after redirect from OAuth)
watch(
  user,
  (val) => {
    if (val) {
      syncUserAndRedirect();
    }
  },
  { immediate: true },
);
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6"
  >
    <div v-if="eventError" class="text-center space-y-4">
      <h1 class="text-2xl font-bold text-red-600">Event Not Found</h1>
      <p class="text-zinc-600">
        The event you are looking for does not exist or has been removed.
      </p>
    </div>

    <Card
      v-else-if="event"
      class="w-full max-w-md border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden bg-white dark:bg-zinc-900"
    >
      <div class="p-8 flex flex-col items-center text-center space-y-8">
        <!-- Event Logo / Banner -->
        <div
          class="relative w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-800"
        >
          <NuxtImg
            v-if="event.bannerPath"
            :src="event.bannerPath"
            provider="imagekit"
            class="w-full h-full object-cover"
            alt="Event Logo"
          />
          <div v-else class="text-zinc-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-ticket"
            >
              <path
                d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"
              />
              <path d="M13 5v2" />
              <path d="M13 17v2" />
              <path d="M13 11v2" />
            </svg>
          </div>
        </div>

        <div class="space-y-2">
          <h1
            class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            {{ event.title }}
          </h1>
          <p class="text-zinc-500 dark:text-zinc-400 text-sm">
            Sign in to claim your daily coupon and stay updated.
          </p>
        </div>

        <div class="w-full space-y-4">
          <Button
            @click="loginWithGoogle"
            variant="outline"
            class="w-full h-12 relative flex items-center justify-center gap-3 font-medium transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.98]"
            :disabled="loading"
          >
            <template v-if="loading">
              <svg
                class="animate-spin h-5 w-5 text-zinc-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </template>
            <template v-else>
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </template>
          </Button>

          <p
            v-if="errorMsg"
            class="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 line-clamp-2"
          >
            {{ errorMsg }}
          </p>
        </div>
      </div>

      <div
        class="px-8 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 text-center"
      >
        <p
          class="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold"
        >
          Powered by UnitProject
        </p>
      </div>
    </Card>

    <div v-else class="flex flex-col items-center space-y-4">
      <div class="animate-pulse flex flex-col items-center space-y-4">
        <div class="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        <div class="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
    </div>
  </div>
</template>
