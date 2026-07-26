/** Must match school-dashboard tokenStorage keys (same origin). */
const DASHBOARD_TOKEN_KEYS = {
  access: 'access_token',
  refresh: 'refresh_token',
  user: 'user',
}

export const DASHBOARD_ACCESS_KEY = 'biruk_dashboard_entry'

/**
 * End dashboard session when the public site is opened (same tab or return visit).
 * If an admin was logged in, allow dashboard login again without re-using biruk-admin.
 */
export function revokeDashboardSessionOnPublicSite() {
  try {
    const hadAuth = Boolean(localStorage.getItem(DASHBOARD_TOKEN_KEYS.access))

    localStorage.removeItem(DASHBOARD_TOKEN_KEYS.access)
    localStorage.removeItem(DASHBOARD_TOKEN_KEYS.refresh)
    localStorage.removeItem(DASHBOARD_TOKEN_KEYS.user)

    sessionStorage.removeItem(DASHBOARD_ACCESS_KEY)

    if (hadAuth) {
      sessionStorage.setItem(DASHBOARD_ACCESS_KEY, '1')
    }
  } catch {
    /* ignore storage errors */
  }
}
