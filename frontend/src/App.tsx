import { Route, Routes } from 'react-router'
import './App.css'
import UserLayout from './layout/UserLayout'
import { ADMIN_ROUTES, USER_ROUTES } from './constants/routes'
import Login from './page/Login'
import AdminLayout from './layout/AdminLayout'
import { Provider } from 'react-redux'
import { store } from './store/store'
import Productos from "./page/admin/producto/Productos";
import AddProducto from "./page/admin/producto/AddProducto";
import Usuarios from "./page/admin/usuario/Usuarios";
import Categorias from './page/admin/categoria/Categorias'

function App() {

  return (
    <Provider store={store}>
      <div className='h-screen w-full p-0 m-0 bg-gray-900'>
        <Routes>
          <Route path={USER_ROUTES.HOME} Component={UserLayout} />

          <Route path={ADMIN_ROUTES.ADMIN} Component={AdminLayout} >
            <Route index Component={Productos} />
            <Route path={ADMIN_ROUTES.CREAR_PRODUCTO} Component={AddProducto} />
            <Route path={ADMIN_ROUTES.CATEGORIAS} Component={Categorias} />
            <Route path={ADMIN_ROUTES.USUARIOS} Component={Usuarios} />
            <Route path={ADMIN_ROUTES.REPORTES} Component={AdminLayout} />
          </Route>

          <Route path={USER_ROUTES.LOGIN} Component={Login} />
        </Routes>
      </div>
    </Provider>
  )
}

export default App
