/** Base path when dashboard is hosted under /dashboard (Docker) or / (Cloudflare Pages subdomain). */
export const ROUTER_BASENAME = import.meta.env.VITE_ROUTER_BASENAME || '/dashboard';

export function withBasename(path) {
  const segment = path.startsWith('/') ? path : `/${path}`;
  if (ROUTER_BASENAME === '/' || ROUTER_BASENAME === '') {
    return segment;
  }
  const base = ROUTER_BASENAME.replace(/\/$/, '');
  return `${base}${segment}`;
}
