import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CrudModulePage from '../../components/shared/CrudModulePage';
import { academicsSubApi, teachersApi } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { toEthiopianYearOptions, CURRENT_ETHIOPIAN_YEAR } from '../../utils/ethiopianCalendar';

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

const EVENT_TYPE_OPTIONS = [
  { value: 'TERM', label: 'Term / Semester' },
  { value: 'HOLIDAY', label: 'Holiday / Break' },
  { value: 'EXAM', label: 'Exam Period' },
  { value: 'EVENT', label: 'School Event' },
  { value: 'OTHER', label: 'Other' },
];

const GRADE_FILTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8].map((g) => ({
  value: String(g),
  label: `Grade ${g}`,
}));

const GRADE_FORM_OPTIONS = [
  { value: '', label: 'All grades (whole school)' },
  ...GRADE_FILTER_OPTIONS,
];

function AnnualScheduleTab({ yearOptions, defaultYearId }) {
  const columns = [
    { key: 'title', header: 'Title', render: (r) => <span className="font-semibold">{r.title}</span> },
    { key: 'academic_year_name', header: 'Year', render: (r) => r.academic_year_name || '—' },
    { key: 'event_type_label', header: 'Type', render: (r) => r.event_type_label || r.event_type },
    {
      key: 'dates',
      header: 'Dates',
      render: (r) => {
        if (!r.start_date) return '—';
        if (r.end_date && r.end_date !== r.start_date) {
          return `${formatDate(r.start_date)} – ${formatDate(r.end_date)}`;
        }
        return formatDate(r.start_date);
      },
    },
    { key: 'grade_display', header: 'Grade', render: (r) => r.grade_display || '—' },
  ];

  const formFields = [
    { name: 'academic_year', label: 'Academic Year', type: 'select', required: true, options: yearOptions },
    { name: 'title', label: 'Title', required: true },
    { name: 'event_type', label: 'Event Type', type: 'select', required: true, options: EVENT_TYPE_OPTIONS },
    { name: 'start_date', label: 'Start Date', type: 'date', required: true },
    { name: 'end_date', label: 'End Date', type: 'date' },
    { name: 'grade_level', label: 'Grade (optional)', type: 'select', options: GRADE_FORM_OPTIONS },
    { name: 'description', label: 'Description' },
  ];

  const preparePayload = (data) => ({
    academic_year: Number(data.academic_year),
    title: data.title?.trim(),
    event_type: data.event_type,
    start_date: data.start_date,
    end_date: data.end_date || data.start_date,
    grade_level: data.grade_level ? Number(data.grade_level) : null,
    description: data.description?.trim() || '',
  });

  return (
    <CrudModulePage
      title="Annual Schedule"
      description="School-wide calendar: terms, holidays, exams, and events by Ethiopian academic year"
      queryKey={['timetable', 'annual-schedule']}
      api={academicsSubApi.annualSchedules}
      columns={columns}
      formFields={formFields}
      preparePayload={preparePayload}
      filters={[
        { key: 'academic_year', label: 'Academic Year', options: yearOptions },
        { key: 'event_type', label: 'Type', options: EVENT_TYPE_OPTIONS },
        { key: 'grade_level', label: 'Grade', options: GRADE_FILTER_OPTIONS },
      ]}
      searchPlaceholder="Search annual schedule..."
      createLabel="Add Event"
      getDefaultValues={() => ({
        academic_year: defaultYearId || '',
        title: '',
        event_type: 'EVENT',
        start_date: '',
        end_date: '',
        grade_level: '',
        description: '',
      })}
    />
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

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicsSubApi.years.list({ page_size: 50 }),
  });

  const { data: classesData } = useQuery({
    queryKey: ['school-classes'],
    queryFn: () => academicsSubApi.classes.list({ page_size: 100 }),
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicsSubApi.subjects.list({ page_size: 100 }),
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers-options'],
    queryFn: () => teachersApi.list({ page_size: 100 }),
  });

  const { data: roomsData } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => academicsSubApi.rooms.list({ page_size: 100 }),
  });

  const yearOptions = useMemo(() => toEthiopianYearOptions(yearsData), [yearsData]);
  const defaultYearId = useMemo(() => {
    const match = yearOptions.find((y) => y.label === CURRENT_ETHIOPIAN_YEAR);
    return match?.value || yearOptions[0]?.value || '';
  }, [yearOptions]);

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
        <AnnualScheduleTab yearOptions={yearOptions} defaultYearId={defaultYearId} />
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
