<script setup lang="ts">
import { CheckCircle2 } from "lucide-vue-next";

definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();
const customer = computed(() => authStore.customer);
const eventId = computed(() => authStore.currentEventId);

// Redirect to home if no event id or customer id is found (invalid session)
onMounted(() => {
  if (!eventId.value || !customer.value) {
    navigateTo("/");
  }
});

// Fetch event details if not already in store
const { data: eventDetails } = await useFetch<any>(`/api/events/list`, {
  transform: (events: any[]) => events.find((e) => e.id === eventId.value),
  immediate: !!eventId.value,
});

// Update store if event details were fetched
watch(eventDetails, (val) => {
  if (val && !authStore.currentEvent) {
    authStore.setAuthData({ currentEvent: val });
  }
}, { immediate: true });

const event = computed(() => authStore.currentEvent || eventDetails.value);

const greeting = computed(() => {
  const baseGreeting = event.value?.successGreeting || "Registrasi Berhasil!";
  const name = customer.value?.fullName || "";
  return name ? `Selamat bergabung, ${name}!` : baseGreeting;
});

const description = computed(() => event.value?.successDescription || "Terima kasih telah mendaftar. Kami menantikan kehadiran Anda!");
</script>

<template>
  <div
    class="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6"
  >
    <div v-if="event" class="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
      <Card
        class="border-zinc-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900 overflow-hidden"
      >
        <div class="p-8 text-center space-y-6">
          <!-- Success Icon -->
          <div class="flex justify-center">
            <div class="relative">
              <div class="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full blur-xl scale-150"></div>
              <CheckCircle2 class="w-16 h-16 text-green-600 dark:text-green-500 relative z-10" />
            </div>
          </div>

          <!-- Main Heading -->
          <div class="space-y-2">
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {{ greeting }}
            </h1>
            <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
              {{ event.successGreeting || 'Registration Complete' }}
            </p>
          </div>

          <!-- Description -->
          <div 
            class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm"
            v-html="description"
          ></div>

          <!-- Action Button -->
          <div class="pt-4">
            <Button
              as="a"
              :href="event.successPrimaryBtnUrl || '/'"
              class="w-full h-12 font-semibold transition-all hover:translate-y-[-2px] active:scale-[0.98] shadow-md shadow-zinc-900/10"
            >
              {{ event.successPrimaryBtnText || 'Kembali ke Beranda' }}
            </Button>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="px-8 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 text-center"
        >
          <p class="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
            Konfirmasi Pendaftaran • {{ event.title }}
          </p>
        </div>
      </Card>
    </div>

    <!-- Loading State -->
    <div v-else class="flex flex-col items-center space-y-4">
      <div class="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      <p class="text-sm text-zinc-500 animate-pulse">Memuat halaman...</p>
    </div>
  </div>
</template>
