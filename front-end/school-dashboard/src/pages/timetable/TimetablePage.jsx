import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiChevronRight } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { academicsSubApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { isReadOnlyModule, isTeacherRole, normalizeRole } from '../../utils/roles';
import {
  GRADE_LEVELS,
  annualScheduleYearPath,
  classTimetableGradePath,
} from './timetableConstants';

const TABS = [
  { key: 'annual', label: 'Annual Schedule' },
  { key: 'class', label: 'Class Timetable' },
];


function AnnualYearListTab() {
  const { user } = useAuth();
  const readOnly = isReadOnlyModule(normalizeRole(user?.role), 'timetable');
  const { data: years = [], isLoading, isError } = useQuery({
    queryKey: ['annual-schedule', 'year-options'],
    queryFn: () => academicsSubApi.annualSchedules.yearOptions(),
  });

  const sortedYears = useMemo(
    () => [...years].sort((a, b) => String(b.name).localeCompare(String(a.name))),
    [years],
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Annual Schedule — Academic Years</h3>
        <p className="text-xs text-gray-500">
          {readOnly ? 'View calendar events for each academic year' : 'Select a year to view and manage its calendar events'}
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : isError ? (
        <EmptyState title="Failed to load years" description="Please try again." />
      ) : sortedYears.length === 0 ? (
        <EmptyState title="No academic years" description="Add Ethiopian calendar years under Academics seed or settings." />
      ) : (
        <ul className="flex flex-col gap-3">
          {sortedYears.map((year) => (
            <li key={year.id}>
              <Link to={annualScheduleYearPath(year.id)} className="block">
                <Card padding className="group transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-primary dark:text-white">
                        {year.name}
                      </p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        {year.event_count} {year.event_count === 1 ? 'event' : 'events'}
                      </p>
                    </div>
                    <FiChevronRight className="shrink-0 text-gray-400 group-hover:text-primary" />
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ClassGradeListTab() {
  const { user } = useAuth();
  const isTeacher = isTeacherRole(normalizeRole(user?.role));
  const grades = GRADE_LEVELS;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Class Timetable — Grades</h3>
        <p className="text-xs text-gray-500">
          {isTeacher
            ? 'View weekly schedules for all grades (read-only)'
            : 'Choose a grade, then section A, B, or C to manage the weekly schedule'}
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {grades.map((grade) => (
          <li key={grade}>
            <Link to={classTimetableGradePath(grade)} className="block">
              <Card padding className="group transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-bold text-gray-900 group-hover:text-primary dark:text-white">
                    Grade {grade}
                  </p>
                  <FiChevronRight className="shrink-0 text-gray-400 group-hover:text-primary" />
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TimetablePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabFromUrl === 'class' ? 'class' : 'annual',
  );

  useEffect(() => {
    if (tabFromUrl === 'class') setActiveTab('class');
    if (tabFromUrl === 'annual') setActiveTab('annual');
  }, [tabFromUrl]);

  const selectTab = (key) => {
    setActiveTab(key);
    if (key === 'class') {
      setSearchParams({ tab: 'class' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Time Schedule</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Annual school calendar and weekly class period schedules
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1 dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => selectTab(t.key)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === t.key ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'annual' ? (
        <AnnualYearListTab />
      ) : (
        <ClassGradeListTab />
      )}
    </div>
  );
}
