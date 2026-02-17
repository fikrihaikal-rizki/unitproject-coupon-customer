<script setup lang="ts">
import { LogOut, ChevronDown } from "lucide-vue-next";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "~/stores/auth";
import { format } from "date-fns";
import ProfileDetail from "~/components/ProfileDetail.vue";
import { toast } from "vue-sonner";

// Props
interface Event {
  title: string;
  startAt: string;
  endAt: string;
}

const props = defineProps<{
  eventDetails?: Event | null;
}>();

// Auth & User
const authStore = useAuthStore();
const user = useSupabaseUser();
const supabase = useSupabaseClient();

const profileData = computed(() => {
  if (!authStore.customerData) return { email: user.value?.email || "" };
  return {
    email: authStore.customerData.email,
    fullName: authStore.customerData.fullName,
    phoneNumber: authStore.customerData.phoneNumber,
  };
});

const handleLogout = async () => {
  const toastLoading = toast.loading("Logging out...");
  await supabase.auth.signOut();
  authStore.clearAuth();
  navigateTo("/");
  toast.success("Logged out successfully", { id: toastLoading });
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

// Popover State for Event Dates
const showEventDates = ref(false);
</script>

<template>
  <Sidebar>
    <SidebarHeader>
      <div class="p-2">
        <Popover v-model:open="showEventDates">
          <PopoverTrigger as-child>
            <div
              class="flex items-center gap-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors w-full"
            >
              <Avatar
                class="h-8 w-8 border border-zinc-200 dark:border-zinc-700"
              >
                <AvatarImage
                  v-if="user?.user_metadata?.avatar_url"
                  :src="user?.user_metadata?.avatar_url"
                  alt="@profileData.fullName"
                />
                <AvatarFallback
                  class="bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300 text-xs"
                >
                  {{
                    profileData.fullName?.charAt(0) ||
                    user?.email?.charAt(0) ||
                    "U"
                  }}
                </AvatarFallback>
              </Avatar>
              <div class="flex-1 min-w-0 text-left">
                <p
                  class="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate leading-tight"
                >
                  {{ profileData.fullName || "Guest" }}
                </p>
                <p class="text-xs text-zinc-500 truncate leading-tight">
                  {{ props.eventDetails?.title || "Event" }}
                </p>
              </div>
              <ChevronDown class="w-4 h-4 text-zinc-400 shrink-0" />
            </div>
          </PopoverTrigger>
          <PopoverContent class="w-64 p-4 space-y-2" align="start">
            <h4 class="font-medium text-sm">Event Schedule</h4>
            <div class="text-xs text-zinc-500 space-y-1">
              <div class="flex justify-between">
                <span>Start:</span>
                <ClientOnly>
                  <span class="font-medium text-zinc-900 dark:text-zinc-50">{{
                    props.eventDetails?.startAt
                      ? formatDate(props.eventDetails.startAt)
                      : "-"
                  }}</span>
                </ClientOnly>
              </div>
              <div class="flex justify-between">
                <span>End:</span>
                <ClientOnly>
                  <span class="font-medium text-zinc-900 dark:text-zinc-50">{{
                    props.eventDetails?.endAt
                      ? formatDate(props.eventDetails.endAt)
                      : "-"
                  }}</span>
                </ClientOnly>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <div class="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <ProfileDetail :initialData="profileData" readonly>
          <template #title>
            <h2
              class="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3"
            >
              My Profile
            </h2>
          </template>
          <template #sub-title>
            <p></p>
          </template>
          <template #action>
            <!-- Hide action button -->
            <div class="hidden"></div>
          </template>
        </ProfileDetail>
      </div>
    </SidebarContent>

    <SidebarFooter>
      <div class="p-4 border-t border-zinc-100 dark:border-zinc-800">
        <Button
          variant="outline"
          class="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 border-red-50 dark:border-red-900"
          @click="handleLogout"
        >
          <LogOut class="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
