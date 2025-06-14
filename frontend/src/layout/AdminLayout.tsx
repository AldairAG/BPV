import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ADMIN_ROUTES } from "../constants/routes";
import { ShoppingCartIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { BookCopy, Boxes, ChartNoAxesCombined, LogOut, Menu, Package, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import useUser from "../hooks/useUser";
import logo from '../assets/logo.png'; // Asegúrate de que la ruta sea correcta

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // Nuevo: Estado para mostrar/ocultar menú lateral en escritorio
    const [showSidebar, setShowSidebar] = useState(true);

    // Solo mostrar menú lateral en área de ventas
    const isVentas = location.pathname.startsWith(ADMIN_ROUTES.VENTAS_PANEL);

    // Manejar la navegación
    const handleNavigation = (path: string) => {
        navigate(path);
        // Cerrar el menú después de navegar en dispositivos móviles
        if (isMobile) {
            setIsMenuOpen(false);
        }
    };

    // Manejar el cierre de sesión
    const handleLogout = () => {
        if (window.confirm("¿Está seguro que desea cerrar sesión?")) {
            logout();
        }
    };

    // Controlar cambios de tamaño de ventana
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            // Si la pantalla se vuelve grande, cerrar el menú móvil
            if (window.innerWidth >= 1024) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Array de elementos de navegación para reutilización
    const navItems = [
        {
            path: ADMIN_ROUTES.VENTAS_PANEL,
            icon: <ShoppingCartIcon className="h-5 w-5 text-sky-500" />,
            label: "Ventas"
        },
        {
            path: ADMIN_ROUTES.ADMIN,
            icon: <Package className="h-5 w-5 text-sky-500" />,
            label: "Productos"
        },
        {
            path: ADMIN_ROUTES.REPORTES,
            icon: <ChartNoAxesCombined className="h-5 w-5 text-sky-500" />,
            label: "Reportes"
        },
        {
            path: ADMIN_ROUTES.USUARIOS,
            icon: <UserGroupIcon className="h-5 w-5 text-sky-500" />,
            label: "Usuarios"
        },
        {
            path: ADMIN_ROUTES.CATEGORIAS,
            icon: <Boxes className="h-5 w-5 text-sky-500" />,
            label: "Categorias"
        },
        {
            path: ADMIN_ROUTES.PRESUPUESTOS,
            icon: <BookCopy className="h-5 w-5 text-sky-500" />,
            label: "Presupuestos"
        }
    ];

    return (
        <section
            className="flex flex-col h-screen w-full text-white"
            style={{
                // Fondo degradado azul compatible
                background: "linear-gradient(135deg, #d8dbe6 0%, #5d8b12 60%, #bdd0da 100%)"
            }}
        >
            {/* Barra superior */}
            <header className="sticky top-0 z-40 flex border-b border-indigo-900 items-center h-16 px-4 md:px-8 bg-indigo-950/95 shadow-lg">
                <span className="text-xl md:text-2xl font-extrabold tracking-widest text-amber-400 select-none">
                    La Burbuja Felíz <span className="font-normal text-indigo-200">- Admin -</span>
                </span>

                {/* Menú hamburguesa solo visible en móvil */}
                <button
                    className="ml-auto lg:hidden p-1 hover:bg-indigo-900 rounded-md"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                >
                    {isMenuOpen ?
                        <X className="h-6 w-6 text-amber-400" /> :
                        <Menu className="h-6 w-6 text-amber-400" />
                    }
                </button>

                {/* Menú horizontal para escritorio */}
                <nav className="hidden lg:flex flex-row items-center gap-2 ml-auto">
                    {navItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleNavigation(item.path)}
                            className="flex gap-2 items-center hover:bg-indigo-900/40 px-4 py-2 rounded-md transition-colors font-medium text-indigo-100"
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                    <Button
                        onClick={handleLogout}
                        className="ml-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="max-[900px]:hidden">Cerrar sesión</span>
                    </Button>
                </nav>
            </header>

            {/* Menú vertical para móvil */}
            {isMobile && isMenuOpen && (
                <div className="lg:hidden bg-indigo-950 border-b border-indigo-900 shadow-md">
                    <nav className="flex flex-col p-2">
                        {navItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleNavigation(item.path)}
                                className="flex gap-2 items-center hover:bg-indigo-900/40 px-4 py-3 rounded-md transition-colors text-left font-medium text-indigo-100"
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="flex gap-2 items-center text-red-400 hover:bg-red-900/20 px-4 py-3 rounded-md transition-colors mt-2 text-left font-semibold"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Cerrar sesión</span>
                        </button>
                    </nav>
                </div>
            )}

            {/* Menú lateral para escritorio SOLO en ventas y si showSidebar es true */}
            {isVentas && showSidebar && (
                <aside className="hidden lg:flex h-screen w-64 bg-gradient-to-b from-indigo-950 via-indigo-900 to-blue-900/95 shadow-2xl border-r border-indigo-800 flex-col fixed z-40">
                    {/* Logo y título */}
                    <div className="flex items-center gap-3 px-6 py-7 border-b border-indigo-800 bg-indigo-950/80">
                        <img
                            src={logo}
                            alt="Logo"
                            className="w-12 h-12 rounded-xl shadow-lg bg-white object-contain ring-2 ring-amber-400"
                        />
                        <span className="text-2xl font-black text-amber-400 tracking-widest drop-shadow select-none font-mono">
                            Burbuja <span className="text-indigo-100 font-normal">Admin</span>
                        </span>
                        {/* Botón para ocultar menú */}
                        <button
                            onClick={() => setShowSidebar(false)}
                            className="ml-auto bg-indigo-900/80 text-amber-400 rounded-full p-1 hover:bg-indigo-800 transition"
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
                                    ? "bg-gradient-to-r from-amber-400 to-amber-300 text-indigo-900 shadow-xl ring-2 ring-amber-400"
                                    : "text-indigo-100 hover:bg-indigo-800/80 hover:text-amber-300 hover:scale-[1.03]"}
                                  focus:outline-none focus:ring-2 focus:ring-amber-400
                                `}
                            >
                                <span className="text-xl transition-transform group-hover:scale-110">{item.icon}</span>
                                <span className="truncate">{item.label}</span>
                            </button>
                        ))}
                        {/* Separador */}
                        <div className="my-5 border-t border-indigo-800" />
                        {/* Botón cerrar sesión */}
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-base text-red-100 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 hover:text-amber-300 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <LogOut className="h-6 w-6" />
                            <span className="truncate">Cerrar sesión</span>
                        </button>
                    </nav>
                    {/* Footer opcional */}
                    <div className="px-6 py-4 text-xs text-indigo-300 border-t border-indigo-800 bg-indigo-950/80">
                        &copy; {new Date().getFullYear()} La Burbuja Feliz
                    </div>
                </aside>
            )}

            {/* Botón para mostrar menú lateral si está oculto (solo en ventas) */}
            {isVentas && !showSidebar && (
                <button
                    onClick={() => setShowSidebar(true)}
                    className="hidden lg:flex fixed top-20 left-4 z-50 bg-amber-400 text-indigo-900 rounded-full p-2 shadow-lg hover:bg-amber-300 transition"
                    title="Mostrar menú"
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}

            {/* Contenido principal */}
            <div className={`flex flex-1 overflow-y-auto ${isVentas && showSidebar ? "lg:ml-64" : ""}`}>
                <Outlet />
            </div>
        </section>
    );
}

export default AdminLayout;