import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { portalApi } from '../services/api';
import { isPortalRole, normalizeRole } from '../utils/roles';

export default function usePortalContext() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isPortal = isPortalRole(role);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal-context'],
    queryFn: () => portalApi.getContext(),
    enabled: isPortal,
    staleTime: 5 * 60 * 1000,
  });

  const students = data?.students || [];
  const gradeLevels = [...new Set(students.map((s) => Number(s.grade_level)).filter(Boolean))].sort(
    (a, b) => a - b,
  );
  const primaryStudent = students[0] || null;

  return {
    isPortal,
    students,
    gradeLevels,
    primaryStudent,
    isLoading: isPortal && isLoading,
    isError: isPortal && isError,
  };
}
