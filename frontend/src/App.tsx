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

function App() {

  return (
    <Provider store={store}>
      <div className='h-screen w-full p-0 m-0 bg-gray-900'>
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
