import { toast } from "vue-sonner"

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()
  const authStore = useAuthStore()

  const oldAuth = useCookie('auth')
  const newAuth = useCookie('auth-2')

  if (oldAuth.value && newAuth.value) {
    oldAuth.value = null
  }

  if (!user.value || !authStore.checkAuthData()) {
  // return navigateTo('/')
  }

  try {
    let checkRedirect = false;
    const accessPages = ['/registration', '/registration-success', '/dashboard', '/registration-blacklisted'];
    if (user.value && from.path != '/login/' + authStore.currentEventSlug && accessPages.includes(to.path)) {
      checkRedirect = true;
    }

    if (!checkRedirect) {
      return;
    }

    const loginCheckResult = await checkAuthData(authStore.currentEventSlug, authStore.customer.email, authStore.customer.fullName, authStore.customer.id);
    const authCookie = useCookie('auth-2');
    authCookie.value = JSON.stringify({
      customer: loginCheckResult.customer,
      eventRegistration: loginCheckResult.eventRegistration,
      currentEvent: loginCheckResult.event
    });

    const navigateToUrl = checkAuthStoreAndRedirectUrl();
    if (navigateToUrl === to.path) {
      return;
    }

    console.log({ to: to.path, from: from.path, navigateToUrl, 'isCustomerRegistered': authStore.isCustomerRegistered });
    return navigateTo(navigateToUrl);

  } catch (err: any) {
    console.log(err);
    return navigateTo('/');
  }
})
