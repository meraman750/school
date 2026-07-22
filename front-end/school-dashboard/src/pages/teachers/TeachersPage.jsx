import CrudModulePage from '../../components/shared/CrudModulePage';
import { teachersApi } from '../../services/api';
import { formatDate, getDisplayName } from '../../utils/formatters';

const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
];

const columns = [
  { key: 'name', header: 'Teacher', render: (r) => <span className="font-semibold">{getDisplayName(r)}</span> },
  { key: 'subject', header: 'Subject', render: (r) => r.subject || r.specialization || '—' },
  {
    key: 'gender',
    header: 'Gender',
    render: (r) => (r.gender === 'M' ? 'Male' : r.gender === 'F' ? 'Female' : '—'),
  },
  { key: 'phone', header: 'Phone', render: (r) => r.phone || '—' },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">{r.status || 'Active'}</span>
    ),
  },
  { key: 'created_at', header: 'Joined', render: (r) => formatDate(r.created_at || r.hire_date) },
];

const formFields = [
  { name: 'first_name', label: 'First Name', required: true },
  { name: 'last_name', label: 'Last Name', required: true },
  { name: 'gender', label: 'Gender', type: 'select', required: true, options: GENDER_OPTIONS },
  { name: 'phone', label: 'Phone' },
  { name: 'subject', label: 'Subject' },
];

function preparePayload(data) {
  return {
    first_name: data.first_name?.trim(),
    last_name: data.last_name?.trim(),
    gender: data.gender,
    phone: data.phone?.trim() || '',
    specialization: data.subject?.trim() || '',
    status: 'ACTIVE',
  };
}

export default function TeachersPage() {
  return (
    <CrudModulePage
      title="Teachers"
      description="Manage teaching staff, assignments, and contact information"
      queryKey={['teachers']}
      api={teachersApi}
      columns={columns}
      formFields={formFields}
      preparePayload={preparePayload}
      exportType="teachers"
      searchPlaceholder="Search teachers..."
      createLabel="Add Teacher"
      getDefaultValues={() => ({ first_name: '', last_name: '', gender: '', phone: '', subject: '' })}
    />
  );
}
