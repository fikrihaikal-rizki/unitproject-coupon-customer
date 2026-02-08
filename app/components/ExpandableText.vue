<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';

interface Props {
  content: string;
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 300,
});

const isExpanded = ref(false);
const isLongText = computed(() => props.content.length > props.limit);

const displayContent = computed(() => {
  if (isExpanded.value || !isLongText.value) {
    return props.content;
  }
  return props.content.substring(0, props.limit) + "...";
});
</script>

<template>
  <div class="relative transition-all duration-300">
    <div
      class="prose prose-sm max-w-none text-slate-600 leading-relaxed overflow-hidden transition-all duration-500"
      :class="[isExpanded ? 'max-h-[1000px]' : 'max-h-40']"
    >
      <div v-html="displayContent"></div>
    </div>

    <div v-if="isLongText" class="flex flex-col items-center pt-2">
      <div
        v-if="!isExpanded"
        class="absolute bottom-10 left-0 w-full h-12 bg-gradient-to-t from-white/90 to-transparent pointer-events-none"
      ></div>

      <button
        @click="isExpanded = !isExpanded"
        class="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
      >
        {{ isExpanded ? "Show Less" : "Read More" }}
        <span
          :class="[
            'transition-transform duration-300',
            isExpanded ? 'rotate-180' : '',
          ]"
        >
          <ChevronDown class="w-3 h-3" />
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Opsional: Memastikan style v-html tetap rapi */
:deep(p) {
  margin-bottom: 0.75rem;
}
:deep(ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
}
</style>
