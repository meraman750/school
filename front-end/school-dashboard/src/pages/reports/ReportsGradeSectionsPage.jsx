import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { academicsSubApi } from '../../services/api';
import { isValidGradeLevel, MAX_GRADE_LEVEL, MIN_GRADE_LEVEL } from '../../utils/constants';
import { reportsClassPath, reportsListPath } from './reportsConstants';
import useTeacherAssignedSections from '../../hooks/useTeacherAssignedSections';

export default function ReportsGradeSectionsPage({ gradeLevel }) {
  const grade = Number(gradeLevel);
  const navigate = useNavigate();
  const { isTeacher, canAccessClass } = useTeacherAssignedSections();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports', 'grade-sections', grade],
    queryFn: () => academicsSubApi.classes.ensureGradeSections(grade),
    enabled: isValidGradeLevel(grade),
  });

  const sections = (data?.sections || []).filter(
    (section) => !isTeacher || canAccessClass(grade, section.name),
  );

  if (isTeacher && !isLoading && sections.length === 0) {
    return (
      <EmptyState
        title="No access to this grade"
        description="You can only open reports for classes assigned to you."
        actionLabel="Back to reports"
        onAction={() => navigate(reportsListPath())}
      />
    );
  }

  if (!isValidGradeLevel(grade)) {
    return (
      <EmptyState title="Invalid grade" description={`Choose a grade from ${MIN_GRADE_LEVEL} to ${MAX_GRADE_LEVEL}.`} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => navigate(reportsListPath())}
          className="mt-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Back to grades"
        >
          <FiArrowLeft />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Student Reports</p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Grade {grade}</h1>
          <p className="text-xs text-gray-500">Select a section to manage marks and rankings</p>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={3} />
      ) : isError ? (
        <EmptyState title="Failed to load sections" description="Please try again." />
      ) : (
        <ul className="flex flex-col gap-3">
          {sections.map((section) => (
            <li key={section.id}>
              <Link to={reportsClassPath(grade, section.name)} className="block">
                <Card padding className="group transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-gray-900 group-hover:text-primary dark:text-white">
                        Section {section.name}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {data?.school_class?.name || `Grade ${grade}`}
                      </p>
                    </div>
                    <FiChevronRight className="shrink-0 text-gray-400 group-hover:text-primary" />
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => navigate(reportsListPath())}
        className="text-xs font-semibold text-primary hover:underline"
      >
        ← Back to all grades
      </button>
    </div>
  );
}
