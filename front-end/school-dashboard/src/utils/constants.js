export const APP_NAME = 'Biruk Academy';
export const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
  USER: 'user',
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const MODULES = [
  { key: 'overview', label: 'Overview', path: '/', icon: 'grid' },
  { key: 'students', label: 'Students', path: '/students', icon: 'users' },
  { key: 'teachers', label: 'Teachers', path: '/teachers', icon: 'userCheck' },
  { key: 'academics', label: 'Academics', path: '/academics', icon: 'book' },
  { key: 'timetable', label: 'Time Schedule', path: '/timetable', icon: 'clock' },
  { key: 'examination', label: 'Examination', path: '/examination', icon: 'fileText' },
  { key: 'library', label: 'Library', path: '/library', icon: 'bookOpen' },
  { key: 'documents', label: 'Documents', path: '/documents', icon: 'folder' },
  { key: 'reports', label: 'Reports', path: '/reports', icon: 'barChart' },
  { key: 'activity', label: 'Activity', path: '/activity', icon: 'activity' },
  { key: 'studentFees', label: 'Student Fees', path: '/finance/student-fees', icon: 'users' },
  { key: 'teacherPayroll', label: 'Teacher Payroll', path: '/finance/teacher-payroll', icon: 'briefcase' },
  { key: 'finance', label: 'Finance', path: '/finance', icon: 'dollar' },
  { key: 'settings', label: 'Settings', path: '/settings', icon: 'settings' },
];

export const PORTAL_MODULES = [
  { key: 'timetable', label: 'My Timetable', path: '/portal/timetable', icon: 'clock' },
  { key: 'examination', label: 'Exams', path: '/portal/examination', icon: 'fileText' },
  { key: 'academics', label: 'Materials', path: '/portal/academics', icon: 'book' },
  { key: 'library', label: 'Library', path: '/portal/library', icon: 'bookOpen' },
  { key: 'profile', label: 'My Profile', path: '/portal/profile', icon: 'users' },
];

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;

export const CHART_COLORS = {
  primary: '#6C3EF4',
  secondary: '#FFC107',
  male: '#6C3EF4',
  female: '#FFC107',
  success: '#10B981',
  danger: '#EF4444',
};

export const DEMO_CREDENTIALS = {
  email: 'admin@birukacademy.edu',
  password: 'Admin@123',
};

/** Demo accounts — passwords reset when you run: python manage.py seed_data */
export const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@birukacademy.edu', password: 'Admin@123' },
  { role: 'Teacher', email: 'teacher@birukacademy.edu', password: 'Teacher@123' },
  { role: 'Finance', email: 'finance@birukacademy.edu', password: 'Finance@123' },
  { role: 'Student / Parent', email: 'student@birukacademy.edu', password: 'Student@123' },
];
