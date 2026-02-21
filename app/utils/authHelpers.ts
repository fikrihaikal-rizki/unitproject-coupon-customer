export async function checkAuthData(eventSlug: string, email: string, fullName: string, customerId: string) {
  const authStore = useAuthStore();
  try {
    const { data: loginCheck, error: loginError } = await useFetch(
      "/api/auth/login-check",
      {
        method: "POST",
        body: {
          slug: eventSlug,
          email: email,
          fullName: fullName,
          customerId: customerId,
        },
      },
    );

    if (loginError.value) {
      throw new Error(
        loginError.value.statusMessage || "Failed to sync user data",
      );
    }

    if (!loginCheck.value) {
      throw new Error("Data not found, Failed to sync user data");
    }

    const loginCheckResult = loginCheck.value as any;

    authStore.setAuthData({
      customer: loginCheckResult.customer,
      eventRegistration: loginCheckResult.eventRegistration,
      currentEvent: loginCheckResult.event
    });

    return loginCheckResult;
  } catch (err: any) {
    authStore.clearAuth();
    throw new Error(err.message);
  }
}

export async function checkLockEvent(eventId: string) {
  try {
    if (!eventId) {
      throw new Error("Data not found, Failed to check lock event");
    }

    const { data: checkLock, error: checkError } = await useFetch(
      "/api/customer/events/check-lock",
      {
        params: { eventId: eventId },
      },
    );

    if (checkError.value) {
      throw new Error(
        checkError.value.statusMessage || "Failed to check lock event",
      );
    }

    if (!checkLock.value) {
      throw new Error("Data not found, Failed to check lock event");
    }

    return checkLock.value;
  } catch (err: any) {
    throw new Error(err.message);
  }
}

export function checkAuthStoreAndRedirectUrl() {
  try {
    const authStore = useAuthStore();

    if (!authStore.isCustomerRegistered) {
      return "/registration";
    }

    if (authStore.registrationStatus === "blacklisted") {
      return "/registration-blacklisted";
    }

    if (
      !authStore.isEventStarted &&
      authStore.registrationStatus === "completed"
    ) {
      return "/registration-success";
    } else if (
      authStore.isEventStarted &&
      authStore.registrationStatus === "completed"
    ) {
      return "/registration-success";
    }

    if (
      !authStore.isEventStarted &&
      authStore.registrationStatus === "active"
    ) {
      return "/registration-success";
    } else if (
      authStore.isEventStarted &&
      authStore.registrationStatus === "active"
    ) {
      return "/dashboard";
    } else {
      // Fallback
      return "/registration-success";
    }
  } catch (err: any) {
    throw new Error(err.message);
  }
}