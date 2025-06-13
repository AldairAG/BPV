import { Outlet, useNavigate } from "react-router-dom";
import { ADMIN_ROUTES } from "../constants/routes";
import { ShoppingCartIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Boxes, ChartNoAxesCombined, LogOut, Menu, Package, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import useUser from "../hooks/useUser";

const AdminLayout = () => {
    const navigate = useNavigate();
    const { logout } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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
            icon: <ChartNoAxesCombined className="h-5 w-5 text-sky-500" />,
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

            {/* Contenido principal */}
            <div className="flex flex-1 overflow-y-auto">
                <Outlet />
            </div>
        </section>
    );
}

export default AdminLayout;