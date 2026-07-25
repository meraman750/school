import { useMemo } from 'react';
import Select from '../ui/Select';
import {
  getDayOptionsInRange,
  getMonthOptionsInRange,
  getAcademicYearRange,
} from '../../pages/timetable/academicYearRange';

export default function AcademicYearDateFields({
  label,
  monthKey,
  day,
  onMonthChange,
  onDayChange,
  yearRecord,
  required = false,
  monthError,
  dayError,
}) {
  const { start, end } = useMemo(() => getAcademicYearRange(yearRecord), [yearRecord]);
  const monthOptions = useMemo(() => getMonthOptionsInRange(start, end), [start, end]);
  const dayOptions = useMemo(
    () => getDayOptionsInRange(start, end, monthKey),
    [start, end, monthKey],
  );

  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
        {required ? ' *' : ''}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Month"
          placeholder="Select month"
          options={monthOptions}
          value={monthKey}
          onChange={(e) => onMonthChange(e.target.value)}
          error={monthError}
        />
        <Select
          label="Day"
          placeholder="Select day"
          options={dayOptions}
          value={day}
          onChange={(e) => onDayChange(e.target.value)}
          error={dayError}
          disabled={!monthKey}
        />
      </div>
    </div>
  );
}
