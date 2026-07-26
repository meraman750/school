export const EXAM_GRADE_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8];

export const EXAM_WEEKDAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
];

export function examinationGradePath(gradeLevel) {
  return `/examination/grade/${gradeLevel}`;
}

export function toTimeInputValue(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}

/** Align exam_date to a weekday (1=Mon … 5=Fri, same as EXAM_WEEKDAYS.value). */
export function applyWeekdayToIsoDate(isoDate, weekdayValue) {
  if (!isoDate || !weekdayValue) return isoDate;
  const date = new Date(`${isoDate}T12:00:00`);
  const target = Number(weekdayValue);
  const jsTarget = target === 7 ? 0 : target;
  const diff = jsTarget - date.getDay();
  date.setDate(date.getDate() + diff);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function weekdayFromIsoDate(isoDate) {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T12:00:00`);
  const day = date.getDay();
  if (day >= 1 && day <= 5) return String(day);
  return '1';
}
