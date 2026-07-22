import { useNavigate } from 'react-router-dom';
import CrudModulePage from '../../components/shared/CrudModulePage';
import { studentsApi } from '../../services/api';
import { formatDate, getDisplayName } from '../../utils/formatters';

const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
];

const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8].map((g) => ({ value: String(g), label: `Grade ${g}` }));

const columns = [
  { key: 'name', header: 'Student', render: (r) => <span className="font-semibold text-gray-900">{getDisplayName(r)}</span> },
  { key: 'grade_level', header: 'Grade', render: (r) => (r.grade_level ? `Grade ${r.grade_level}` : '—') },
  {
    key: 'gender',
    header: 'Gender',
    render: (r) => (r.gender === 'M' ? 'Male' : r.gender === 'F' ? 'Female' : '—'),
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
        {r.status || 'Active'}
      </span>
    ),
  },
  { key: 'created_at', header: 'Enrolled', render: (r) => formatDate(r.created_at || r.enrollment_date) },
];

const formFields = [
  { name: 'first_name', label: 'First Name', required: true },
  { name: 'last_name', label: 'Last Name', required: true },
  { name: 'grade_level', label: 'Grade', type: 'number', required: true, min: 1, max: 8 },
  { name: 'gender', label: 'Gender', type: 'select', required: true, options: GENDER_OPTIONS },
];

function preparePayload(data) {
  return {
    first_name: data.first_name?.trim(),
    last_name: data.last_name?.trim(),
    gender: data.gender,
    grade_level: Number(data.grade_level),
    status: 'ACTIVE',
  };
}

export default function StudentsPage() {
  const navigate = useNavigate();

  return (
    <CrudModulePage
      title="Students"
      description="Manage student profiles, enrollment, and academic records"
      queryKey={['students']}
      api={studentsApi}
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
      exportType="students"
      filters={[
        { key: 'status', label: 'Status', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }] },
        { key: 'grade_level', label: 'Grade', options: GRADE_OPTIONS },
        { key: 'gender', label: 'Gender', options: GENDER_OPTIONS },
      ]}
      searchPlaceholder="Search by name..."
      createLabel="Add Student"
      getDefaultValues={() => ({ first_name: '', last_name: '', grade_level: '', gender: '' })}
    />
  );
}
