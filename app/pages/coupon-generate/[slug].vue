<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import { toast } from "vue-sonner";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const couponSlug = route.params.slug as string;

const isProcessing = ref(true);
const errorMsg = ref("");

onMounted(async () => {
  // Simulate short delay for UX if needed, but API might be fast.
  // Let's call API immediately.
  isProcessing.value = true;
  try {
    const response = await $fetch("/api/customer/coupons/generate", {
      method: "POST",
      body: {
        couponSlug,
      },
    });

    // Success
    // If already exists, API returns it too.
    // Redirect to detail page
    setTimeout(() => {
      navigateTo(`/coupon-detail/${couponSlug}`);
    }, 1500); // Add slight delay to show animation
  } catch (err: any) {
    console.error("Generation failed", err);
    errorMsg.value = err.data?.statusMessage || "Failed to generate coupon.";
    toast.error(errorMsg.value);

    // Redirect back after delay
    setTimeout(() => {
      navigateTo("/dashboard");
    }, 2000);
  }
});

isProcessing.value = false;
</script>

<template>
  <div
    class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center"
  >
    <div
      class="space-y-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-700"
    >
      <!-- Animation Container -->
      <div class="relative w-32 h-32 mx-auto">
        <div
          class="absolute inset-0 bg-white/5 rounded-full blur-xl animate-pulse"
        ></div>
        <div
          class="relative w-full h-full bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center shadow-2xl"
        >
          <Loader2 v-if="!errorMsg" class="w-12 h-12 text-white animate-spin" />
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-red-500"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
      </div>

      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-white tracking-tight">
          {{ errorMsg ? "Generation Failed" : "Generating Coupon" }}
        </h1>
        <p class="text-zinc-400">
          {{
            errorMsg || "Please wait while we prepare your exclusive ticket..."
          }}
        </p>
      </div>

      <!-- Loading Bar -->
      <div
        v-if="!errorMsg"
        class="w-full bg-zinc-900 rounded-full h-1 overflow-hidden"
      >
        <div
          class="bg-white h-full rounded-full w-1/3 animate-[loading_2s_ease-in-out_infinite]"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(300%);
  }
}
</style>
