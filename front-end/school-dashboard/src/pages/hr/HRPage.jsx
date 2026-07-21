import CrudModulePage from '../../components/shared/CrudModulePage';
import { hrApi } from '../../services/api';
import { formatDate, getDisplayName } from '../../utils/formatters';

const columns = [
  { key: 'employee_id', header: 'Employee ID', render: (r) => <span className="font-mono">{r.employee_id || `#${r.id}`}</span> },
  { key: 'name', header: 'Employee', render: (r) => <span className="font-semibold">{getDisplayName(r)}</span> },
  { key: 'department', header: 'Department', render: (r) => r.department || '—' },
  { key: 'position', header: 'Position', render: (r) => r.position || r.job_title || '—' },
  { key: 'email', header: 'Email', render: (r) => r.email || '—' },
  { key: 'hire_date', header: 'Hire Date', render: (r) => formatDate(r.hire_date || r.created_at) },
  { key: 'status', header: 'Status', render: (r) => (
    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">{r.status || 'Active'}</span>
  )},
];

const formFields = [
  { name: 'first_name', label: 'First Name', required: true },
  { name: 'last_name', label: 'Last Name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'department', label: 'Department', required: true },
  { name: 'position', label: 'Position', required: true },
  { name: 'employee_id', label: 'Employee ID' },
];

export default function HRPage() {
  return (
    <CrudModulePage
      title="Human Resources"
      description="Manage staff records, departments, and employment details"
      queryKey={['hr']}
      api={hrApi}
      columns={columns}
      formFields={formFields}
      exportType="hr"
      filters={[
        { key: 'department', label: 'Department', options: [{ value: 'administration', label: 'Administration' }, { value: 'teaching', label: 'Teaching' }, { value: 'support', label: 'Support' }] },
      ]}
      searchPlaceholder="Search employees..."
      createLabel="Add Employee"
    />
  );
}
