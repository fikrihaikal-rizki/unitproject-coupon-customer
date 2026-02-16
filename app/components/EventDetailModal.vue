<script setup lang="ts">
import { AlertTriangle, ArrowRight, Ticket } from "lucide-vue-next";

const props = defineProps<{
  open: boolean;
  event: any;
}>();

const emit = defineEmits(["update:open", "continue"]);

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent
      :aria-describedby="undefined"
      class="sm:max-w-[425px] p-0 overflow-y-scroll no-scrollbar max-h-screen border-none bg-white dark:bg-zinc-900 shadow-2xl"
    >
      <div v-if="event" class="flex flex-col">
        <!-- Banner/Header -->
        <div
          class="relative h-48 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden"
        >
          <template v-if="event.bannerPath">
            <NuxtImg
              :src="event.bannerPath"
              provider="imagekit"
              class="w-full h-full object-cover object-center"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
            ></div>
          </template>
          <Ticket v-else class="w-16 h-16 text-zinc-300" />

          <DialogHeader class="absolute bottom-4 left-6 text-left">
            <DialogTitle class="text-2xl font-bold text-white leading-tight">
              {{ event.title }}
            </DialogTitle>
          </DialogHeader>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6">
          <div class="space-y-4">
            <div
              class="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400"
            >
              <div class="flex flex-col">
                <span
                  class="text-[10px] uppercase tracking-widest font-bold text-zinc-400"
                  >Start Date</span
                >
                <ClientOnly>
                  <span class="font-medium text-zinc-900 dark:text-zinc-50">{{
                    formatDateToLocal(event.startAt)
                  }}</span>
                </ClientOnly>
              </div>
              <div class="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800"></div>
              <div class="flex flex-col">
                <span
                  class="text-[10px] uppercase tracking-widest font-bold text-zinc-400"
                  >End Date</span
                >
                <ClientOnly>
                  <span class="font-medium text-zinc-900 dark:text-zinc-50">{{
                    formatDateToLocal(event.endAt)
                  }}</span>
                </ClientOnly>
              </div>
            </div>

            <div class="space-y-2">
              <span
                class="text-[10px] uppercase tracking-widest font-bold text-zinc-400"
                >Description</span
              >
              <ExpandableText
                :content="
                  event.description || 'No description availabe for this event.'
                "
                :limit="150"
              />
            </div>
          </div>

          <DialogFooter class="sm:justify-start">
            <Button
              class="w-full h-12 text-md font-bold transition-all active:scale-95 shadow-lg shadow-zinc-900/10"
              @click="$emit('continue')"
            >
              Join Event & Claim Coupons
            </Button>
          </DialogFooter>
        </div>

        <div
          class="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 text-center"
        >
          <p
            class="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-2"
          >
            <Ticket class="w-3 h-3" /> Powered by UnitProject
          </p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
