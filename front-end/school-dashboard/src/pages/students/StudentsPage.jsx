import { useNavigate } from 'react-router-dom';
import CrudModulePage from '../../components/shared/CrudModulePage';
import { studentsApi } from '../../services/api';
import { formatDate, getDisplayName } from '../../utils/formatters';

const columns = [
  { key: 'admission_number', header: 'Admission #', render: (r) => <span className="font-mono font-bold">{r.admission_number || `#${r.id}`}</span> },
  { key: 'name', header: 'Student', render: (r) => <span className="font-semibold text-gray-900">{getDisplayName(r)}</span> },
  { key: 'grade', header: 'Grade', render: (r) => r.grade || r.class_name || '—' },
  { key: 'gender', header: 'Gender', render: (r) => r.gender || '—' },
  { key: 'status', header: 'Status', render: (r) => (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
      {r.status || 'Active'}
    </span>
  )},
  { key: 'created_at', header: 'Enrolled', render: (r) => formatDate(r.created_at || r.enrollment_date) },
];

const formFields = [
  { name: 'first_name', label: 'First Name', required: true },
  { name: 'last_name', label: 'Last Name', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'admission_number', label: 'Admission Number' },
  { name: 'grade', label: 'Grade', required: true },
  { name: 'gender', label: 'Gender' },
];

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
      exportType="students"
      filters={[
        { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
        { key: 'grade', label: 'Grade', options: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'].map((g) => ({ value: g, label: g })) },
      ]}
      searchPlaceholder="Search by name or admission number..."
      createLabel="Add Student"
      getDefaultValues={() => ({ first_name: '', last_name: '', email: '', admission_number: '', grade: '', gender: '' })}
    />
  );
}
