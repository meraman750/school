export { GRADE_LEVELS as EXAM_GRADE_LEVELS } from '../../utils/constants';

/** Monday = 1 ΓÇª Sunday = 7 */
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
  return `${a} ΓÇô ${b}`;
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

/** Map ISO date to weekday value 1 (Mon) ΓÇª 7 (Sun). */
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

export function createDayRow(dayValue) {
  return {
    rowId: `day-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dayValue: Number(dayValue),
  };
}

export function mapEntryFromApi(entry) {
  return {
    id: entry.id,
    subject: String(entry.subject),
    subject_name: entry.subject_name,
    start_time: toTimeInputValue(entry.start_time),
    end_time: toTimeInputValue(entry.end_time),
    schedule_slot_index: entry.schedule_slot_index ?? 0,
  };
}

export function hydrateExamScheduleFromServer(scheduledWeekdays, entries) {
  const scheduled = Array.isArray(scheduledWeekdays) ? scheduledWeekdays : [];
  const rows = [];
  const examsByRowId = {};

  if (scheduled.length > 0) {
    scheduled.forEach((d) => {
      const dayValue = Number(d);
      if (dayValue < 1 || dayValue > 7) return;
      const row = createDayRow(dayValue);
      rows.push(row);
      examsByRowId[row.rowId] = [];
    });
  } else {
    EXAM_WEEK_DAYS.forEach((day) => {
      const dayEntries = (entries || []).filter(
        (e) => Number(weekdayFromIsoDate(e.exam_date)) === day.value,
      );
      if (!dayEntries.length) return;
      const row = createDayRow(day.value);
      rows.push(row);
      examsByRowId[row.rowId] = dayEntries.map(mapEntryFromApi).sort((a, b) =>
        a.start_time.localeCompare(b.start_time),
      );
    });
    return { rows, examsByRowId };
  }

  const bySlot = {};
  (entries || []).forEach((entry) => {
    const mapped = mapEntryFromApi(entry);
    const idx = mapped.schedule_slot_index;
    if (!bySlot[idx]) bySlot[idx] = [];
    bySlot[idx].push(mapped);
  });

  rows.forEach((row, index) => {
    examsByRowId[row.rowId] = (bySlot[index] || []).sort((a, b) =>
      a.start_time.localeCompare(b.start_time),
    );
  });

  return { rows, examsByRowId };
}

export function flattenExamScheduleRows(dayRows, examsByRowId) {
  const flat = [];
  (dayRows || []).forEach((row, index) => {
    (examsByRowId[row.rowId] || []).forEach((exam) => {
      flat.push({
        day_of_week: row.dayValue,
        schedule_slot_index: index,
        subject: Number(exam.subject),
        start_time: exam.start_time,
        end_time: exam.end_time,
      });
    });
  });
  return flat;
}

export function hasAnyExamInRows(examsByRowId) {
  return Object.values(examsByRowId || {}).some((list) => list.length > 0);
}

/** @deprecated use hydrateExamScheduleFromServer */
export function flattenExamDaySlots(daySlots, activeDays) {
  const flat = [];
  const days = activeDays?.length
    ? activeDays
    : EXAM_WEEK_DAYS.map((day) => day.value);
  days.forEach((dayValue) => {
    (daySlots[dayValue] || []).forEach((exam) => {
      flat.push({
        day_of_week: dayValue,
        subject: Number(exam.subject),
        start_time: exam.start_time,
        end_time: exam.end_time,
      });
    });
  });
  return flat;
}

export function activeDaysFromPlanAndSlots(scheduledWeekdays, daySlots) {
  const ordered = [];
  const seen = new Set();
  (scheduledWeekdays || []).forEach((d) => {
    const n = Number(d);
    if (n >= 1 && n <= 7 && !seen.has(n)) {
      seen.add(n);
      ordered.push(n);
    }
  });
  EXAM_WEEK_DAYS.forEach((day) => {
    if ((daySlots[day.value] || []).length > 0 && !seen.has(day.value)) {
      seen.add(day.value);
      ordered.push(day.value);
    }
  });
  return ordered;
}

export function examDayMeta(dayValue) {
  return EXAM_WEEK_DAYS.find((d) => d.value === dayValue);
}

export function hasAnyExamSlot(daySlots) {
  return EXAM_WEEK_DAYS.some((day) => (daySlots[day.value] || []).length > 0);
}

export function hasAnyScheduledDay(activeDays) {
  return Array.isArray(activeDays) && activeDays.length > 0;
}
