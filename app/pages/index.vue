<script setup lang="ts">
import {
  Search,
  Rocket,
  Calendar,
  ChevronRight,
  Ticket,
} from "lucide-vue-next";
import { toast } from "vue-sonner";

// Fetch Event List
const { data: events, pending } = await useFetch<any[]>("/api/events/list");

const authStore = useAuthStore();
const searchQuery = ref("");
const selectedEvent = ref<any>(null);
const isModalOpen = ref(false);

// Native Date grouping logic
const groupedEvents = computed(() => {
  if (!events.value) return { ongoing: [], upcoming: [] };

  const now = new Date();
  const filtered = events.value.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );

  return {
    ongoing: filtered.filter((e) => {
      const start = new Date(e.startAt);
      const end = new Date(e.endAt);
      return now >= start && now <= end;
    }),
    upcoming: filtered.filter((e) => {
      const start = new Date(e.startAt);
      return start > now;
    }),
  };
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const openEventDetail = (event: any) => {
  selectedEvent.value = event;
  isModalOpen.value = true;
};

const joinEvent = (slug: string) => {
  // Pre-populate store if possible (though middleware also validates)
  if (selectedEvent.value) {
    authStore.setAuthData({
      eventId: selectedEvent.value.id,
      eventSlug: selectedEvent.value.slug,
    });
  }
  navigateTo(`/login/${slug}`);
};
</script>

<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col overflow-y-scroll no-scrollbar">
    <!-- <SiteHeader /> -->

    <main class="flex-1 max-w-7xl mx-auto w-full px-6 py-12 space-y-12">
      <!-- Hero/Search Section -->
      <div class="space-y-6 text-center max-w-2xl mx-auto">
        <h1
          class="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Discover Events
        </h1>
        <p class="text-zinc-600 dark:text-zinc-400">
          Select an event to view details, claim your coupons, and join the
          community.
        </p>

        <div class="relative max-w-md mx-auto group">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-50 transition-colors"
          />
          <Input
            v-model="searchQuery"
            placeholder="Search events by name..."
            class="pl-10 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-50"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="pending"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="h-[200px] rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 animate-pulse flex flex-col p-6 space-y-4"
        >
          <div class="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800"></div>
          <div class="space-y-2">
            <div class="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
            <div class="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="space-y-16">
        <!-- Ongoing Events -->
        <section v-if="groupedEvents.ongoing.length > 0" class="space-y-6">
          <div class="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <Rocket class="w-5 h-5 text-emerald-500" />
            <h2 class="text-xl font-bold">Ongoing Events</h2>
            <Badge variant="outline" class="ml-2 font-mono">{{
              groupedEvents.ongoing.length
            }}</Badge>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              v-for="event in groupedEvents.ongoing"
              :key="event.id"
              class="group hover:shadow-xl transition-all duration-300 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer overflow-hidden relative"
              @click="openEventDetail(event)"
            >
              <div class="p-6 space-y-4">
                <div class="flex items-start justify-between">
                  <div
                    class="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-sm group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-50 dark:group-hover:text-black transition-colors overflow-hidden"
                  >
                    <NuxtImg
                      v-if="event.bannerPath"
                      :src="event.bannerPath"
                      provider="imagekit"
                      class="w-full h-full object-cover"
                    />
                    <Ticket v-else class="w-6 h-6" />
                  </div>
                  <Badge
                    variant="secondary"
                    class="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-none"
                    >Live</Badge
                  >
                </div>

                <div class="space-y-1">
                  <h3
                    class="font-bold text-lg group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors line-clamp-1"
                  >
                    {{ event.title }}
                  </h3>
                  <div class="flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar class="w-3 h-3" />
                    <span
                      >{{ formatDate(event.startAt) }} -
                      {{ formatDate(event.endAt) }}</span
                    >
                  </div>
                </div>

                <div
                  class="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2"
                >
                  <div
                    v-if="event.description"
                    v-html="event.description"
                  ></div>
                  <div v-else>Upcoming exciting experience.</div>
                </div>

                <div
                  class="pt-2 flex items-center text-xs font-semibold text-zinc-900 dark:text-zinc-50 group-hover:translate-x-1 transition-transform"
                >
                  View Details <ChevronRight class="w-3 h-3 ml-1" />
                </div>
              </div>
            </Card>
          </div>
        </section>

        <!-- Upcoming Events -->
        <section v-if="groupedEvents.upcoming.length > 0" class="space-y-6">
          <div class="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <Calendar class="w-5 h-5 text-zinc-400" />
            <h2 class="text-xl font-bold">Upcoming Events</h2>
            <Badge variant="outline" class="ml-2 font-mono text-zinc-400">{{
              groupedEvents.upcoming.length
            }}</Badge>
          </div>
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity"
          >
            <Card
              v-for="event in groupedEvents.upcoming"
              :key="event.id"
              class="group hover:shadow-lg transition-all border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 cursor-pointer"
              @click="openEventDetail(event)"
            >
              <div class="p-6 space-y-4">
                <div
                  class="w-12 h-12 rounded-xl bg-zinc-200/50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 overflow-hidden"
                >
                  <NuxtImg
                    v-if="event.bannerPath"
                    :src="event.bannerPath"
                    provider="imagekit"
                    class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                  />
                  <Ticket v-else class="w-6 h-6 text-zinc-400" />
                </div>

                <div class="space-y-1">
                  <h3 class="font-bold text-lg line-clamp-1">
                    {{ event.title }}
                  </h3>
                  <div class="flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar class="w-3 h-3" />
                    <span>Starts {{ formatDate(event.startAt) }}</span>
                  </div>
                </div>

                <div
                  class="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2"
                >
                  <div
                    v-if="event.description"
                    v-html="event.description"
                  ></div>
                  <div v-else>Upcoming exciting experience.</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <!-- Empty State -->
        <div
          v-if="
            groupedEvents.ongoing.length === 0 &&
            groupedEvents.upcoming.length === 0
          "
          class="text-center py-20 space-y-4"
        >
          <div
            class="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400"
          >
            <Search class="w-8 h-8" />
          </div>
          <p class="text-zinc-500">
            No events found matching "{{ searchQuery }}".
          </p>
          <Button
            variant="ghost"
            @click="searchQuery = ''"
            class="text-zinc-900 dark:text-zinc-50 font-bold"
            >Clear search</Button
          >
        </div>
      </div>
    </main>

    <!-- Event Detail Modal -->
    <Dialog v-model:open="isModalOpen">
      <DialogContent
        class="sm:max-w-[425px] p-0 overflow-y-scroll no-scrollbar max-h-screen border-none bg-white dark:bg-zinc-900 shadow-2xl"
      >
        <div v-if="selectedEvent" class="flex flex-col">
          <!-- Banner/Header -->
          <div
            class="relative h-48 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden"
          >
            <template v-if="selectedEvent.bannerPath">
              <NuxtImg
                :src="selectedEvent.bannerPath"
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
                {{ selectedEvent.title }}
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
                  <span class="font-medium text-zinc-900 dark:text-zinc-50">{{
                    formatDate(selectedEvent.startAt)
                  }}</span>
                </div>
                <div class="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800"></div>
                <div class="flex flex-col">
                  <span
                    class="text-[10px] uppercase tracking-widest font-bold text-zinc-400"
                    >End Date</span
                  >
                  <span class="font-medium text-zinc-900 dark:text-zinc-50">{{
                    formatDate(selectedEvent.endAt)
                  }}</span>
                </div>
              </div>

              <div class="space-y-2">
                <span
                  class="text-[10px] uppercase tracking-widest font-bold text-zinc-400"
                  >Description</span
                >
                <ExpandableText
                  :content="
                    selectedEvent.description ||
                    'No description availabe for this event.'
                  "
                  :limit="150"
                />
              </div>
            </div>

            <DialogFooter class="sm:justify-start">
              <Button
                class="w-full h-12 text-md font-bold transition-all active:scale-95 shadow-lg shadow-zinc-900/10"
                @click="joinEvent(selectedEvent.slug)"
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
  </div>
</template>

<style scoped>
:deep(.lucide) {
  stroke-width: 2.5px;
}
</style>
