<script setup lang="ts">
import { dateToFormat } from "#imports";
import {
  ShieldAlert,
  User,
  Mail,
  CalendarDays,
  ArrowLeft,
} from "lucide-vue-next";

definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();
const router = useRouter();

const user = computed(() => authStore.customer);
const blacklistedUntil = computed(() => authStore.isBlacklistedUntil);

const backToHome = async () => {
  router.push(`/`);
};
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6"
  >
    <Card
      class="w-full max-w-md border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden bg-white dark:bg-zinc-900"
    >
      <div class="p-8 flex flex-col items-center space-y-8 text-center">
        <!-- Status Icon -->
        <div
          class="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-500 ring-8 ring-red-50 dark:ring-red-900/10"
        >
          <ShieldAlert class="w-10 h-10" />
        </div>

        <div class="space-y-4 w-full">
          <div class="space-y-1">
            <h1
              class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Access Restricted
            </h1>
            <p class="text-zinc-500 dark:text-zinc-400 text-sm">
              Your account has been temporarily restricted
            </p>
          </div>

          <!-- User Information Card -->
          <div
            v-if="user"
            class="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 text-left space-y-3"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300"
              >
                <User class="w-4 h-4" />
              </div>
              <div>
                <p
                  class="text-[10px] text-zinc-400 uppercase font-bold tracking-wider"
                >
                  Account Name
                </p>
                <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {{ user.fullName || "User" }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300"
              >
                <Mail class="w-4 h-4" />
              </div>
              <div>
                <p
                  class="text-[10px] text-zinc-400 uppercase font-bold tracking-wider"
                >
                  Email Address
                </p>
                <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {{ user.email }}
                </p>
              </div>
            </div>

            <div
              class="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3"
            >
              <div
                class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-500"
              >
                <CalendarDays class="w-4 h-4" />
              </div>
              <div>
                <p
                  class="text-[10px] text-orange-600/70 dark:text-orange-400 uppercase font-bold tracking-wider"
                >
                  Restricted Until
                </p>
                <ClientOnly>
                  <p
                    class="text-sm font-semibold text-orange-600 dark:text-orange-400"
                  >
                    {{ dateToFormat(blacklistedUntil, "dd MMM yyyy HH:mm:ss") }}
                  </p>
                </ClientOnly>
              </div>
            </div>
          </div>

          <div class="pt-2">
            <p class="text-sm text-zinc-500 dark:text-zinc-500">
              If you believe this is a mistake, please contact the event
              administrator for further assistance.
            </p>
          </div>
        </div>

        <div class="w-full pt-4">
          <Button
            @click="backToHome"
            variant="default"
            class="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft class="w-4 h-4" />
            Back To Event List
          </Button>
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
  </div>
</template>
