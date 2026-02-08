import { defineStore } from 'pinia'

export const useRegistrationStore = defineStore('registration', {
  state: () => ({
    steps: [] as any[],
    currentStepIndex: 0,
    answers: {} as Record<number, any>,
    profileData: {
      fullName: '',
      email: '',
      phoneNumber: ''
    },
    eventSlug: null as string | null,
    eventId: null as string | null,
  }),

  getters: {
    totalStepsCount: (state): number => (state.steps?.length || 0) + 1,
    isFinalStep: (state): boolean => state.currentStepIndex === (state.steps?.length || 0),
    currentStep: (state) => {
      if (state.currentStepIndex === 0) return 'profile'
      return state.steps[state.currentStepIndex - 1]
    },
    // Helper to check if we can proceed
    canProceed: (state) => {
        // Logic handled in components mostly via validation
        return true 
    }
  },

  actions: {
    setSteps(steps: any[]) {
      this.steps = steps
    },
    
    setEventInfo(slug: string, id: string) {
      this.eventSlug = slug
      this.eventId = id
    },

    setProfileData(data: any) {
      this.profileData = { ...this.profileData, ...data }
    },

    setStepAnswer(stepId: number, answer: any) {
      this.answers[stepId] = answer
    },

    nextStep() {
      if (this.currentStepIndex < this.totalStepsCount) {
        this.currentStepIndex++
      }
    },

    prevStep() {
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--
      }
    },
    
    reset() {
      this.currentStepIndex = 0
      this.answers = {}
      this.steps = []
    }
  }
})
