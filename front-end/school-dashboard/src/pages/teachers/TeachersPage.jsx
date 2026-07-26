import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import CrudModulePage from '../../components/shared/CrudModulePage';
import { teachersApi } from '../../services/api';
import { formatDate, getDisplayName } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { isTeacherRole, normalizeRole } from '../../utils/roles';

const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'TERMINATED', label: 'Terminated' },
];

const STATUS_STYLES = {
  ACTIVE: 'bg-green-50 text-green-700',
  ON_LEAVE: 'bg-amber-50 text-amber-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  TERMINATED: 'bg-red-50 text-red-700',
};

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
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[r.status] || 'bg-green-50 text-green-700'}`}>
        {STATUS_OPTIONS.find((s) => s.value === r.status)?.label || r.status || 'Active'}
      </span>
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  const { data: meTeacher } = useQuery({
    queryKey: ['teacher-me'],
    queryFn: () => teachersApi.me(),
    enabled: isTeacherRole(role),
  });

  useEffect(() => {
    if (isTeacherRole(role) && meTeacher?.id) {
      navigate(`/teachers/${meTeacher.id}`, { replace: true });
    }
  }, [role, meTeacher, navigate]);

  if (isTeacherRole(role)) {
    return null;
  }

  return (
    <CrudModulePage
      title="Teachers"
      description="Manage teaching staff, assignments, and contact information"
      queryKey={['teachers']}
      api={teachersApi}
      allowDelete={false}
      allowEdit={false}
      columns={columns.map((c) => ({
        ...c,
        render: c.key === 'name'
          ? (r) => (
            <button onClick={() => navigate(`/teachers/${r.id}`)} className="font-semibold text-primary hover:underline">
              {getDisplayName(r)}
            </button>
          )
          : c.render,
      }))}
      formFields={formFields}
      preparePayload={preparePayload}
      searchPlaceholder="Search teachers..."
      createLabel="Add Teacher"
      getDefaultValues={() => ({ first_name: '', last_name: '', gender: '', phone: '', subject: '' })}
    />
  );
}
