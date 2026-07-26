export const DASHBOARD_ACCESS_KEY = 'biruk_dashboard_entry';

export const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || '/';

export function hasDashboardEntry() {
  try {
    return sessionStorage.getItem(DASHBOARD_ACCESS_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearDashboardEntry() {
  try {
    sessionStorage.removeItem(DASHBOARD_ACCESS_KEY);
  } catch {
    /* ignore */
  }
}

export function redirectToPublicSite() {
  const target = PUBLIC_SITE_URL;
  if (window.location.pathname.startsWith('/dashboard')) {
    window.location.replace(target);
  }
}
