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
        }
    ];

    return (
        <section className="flex flex-col h-screen w-full text-white">
            <header className="flex border-b items-center border-b-gray-300 h-15 p-3">
                <span className="text-xl md:text-2xl text-sky-500 font-semibold">La Burbuja Felíz -Administrador-</span>

                {/* Menú hamburguesa solo visible en móvil */}
                <button 
                    className="ml-auto lg:hidden p-1 hover:bg-gray-700 rounded-md"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                >
                    {isMenuOpen ? 
                        <X className="h-6 w-6 text-sky-500" /> : 
                        <Menu className="h-6 w-6 text-sky-500" />
                    }
                </button>

                {/* Menú horizontal para escritorio */}
                <div className="hidden lg:flex flex-row items-center gap-2 ml-auto">
                    {navItems.map((item, index) => (
                        <button 
                            key={index}
                            onClick={() => handleNavigation(item.path)} 
                            className="flex gap-2 items-center hover:bg-gray-700 px-3 py-1 rounded-md transition-colors"
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                    
                    {/* Botón de cerrar sesión */}
                    <Button 
                        onClick={handleLogout}
                        className=""
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="max-[900px]:hidden">
                            Cerrar sesión
                        </span>
                    </Button>
                </div>
            </header>

            {/* Menú vertical para móvil */}
            {isMobile && isMenuOpen && (
                <div className="lg:hidden bg-gray-800 border-b border-gray-700 overflow-y-auto">
                    <nav className="flex flex-col p-2">
                        {navItems.map((item, index) => (
                            <button 
                                key={index}
                                onClick={() => handleNavigation(item.path)} 
                                className="flex gap-2 items-center hover:bg-gray-700 px-3 py-3 rounded-md transition-colors text-left"
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                        
                        {/* Botón de cerrar sesión en móvil */}
                        <button 
                            onClick={handleLogout}
                            className="flex gap-2 items-center text-red-400 hover:bg-red-900/20 px-3 py-3 rounded-md transition-colors mt-2 text-left"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Cerrar sesión</span>
                        </button>
                    </nav>
                </div>
            )}

            {/* Contenido principal */}
            <div className="flex flex-1 overflow-y-auto">
                <Outlet/>
            </div>
        </section>
    );
}

export default AdminLayout;