<script setup lang="ts">
import { Loader2, User, LogOut } from "lucide-vue-next";

const props = defineProps<{
  user: any;
  loading: boolean;
  open: boolean;
}>();

const emit = defineEmits(["update:open", "confirm", "switch-account"]);

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent
      class="sm:max-w-[400px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-0 overflow-hidden"
    >
      <DialogHeader class="p-6 pb-2 text-left">
        <DialogTitle class="text-xl font-bold text-zinc-900 dark:text-zinc-50"
          >Confirm Account</DialogTitle
        >
        <DialogDescription class="text-zinc-500 dark:text-zinc-400">
          You are currently logged in as:
        </DialogDescription>
      </DialogHeader>

      <div class="px-6 py-4 flex flex-col items-center gap-4">
        <div
          class="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-100 dark:border-zinc-700"
        >
          <NuxtImg
            v-if="user?.user_metadata?.avatar_url"
            :src="user.user_metadata.avatar_url"
            class="w-full h-full object-cover"
          />
          <User v-else class="w-10 h-10 text-zinc-400" />
        </div>

        <div class="text-center space-y-1">
          <p class="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
            {{ user?.user_metadata?.full_name || "User" }}
          </p>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
            {{ user?.email }}
          </p>
        </div>
      </div>

      <DialogFooter
        class="bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800"
      >
        <div class="w-full flex flex-col gap-3 p-6">
          <Button
            class="w-full h-11 font-bold shadow-lg shadow-zinc-900/5"
            @click="$emit('confirm')"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            Continue via {{ user?.email }}
          </Button>

          <Button
            variant="destructive"
            class="w-full h-11 hover:bg-red-500/90"
            @click="$emit('switch-account')"
            :disabled="loading"
          >
            <LogOut class="w-4 h-4 mr-2" />
            Switch Account
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
