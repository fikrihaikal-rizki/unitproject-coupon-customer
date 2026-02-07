import { defineStore } from 'pinia'

/**
 * Auth Store
 * Following Pinia best practices: State, Getters, and Actions pattern.
 * Persistence is handled via useCookie to ensure data survives refreshes in Nuxt SSR.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Using Nuxt cookies for persistence that works across SSR and Client
    eventId: useCookie<string | null>('auth_event_id', { default: () => null }),
    customerId: useCookie<string | null>('auth_customer_id', { default: () => null }),
    eventSlug: useCookie<string | null>('auth_event_slug', { default: () => null }),
    customer: useCookie<any | null>('auth_customer', { default: () => null }),
  }),

  getters: {
    /**
     * Check if user is authenticated
     */
    isAuthenticated: (state) => !!state.customerId,
    
    /**
     * Get the current event ID
     */
    currentEventId: (state) => state.eventId,
    
    /**
     * Get the current event Slug
     */
    currentEventSlug: (state) => state.eventSlug,
    
    /**
     * Get the customer profile data
     */
    customerData: (state) => state.customer,
  },

  actions: {
    /**
     * Set authentication and event data
     */
    setAuthData(payload: {
      eventId?: string | null;
      customerId?: string | null;
      eventSlug?: string | null;
      customer?: any | null;
    }) {
      if (payload.eventId !== undefined) this.eventId = payload.eventId;
      if (payload.customerId !== undefined) this.customerId = payload.customerId;
      if (payload.eventSlug !== undefined) this.eventSlug = payload.eventSlug;
      if (payload.customer !== undefined) this.customer = payload.customer;
    },

    /**
     * Clear all auth-related state
     */
    clearAuth() {
      this.eventId = null;
      this.customerId = null;
      this.eventSlug = null;
      this.customer = null;
    },
  },
})
