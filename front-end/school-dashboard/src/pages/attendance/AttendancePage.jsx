import CrudModulePage from '../../components/shared/CrudModulePage';
import { attendanceApi } from '../../services/api';
import { formatDate, getDisplayName } from '../../utils/formatters';

const columns = [
  { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
  { key: 'student', header: 'Student', render: (r) => getDisplayName(r.student) || r.student_name || '—' },
  { key: 'class', header: 'Class', render: (r) => r.class_name || r.class || '—' },
  { key: 'status', header: 'Status', render: (r) => (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
      r.status === 'present' ? 'bg-green-50 text-green-700' : r.status === 'absent' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
    }`}>{r.status || '—'}</span>
  )},
  { key: 'remarks', header: 'Remarks', render: (r) => r.remarks || '—' },
];

const formFields = [
  { name: 'student', label: 'Student ID', required: true },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'status', label: 'Status (present/absent/late)', required: true },
  { name: 'remarks', label: 'Remarks' },
];

export default function AttendancePage() {
  return (
    <CrudModulePage
      title="Attendance"
      description="Track and manage daily student attendance records"
      queryKey={['attendance']}
      api={attendanceApi}
      columns={columns}
      formFields={formFields}
      exportType="attendance"
      filters={[
        { key: 'status', label: 'Status', options: [{ value: 'present', label: 'Present' }, { value: 'absent', label: 'Absent' }, { value: 'late', label: 'Late' }] },
      ]}
      searchPlaceholder="Search attendance records..."
      createLabel="Mark Attendance"
    />
  );
}
