export { GRADE_LEVELS, GRADE_OPTIONS, isValidGradeLevel, MAX_GRADE_LEVEL, MIN_GRADE_LEVEL } from '../../utils/constants';

export const ACADEMIC_TABS = [
  { key: 'ASSIGNMENT', label: 'Assignments', slug: 'assignments' },
  { key: 'MID_EXAM', label: 'Mid Exams', slug: 'mid-exams' },
  { key: 'FINAL_EXAM', label: 'Final Exams', slug: 'final-exams' },
  { key: 'MATERIAL', label: 'Materials', slug: 'materials', hideAcademicYear: true },
];

export function getTabByKey(key) {
  return ACADEMIC_TABS.find((t) => t.key === key);
}

export function getTabBySlug(slug) {
  return ACADEMIC_TABS.find((t) => t.slug === slug);
}

export function subjectItemsPath(tab, subjectId) {
  return `/academics/${tab.slug}/subject/${subjectId}`;
}

export function itemViewerPath(tab, subjectId, itemId) {
  return `/academics/${tab.slug}/subject/${subjectId}/view/${itemId}`;
}

export function buildGradeItemFormData(formValues, itemType, subjectId, files, editing) {
  const fd = new FormData();
  fd.append('item_type', itemType);
  fd.append('subject', String(subjectId));
  fd.append('title', formValues.title?.trim() || '');
  fd.append('grade_level', String(formValues.grade_level));
  const hideYear = itemType === 'MATERIAL';
  if (!editing && !hideYear) {
    fd.append('academic_year', String(formValues.academic_year));
  }
  if (formValues.description?.trim()) {
    fd.append('description', formValues.description.trim());
  }
  files.forEach((file) => fd.append('files', file));
  return fd;
}

export function tabSingularLabel(tab) {
  if (tab?.key === 'MATERIAL') return 'Material';
  return tab?.label?.slice(0, -1) || 'Item';
}
