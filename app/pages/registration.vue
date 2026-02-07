<script setup lang="ts">

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const user = useSupabaseUser()

const currentStepIndex = ref(0)
const answers = reactive<Record<number, any>>({})
const profileData = ref({
  fullName: authStore.customer?.fullName || '',
  email: authStore.customer?.email || '',
  phoneNumber: authStore.customer?.phoneNumber || ''
})

const { data: rawSteps } = await useFetch<any[]>(`/api/registration-steps/${authStore.eventId}`)

const steps = computed(() => {
  if (!rawSteps.value) return []
  return rawSteps.value.map((step: any) => ({
    ...step,
    inputs: step.stepType === 'claim_seat' ? step.seatConfigs : step.questions
  }))
})

// Total steps = Profile Step (1) + Registration Steps
const totalStepsCount = computed(() => (steps.value?.length || 0) + 1)

const isFinalStep = computed(() => currentStepIndex.value === totalStepsCount.value - 1)

const handleProfileNext = (data: any) => {
  profileData.value = { ...profileData.value, ...data }
  currentStepIndex.value++
}

const handleStepNext = (stepId: number, stepAnswers: any) => {
  answers[stepId] = stepAnswers
  
  if (isFinalStep.value) {
    submitRegistration()
  } else {
    currentStepIndex.value++
  }
}

const isSubmitting = ref(false)
const submitRegistration = async () => {
  isSubmitting.value = true
  try {
    // Prepare answers
    let claimSeatValue = ''
    const questionnaireAnswers: any[] = []

    steps.value.forEach((step: any) => {
      const stepAnswers = answers[step.id] || {}
      if (step.stepType === 'claim_seat') {
        const values = Object.values(stepAnswers).filter(v => v !== undefined && v !== '')
        claimSeatValue = values.join(', ')
      } else {
        Object.entries(stepAnswers).forEach(([key, val]) => {
          const questionId = parseInt(key.replace('input_', ''))
          questionnaireAnswers.push({
            questionId,
            answerValue: val
          })
        })
      }
    })

    const { error } = await useFetch('/api/events/register', {
      method: 'POST' as any,
      body: {
        eventId: authStore.eventId,
        claimSeatValue,
        questionnaireAnswers
      }
    })

    if (error.value) {
      throw new Error(error.value.statusMessage || 'Registration failed')
    }

    navigateTo('/registration-success')
  } catch (err: any) {
    alert(err.message || 'An error occurred during registration')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-start pt-12 p-6">
    <div class="w-full max-w-md space-y-8">
      <!-- Progress Bar -->
      <div class="space-y-2">
        <div class="flex justify-between text-[10px] uppercase tracking-widest font-bold text-zinc-400">
          <span>Step {{ currentStepIndex + 1 }} of {{ totalStepsCount }}</span>
          <span>{{ Math.round(((currentStepIndex + 1) / totalStepsCount) * 100) }}% Complete</span>
        </div>
        <div class="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-500 ease-in-out"
            :style="{ width: `${((currentStepIndex + 1) / totalStepsCount) * 100}%` }"
          ></div>
        </div>
      </div>

      <Card class="border-zinc-200 dark:border-zinc-800 shadow-lg bg-white dark:bg-zinc-900 overflow-hidden">
        <div class="p-8">
          <!-- Step 0: Profile Details -->
          <ProfileDetail
            v-if="currentStepIndex === 0"
            :initial-data="profileData"
            @next="handleProfileNext"
          />

          <!-- Dynamic Steps -->
          <template v-else>
            <div v-for="(step, index) in steps" :key="step.id">
              <ProfileQuestion
                v-if="currentStepIndex === index + 1"
                :step-info="step"
                :inputs="step.inputs"
                :initial-values="answers[step.id]"
                @next="(data) => handleStepNext(step.id, data)"
              >
                <template #action>
                  <Button type="submit" class="w-full" :disabled="isSubmitting">
                    <span v-if="isSubmitting">Saving...</span>
                    <span v-else-if="index + 1 === totalStepsCount - 1">Save and Claim</span>
                    <span v-else>Next</span>
                  </Button>
                </template>
              </ProfileQuestion>
            </div>
          </template>
        </div>

        <div class="px-8 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[10px] text-zinc-400">
          <button 
            v-if="currentStepIndex > 0"
            @click="currentStepIndex--"
            class="hover:text-zinc-600 dark:hover:text-zinc-200 font-bold uppercase transition-colors"
          >
            ← Back
          </button>
          <div v-else></div>
          <span class="font-semibold tracking-widest uppercase">Registration</span>
        </div>
      </Card>
    </div>
  </div>
</template>
