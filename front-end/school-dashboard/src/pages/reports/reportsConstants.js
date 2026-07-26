export const REPORT_GRADE_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8];

export function reportsListPath() {
  return '/reports';
}

export function reportsGradePath(gradeLevel) {
  return `/reports/grade/${gradeLevel}`;
}

export function reportsClassPath(gradeLevel, sectionName) {
  return `/reports/grade/${gradeLevel}/section/${encodeURIComponent(sectionName)}`;
}

export const REPORT_QUARTERS = [
  { value: '1', label: 'Quarter 1' },
  { value: '2', label: 'Quarter 2' },
  { value: '3', label: 'Quarter 3' },
  { value: '4', label: 'Quarter 4' },
];
