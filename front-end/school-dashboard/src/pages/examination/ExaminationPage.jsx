import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { EXAM_GRADE_LEVELS } from './examinationConstants';
import useModulePaths from '../../hooks/useModulePaths';
import usePortalContext from '../../hooks/usePortalContext';

export default function ExaminationPage() {
  const { examinationGradePath } = useModulePaths();
  const { isPortal, gradeLevels, isLoading } = usePortalContext();
  const grades = isPortal && gradeLevels.length > 0 ? gradeLevels : EXAM_GRADE_LEVELS;

  if (isPortal && isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Examination</h2>
        <p className="text-xs text-gray-500">Loading your exam schedule…</p>
      </div>
    );
  }

  if (isPortal && gradeLevels.length === 0) {
    return (
      <EmptyState
        title="No grade linked"
        description="Your student profile must have a grade before you can view exam schedules."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Examination</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          {isPortal
            ? 'View the exam schedule for your grade'
            : 'Open a grade to view and edit its exam schedule (date, day, subject, and time)'}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {grades.map((grade) => (
          <li key={grade}>
            <Link to={examinationGradePath(grade)} className="block">
              <Card padding className="group transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-gray-900 group-hover:text-primary dark:text-white">
                      Grade {grade}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">Exam schedule for this grade</p>
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
