import { Route, Routes } from 'react-router'
import './App.css'
import UserLayout from './layout/UserLayout'
import { ADMIN_ROUTES, USER_ROUTES } from './constants/routes'
import Login from './page/Login'
import AdminLayout from './layout/AdminLayout'
import { Provider } from 'react-redux'
import { store } from './store/store'

function App() {

  return (
    <Provider store={store}>
      <div className='h-screen w-full p-0 m-0 bg-gray-900'>
        <Routes>
          <Route path={USER_ROUTES.HOME} Component={UserLayout} />
          <Route path={ADMIN_ROUTES.ADMIN} Component={AdminLayout} />
          <Route path={USER_ROUTES.LOGIN} Component={Login} />
        </Routes>
      </div>
    </Provider>
  )
}

export default App
