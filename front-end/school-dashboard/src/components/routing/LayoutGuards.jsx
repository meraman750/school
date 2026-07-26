import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHomePath, isPortalRole, normalizeRole } from '../../utils/roles';

export function StaffLayoutGuard({ children }) {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  if (isPortalRole(role)) {
    return <Navigate to={getHomePath(role)} replace />;
  }
  return children || <Outlet />;
}

export function PortalLayoutGuard({ children }) {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  if (!isPortalRole(role)) {
    return <Navigate to={getHomePath(role)} replace />;
  }
  return children || <Outlet />;
}
