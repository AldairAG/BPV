import { Link, Route, Routes } from "react-router-dom";
import { ADMIN_ROUTES, USER_ROUTES } from "../constants/routes";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { Boxes, ChartNoAxesCombined, Package } from "lucide-react";

const AdminLayout = () => {
    return (
        <section className="flex flex-col h-screen w-full text-white">
            <header className="flex border-b items-center border-b-gray-300 h-15 p-3">
                <span className="text-2xl text-sky-500 font-semibold">LBF Admin</span>

                <div className="flex flex-row items-center gap-4 ml-auto mr-4">
                    <Link to={ADMIN_ROUTES.HOME} className="flex gap-2 hover:bg-gray-700 px-3 py-1 rounded-md ">
                        <ShoppingCartIcon className="h-5 w-5 text-sky-500" />
                        Ventas
                    </Link>
                    <Link to={ADMIN_ROUTES.PRODUCTOS} className="flex gap-2 hover:bg-gray-700 px-3 py-1 rounded-md ">
                        <Package className="h-5 w-5 text-sky-500" />
                        Productos
                    </Link>
                    <Link to={ADMIN_ROUTES.REPORTES} className="flex gap-2 hover:bg-gray-700 px-3 py-1 rounded-md ">
                        <ChartNoAxesCombined className="h-5 w-5 text-sky-500" />
                        Reportes
                    </Link>
                    <Link to={ADMIN_ROUTES.USUARIOS} className="flex gap-2 hover:bg-gray-700 px-3 py-1 rounded-md ">
                        <UserGroupIcon className="h-5 w-5 text-sky-500" />
                        Usuarios
                    </Link>
                    <Link to={ADMIN_ROUTES.CATEGORIAS} className="flex gap-2 hover:bg-gray-700 px-3 py-1 rounded-md ">
                        <Boxes className="h-5 w-5 text-sky-500" />
                        Categorias
                    </Link>
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden">
                <Routes>
                    <Route path={USER_ROUTES.HOME} Component={UserLayout} />
                </Routes>
            </main>

        </section>
    );
}
export default AdminLayout;