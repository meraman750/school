import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { REPORT_GRADE_LEVELS, reportsGradePath } from './reportsConstants';
import useTeacherAssignedSections from '../../hooks/useTeacherAssignedSections';

export default function ReportsPage() {
  const { isTeacher, gradeLevels, isLoading } = useTeacherAssignedSections();

  const grades = isTeacher
    ? gradeLevels
    : REPORT_GRADE_LEVELS;

  if (isTeacher && isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Reports</h2>
          <p className="mt-0.5 text-xs text-gray-500">Loading your assigned classes…</p>
        </div>
      </div>
    );
  }

  if (isTeacher && grades.length === 0) {
    return (
      <EmptyState
        title="No classes assigned"
        description="Ask an administrator to assign you as class teacher for a grade."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Reports</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          {isTeacher
            ? 'Your assigned class only — roster and marks (empty until an admin assigns you)'
            : 'Choose a grade, then a section, to enter marks and export class results'}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {grades.map((grade) => (
          <li key={grade}>
            <Link to={reportsGradePath(grade)} className="block">
              <Card padding className="group transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-gray-900 group-hover:text-primary dark:text-white">
                      Grade {grade}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">Sections and student marks</p>
                  </div>
                  <FiChevronRight className="shrink-0 text-gray-400 group-hover:text-primary" />
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
