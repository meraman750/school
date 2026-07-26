export const PORTAL_ROOT = '/portal';

export function resolveModulePrefix(pathname = '') {
  return pathname.startsWith(PORTAL_ROOT) ? PORTAL_ROOT : '';
}

export function withModulePrefix(prefix, path) {
  const segment = path.startsWith('/') ? path : `/${path}`;
  return `${prefix || ''}${segment}`;
}
