import { Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import {
  canAccessModule,
  getHomePath,
  isTeacherRole,
  normalizeRole,
} from '../../utils/roles';
import { teachersApi } from '../../services/api';
import { TableSkeleton } from '../ui/Skeleton';
import TeacherDetailPage from '../../pages/teachers/TeacherDetailPage';

export default function TeacherDetailRoute() {
  const { id } = useParams();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  if (canAccessModule(role, 'teachers')) {
    return <TeacherDetailPage />;
  }

  if (!isTeacherRole(role)) {
    return <Navigate to={getHomePath(role)} replace />;
  }

  const { data: meTeacher, isLoading, isError } = useQuery({
    queryKey: ['teacher-me'],
    queryFn: () => teachersApi.me(),
  });

  if (isLoading) return <TableSkeleton rows={6} />;
  if (isError || !meTeacher?.id) {
    return <Navigate to="/settings" replace />;
  }

  if (String(meTeacher.id) !== String(id)) {
    return <Navigate to={`/teachers/${meTeacher.id}`} replace />;
  }

  return <TeacherDetailPage />;
}
