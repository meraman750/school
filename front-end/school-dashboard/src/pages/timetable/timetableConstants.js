export const EVENT_TYPE_OPTIONS = [
  { value: 'TERM', label: 'Term / Semester' },
  { value: 'HOLIDAY', label: 'Holiday / Break' },
  { value: 'EXAM', label: 'Exam Period' },
  { value: 'EVENT', label: 'School Event' },
  { value: 'OTHER', label: 'Other' },
];

export const GRADE_FORM_OPTIONS = [
  { value: '', label: 'All grades (whole school)' },
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((g) => ({ value: String(g), label: `Grade ${g}` })),
];

export const GRADE_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8];

export const CLASS_TIMETABLE_DAYS = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
];

export const PERIOD_NUMBERS = [1, 2, 3, 4, 5, 6, 7];

export function classTimetableGradePath(gradeLevel) {
  return `/timetable/class/grade/${gradeLevel}`;
}

export function classTimetableSectionPath(gradeLevel, sectionId) {
  return `/timetable/class/grade/${gradeLevel}/section/${sectionId}`;
}

export function annualScheduleYearPath(yearId) {
  return `/timetable/annual/${yearId}`;
}

export function buildAnnualEventFormData(formValues, academicYearId, files, editing) {
  const fd = new FormData();
  if (!editing) {
    fd.append('academic_year', String(academicYearId));
  }
  fd.append('title', formValues.title?.trim() || '');
  fd.append('event_type', formValues.event_type || 'EVENT');
  fd.append('start_date', formValues.start_date || '');
  fd.append('end_date', formValues.end_date || formValues.start_date || '');
  if (formValues.grade_level) {
    fd.append('grade_level', String(formValues.grade_level));
  }
  if (formValues.description?.trim()) {
    fd.append('description', formValues.description.trim());
  }
  files.forEach((file) => fd.append('files', file));
  return fd;
}
