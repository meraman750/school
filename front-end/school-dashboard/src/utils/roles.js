export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  VICE_PRINCIPAL: 'VICE_PRINCIPAL',
  REGISTRAR: 'REGISTRAR',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT',
  FINANCE: 'FINANCE',
  ACCOUNTANT: 'ACCOUNTANT',
  LIBRARIAN: 'LIBRARIAN',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.PRINCIPAL]: 'Principal',
  [ROLES.VICE_PRINCIPAL]: 'Vice Principal',
  [ROLES.REGISTRAR]: 'Registrar',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.PARENT]: 'Student / Parent',
  [ROLES.STUDENT]: 'Student / Parent',
  [ROLES.FINANCE]: 'Finance',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.LIBRARIAN]: 'Librarian',
};

const ADMIN_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.REGISTRAR,
];

const TEACHER_ROLES = [ROLES.TEACHER];
const FINANCE_ROLES = [ROLES.FINANCE, ROLES.ACCOUNTANT];
const PORTAL_ROLES = [ROLES.STUDENT, ROLES.PARENT];

/** Staff sidebar modules (admin / teacher / finance). */
const STAFF_MODULE_ACCESS = {
  overview: [...ADMIN_ROLES],
  students: [...ADMIN_ROLES],
  teachers: [...ADMIN_ROLES],
  academics: [...ADMIN_ROLES, ...TEACHER_ROLES],
  timetable: [...ADMIN_ROLES, ...TEACHER_ROLES],
  examination: [...ADMIN_ROLES, ...TEACHER_ROLES],
  library: [...ADMIN_ROLES, ...TEACHER_ROLES, ROLES.LIBRARIAN],
  documents: [...ADMIN_ROLES],
  reports: [...ADMIN_ROLES, ...TEACHER_ROLES],
  studentFees: [...ADMIN_ROLES, ...FINANCE_ROLES],
  teacherPayroll: [...ADMIN_ROLES, ...FINANCE_ROLES],
  finance: [...ADMIN_ROLES, ...FINANCE_ROLES],
  settings: [...ADMIN_ROLES, ...TEACHER_ROLES, ...FINANCE_ROLES],
};

/** Family portal (student / parent). */
const PORTAL_MODULE_ACCESS = {
  timetable: PORTAL_ROLES,
  examination: PORTAL_ROLES,
  academics: PORTAL_ROLES,
  library: PORTAL_ROLES,
  profile: PORTAL_ROLES,
};

export function normalizeRole(role) {
  if (!role) return ROLES.ADMIN;
  return String(role).toUpperCase().replace(/\s+/g, '_');
}

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(normalizeRole(role));
}

export function isTeacherRole(role) {
  return normalizeRole(role) === ROLES.TEACHER;
}

export function isFinanceRole(role) {
  return FINANCE_ROLES.includes(normalizeRole(role));
}

export function isPortalRole(role) {
  return PORTAL_ROLES.includes(normalizeRole(role));
}

export function getPortalType(role) {
  const r = normalizeRole(role);
  if (PORTAL_ROLES.includes(r)) return 'portal';
  if (FINANCE_ROLES.includes(r)) return 'finance';
  if (r === ROLES.TEACHER) return 'teacher';
  return 'admin';
}

export function canShowModuleInNav(role, moduleKey) {
  if (!canAccessModule(role, moduleKey)) return false;
  if (isTeacherRole(role) && moduleKey === 'teachers') return false;
  if (isFinanceRole(role) && moduleKey === 'finance') return false;
  return true;
}

export function canAccessModule(role, moduleKey) {
  const normalized = normalizeRole(role);
  if (PORTAL_ROLES.includes(normalized)) {
    const allowed = PORTAL_MODULE_ACCESS[moduleKey];
    if (!allowed) return false;
    return allowed.includes(normalized);
  }
  const allowed = STAFF_MODULE_ACCESS[moduleKey];
  if (!allowed) return false;
  return allowed.includes(normalized);
}

export function getHomePath(role) {
  const type = getPortalType(role);
  if (type === 'portal') return '/portal/timetable';
  if (type === 'teacher') return '/reports';
  if (type === 'finance') return '/finance/student-fees';
  return '/';
}

export function canEditSchoolSettings(role) {
  return isAdminRole(role);
}

export function canManageTeacherSalary(role) {
  const r = normalizeRole(role);
  return isAdminRole(r) || FINANCE_ROLES.includes(r);
}

export function canEditStudentRecords(role) {
  return isAdminRole(role) || isTeacherRole(role);
}

export function canEditStudentAcademic(role) {
  return canEditStudentRecords(role);
}

export function canEditStudentDemographics(role) {
  return isAdminRole(role);
}

export function isStudentBillingView(role) {
  return isFinanceRole(role);
}

export function isReadOnlyModule(role, moduleKey) {
  const r = normalizeRole(role);
  if (PORTAL_ROLES.includes(r)) return true;
  if (isFinanceRole(r)) {
    return false;
  }
  if (isTeacherRole(r)) {
    return ['timetable', 'examination'].includes(moduleKey);
  }
  return false;
}

export function isAdmin(role) {
  return isAdminRole(role);
}
