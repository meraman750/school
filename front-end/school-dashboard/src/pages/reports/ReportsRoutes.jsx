import { Navigate, useParams } from 'react-router-dom';
import ReportsGradeSectionsPage from './ReportsGradeSectionsPage';
import ReportsClassPage from './ReportsClassPage';

export function ReportsGradeRoute() {
  const { gradeLevel } = useParams();
  return <ReportsGradeSectionsPage gradeLevel={gradeLevel} />;
}

export function ReportsClassRoute() {
  const { gradeLevel, sectionName } = useParams();
  if (!gradeLevel || !sectionName) {
    return <Navigate to="/reports" replace />;
  }
  return <ReportsClassPage gradeLevel={gradeLevel} sectionName={sectionName} />;
}
