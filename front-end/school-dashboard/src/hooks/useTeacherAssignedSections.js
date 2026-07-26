import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { teachersApi } from '../services/api';
import { isTeacherRole, normalizeRole } from '../utils/roles';

export default function useTeacherAssignedSections() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isTeacher = isTeacherRole(role);

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-assigned-sections'],
    queryFn: () => teachersApi.assignedSections(),
    enabled: isTeacher,
  });

  const sections = data?.sections || [];

  const gradeLevels = [...new Set(sections.map((s) => Number(s.grade_level)).filter(Boolean))].sort(
    (a, b) => a - b,
  );

  const canAccessClass = (gradeLevel, sectionName) => {
    if (!isTeacher) return true;
    const grade = Number(gradeLevel);
    const section = String(sectionName || '').trim().toUpperCase();
    return sections.some(
      (s) => Number(s.grade_level) === grade && String(s.section || '').trim().toUpperCase() === section,
    );
  };

  return { isTeacher, sections, gradeLevels, canAccessClass, isLoading };
}
