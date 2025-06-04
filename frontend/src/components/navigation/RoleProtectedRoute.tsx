// src/components/RoleProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { USER_ROUTES } from '../../constants/routes';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { isAuthenticated, hasAnyRole } = useUser();
  
  if (!isAuthenticated) {
    return <Navigate to={USER_ROUTES.LOGIN} replace />;
  }
  
  return hasAnyRole(allowedRoles) ? <Outlet /> : <Navigate to={USER_ROUTES.HOME} replace />;
};

export default RoleProtectedRoute;