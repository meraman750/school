/** Must match school-dashboard tokenStorage keys (same origin). */
const DASHBOARD_TOKEN_KEYS = {
  access: 'access_token',
  refresh: 'refresh_token',
  user: 'user',
}

export const DASHBOARD_ACCESS_KEY = 'biruk_dashboard_entry'

/**
 * End dashboard session when the public site is opened.
 * Clears auth and the biruk-admin entry flag so dashboard requires the gateway again.
 */
export function revokeDashboardSessionOnPublicSite() {
  try {
    localStorage.removeItem(DASHBOARD_TOKEN_KEYS.access);
    localStorage.removeItem(DASHBOARD_TOKEN_KEYS.refresh);
    localStorage.removeItem(DASHBOARD_TOKEN_KEYS.user);
    sessionStorage.removeItem(DASHBOARD_ACCESS_KEY);
  } catch {
    /* ignore storage errors */
  }
}
