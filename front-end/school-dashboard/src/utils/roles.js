export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT',
  ACCOUNTANT: 'ACCOUNTANT',
  LIBRARIAN: 'LIBRARIAN',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.PARENT]: 'Parent',
  [ROLES.STUDENT]: 'Student',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.LIBRARIAN]: 'Librarian',
};

const MODULE_ACCESS = {
  overview: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER],
  students: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER],
  teachers: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  academics: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER],
  timetable: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER],
  examination: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER],
  library: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LIBRARIAN, ROLES.TEACHER],
  documents: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER],
  reports: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  settings: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
};

export function normalizeRole(role) {
  if (!role) return ROLES.ADMIN;
  return String(role).toUpperCase().replace(/\s+/g, '_');
}

export function canAccessModule(role, moduleKey) {
  const normalized = normalizeRole(role);
  const allowed = MODULE_ACCESS[moduleKey];
  if (!allowed) return true;
  return allowed.includes(normalized);
}

export function isAdmin(role) {
  const normalized = normalizeRole(role);
  return normalized === ROLES.SUPER_ADMIN || normalized === ROLES.ADMIN;
}
