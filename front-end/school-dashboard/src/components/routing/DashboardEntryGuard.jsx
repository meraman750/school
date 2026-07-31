import { hasDashboardEntry } from '../../utils/dashboardAccess';
import DashboardAccessDenied from '../../pages/auth/DashboardAccessDenied';

export default function DashboardEntryGuard({ children }) {
  if (!hasDashboardEntry()) {
    return <DashboardAccessDenied />;
  }
  return children;
}
