import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowLeft, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import { studentsApi } from '../../services/api';
import Card, { CardHeader } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, getDisplayName, getInitials } from '../../utils/formatters';

export default function StudentDetailPage() {
  const { id } = useParams();
  const { data: student, isLoading, isError } = useQuery({
    queryKey: ['students', id],
    queryFn: () => studentsApi.get(id),
  });

  if (isLoading) return <TableSkeleton rows={3} />;
  if (isError || !student) return <EmptyState title="Student not found" description="The requested student record could not be loaded." />;

  return (
    <div className="space-y-6">
      <Link to="/students" className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
        <FiArrowLeft /> Back to Students
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-black text-white">
          {getInitials(getDisplayName(student))}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getDisplayName(student)}</h2>
          <p className="font-mono text-xs text-gray-500">{student.admission_number || `#${student.id}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader title="Personal Info" />
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600"><FiUser className="text-primary" /> {student.gender || '—'}</div>
            <div className="flex items-center gap-2 text-gray-600"><FiMail className="text-primary" /> {student.email || '—'}</div>
            <div className="flex items-center gap-2 text-gray-600"><FiPhone className="text-primary" /> {student.phone || '—'}</div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Academic Info" />
          <div className="space-y-2 text-sm text-gray-600">
            <p>Grade: <strong className="text-gray-900 dark:text-white">{student.grade || student.class_name || '—'}</strong></p>
            <p>Section: <strong className="text-gray-900 dark:text-white">{student.section || '—'}</strong></p>
            <p>Status: <strong className="text-gray-900 dark:text-white">{student.status || 'Active'}</strong></p>
          </div>
        </Card>
        <Card>
          <CardHeader title="Enrollment" />
          <div className="space-y-2 text-sm text-gray-600">
            <p>Enrolled: <strong className="text-gray-900 dark:text-white">{formatDate(student.enrollment_date || student.created_at)}</strong></p>
            <p>GPA: <strong className="text-gray-900 dark:text-white">{student.gpa || '—'}</strong></p>
            <p>Attendance: <strong className="text-gray-900 dark:text-white">{student.attendance_rate ? `${student.attendance_rate}%` : '—'}</strong></p>
          </div>
        </Card>
      </div>
    </div>
  );
}
