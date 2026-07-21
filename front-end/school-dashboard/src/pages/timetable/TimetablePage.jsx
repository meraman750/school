import CrudModulePage from '../../components/shared/CrudModulePage';
import { academicsSubApi } from '../../services/api';

const columns = [
  { key: 'day', header: 'Day', render: (r) => r.day || r.day_of_week || '—' },
  { key: 'period', header: 'Period', render: (r) => r.period || r.time_slot || '—' },
  { key: 'class', header: 'Class', render: (r) => r.class_name || r.class || '—' },
  { key: 'subject', header: 'Subject', render: (r) => r.subject?.name || r.subject || '—' },
  { key: 'teacher', header: 'Teacher', render: (r) => r.teacher?.name || r.teacher_name || '—' },
  { key: 'room', header: 'Room', render: (r) => r.room || '—' },
];

const formFields = [
  { name: 'day', label: 'Day', required: true },
  { name: 'period', label: 'Period', required: true },
  { name: 'class', label: 'Class', required: true },
  { name: 'subject', label: 'Subject', required: true },
  { name: 'teacher', label: 'Teacher ID' },
  { name: 'room', label: 'Room' },
];

export default function TimetablePage() {
  return (
    <CrudModulePage
      title="Timetable"
      description="Manage class schedules and period assignments"
      queryKey={['timetable']}
      api={{ ...academicsSubApi.classes, list: (params) => academicsSubApi.classes.list({ ...params, type: 'timetable' }) }}
      columns={columns}
      formFields={formFields}
      exportType="timetable"
      searchPlaceholder="Search timetable..."
      createLabel="Add Schedule"
    />
  );
}
