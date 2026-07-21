import CrudModulePage from '../../components/shared/CrudModulePage';
import { teachersApi } from '../../services/api';
import { formatDate, getDisplayName } from '../../utils/formatters';

const columns = [
  { key: 'employee_id', header: 'Employee ID', render: (r) => <span className="font-mono">{r.employee_id || `#${r.id}`}</span> },
  { key: 'name', header: 'Teacher', render: (r) => <span className="font-semibold">{getDisplayName(r)}</span> },
  { key: 'subject', header: 'Subject', render: (r) => r.subject || r.department || '—' },
  { key: 'email', header: 'Email', render: (r) => r.email || '—' },
  { key: 'phone', header: 'Phone', render: (r) => r.phone || '—' },
  { key: 'status', header: 'Status', render: (r) => (
    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">{r.status || 'Active'}</span>
  )},
  { key: 'created_at', header: 'Joined', render: (r) => formatDate(r.created_at || r.hire_date) },
];

const formFields = [
  { name: 'first_name', label: 'First Name', required: true },
  { name: 'last_name', label: 'Last Name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone' },
  { name: 'subject', label: 'Subject' },
  { name: 'employee_id', label: 'Employee ID' },
];

export default function TeachersPage() {
  return (
    <CrudModulePage
      title="Teachers"
      description="Manage teaching staff, assignments, and contact information"
      queryKey={['teachers']}
      api={teachersApi}
      columns={columns}
      formFields={formFields}
      exportType="teachers"
      searchPlaceholder="Search teachers..."
      createLabel="Add Teacher"
    />
  );
}
