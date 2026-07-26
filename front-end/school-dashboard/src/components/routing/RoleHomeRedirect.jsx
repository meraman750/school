import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccessModule, getHomePath, isPortalRole, normalizeRole } from '../../utils/roles';
import Overview from '../../pages/Overview';

export default function RoleHomeRedirect() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  if (isPortalRole(role)) {
    return <Navigate to={getHomePath(role)} replace />;
  }

  if (!canAccessModule(role, 'overview')) {
    return <Navigate to={getHomePath(role)} replace />;
  }

  return <Overview />;
}
