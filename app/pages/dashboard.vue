<script setup lang="ts">
import {
  Search,
  Calendar as CalendarIcon,
  ArrowRight,
  Ticket,
  Filter,
  X,
} from "lucide-vue-next";
import { format, isSameDay } from "date-fns";
import { useAuthStore } from "~/stores/auth";
import CustomerSidebar from "~/components/CustomerSidebar.vue";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const authStore = useAuthStore();

// Derived state
const eventId = computed(() => authStore.currentEventId);
const customerId = computed(() => authStore.customerId);
const eventSlug = computed(() => authStore.currentEventSlug);

// 1. Fetch Dashboard Data
const { data: stats, refresh: refreshStats } = await useFetch(
  "/api/customer/dashboard/stats",
  {
    params: {
      eventId,
      customerId,
    },
    watch: [eventId, customerId],
  },
);

// 2. Fetch Coupon List
const filterStatus = ref<string | null>(null);
const searchQuery = ref("");
const sortOrder = ref<"asc" | "desc">("desc");

const { data: coupons, refresh: refreshCoupons } = await useFetch(
  "/api/customer/coupons/list",
  {
    params: {
      eventId,
      customerId,
      filter: filterStatus,
    },
    watch: [eventId, customerId, filterStatus],
  },
);

interface Event {
  title: string;
  startAt: string;
  endAt: string;
}

// 3. User & Event Info (Sidebar)
// Fetch event details to show dates in popover
const { data: eventDetails } = await useFetch<Event>(
  `/api/events/${eventSlug.value}`,
);

// Date Filtering
const selectedDate = ref<Date>();

// Computed for filtered/sorted list
const filteredCoupons = computed(() => {
  if (!coupons.value) return [];

  let list = [...coupons.value];

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)),
    );
  }

  // Date Filter
  if (selectedDate.value) {
    const filterDate = new Date(selectedDate.value);
    list = list.filter((c) => {
      const dateToCheck = c.userCoupon?.generatedAt || c.createdAt;
      return isSameDay(new Date(dateToCheck || ""), filterDate);
    });
  }

  // Sort
  list.sort((a, b) => {
    // Sort by generatedAt if userCoupon exists, else by createdAt
    const dateA = a.userCoupon?.generatedAt
      ? new Date(a.userCoupon.generatedAt).getTime()
      : new Date(a.createdAt).getTime();
    const dateB = b.userCoupon?.generatedAt
      ? new Date(b.userCoupon.generatedAt).getTime()
      : new Date(b.createdAt).getTime();

    return sortOrder.value === "asc" ? dateA - dateB : dateB - dateA;
  });

  return list;
});

// Generate Logic
const isGenerating = ref(false);
const handleGenerate = (slug: string) => {
  navigateTo(`/coupon-generate/${slug}`);
};

// Date Formatters
const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return "-";
  try {
    return format(new Date(date), "dd MMM yyyy");
  } catch (e) {
    return "-";
  }
};
const formatTime = (date: string | Date | null | undefined) => {
  if (!date) return "-";
  try {
    return format(new Date(date), "HH:mm");
  } catch (e) {
    return "-";
  }
};

// Countdown Logic
const now = ref(new Date());
let countdownInterval: any = null;

const getCountdown = (date: string | Date | null | undefined) => {
  if (!date) return "-";
  try {
    const target = new Date(date);
    const diff = target.getTime() - now.value.getTime();

    if (diff <= 0) return "0 hours 0 minutes";

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (d > 0) {
      return `${d} ${d === 1 ? "day" : "days"} ${h} ${h === 1 ? "hour" : "hours"} ${m} ${m === 1 ? "minute" : "minutes"}`;
    } else {
      return `${h} ${h === 1 ? "hour" : "hours"} ${m} ${m === 1 ? "minute" : "minutes"}`;
    }
  } catch (e) {
    return "-";
  }
};

// Scroll Interaction - Month Indicator
// We will track the visibility of coupons and update the current month based on the top-most visible one.
const currentVisibleMonth = ref(format(new Date(), "MMMM yyyy"));

let observer: IntersectionObserver | null = null;
const dateMap = new Map<Element, string | Date>();

onMounted(() => {
  countdownInterval = setInterval(() => {
    now.value = new Date();
  }, 10000); // Update every 10 seconds

  observer = new IntersectionObserver(
    (entries) => {
      // Find the first intersecting entry (or the one most congruent with top)
      // Since we want the one at the top, we might rely on the order or simple isIntersecting
      const visible = entries.find((e) => e.isIntersecting);
      if (visible) {
        const date = dateMap.get(visible.target);
        if (date) {
          currentVisibleMonth.value = format(new Date(date), "MMMM yyyy");
        }
      }
    },
    {
      threshold: [0, 0.1, 0.5],
      rootMargin: "-10% 0px -50% 0px", // Active area near top
    },
  );
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  dateMap.clear();
});

const registerCouponRef = (el: any, coupon: any) => {
  // el might be component or element
  const element = el?.$el || el;
  if (element && observer) {
    const date = coupon.userCoupon?.generatedAt || coupon.createdAt;

    // Only observe if not already observed/mapped (or update it)
    if (date && !dateMap.has(element)) {
      dateMap.set(element, date);
      observer.observe(element);
    }
  }
};
</script>

<template>
  <SidebarProvider>
    <CustomerSidebar :eventDetails="eventDetails" />
    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-zinc-200 dark:border-zinc-800 px-4 mb-4 bg-white dark:bg-zinc-900"
      >
        <div class="flex items-center gap-2">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <h1 class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {{ eventDetails?.title || "Dashboard" }}
          </h1>
        </div>
      </header>

      <!-- Main Content -->
      <main
        class="flex-1 overflow-y-auto relative no-scrollbar bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 pb-32"
      >
        <div class="max-w-4xl mx-auto space-y-8">
          <!-- Hero / Generate Section -->
          <section v-for="coupon in coupons" :key="coupon.id">
            <!-- Logic: Show ONLY if active & allowGeneratePeriod & NOT generated -->
            <div
              v-if="
                coupon.status === 'available' || coupon.status === 'upcoming'
              "
              class="mt-6"
            >
              <Card
                class="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-none overflow-hidden relative group cursor-pointer hover:shadow-2xl transition-all duration-500"
                @click="
                  coupon.status === 'available'
                    ? handleGenerate(coupon.slug)
                    : null
                "
              >
                <!-- Decorative bg -->
                <div
                  class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors"
                ></div>

                <div
                  class="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div class="space-y-2">
                    <div
                      class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-emerald-300"
                    >
                      <Ticket class="w-3 h-3" />
                      <span>{{
                        coupon.status === "available"
                          ? "Available to Generate"
                          : "Coming Soon"
                      }}</span>
                    </div>
                    <h2 class="text-2xl md:text-3xl font-bold tracking-tight">
                      {{ coupon.name }}
                    </h2>
                    <div
                      class="text-zinc-400 max-w-lg line-clamp-1"
                      v-html="
                        coupon.description || 'Get your exclusive coupon now.'
                      "
                    ></div>
                  </div>

                  <div class="flex flex-col items-end gap-3 min-w-[140px]">
                    <!-- Countdown -->
                    <div
                      v-if="coupon.status === 'available'"
                      class="text-right"
                    >
                      <p
                        class="text-xs text-zinc-500 uppercase tracking-widest mb-1"
                      >
                        Expires in
                      </p>
                      <p class="text-xl font-mono font-bold">
                        {{ getCountdown(coupon.allowGenerateUntil) }}
                      </p>
                    </div>
                    <div v-else class="text-right">
                      <p
                        class="text-xs text-zinc-500 uppercase tracking-widest mb-1"
                      >
                        Starts in
                      </p>
                      <p class="text-xl font-mono font-bold">
                        {{ getCountdown(coupon.allowGenerateFrom) }}
                      </p>
                    </div>

                    <Button
                      v-if="coupon.status === 'available'"
                      class="bg-white text-black hover:bg-zinc-200 mt-2 font-bold w-full md:w-auto"
                    >
                      Generate Now
                      <ArrowRight
                        class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                      />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <!-- Stats Summary -->
          <section class="grid grid-cols-3 gap-4">
            <Card
              class="p-4 flex flex-col items-center justify-center text-center space-y-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            >
              <span class="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{{
                stats?.generated || 0
              }}</span>
              <span
                class="text-xs text-zinc-500 font-medium uppercase tracking-wider"
                >Generated</span
              >
            </Card>
            <Card
              class="p-4 flex flex-col items-center justify-center text-center space-y-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            >
              <span
                class="text-3xl font-bold text-emerald-600 dark:text-emerald-500"
                >{{ stats?.redeemed || 0 }}</span
              >
              <span
                class="text-xs text-zinc-500 font-medium uppercase tracking-wider"
                >Redeemed</span
              >
            </Card>
            <Card
              class="p-4 flex flex-col items-center justify-center text-center space-y-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            >
              <span class="text-3xl font-bold text-red-600 dark:text-red-500">{{
                stats?.missed || 0
              }}</span>
              <span
                class="text-xs text-zinc-500 font-medium uppercase tracking-wider"
                >Missed</span
              >
            </Card>
          </section>

          <!-- Filters -->
          <div
            class="sticky top-0 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-sm z-30 py-4 space-y-2 md:space-y-0"
          >
            <div class="flex flex-row md:flex-row gap-2 items-center w-full">
              <!-- Search Input (Flexible width) -->
              <div class="relative flex-1 group min-w-0">
                <Search
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors"
                />
                <Input
                  v-model="searchQuery"
                  placeholder="Search..."
                  class="pl-9 h-10 w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
                />
              </div>

              <!-- Date Picker Popover -->
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    class="h-10 justify-start text-left font-normal px-3 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    :class="!selectedDate && 'text-muted-foreground'"
                  >
                    <CalendarIcon class="mr-2 h-4 w-4 shrink-0" />
                    <span class="hidden sm:inline">{{
                      selectedDate ? format(selectedDate, "PPP") : "Pick a date"
                    }}</span>
                    <span class="sm:hidden">{{
                      selectedDate ? format(selectedDate, "dd/MM") : "Date"
                    }}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0">
                  <div class="p-3 border-b border-border" v-if="selectedDate">
                    <Button
                      variant="ghost"
                      size="sm"
                      class="w-full justify-start text-muted-foreground"
                      @click="selectedDate = undefined"
                    >
                      <X class="w-4 h-4 mr-2" />
                      Clear Date
                    </Button>
                  </div>
                  <Calendar v-model="selectedDate" mode="single" />
                </PopoverContent>
              </Popover>

              <!-- Sort Toggle -->
              <Button
                variant="outline"
                size="icon"
                class="h-10 w-10 shrink-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
              >
                <Filter
                  class="w-4 h-4 transition-transform"
                  :class="{ 'rotate-180': sortOrder === 'asc' }"
                />
              </Button>
            </div>
          </div>

          <!-- Coupon List -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
            <ClientOnly>
              <Card
                v-for="coupon in filteredCoupons"
                :key="coupon.id"
                :ref="(el) => registerCouponRef(el, coupon)"
                class="p-4 group relative overflow-hidden transition-all hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 cursor-pointer"
                @click="
                  coupon.status !== 'available' &&
                  coupon.status !== 'upcoming' &&
                  coupon.status !== 'missed'
                    ? navigateTo(`/coupon-detail/${coupon.slug}`)
                    : null
                "
              >
                <div class="flex flex-col h-full justify-between gap-2">
                  <div class="flex justify-between items-start">
                    <div class="space-y-1 max-w-[70%]">
                      <h3
                        class="font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1"
                      >
                        {{ coupon.name }}
                      </h3>
                      <p class="text-xs font-mono text-zinc-500">
                        {{ coupon.code }}
                      </p>
                    </div>
                    <!-- Status Badge -->
                    <Badge
                      v-if="coupon.status === 'active'"
                      class="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none"
                      >Active</Badge
                    >
                    <Badge
                      v-else-if="coupon.status === 'redeemed'"
                      class="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none"
                      >Used</Badge
                    >
                    <Badge
                      v-else-if="coupon.status === 'expired'"
                      variant="destructive"
                      class="bg-red-50 text-red-700 hover:bg-red-100 border-none"
                      >Expired</Badge
                    >
                    <Badge
                      v-else-if="coupon.status === 'missed'"
                      variant="outline"
                      class="text-zinc-400 border-zinc-200"
                      >Missed</Badge
                    >
                  </div>

                  <div
                    class="text-sm text-zinc-500 line-clamp-1 min-h-[20px]"
                    v-html="coupon.description || 'No description available.'"
                  ></div>

                  <div
                    class="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 mt-2"
                  >
                    <span class="text-xs text-zinc-400">
                      {{
                        coupon.status === "redeemed"
                          ? `Used on ${formatDate(coupon.userCoupon?.redeemedAt ?? "")}`
                          : `Valid until ${formatDate(coupon.redeemUntil)}`
                      }}
                    </span>

                    <Button
                      v-if="coupon.status === 'active'"
                      size="sm"
                      variant="ghost"
                      class="h-8 text-xs font-bold text-zinc-900 hover:bg-zinc-100 -mr-2"
                    >
                      Use Coupon <ArrowRight class="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            </ClientOnly>

            <!-- Empty State -->
            <div
              v-if="filteredCoupons.length === 0"
              class="col-span-1 md:col-span-2 text-center py-12 text-zinc-500"
            >
              <Ticket class="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No coupons found.</p>
            </div>
          </div>
        </div>

        <!-- Sticky Month Indicator (Floating Badge) - Moved to bottom -->
        <div
          class="fixed bottom-4 left-0 w-full z-40 px-6 pointer-events-none flex justify-center pb-safe"
        >
          <transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform translate-y-2 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform translate-y-2 opacity-0"
          >
            <span
              v-if="currentVisibleMonth"
              class="bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/10"
            >
              {{ currentVisibleMonth }}
            </span>
          </transition>
        </div>
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
