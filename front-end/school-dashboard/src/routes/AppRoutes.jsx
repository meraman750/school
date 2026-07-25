import { Routes, Route, Navigate } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';

import { canAccessModule, normalizeRole } from '../utils/roles';

import DashboardLayout from '../layouts/DashboardLayout';



import Login from '../pages/auth/Login';

import ForgotPassword from '../pages/auth/ForgotPassword';

import ResetPassword from '../pages/auth/ResetPassword';

import Overview from '../pages/Overview';

import StudentsPage from '../pages/students/StudentsPage';

import StudentDetailPage from '../pages/students/StudentDetailPage';

import TeacherDetailPage from '../pages/teachers/TeacherDetailPage';

import TeachersPage from '../pages/teachers/TeachersPage';

import AcademicsPage from '../pages/academics/AcademicsPage';

import AcademicsSubjectItemsPage from '../pages/academics/AcademicsSubjectItemsPage';

import AcademicsItemViewerPage from '../pages/academics/AcademicsItemViewerPage';

import TimetablePage from '../pages/timetable/TimetablePage';

import AnnualScheduleYearPage from '../pages/timetable/AnnualScheduleYearPage';

import ExaminationPage from '../pages/examination/ExaminationPage';

import LibraryPage from '../pages/library/LibraryPage';

import TransportPage from '../pages/transport/TransportPage';

import InventoryPage from '../pages/inventory/InventoryPage';

import HRPage from '../pages/hr/HRPage';

import DocumentsPage from '../pages/documents/DocumentsPage';

import ReportsPage from '../pages/reports/ReportsPage';

import SettingsPage from '../pages/settings/SettingsPage';



function ProtectedGuard({ children }) {

  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <Navigate to="/login" replace />;

}



function RoleGuard({ moduleKey, children }) {

  const { user } = useAuth();

  const role = normalizeRole(user?.role);

  if (!canAccessModule(role, moduleKey)) {

    return <Navigate to="/" replace />;

  }

  return children;

}



function GuestGuard({ children }) {

  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/" replace /> : children;

}



export default function AppRoutes() {

  return (

    <>

      <Toaster

        position="top-right"

        toastOptions={{

          style: { fontSize: '13px', borderRadius: '12px' },

        }}

      />

      <Routes>

        <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />

        <Route path="/forgot-password" element={<GuestGuard><ForgotPassword /></GuestGuard>} />

        <Route path="/reset-password" element={<GuestGuard><ResetPassword /></GuestGuard>} />



        <Route path="/" element={<ProtectedGuard><DashboardLayout /></ProtectedGuard>}>

          <Route index element={<Overview />} />

          <Route path="students" element={<RoleGuard moduleKey="students"><StudentsPage /></RoleGuard>} />

          <Route path="students/:id" element={<RoleGuard moduleKey="students"><StudentDetailPage /></RoleGuard>} />

          <Route path="teachers" element={<RoleGuard moduleKey="teachers"><TeachersPage /></RoleGuard>} />

          <Route path="teachers/:id" element={<RoleGuard moduleKey="teachers"><TeacherDetailPage /></RoleGuard>} />

          <Route path="academics" element={<RoleGuard moduleKey="academics"><AcademicsPage /></RoleGuard>} />

          <Route path="academics/:typeSlug/subject/:subjectId/view/:itemId" element={<RoleGuard moduleKey="academics"><AcademicsItemViewerPage /></RoleGuard>} />

          <Route path="academics/:typeSlug/subject/:subjectId" element={<RoleGuard moduleKey="academics"><AcademicsSubjectItemsPage /></RoleGuard>} />

          <Route path="timetable" element={<RoleGuard moduleKey="timetable"><TimetablePage /></RoleGuard>} />

          <Route path="timetable/annual/:yearId" element={<RoleGuard moduleKey="timetable"><AnnualScheduleYearPage /></RoleGuard>} />

          <Route path="examination" element={<RoleGuard moduleKey="examination"><ExaminationPage /></RoleGuard>} />

          <Route path="library" element={<RoleGuard moduleKey="library"><LibraryPage /></RoleGuard>} />

          <Route path="transport" element={<RoleGuard moduleKey="transport"><TransportPage /></RoleGuard>} />

          <Route path="inventory" element={<RoleGuard moduleKey="inventory"><InventoryPage /></RoleGuard>} />

          <Route path="hr" element={<RoleGuard moduleKey="hr"><HRPage /></RoleGuard>} />

          <Route path="documents" element={<RoleGuard moduleKey="documents"><DocumentsPage /></RoleGuard>} />

          <Route path="reports" element={<RoleGuard moduleKey="reports"><ReportsPage /></RoleGuard>} />

          <Route path="settings" element={<RoleGuard moduleKey="settings"><SettingsPage /></RoleGuard>} />

        </Route>



        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </>

  );

}

