<script setup lang="ts">
import { Download } from "lucide-vue-next";
import { domToJpeg } from "modern-screenshot";
import QrcodeVue from "qrcode.vue";
import { toast } from "vue-sonner";

interface Props {
  couponName: string;
  eventName: string;
  qrData: string;
  expiryDate?: string | Date;
  redeemFrom?: string | Date;
  redeemUntil?: string | Date;
  code: string;
}

const props = defineProps<Props>();
const isDownloading = ref(false);

const downloadTicket = async () => {
  isDownloading.value = true;
  try {
    const el = document.getElementById("coupon-card");
    if (el) {
      const dataUrl = await domToJpeg(el, { quality: 1, scale: 2 });
      const link = document.createElement("a");
      link.download = `${props.eventName}-${props.couponName}-ticket.jpg`;
      link.href = dataUrl;
      link.click();

      toast.success("Coupon downloaded successfully!");
    }
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Failed to download Coupon.");
  } finally {
    isDownloading.value = false;
  }
};

const formatDate = (date?: string | Date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};
</script>

<template>
  <div class="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
    <div
      id="coupon-card"
      @click="downloadTicket"
      class="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <Card
        class="gap-2 w-full max-w-sm border-2 border-dashed border-primary shadow-2xl relative overflow-hidden bg-white"
      >
        <!-- Ticket cutouts effect -->
        <div
          class="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-r-2 border-dashed border-primary"
        ></div>
        <div
          class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-l-2 border-dashed border-primary"
        ></div>

        <CardHeader class="text-center pb-2">
          <Badge variant="secondary" class="w-fit mx-auto mb-2">{{
            eventName
          }}</Badge>
          <CardTitle class="text-3xl font-bold tracking-tight text-primary">
            {{ couponName }}
          </CardTitle>
          <p class="text-sm text-muted-foreground">
            {{ code }}
          </p>
        </CardHeader>

        <CardContent class="flex flex-col items-center py-6">
          <div class="p-4 bg-white border rounded-xl shadow-inner mb-6">
            <QrcodeVue
              :value="qrData"
              :size="200"
              level="H"
              render-as="svg"
              background="#ffffff"
              foreground="#000000"
            />
          </div>

          <div
            class="w-full h-px bg-neutral-200 border-dashed border-b mb-6"
          ></div>

          <div class="flex flex-col gap-2 text-center w-full px-4">
            <div class="flex flex-col items-center justify-between text-sm">
              <span class="text-zinc-500">Valid From</span>
              <ClientOnly>
                <span class="font-medium text-zinc-900 dark:text-zinc-50">{{
                  formatDate(redeemFrom)
                }}</span>
              </ClientOnly>
            </div>
            <div class="flex flex-col items-center justify-between text-sm">
              <span class="text-zinc-500">Expires On</span>
              <ClientOnly>
                <span class="font-medium text-red-600 dark:text-red-400">{{
                  formatDate(expiryDate)
                }}</span>
              </ClientOnly>
            </div>
          </div>
        </CardContent>
        <CardFooter
          class="flex flex-col items-center justify-center bg-primary/5 h-12"
        >
          <p class="text-[10px] text-primary/60 font-medium tracking-wide">
            TAP TO DOWNLOAD
          </p>
        </CardFooter>
      </Card>
    </div>
    <!-- Actions -->
    <Button
      @click="downloadTicket"
      :disabled="isDownloading"
      variant="outline"
      class="w-full max-w-xs gap-2"
    >
      <Download class="w-4 h-4" />
      {{ isDownloading ? "Saving..." : "Save to Gallery" }}
    </Button>
  </div>
</template>

<style scoped>
/* Optional: specific print styles or overrides */
</style>
