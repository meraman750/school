import { useNavigate } from 'react-router-dom';
import CrudModulePage from '../../components/shared/CrudModulePage';
import { studentsApi } from '../../services/api';
import { formatDate, getDisplayName } from '../../utils/formatters';

const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'GRADUATED', label: 'Graduated' },
  { value: 'TRANSFERRED', label: 'Transferred' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E'].map((s) => ({ value: s, label: `Section ${s}` }));

const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8].map((g) => ({ value: String(g), label: `Grade ${g}` }));

const STATUS_STYLES = {
  ACTIVE: 'bg-green-50 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  GRADUATED: 'bg-blue-50 text-blue-700',
  TRANSFERRED: 'bg-purple-50 text-purple-700',
  SUSPENDED: 'bg-red-50 text-red-700',
};

const columns = [
  { key: 'name', header: 'Student', render: (r) => <span className="font-semibold text-gray-900">{getDisplayName(r)}</span> },
  { key: 'grade_level', header: 'Grade', render: (r) => (r.grade_level ? `Grade ${r.grade_level}` : '—') },
  { key: 'section', header: 'Section', render: (r) => (r.section ? `Section ${r.section}` : '—') },
  {
    key: 'gender',
    header: 'Gender',
    render: (r) => (r.gender === 'M' ? 'Male' : r.gender === 'F' ? 'Female' : '—'),
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[r.status] || 'bg-amber-50 text-amber-700'}`}>
        {STATUS_OPTIONS.find((s) => s.value === r.status)?.label || r.status || 'Active'}
      </span>
    ),
  },
  { key: 'created_at', header: 'Enrolled', render: (r) => formatDate(r.created_at || r.enrollment_date) },
];

const formFields = [
  { name: 'first_name', label: 'First Name', required: true },
  { name: 'last_name', label: 'Last Name', required: true },
  { name: 'grade_level', label: 'Grade', type: 'number', required: true, min: 1, max: 8 },
  { name: 'section', label: 'Section', type: 'select', options: SECTION_OPTIONS, placeholder: 'Select section...' },
  { name: 'gender', label: 'Gender', type: 'select', required: true, options: GENDER_OPTIONS },
  { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTIONS, editOnly: true },
];

function preparePayload(data, editing) {
  const payload = {
    first_name: data.first_name?.trim(),
    last_name: data.last_name?.trim(),
    gender: data.gender,
    grade_level: Number(data.grade_level),
    section: data.section || '',
  };

  if (editing) {
    payload.status = data.status;
  } else {
    payload.status = 'ACTIVE';
  }

  return payload;
}

export default function StudentsPage() {
  const navigate = useNavigate();

  return (
    <CrudModulePage
      title="Students"
      description="Manage student profiles, enrollment, and academic records"
      queryKey={['students']}
      api={studentsApi}
      allowDelete={false}
      columns={columns.map((c) => ({
        ...c,
        render: c.key === 'name'
          ? (r) => (
            <button onClick={() => navigate(`/students/${r.id}`)} className="font-semibold text-primary hover:underline">
              {getDisplayName(r)}
            </button>
          )
          : c.render,
      }))}
      formFields={formFields}
      preparePayload={preparePayload}
      filters={[
        { key: 'status', label: 'Status', options: STATUS_OPTIONS },
        { key: 'grade_level', label: 'Grade', options: GRADE_OPTIONS },
        { key: 'section', label: 'Section', options: SECTION_OPTIONS },
        { key: 'gender', label: 'Gender', options: GENDER_OPTIONS },
      ]}
      searchPlaceholder="Search by name..."
      createLabel="Add Student"
      getDefaultValues={() => ({
        first_name: '',
        last_name: '',
        grade_level: '',
        section: '',
        gender: '',
        status: 'ACTIVE',
      })}
    />
  );
}
