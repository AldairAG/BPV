import { Outlet, useNavigate } from "react-router-dom";
import { ADMIN_ROUTES } from "../constants/routes";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { Boxes, ChartNoAxesCombined, Package } from "lucide-react";

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleNavigation = (path:string) => {
        navigate(path);
    };

    return (
        <section className="flex flex-col h-screen w-full text-white">
            <header className="flex border-b items-center border-b-gray-300 h-15 p-3">
                <span className="text-2xl text-sky-500 font-semibold">LBF Admin</span>

                <div className="flex flex-row items-center gap-4 ml-auto mr-4">
                    <button 
                        onClick={() => handleNavigation(ADMIN_ROUTES.VENTAS_PANEL)} 
                        className="flex gap-2 hover:bg-gray-700 px-3 py-1 rounded-md "
                    >
                        <ShoppingCartIcon className="h-5 w-5 text-sky-500" />
                        Ventas
                    </button>
                    <button 
                        onClick={() => handleNavigation(ADMIN_ROUTES.ADMIN)} 
                        className="flex gap-2 hover:bg-gray-700 px-3 py-1 rounded-md "
                    >
                        <Package className="h-5 w-5 text-sky-500" />
                        Productos
                    </button>
                    <button 
                        onClick={() => handleNavigation(ADMIN_ROUTES.REPORTES)} 
                        className="flex gap-2 hover:bg-gray-700 px-3 py-1 rounded-md "
                    >
                        <ChartNoAxesCombined className="h-5 w-5 text-sky-500" />
                        Reportes
                    </button>
                    <button 
                        onClick={() => handleNavigation(ADMIN_ROUTES.USUARIOS)} 
                        className="flex gap-2 hover:bg-gray-700 px-3 py-1 rounded-md "
                    >
                        <UserGroupIcon className="h-5 w-5 text-sky-500" />
                        Usuarios
                    </button>
                    <button 
                        onClick={() => handleNavigation(ADMIN_ROUTES.CATEGORIAS)} 
                        className="flex gap-2 hover:bg-gray-700 px-3 py-1 rounded-md "
                    >
                        <Boxes className="h-5 w-5 text-sky-500" />
                        Categorias
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <Outlet/>
            </div>

        </section>
    );
}
export default AdminLayout;