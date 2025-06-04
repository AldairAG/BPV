// src/components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { USER_ROUTES } from '../../constants/routes';

const ProtectedRoute = () => {
  const { isAuthenticated, navigateTo } = useUser();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo(USER_ROUTES.LOGIN);
    }
  }, [isAuthenticated, navigateTo]);
  
  return isAuthenticated ? <Outlet /> : <Navigate to={USER_ROUTES.LOGIN} replace />;
};

export default ProtectedRoute;