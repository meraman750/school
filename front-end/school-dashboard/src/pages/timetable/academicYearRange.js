export function parseDay(dateStr) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T12:00:00`);
}

function defaultYearRange(yearName) {
  const match = String(yearName || '').match(/(\d{4})/);
  const ec = match ? Number(match[1]) : 2018;
  const gregorianStart = ec + 7;
  return {
    start: new Date(`${gregorianStart}-09-11T12:00:00`),
    end: new Date(`${gregorianStart + 1}-09-10T12:00:00`),
  };
}

export function getAcademicYearRange(yearRecord) {
  const start = parseDay(yearRecord?.start_date);
  const end = parseDay(yearRecord?.end_date);
  if (start && end) return { start, end };
  return defaultYearRange(yearRecord?.name);
}

export function monthKeyFromDate(date) {
  if (!date) return '';
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function parseIsoToMonthDay(iso, rangeStart, rangeEnd) {
  const date = parseDay(iso);
  if (!date) return { monthKey: '', day: '' };
  if (rangeStart && date < rangeStart) {
    return { monthKey: monthKeyFromDate(rangeStart), day: String(rangeStart.getDate()) };
  }
  if (rangeEnd && date > rangeEnd) {
    return { monthKey: monthKeyFromDate(rangeEnd), day: String(rangeEnd.getDate()) };
  }
  return { monthKey: monthKeyFromDate(date), day: String(date.getDate()) };
}

export function isoFromMonthDay(monthKey, dayStr) {
  if (!monthKey || !dayStr) return '';
  const [y, m] = monthKey.split('-').map(Number);
  const day = Number(dayStr);
  if (!y || Number.isNaN(m) || !day) return '';
  const month = m + 1;
  return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getMonthOptionsInRange(rangeStart, rangeEnd) {
  if (!rangeStart || !rangeEnd) return [];
  const options = [];
  const seen = new Set();
  const cursor = new Date(rangeStart);
  cursor.setDate(1);

  while (cursor <= rangeEnd) {
    const key = monthKeyFromDate(cursor);
    if (!seen.has(key)) {
      seen.add(key);
      options.push({
        value: key,
        label: cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return options;
}

export function getDayOptionsInRange(rangeStart, rangeEnd, monthKey) {
  if (!rangeStart || !rangeEnd || !monthKey) return [];
  const [y, m] = monthKey.split('-').map(Number);
  if (Number.isNaN(y) || Number.isNaN(m)) return [];

  const options = [];
  const cursor = new Date(y, m, 1);
  const monthEnd = new Date(y, m + 1, 0);

  while (cursor <= monthEnd) {
    if (cursor >= rangeStart && cursor <= rangeEnd) {
      const day = cursor.getDate();
      options.push({ value: String(day), label: String(day) });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return options;
}

export function compareIsoDates(a, b) {
  if (!a || !b) return 0;
  return parseDay(a).getTime() - parseDay(b).getTime();
}
