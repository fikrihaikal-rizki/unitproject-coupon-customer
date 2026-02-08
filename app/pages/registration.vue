<script setup lang="ts">
import { useRegistrationStore } from '~/stores/registration'
import { Loader2 } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const registrationStore = useRegistrationStore()

if (authStore.customer) {
  registrationStore.setProfileData({
    fullName: authStore.customer.fullName,
    email: authStore.customer.email,
    phoneNumber: authStore.customer.phoneNumber
  })
}

// Fetch Steps
const { data: rawSteps, refresh } = await useFetch<any[]>(`/api/registration-steps/${authStore.eventId}`)

// Initialize Store
watchEffect(() => {
  if (rawSteps.value) {
    const stepsData = rawSteps.value.map((step: any) => ({
      ...step,
      inputs: step.stepType === 'claim_seat' ? step.seatConfigs : step.questions
    }))
    registrationStore.setSteps(stepsData)
    registrationStore.setEventInfo(authStore.eventSlug || '', authStore.eventId || '')
    
    // Initialize profile data from auth store
    if (authStore.customer) {
      registrationStore.setProfileData({
        fullName: authStore.customer.fullName,
        email: authStore.customer.email,
        phoneNumber: authStore.customer.phoneNumber
      })
    }
  }
})

// Computed for template
const currentStepIndex = computed(() => registrationStore.currentStepIndex)
const totalStepsCount = computed(() => registrationStore.totalStepsCount)
const progressPercentage = computed(() => Math.round(((currentStepIndex.value + 1) / totalStepsCount.value) * 100))

const activeStep = computed(() => {
  if (currentStepIndex.value === 0) return null
  return registrationStore.steps[currentStepIndex.value - 1]
})

const handleProfileNext = (data: any) => {
  registrationStore.setProfileData(data)
  // Update auth store as well to keep in sync
  if (authStore.customer) {
    authStore.setAuthData({
       customer: { ...authStore.customer, ...data }
    })
  }
  registrationStore.nextStep()
}

const handleStepNext = (stepId: number, stepAnswers: any) => {
  registrationStore.setStepAnswer(stepId, stepAnswers)
  
  if (registrationStore.isFinalStep) {
    submitRegistration()
  } else {
    registrationStore.nextStep()
  }
}

const isSubmitting = ref(false)
const submitRegistration = async () => {
  isSubmitting.value = true
  try {
    // Prepare answers
    let claimSeatValue = ''
    const questionnaireAnswers: any[] = []

    registrationStore.steps.forEach((step: any) => {
      const stepAnswers = registrationStore.answers[step.id] || {}
      
      if (step.stepType === 'claim_seat') {
        const values = Object.values(stepAnswers).filter(v => v !== undefined && v !== '' && v !== null)
        claimSeatValue = values.join(', ')
      } else {
        Object.entries(stepAnswers).forEach(([key, val]) => {
            // key is input_ID
          const questionId = parseInt(key.replace('input_', ''))
          if (!isNaN(questionId)) {
             questionnaireAnswers.push({
               questionId,
               answerValue: val
             })
          }
        })
      }
    })

    const { error } = await useFetch('/api/events/register', {
      method: 'POST',
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
    // In a real app, use a Toast here
    alert(err.message || 'An error occurred during registration')
  } finally {
    isSubmitting.value = false
  }
}

// Cleanup on leave
onUnmounted(() => {
    // optional: registrationStore.reset() 
    // kept comment out if we want to preserve state on accidental back navigation
})
</script>

<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-start pt-12 p-6">
    <div class="w-full max-w-md space-y-8">
      <!-- Progress Bar -->
      <div class="space-y-2">
        <div class="flex justify-between text-[10px] uppercase tracking-widest font-bold text-zinc-400">
          <span>Step {{ currentStepIndex + 1 }} of {{ totalStepsCount }}</span>
          <span>{{ progressPercentage }}% Complete</span>
        </div>
        <div class="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-500 ease-in-out"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <Card class="border-zinc-200 dark:border-zinc-800 shadow-lg bg-white dark:bg-zinc-900 overflow-hidden">
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
              @save="(data, stepId) => registrationStore.setStepAnswer(stepId, data)"
            >
              <template #action>
                <Button type="submit" class="w-full" :disabled="isSubmitting">
                  <span v-if="isSubmitting">
                        <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                  </span>
                  <span v-else-if="currentStepIndex === totalStepsCount - 1">Complete & Claim Coupon</span>
                  <span v-else>Next Step</span>
                </Button>
              </template>
            </ProfileQuestion>
          </template>
        </div>

        <div class="px-8 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[10px] text-zinc-400">
          <button 
            v-if="currentStepIndex > 0"
            @click="registrationStore.prevStep()"
            type="button"
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
