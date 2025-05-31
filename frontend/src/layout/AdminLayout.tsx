import { Outlet, useNavigate } from "react-router-dom";
import { ADMIN_ROUTES } from "../constants/routes";
import { ShoppingCartIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Boxes, ChartNoAxesCombined, Menu, Package, X } from "lucide-react";
import { useState, useEffect } from "react";

const AdminLayout = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Manejar la navegación
    const handleNavigation = (path: string) => {
        navigate(path);
        // Cerrar el menú después de navegar en dispositivos móviles
        if (isMobile) {
            setIsMenuOpen(false);
        }
    };

    // Controlar cambios de tamaño de ventana
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            // Si la pantalla se vuelve grande, cerrar el menú móvil
            if (window.innerWidth >= 768) {
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
                <span className="text-xl md:text-2xl text-sky-500 font-semibold">LBF Admin</span>

                {/* Menú hamburguesa solo visible en móvil */}
                <button 
                    className="ml-auto md:hidden p-1 hover:bg-gray-700 rounded-md"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                >
                    {isMenuOpen ? 
                        <X className="h-6 w-6 text-sky-500" /> : 
                        <Menu className="h-6 w-6 text-sky-500" />
                    }
                </button>

                {/* Menú horizontal para escritorio */}
                <div className="hidden md:flex flex-row items-center gap-2 ml-auto mr-4">
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
                </div>
            </header>

            {/* Menú vertical para móvil */}
            {isMobile && isMenuOpen && (
                <div className="md:hidden bg-gray-800 border-b border-gray-700 overflow-y-auto">
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
                    </nav>
                </div>
            )}

            {/* Contenido principal */}
            <div className="flex flex-1 overflow-hidden">
                <Outlet/>
            </div>
        </section>
    );
}

export default AdminLayout;