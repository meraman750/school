export const EXAM_GRADE_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Monday = 1 … Sunday = 7 */
export const EXAM_WEEK_DAYS = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
  { value: 7, label: 'Sunday', short: 'Sun' },
];

/** @deprecated use EXAM_WEEK_DAYS */
export const EXAM_WEEKDAYS = EXAM_WEEK_DAYS.filter((d) => d.value <= 5);

export function examinationGradePath(gradeLevel) {
  return `/examination/grade/${gradeLevel}`;
}

export function toTimeInputValue(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}

export function formatTimeRange(start, end) {
  const a = toTimeInputValue(start);
  const b = toTimeInputValue(end);
  if (!a || !b) return '';
  return `${a} – ${b}`;
}

export function defaultWeekStartMondayIso() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() + 1);
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Map ISO date to weekday value 1 (Mon) … 7 (Sun). */
export function weekdayFromIsoDate(isoDate) {
  if (!isoDate) return '1';
  const date = new Date(`${isoDate}T12:00:00`);
  const day = date.getDay();
  if (day === 0) return '7';
  return String(day);
}

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

export function emptyExamDaySlots() {
  const slots = {};
  EXAM_WEEK_DAYS.forEach((day) => {
    slots[day.value] = [];
  });
  return slots;
}

export function examDaySlotsFromEntries(entries) {
  const slots = emptyExamDaySlots();
  (entries || []).forEach((entry) => {
    const day = Number(weekdayFromIsoDate(entry.exam_date));
    if (!slots[day]) slots[day] = [];
    slots[day].push({
      id: entry.id,
      subject: String(entry.subject),
      subject_name: entry.subject_name,
      start_time: toTimeInputValue(entry.start_time),
      end_time: toTimeInputValue(entry.end_time),
    });
  });
  EXAM_WEEK_DAYS.forEach((day) => {
    slots[day.value].sort((a, b) => a.start_time.localeCompare(b.start_time));
  });
  return slots;
}

export function flattenExamDaySlots(daySlots) {
  const flat = [];
  EXAM_WEEK_DAYS.forEach((day) => {
    (daySlots[day.value] || []).forEach((exam) => {
      flat.push({
        day_of_week: day.value,
        subject: Number(exam.subject),
        start_time: exam.start_time,
        end_time: exam.end_time,
      });
    });
  });
  return flat;
}

export function hasAnyExamSlot(daySlots) {
  return EXAM_WEEK_DAYS.some((day) => (daySlots[day.value] || []).length > 0);
}
