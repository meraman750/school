import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import { REPORT_GRADE_LEVELS, reportsGradePath } from './reportsConstants';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Reports</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Choose a grade, then a section, to enter marks and export class results
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {REPORT_GRADE_LEVELS.map((grade) => (
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
