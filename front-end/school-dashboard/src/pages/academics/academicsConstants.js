export const ACADEMIC_TABS = [
  { key: 'ASSIGNMENT', label: 'Assignments', slug: 'assignments' },
  { key: 'MID_EXAM', label: 'Mid Exams', slug: 'mid-exams' },
  { key: 'FINAL_EXAM', label: 'Final Exams', slug: 'final-exams' },
];

export const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8].map((g) => ({
  value: String(g),
  label: `Grade ${g}`,
}));

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
  if (!editing) {
    fd.append('academic_year', String(formValues.academic_year));
  }
  if (formValues.description?.trim()) {
    fd.append('description', formValues.description.trim());
  }
  files.forEach((file) => fd.append('files', file));
  return fd;
}
