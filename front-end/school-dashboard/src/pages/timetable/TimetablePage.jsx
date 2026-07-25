import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiChevronRight } from 'react-icons/fi';
import CrudModulePage from '../../components/shared/CrudModulePage';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { academicsSubApi, teachersApi } from '../../services/api';
import { annualScheduleYearPath } from './timetableConstants';

const TABS = [
  { key: 'annual', label: 'Annual Schedule' },
  { key: 'class', label: 'Class Timetable' },
];

const DAY_OPTIONS = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

function AnnualYearListTab() {
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
        <p className="text-xs text-gray-500">Select a year to view and manage its calendar events</p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : isError ? (
        <EmptyState title="Failed to load years" description="Please try again." />
      ) : sortedYears.length === 0 ? (
        <EmptyState title="No academic years" description="Add Ethiopian calendar years under Academics seed or settings." />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedYears.map((year) => (
            <li key={year.id}>
              <Link to={annualScheduleYearPath(year.id)} className="block h-full">
                <Card padding className="group h-full transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-primary dark:text-white">
                        {year.name}
                      </p>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
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

function ClassTimetableTab({ classOptions, subjectOptions, teacherOptions, roomOptions }) {
  const columns = [
    { key: 'day_label', header: 'Day', render: (r) => r.day_label || '—' },
    {
      key: 'time',
      header: 'Time',
      render: (r) => (r.start_time && r.end_time ? `${r.start_time} – ${r.end_time}` : '—'),
    },
    { key: 'school_class_name', header: 'Class', render: (r) => r.school_class_name || '—' },
    { key: 'subject_name', header: 'Subject', render: (r) => r.subject_name || '—' },
    { key: 'teacher_name', header: 'Teacher', render: (r) => r.teacher_name || '—' },
    { key: 'room_name', header: 'Room', render: (r) => r.room_name || '—' },
  ];

  const formFields = [
    { name: 'school_class', label: 'Class', type: 'select', required: true, options: classOptions },
    { name: 'subject', label: 'Subject', type: 'select', required: true, options: subjectOptions },
    { name: 'teacher', label: 'Teacher', type: 'select', required: true, options: teacherOptions },
    { name: 'day_of_week', label: 'Day', type: 'select', required: true, options: DAY_OPTIONS },
    { name: 'start_time', label: 'Start Time', type: 'time', required: true },
    { name: 'end_time', label: 'End Time', type: 'time', required: true },
    { name: 'room', label: 'Room (optional)', type: 'select', options: [{ value: '', label: 'None' }, ...roomOptions] },
  ];

  const preparePayload = (data) => ({
    school_class: Number(data.school_class),
    subject: Number(data.subject),
    teacher: Number(data.teacher),
    day_of_week: Number(data.day_of_week),
    start_time: data.start_time,
    end_time: data.end_time,
    room: data.room ? Number(data.room) : null,
  });

  return (
    <CrudModulePage
      title="Class Timetable"
      description="Weekly period schedule by class, subject, and teacher"
      queryKey={['timetable', 'class']}
      api={academicsSubApi.timetables}
      columns={columns}
      formFields={formFields}
      preparePayload={preparePayload}
      filters={[
        { key: 'school_class', label: 'Class', options: classOptions },
        { key: 'day_of_week', label: 'Day', options: DAY_OPTIONS },
      ]}
      searchPlaceholder="Search class timetable..."
      createLabel="Add Period"
      getDefaultValues={() => ({
        school_class: '',
        subject: '',
        teacher: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        room: '',
      })}
    />
  );
}

export default function TimetablePage() {
  const [activeTab, setActiveTab] = useState('annual');

  const { data: classesData } = useQuery({
    queryKey: ['school-classes'],
    queryFn: () => academicsSubApi.classes.list({ page_size: 100 }),
    enabled: activeTab === 'class',
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicsSubApi.subjects.list({ page_size: 100 }),
    enabled: activeTab === 'class',
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers-options'],
    queryFn: () => teachersApi.list({ page_size: 100 }),
    enabled: activeTab === 'class',
  });

  const { data: roomsData } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => academicsSubApi.rooms.list({ page_size: 100 }),
    enabled: activeTab === 'class',
  });

  const classOptions = useMemo(() => {
    const list = classesData?.results || classesData || [];
    return list.map((c) => ({ value: String(c.id), label: c.name }));
  }, [classesData]);

  const subjectOptions = useMemo(() => {
    const list = subjectsData?.results || subjectsData || [];
    return list.map((s) => ({ value: String(s.id), label: s.name }));
  }, [subjectsData]);

  const teacherOptions = useMemo(() => {
    const list = teachersData?.results || teachersData || [];
    return list.map((t) => ({
      value: String(t.id),
      label: `${t.first_name || ''} ${t.last_name || ''}`.trim() || t.employee_id,
    }));
  }, [teachersData]);

  const roomOptions = useMemo(() => {
    const list = roomsData?.results || roomsData || [];
    return list.map((r) => ({ value: String(r.id), label: r.name }));
  }, [roomsData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Timetable</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Annual school calendar and weekly class period schedules
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1 dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
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
        <ClassTimetableTab
          classOptions={classOptions}
          subjectOptions={subjectOptions}
          teacherOptions={teacherOptions}
          roomOptions={roomOptions}
        />
      )}
    </div>
  );
}
