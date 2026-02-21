import { defineStore } from 'pinia'
import { checkDateBetween } from '../utils/dateHelpers'

/**
 * Auth Store
 * Following Pinia best practices: State, Getters, and Actions pattern.
 * Persistence is handled via useCookie to ensure data survives refreshes in Nuxt SSR.
 */
export const useAuthStore = defineStore('auth-2', {
  state: () => ({
    customer: null as any | null,
    currentEvent: null as any | null,
    eventRegistration: null as any | null,
  }),

  getters: {
    currentEventId: (state) => state.currentEvent?.id,
    currentEventSlug: (state) => state.currentEvent?.slug,
    customerData: (state) => state.customer,
    customerId: (state) => state.customer?.id,
    isEventStarted: (state) => checkDateBetween(new Date(), state.currentEvent?.startAt, state.currentEvent?.endAt) && state.currentEvent?.isActive,
    isCustomerRegistered: (state) => {
      if (state.eventRegistration) {
        if (state.eventRegistration.status === 'pending') {
          return false
        }
        return true
      }
      return false
    },
    registrationStatus: (state) => state.eventRegistration?.status,
    isBlacklistedUntil: (state) => state.eventRegistration?.blacklistedUntil,
  },
  persist: true,

  actions: {
    /**
     * Set authentication and event data
     */
    setAuthData(payload: {
      customer?: any | null;
      currentEvent?: any | null;
      eventRegistration?: any | null;
    }) {
      if (payload.customer !== undefined) this.customer = payload.customer;
      if (payload.currentEvent !== undefined) this.currentEvent = payload.currentEvent;
      if (payload.eventRegistration !== undefined) this.eventRegistration = payload.eventRegistration;
    },

    /**
     * Clear all auth-related state
     */
    clearAuth() {
      this.customer = null;
      this.currentEvent = null;
      this.eventRegistration = null;
    },
    /**
     * Check auth data
     */
    checkAuthData(): boolean {
      if (!this.customer) {
        console.log('customer is null');
        return false;
      }
      if (!this.currentEvent) {
        console.log('currentEvent is null');
        return false;
      }
      if (!this.eventRegistration) {
        console.log('eventRegistration is null');
        return false;
      }

      return true;
    }
  },
})
