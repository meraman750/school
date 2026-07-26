import { Link, Navigate, useParams } from 'react-router-dom';
import ClassGradeSectionsPage from './ClassGradeSectionsPage';
import ClassSectionTimetablePage from './ClassSectionTimetablePage';
import useModulePaths from '../../hooks/useModulePaths';

export function ClassTimetableGradeRoute() {
  const { gradeLevel } = useParams();
  return <ClassGradeSectionsPage gradeLevel={gradeLevel} />;
}

export function ClassTimetableSectionRoute() {
  const { gradeLevel, sectionId } = useParams();
  const { timetableListPath } = useModulePaths();
  if (!gradeLevel || !sectionId) {
    return <Navigate to={timetableListPath('class')} replace />;
  }
  return <ClassSectionTimetablePage gradeLevel={gradeLevel} sectionId={sectionId} />;
}
