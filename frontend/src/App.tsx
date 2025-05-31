import { Route, Routes } from 'react-router'
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

function App() {

  return (
    <Provider store={store}>
      <div className='h-screen w-full p-0 m-0 bg-gray-900'>
        <Routes>
          <Route path={USER_ROUTES.HOME} Component={PanelVentas} />

          <Route path={ADMIN_ROUTES.ADMIN} Component={AdminLayout} >
            <Route index Component={Productos} />
            <Route path={ADMIN_ROUTES.CATEGORIAS} Component={Categorias} />
            <Route path={ADMIN_ROUTES.USUARIOS} Component={Usuarios} />
            <Route path={ADMIN_ROUTES.REPORTES} Component={AdminLayout} />
            <Route path={ADMIN_ROUTES.VENTAS_PANEL} Component={PanelVentas} />
          </Route>

          <Route path={USER_ROUTES.LOGIN} Component={Login} />
        </Routes>
      </div>
    </Provider>
  )
}

export default App
