import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { canAccessModule, getHomePath, normalizeRole } from '../utils/roles';
import DashboardEntryGuard from '../components/routing/DashboardEntryGuard';
import DashboardLayout from '../layouts/DashboardLayout';
import PortalLayout from '../layouts/PortalLayout';
import { StaffLayoutGuard, PortalLayoutGuard } from '../components/routing/LayoutGuards';
import RoleHomeRedirect from '../components/routing/RoleHomeRedirect';
import TeacherDetailRoute from '../components/routing/TeacherDetailRoute';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import StudentsPage from '../pages/students/StudentsPage';
import StudentDetailPage from '../pages/students/StudentDetailPage';
import TeachersPage from '../pages/teachers/TeachersPage';
import AcademicsPage from '../pages/academics/AcademicsPage';
import AcademicsSubjectItemsPage from '../pages/academics/AcademicsSubjectItemsPage';
import AcademicsItemViewerPage from '../pages/academics/AcademicsItemViewerPage';
import TimetablePage from '../pages/timetable/TimetablePage';
import AnnualScheduleYearPage from '../pages/timetable/AnnualScheduleYearPage';
import { ClassTimetableGradeRoute, ClassTimetableSectionRoute } from '../pages/timetable/ClassTimetableRoutes';
import ExaminationPage from '../pages/examination/ExaminationPage';
import ExaminationGradePage from '../pages/examination/ExaminationGradePage';
import LibraryPage from '../pages/library/LibraryPage';
import DocumentDetailPage from '../pages/documents/DocumentDetailPage';
import DocumentsPage from '../pages/documents/DocumentsPage';
import ReportsPage from '../pages/reports/ReportsPage';
import { ReportsGradeRoute, ReportsClassRoute } from '../pages/reports/ReportsRoutes';
import SettingsPage from '../pages/settings/SettingsPage';
import FinancePage from '../pages/finance/FinancePage';
import StudentFeesPage from '../pages/finance/StudentFeesPage';
import TeacherPayrollPage from '../pages/finance/TeacherPayrollPage';
import ActivityPage from '../pages/activity/ActivityPage';
import WebsiteContentPage from '../pages/website/WebsiteContentPage';
import PortalProfilePage from '../pages/portal/PortalProfilePage';
import PortalGradeReportsPage from '../pages/portal/PortalGradeReportsPage';
import MyPayrollPage from '../pages/payroll/MyPayrollPage';

function ProtectedGuard({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RoleGuard({ moduleKey, children }) {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  if (!canAccessModule(role, moduleKey)) {
    return <Navigate to={getHomePath(role)} replace />;
  }
  return children;
}

function GuestGuard({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={getHomePath(normalizeRole(user?.role))} replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <DashboardEntryGuard>
      <>
        <Toaster position="top-right" toastOptions={{ style: { fontSize: '13px', borderRadius: '12px' } }} />
        <Routes>
        <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
        <Route path="/forgot-password" element={<GuestGuard><ForgotPassword /></GuestGuard>} />
        <Route path="/reset-password" element={<GuestGuard><ResetPassword /></GuestGuard>} />

        <Route path="/portal" element={<ProtectedGuard><PortalLayoutGuard><PortalLayout /></PortalLayoutGuard></ProtectedGuard>}>
          <Route index element={<Navigate to="timetable" replace />} />
          <Route path="timetable" element={<RoleGuard moduleKey="timetable"><TimetablePage /></RoleGuard>} />
          <Route path="timetable/annual/:yearId" element={<RoleGuard moduleKey="timetable"><AnnualScheduleYearPage /></RoleGuard>} />
          <Route path="timetable/class/grade/:gradeLevel/section/:sectionId" element={<RoleGuard moduleKey="timetable"><ClassTimetableSectionRoute /></RoleGuard>} />
          <Route path="timetable/class/grade/:gradeLevel" element={<RoleGuard moduleKey="timetable"><ClassTimetableGradeRoute /></RoleGuard>} />
          <Route path="examination" element={<RoleGuard moduleKey="examination"><ExaminationPage /></RoleGuard>} />
          <Route path="examination/grade/:gradeLevel" element={<RoleGuard moduleKey="examination"><ExaminationGradePage /></RoleGuard>} />
          <Route path="academics" element={<RoleGuard moduleKey="academics"><AcademicsPage /></RoleGuard>} />
          <Route path="academics/:typeSlug/subject/:subjectId/view/:itemId" element={<RoleGuard moduleKey="academics"><AcademicsItemViewerPage /></RoleGuard>} />
          <Route path="academics/:typeSlug/subject/:subjectId" element={<RoleGuard moduleKey="academics"><AcademicsSubjectItemsPage /></RoleGuard>} />
          <Route path="library" element={<RoleGuard moduleKey="library"><LibraryPage /></RoleGuard>} />
          <Route path="grade-reports" element={<RoleGuard moduleKey="gradeReports"><PortalGradeReportsPage /></RoleGuard>} />
          <Route path="profile" element={<RoleGuard moduleKey="profile"><PortalProfilePage /></RoleGuard>} />
        </Route>

        <Route path="/" element={<ProtectedGuard><StaffLayoutGuard><DashboardLayout /></StaffLayoutGuard></ProtectedGuard>}>
          <Route index element={<RoleHomeRedirect />} />
          <Route path="students" element={<RoleGuard moduleKey="students"><StudentsPage /></RoleGuard>} />
          <Route path="students/:id" element={<RoleGuard moduleKey="students"><StudentDetailPage /></RoleGuard>} />
          <Route path="teachers" element={<RoleGuard moduleKey="teachers"><TeachersPage /></RoleGuard>} />
          <Route path="teachers/:id" element={<TeacherDetailRoute />} />
          <Route path="academics" element={<RoleGuard moduleKey="academics"><AcademicsPage /></RoleGuard>} />
          <Route path="academics/:typeSlug/subject/:subjectId/view/:itemId" element={<RoleGuard moduleKey="academics"><AcademicsItemViewerPage /></RoleGuard>} />
          <Route path="academics/:typeSlug/subject/:subjectId" element={<RoleGuard moduleKey="academics"><AcademicsSubjectItemsPage /></RoleGuard>} />
          <Route path="timetable" element={<RoleGuard moduleKey="timetable"><TimetablePage /></RoleGuard>} />
          <Route path="timetable/annual/:yearId" element={<RoleGuard moduleKey="timetable"><AnnualScheduleYearPage /></RoleGuard>} />
          <Route path="timetable/class/grade/:gradeLevel/section/:sectionId" element={<RoleGuard moduleKey="timetable"><ClassTimetableSectionRoute /></RoleGuard>} />
          <Route path="timetable/class/grade/:gradeLevel" element={<RoleGuard moduleKey="timetable"><ClassTimetableGradeRoute /></RoleGuard>} />
          <Route path="examination" element={<RoleGuard moduleKey="examination"><ExaminationPage /></RoleGuard>} />
          <Route path="examination/grade/:gradeLevel" element={<RoleGuard moduleKey="examination"><ExaminationGradePage /></RoleGuard>} />
          <Route path="library" element={<RoleGuard moduleKey="library"><LibraryPage /></RoleGuard>} />
          <Route path="documents" element={<RoleGuard moduleKey="documents"><DocumentsPage /></RoleGuard>} />
          <Route path="documents/:documentId" element={<RoleGuard moduleKey="documents"><DocumentDetailPage /></RoleGuard>} />
          <Route path="reports" element={<RoleGuard moduleKey="reports"><ReportsPage /></RoleGuard>} />
          <Route path="reports/grade/:gradeLevel/section/:sectionName" element={<RoleGuard moduleKey="reports"><ReportsClassRoute /></RoleGuard>} />
          <Route path="reports/grade/:gradeLevel" element={<RoleGuard moduleKey="reports"><ReportsGradeRoute /></RoleGuard>} />
          <Route path="my-payroll" element={<RoleGuard moduleKey="myPayroll"><MyPayrollPage /></RoleGuard>} />
          <Route path="activity" element={<RoleGuard moduleKey="activity"><ActivityPage /></RoleGuard>} />
          <Route path="website-content" element={<RoleGuard moduleKey="websiteContent"><WebsiteContentPage /></RoleGuard>} />
          <Route path="finance/student-fees" element={<RoleGuard moduleKey="studentFees"><StudentFeesPage /></RoleGuard>} />
          <Route path="finance/teacher-payroll" element={<RoleGuard moduleKey="teacherPayroll"><TeacherPayrollPage /></RoleGuard>} />
          <Route path="finance" element={<RoleGuard moduleKey="finance"><FinancePage /></RoleGuard>} />
          <Route path="settings" element={<RoleGuard moduleKey="settings"><SettingsPage /></RoleGuard>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    </DashboardEntryGuard>
  );
}
