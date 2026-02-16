<script setup lang="ts">
import { AlertTriangle, ArrowRight } from "lucide-vue-next";

interface Props {
  open: boolean;
  registeredEventName: string;
  dismissable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  dismissable: true,
});

const emit = defineEmits(["update:open", "continue"]);

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});
</script>

<template>
  <AlertDialog v-model:open="isOpen">
    <AlertDialogContent
      class="sm:max-w-[400px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-0 overflow-hidden"
    >
      <div
        class="flex flex-col items-center justify-center p-8 text-center space-y-4"
      >
        <div
          class="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-2"
        >
          <AlertTriangle class="w-8 h-8 text-amber-600 dark:text-amber-500" />
        </div>

        <AlertDialogTitle
          class="text-xl font-bold text-zinc-900 dark:text-zinc-50"
        >
          Restriction Notice
        </AlertDialogTitle>

        <AlertDialogDescription
          class="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed"
        >
          You can only participate in the event you previously registered for:
          <span
            class="block mt-2 font-bold text-zinc-900 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700"
          >
            {{ registeredEventName }}
          </span>
        </AlertDialogDescription>
      </div>

      <AlertDialogFooter
        class="p-6 pt-0 flex flex-col space-y-2 sm:space-y-2 sm:justify-center sm:flex-col"
      >
        <AlertDialogAction
          class="w-full h-11 font-bold bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 m-0"
          @click="$emit('continue')"
        >
          Continue to {{ registeredEventName }}
          <ArrowRight class="w-4 h-4 ml-2" />
        </AlertDialogAction>
        <AlertDialogCancel
          v-if="dismissable !== false"
          class="w-full h-11 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 m-0"
          @click="isOpen = false"
        >
          Close
        </AlertDialogCancel>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
