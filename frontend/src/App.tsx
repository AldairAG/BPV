import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import PanelVentas from './layout/PanelVentas';
import { ADMIN_ROUTES, USER_ROUTES } from './constants/routes'
import Login from './page/Login'
import AdminLayout from './layout/AdminLayout'
import { Provider } from 'react-redux'
import { store } from './store/store'
import Productos from "./page/admin/producto/Productos";
import Usuarios from "./page/admin/usuario/Usuarios";
import Categorias from './page/admin/categoria/Categorias';
import Reportes from './page/admin/reportes/Reportes';
import OfflineStatusIndicatorEnhanced from './components/OfflineStatusIndicatorEnhanced';
import ProtectedRoute from './components/navigation/ProtectedRoute';
import RoleProtectedRoute from './components/navigation/RoleProtectedRoute';
import { ROLES } from './constants/roles';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Presupuestos from "./page/admin/presupuesto/Presupuestos";

function App() {
  // Registrar el Service Worker para funcionalidad offline
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/serviceWorker.js')
          .then(registration => {
            console.log('Service Worker registrado correctamente:', registration);
            toast.success('La aplicación está lista para trabajar sin conexión', {
              duration: 5000,
              id: 'sw-registered'
            });
          })
          .catch(error => {
            console.error('Error al registrar el Service Worker:', error);
          });
      });
    }
  }, []);

  useEffect(() => {
    const bubbles = document.querySelector('.bubbles');
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30; // rango -15 a 15
      const y = (e.clientY / window.innerHeight - 0.5) * 30; // rango -15 a 15
      if (bubbles) {
        (bubbles as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Provider store={store}>
      <div className="min-h-screen w-full p-0 m-0 bg-blue-900">
        <OfflineStatusIndicatorEnhanced position="top" />
        <Routes>
          <Route path={USER_ROUTES.LOGIN} element={<Login />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path={USER_ROUTES.HOME} element={<PanelVentas />} />

            <Route path={ADMIN_ROUTES.ADMIN} element={<AdminLayout />} >
              <Route element={<RoleProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                <Route index element={<Productos />} />
                <Route path={ADMIN_ROUTES.CATEGORIAS} element={<Categorias />} />
                <Route path={ADMIN_ROUTES.USUARIOS} element={<Usuarios />} />
                <Route path={ADMIN_ROUTES.REPORTES} element={<Reportes />} />
                <Route path={ADMIN_ROUTES.VENTAS_PANEL} element={<PanelVentas />} />
              </Route>
              <Route path={ADMIN_ROUTES.PRESUPUESTOS} element={<Presupuestos />} />
            </Route>
          </Route>

          {/* Redirect any unknown routes to login */}
          <Route path="*" element={<Navigate to={USER_ROUTES.LOGIN} replace />} />
        </Routes>
      </div>
    </Provider>
  )
}

export default App
