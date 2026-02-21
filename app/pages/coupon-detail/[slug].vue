<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import CouponDetail from "~/components/CouponDetail.vue";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const authStore = useAuthStore();
const couponSlug = route.params.slug as string;

const { data, pending, error } = await useFetch("/api/customer/coupons/detail", {
  params: {
    eventSlug: authStore.currentEventSlug,
    couponSlug,
    customerId: authStore.customerId,
  },
});

// If not found or not generated, maybe redirect to generate?
// But generate page handles "already generated".
// If detail page finds no "customerCoupon", it means user hasn't generated it.
// We should redirect to dashboard or generate page?
// The user said: "Check Status: If already generated... Redirect to /coupon-detail".
// So if I am here, I expect to see it.
// If I manually go here without generating, `data.customerCoupon` will be null.
// I should probably redirect to dashboard or show "Not Found".

if (!pending.value && data.value && !data.value.customerCoupon) {
  // Coupon exists but not generated for this user
  navigateTo(`/coupon-generate/${couponSlug}`);
}

const goBack = () => {
   navigateTo("/dashboard");
};
</script>

<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
    <!-- Header / Navbar -->
    <header class="p-4 md:p-6 sticky top-0 z-10 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-sm">
      <Button variant="ghost" class="gap-2 pl-0 hover:bg-transparent hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" @click="goBack">
        <ArrowLeft class="w-5 h-5" />
        <span class="font-medium">Back to Dashboard</span>
      </Button>
    </header>

    <main class="flex-1 flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in zoom-in-95 duration-500">
      <div v-if="pending" class="flex flex-col items-center space-y-4">
         <div class="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
         <p class="text-zinc-500 animate-pulse">Loading your ticket...</p>
      </div>

      <div v-else-if="error" class="text-center space-y-4">
         <p class="text-red-500 font-medium">Failed to load coupon details.</p>
         <Button @click="goBack">Go Back</Button>
      </div>

      <div v-else-if="data && data.customerCoupon" class="w-full max-w-md">
        <CouponDetail 
          :couponName="data.coupon.name"
          :eventName="data.event.title"
          :qrData="data.customerCoupon.qrData"
          :code="data.coupon.code"
          :expiryDate="data.coupon.redeemUntil"
          :redeemFrom="data.coupon.redeemFrom"
          :redeemUntil="data.coupon.redeemUntil"
        />
        
        <p class="text-center text-xs text-zinc-400 mt-8 max-w-xs mx-auto">
           Show this QR code to the staff to redeem your coupon. 
           Please make sure to redeem before the expiry date.
        </p>
      </div>
    </main>
  </div>
</template>
