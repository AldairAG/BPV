import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ADMIN_ROUTES } from "../constants/routes";
import { ShoppingCartIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { BookCopy, Boxes, ChartNoAxesCombined, LogOut, Menu, Package, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import useUser from "../hooks/useUser";


const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [showSidebar, setShowSidebar] = useState(true);

    const isVentas = location.pathname.startsWith(ADMIN_ROUTES.VENTAS_PANEL);

    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile) setIsMenuOpen(false);
    };

    const handleLogout = () => {
        if (window.confirm("¿Está seguro que desea cerrar sesión?")) {
            logout();
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) setIsMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        {
            path: ADMIN_ROUTES.VENTAS_PANEL,
            icon: <ShoppingCartIcon className="h-5 w-5" />,
            label: "Ventas"
        },
        {
            path: ADMIN_ROUTES.ADMIN,
            icon: <Package className="h-5 w-5" />,
            label: "Productos"
        },
        {
            path: ADMIN_ROUTES.REPORTES,
            icon: <ChartNoAxesCombined className="h-5 w-5" />,
            label: "Reportes"
        },
        {
            path: ADMIN_ROUTES.USUARIOS,
            icon: <UserGroupIcon className="h-5 w-5" />,
            label: "Usuarios"
        },
        {
            path: ADMIN_ROUTES.CATEGORIAS,
            icon: <Boxes className="h-5 w-5" />,
            label: "Categorias"
        },
        {
            path: ADMIN_ROUTES.PRESUPUESTOS,
            icon: <BookCopy className="h-5 w-5" />,
            label: "Presupuestos"
        }
    ];

    return (
        <section className="flex flex-col min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-900 to-blue-300 text-blue-900 relative overflow-hidden">
            
            {/* Barra superior */}
            <header className="sticky top-0 z-40 flex border-b border-blue-200 items-center h-16 px-4 md:px-8 bg-white/80 shadow-lg backdrop-blur">
                <div className="flex items-center gap-3">
                    
                    <span className="text-xl md:text-2xl font-extrabold tracking-widest text-blue-700 select-none drop-shadow">
                        La Burbuja <span className="font-normal text-blue-400">Admin</span>
                    </span>
                </div>
                {/* Menú hamburguesa solo visible en móvil */}
                <button
                    className="ml-auto lg:hidden p-1 hover:bg-blue-100 rounded-md"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                >
                    {isMenuOpen ?
                        <X className="h-6 w-6 text-blue-500" /> :
                        <Menu className="h-6 w-6 text-blue-500" />
                    }
                </button>
                {/* Menú horizontal para escritorio */}
                <nav className="hidden lg:flex flex-row items-center gap-2 ml-auto">
                    {navItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleNavigation(item.path)}
                            className={`flex gap-2 items-center px-4 py-2 rounded-md transition-colors font-medium
                                ${location.pathname.startsWith(item.path)
                                    ? "bg-blue-500 text-white shadow"
                                    : "text-blue-700 hover:bg-blue-200/70"}
                            `}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                    <Button
                        onClick={handleLogout}
                        className="ml-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="max-[900px]:hidden">Cerrar sesión</span>
                    </Button>
                </nav>
            </header>

            {/* Menú vertical para móvil */}
            {isMobile && isMenuOpen && (
                <div className="lg:hidden bg-white/95 border-b border-blue-200 shadow-md">
                    <nav className="flex flex-col p-2">
                        {navItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleNavigation(item.path)}
                                className={`flex gap-2 items-center px-4 py-3 rounded-md transition-colors text-left font-medium
                                    ${location.pathname.startsWith(item.path)
                                        ? "bg-blue-500 text-white shadow"
                                        : "text-blue-700 hover:bg-blue-200/70"}
                                `}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="flex gap-2 items-center text-red-500 hover:bg-red-100 px-4 py-3 rounded-md transition-colors mt-2 text-left font-semibold"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Cerrar sesión</span>
                        </button>
                    </nav>
                </div>
            )}

            {/* Menú lateral para escritorio SOLO en ventas y si showSidebar es true */}
            {isVentas && showSidebar && (
                <aside className="hidden lg:flex h-screen w-64 bg-gradient-to-b from-blue-700 via-blue-600 to-blue-800 shadow-2xl border-r border-blue-300 flex-col fixed z-40">
                    {/* Logo y título */}
                    <div className="flex items-center gap-3 px-6 py-7 border-b border-blue-300 bg-blue-700/90">
                        
                        <span className="text-2xl font-black text-white tracking-widest drop-shadow select-none font-mono">
                            Burbuja <span className="text-blue-200 font-normal">Admin</span>
                        </span>
                        {/* Botón para ocultar menú */}
                        <button
                            onClick={() => setShowSidebar(false)}
                            className="ml-auto bg-blue-600/80 text-white rounded-full p-1 hover:bg-blue-500 transition"
                            title="Ocultar menú"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    {/* Navegación */}
                    <nav className="flex-1 flex flex-col gap-2 px-3 py-6">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={`
                                  group flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-base transition-all duration-200
                                  ${location.pathname.startsWith(item.path)
                                    ? "bg-gradient-to-r from-blue-400 to-blue-300 text-blue-900 shadow-xl ring-2 ring-blue-200"
                                    : "text-white hover:bg-blue-600/80 hover:text-blue-100 hover:scale-[1.03]"}
                                  focus:outline-none focus:ring-2 focus:ring-blue-300
                                `}
                            >
                                <span className="text-xl transition-transform group-hover:scale-110">{item.icon}</span>
                                <span className="truncate">{item.label}</span>
                            </button>
                        ))}
                        {/* Separador */}
                        <div className="my-5 border-t border-blue-300" />
                        {/* Botón cerrar sesión */}
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-base text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 hover:text-blue-100 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <LogOut className="h-6 w-6" />
                            <span className="truncate">Cerrar sesión</span>
                        </button>
                    </nav>
                    {/* Footer opcional */}
                    <div className="px-6 py-4 text-xs text-blue-200 border-t border-blue-300 bg-blue-700/90">
                        &copy; {new Date().getFullYear()} La Burbuja Feliz
                    </div>
                </aside>
            )}

            {/* Botón para mostrar menú lateral si está oculto (solo en ventas) */}
            {isVentas && !showSidebar && (
                <button
                    onClick={() => setShowSidebar(true)}
                    className="hidden lg:flex fixed top-20 left-4 z-50 bg-blue-400 text-white rounded-full p-2 shadow-lg hover:bg-blue-300 transition"
                    title="Mostrar menú"
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}

            {/* Contenido principal */}
            <div className={`relative z-10 flex flex-1 overflow-y-auto ${isVentas && showSidebar ? "lg:ml-64" : ""}`}>
                <Outlet />
            </div>
        </section>
    );
}

export default AdminLayout;