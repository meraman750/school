import { useLocation } from 'react-router-dom';
import { resolveModulePrefix, withModulePrefix } from '../utils/modulePaths';

export default function useModulePaths() {
  const { pathname } = useLocation();
  const prefix = resolveModulePrefix(pathname);

  return {
    prefix,
    isPortal: Boolean(prefix),
    path: (p) => withModulePrefix(prefix, p),
    examinationListPath: () => withModulePrefix(prefix, '/examination'),
    examinationGradePath: (gradeLevel) =>
      withModulePrefix(prefix, `/examination/grade/${gradeLevel}`),
    timetableListPath: (tab) =>
      withModulePrefix(prefix, tab === 'class' ? '/timetable?tab=class' : '/timetable'),
    timetableAnnualPath: (yearId) => withModulePrefix(prefix, `/timetable/annual/${yearId}`),
    timetableGradePath: (gradeLevel) =>
      withModulePrefix(prefix, `/timetable/class/grade/${gradeLevel}`),
    timetableSectionPath: (gradeLevel, sectionId) =>
      withModulePrefix(prefix, `/timetable/class/grade/${gradeLevel}/section/${sectionId}`),
    academicsListPath: () => withModulePrefix(prefix, '/academics'),
    subjectItemsPath: (tab, subjectId) =>
      withModulePrefix(prefix, `/academics/${tab.slug}/subject/${subjectId}`),
    itemViewerPath: (tab, subjectId, itemId) =>
      withModulePrefix(prefix, `/academics/${tab.slug}/subject/${subjectId}/view/${itemId}`),
  };
}
