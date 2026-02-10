<script setup lang="ts">
import { useRegistrationStore } from "~/stores/registration";
import { Loader2 } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { compressImage } from "~/utils/imageProcessor";

definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();
const registrationStore = useRegistrationStore();

if (authStore.customer) {
  registrationStore.setProfileData({
    fullName: authStore.customer.fullName,
    email: authStore.customer.email,
    phoneNumber: authStore.customer.phoneNumber,
  });
}

// Fetch Steps
const { data: rawSteps, refresh } = await useFetch<any[]>(
  `/api/registration-steps/${authStore.eventId}`,
);

// Initialize Store
watchEffect(() => {
  if (rawSteps.value) {
    const stepsData = rawSteps.value.map((step: any) => ({
      ...step,
      inputs:
        step.stepType === "claim_seat" ? step.seatConfigs : step.questions,
    }));
    registrationStore.setSteps(stepsData);
    registrationStore.setEventInfo(
      authStore.eventSlug || "",
      authStore.eventId || "",
    );

    // Initialize profile data from auth store
    if (authStore.customer) {
      registrationStore.setProfileData({
        fullName: authStore.customer.fullName,
        email: authStore.customer.email,
        phoneNumber: authStore.customer.phoneNumber,
      });
    }
  }
});

// Computed for template
const currentStepIndex = computed(() => registrationStore.currentStepIndex);
const totalStepsCount = computed(() => registrationStore.totalStepsCount);
const progressPercentage = computed(() =>
  Math.round(((currentStepIndex.value + 1) / totalStepsCount.value) * 100),
);

const activeStep = computed(() => {
  if (currentStepIndex.value === 0) return null;
  return registrationStore.steps[currentStepIndex.value - 1];
});

const handleProfileNext = (data: any) => {
  registrationStore.setProfileData(data);
  // Update auth store as well to keep in sync
  if (authStore.customer) {
    authStore.setAuthData({
      customer: { ...authStore.customer, ...data },
    });
  }
  registrationStore.nextStep();
};

const handleStepNext = async (stepId: number, stepAnswers: any) => {
  registrationStore.setStepAnswer(stepId, stepAnswers);

  // Check if this is a claim_seat step
  const currentStep = registrationStore.steps.find((s: any) => s.id === stepId);

  if (currentStep?.stepType === "claim_seat") {
    // Process claim seat
    isSubmitting.value = true;
    loadingPhase.value = "validating";
    loadingMessage.value = "Verifying seat availability...";

    try {
      // Extract claim seat value from answers
      const claimSeatValue = Object.values(stepAnswers)
        .filter((v) => v !== undefined && v !== "" && v !== null)
        .join(", ");

      const { data, error } = await useFetch("/api/events/claim-seat", {
        method: "POST",
        body: {
          eventId: authStore.eventId,
          claimSeatValue,
        },
      });

      if (error.value) {
        // Handle 409 conflict (duplicate entry)
        if (error.value.statusCode === 409) {
          toast.error(
            error.value.statusMessage || "This seat/ID is already taken",
          );
          return; // Don't proceed to next step
        }

        // Handle other errors
        throw new Error(error.value.statusMessage || "Failed to claim seat");
      }

      // Store registration ID
      const response = data.value as any;
      if (response?.registrationId) {
        registrationStore.setRegistrationId(response.registrationId);
        toast.success("Seat claimed successfully!");
      }

      // Proceed to next step
      registrationStore.nextStep();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred while claiming the seat");
    } finally {
      isSubmitting.value = false;
      loadingPhase.value = "";
      loadingMessage.value = "";
    }
  } else {
    // Regular step - proceed normally
    if (registrationStore.isFinalStep) {
      submitRegistration();
    } else {
      registrationStore.nextStep();
    }
  }
};

const isSubmitting = ref(false);
const loadingPhase = ref<
  "validating" | "compressing" | "uploading" | "saving" | ""
>("");
const loadingMessage = ref("");
const submitRegistration = async () => {
  isSubmitting.value = true;
  loadingPhase.value = "";
  loadingMessage.value = "";

  try {
    // PHASE 1: Validation
    loadingPhase.value = "validating";
    loadingMessage.value = "Validating forms...";
    // Manual validation is already done by vee-validate on submit

    // PHASE 2: Compression
    const filesToProcess: { stepId: number; inputId: string; file: File }[] =
      [];

    registrationStore.steps.forEach((step: any) => {
      const stepAnswers = registrationStore.answers[step.id] || {};
      Object.entries(stepAnswers).forEach(([key, val]) => {
        if (val instanceof File) {
          filesToProcess.push({ stepId: step.id, inputId: key, file: val });
        }
      });
    });

    if (filesToProcess.length > 0) {
      loadingPhase.value = "compressing";
      loadingMessage.value = "Compressing images (Saving your data)...";

      // Compress all files
      const compressedFiles = await Promise.all(
        filesToProcess.map(async (item) => {
          loadingMessage.value = `Optimizing ${item.file.name}...`;
          const compressed = await compressImage(item.file);
          return { ...item, file: compressed };
        }),
      );

      // PHASE 3: Upload
      loadingPhase.value = "uploading";
      loadingMessage.value = `Uploading ${compressedFiles.length} file(s) to server...`;

      const uploadResults = await Promise.all(
        compressedFiles.map(async (item) => {
          const formData = new FormData();
          formData.append("file", item.file);

          try {
            const { data, error } = await useFetch("/api/upload/imagekit", {
              method: "POST",
              body: formData,
            });

            if (error.value) throw new Error("Upload failed");

            return {
              stepId: item.stepId,
              inputId: item.inputId,
              url: (data.value as any).url,
            };
          } catch (e) {
            throw new Error(`Failed to upload ${item.file.name}`);
          }
        }),
      );

      // Update store with URLs
      uploadResults.forEach((res) => {
        const currentAnswers = { ...registrationStore.answers[res.stepId] };
        currentAnswers[res.inputId] = res.url;
        registrationStore.setStepAnswer(res.stepId, currentAnswers);
      });
    }

    // PHASE 4: Database submission
    loadingPhase.value = "saving";
    loadingMessage.value = "Saving your registration...";

    const questionnaireAnswers: any[] = [];

    // Only collect questionnaire answers (skip claim_seat)
    registrationStore.steps.forEach((step: any) => {
      const stepAnswers = registrationStore.answers[step.id] || {};

      if (step.stepType === "questionnaire") {
        Object.entries(stepAnswers).forEach(([key, val]) => {
          const questionId = parseInt(key.replace("input_", ""));
          if (!isNaN(questionId)) {
            questionnaireAnswers.push({
              questionId,
              answerValue: val,
            });
          }
        });
      }
    });

    const { error } = await useFetch("/api/events/register", {
      method: "POST",
      body: {
        registrationId: registrationStore.registrationId,
        eventId: authStore.eventId,
        questionnaireAnswers,
      },
    });

    if (error.value) {
      throw new Error(error.value.statusMessage || "Registration failed");
    }

    toast.success("Registration completed successfully!");
    navigateTo("/registration-success");
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || "An error occurred during registration");
  } finally {
    isSubmitting.value = false;
    loadingPhase.value = "";
    loadingMessage.value = "";
  }
};

// Cleanup on leave
onUnmounted(() => {
  // optional: registrationStore.reset()
  // kept comment out if we want to preserve state on accidental back navigation
});
</script>

<template>
  <div
    class="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-start pt-12 p-6"
  >
    <div class="w-full max-w-md space-y-8">
      <!-- Progress Bar -->
      <div class="space-y-2">
        <div
          class="flex justify-between text-[10px] uppercase tracking-widest font-bold text-zinc-400"
        >
          <span>Step {{ currentStepIndex + 1 }} of {{ totalStepsCount }}</span>
          <span>{{ progressPercentage }}% Complete</span>
        </div>
        <div
          class="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-500 ease-in-out"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <Card
        class="border-zinc-200 dark:border-zinc-800 shadow-lg bg-white dark:bg-zinc-900 overflow-hidden"
      >
        <div class="p-8">
          <!-- Step 0: Profile Details -->
          <ProfileDetail
            v-if="currentStepIndex === 0"
            :initial-data="registrationStore.profileData"
            @next="handleProfileNext"
          />

          <!-- Dynamic Steps -->
          <template v-else>
            <ProfileQuestion
              v-if="activeStep"
              :key="activeStep?.id"
              :step-info="activeStep"
              :inputs="activeStep?.inputs"
              :initial-values="registrationStore.answers[activeStep?.id]"
              @next="(data) => handleStepNext(activeStep!.id, data)"
              @save="
                (data, stepId) => registrationStore.setStepAnswer(stepId, data)
              "
            >
              <template #action>
                <Button type="submit" class="w-full" :disabled="isSubmitting">
                  <span
                    v-if="isSubmitting"
                    class="flex items-center justify-center"
                  >
                    <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                    {{ loadingMessage || "Processing..." }}
                  </span>
                  <span v-else-if="currentStepIndex === totalStepsCount - 1"
                    >Complete & Claim Coupon</span
                  >
                  <span v-else-if="activeStep?.stepType === 'claim_seat'"
                    >Verify & Claim Seat</span
                  >
                  <span v-else>Next Step</span>
                </Button>
              </template>
            </ProfileQuestion>
          </template>
        </div>

        <div
          class="px-8 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[10px] text-zinc-400"
        >
          <button
            v-if="currentStepIndex > 0"
            @click="registrationStore.prevStep()"
            type="button"
            class="hover:text-zinc-600 dark:hover:text-zinc-200 font-bold uppercase transition-colors"
          >
            ← Back
          </button>
          <div v-else></div>
          <span class="font-semibold tracking-widest uppercase"
            >Registration</span
          >
        </div>
      </Card>
    </div>
  </div>
</template>
