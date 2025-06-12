import { CreditCardIcon, ListBulletIcon,  } from "@heroicons/react/24/outline";
import { Input } from "../components/ui/Input";
import { Badge, Card, CardContent, CardHead } from "../components/ui/Card";
import ItemProductoCajero from "../components/items/ItemProducto";
import Carrito from "../components/carrito/Carrito";
import useUser from "../hooks/useUser";
import { ROLES } from "../constants/roles";
import useCategoria from "../hooks/useCategoria";
import useProducto from "../hooks/useProducto";
import useCarrito from "../hooks/useCarrito";
import { useEffect, useState } from "react";
import type { ProductoType } from "../types/ProductoType";
import type { CategoriaType } from "../types/CategoriaType";
import { toast } from "react-hot-toast";
import type { ClienteType } from "../types/ClienteType";
import ModalTemplate, { useModal } from "../components/modal/ModalTemplate";
import CorteCaja from "../components/corte/CorteCaja";

const PanelVentas = () => {
  // Hooks
  const { logout, hasRole, user } = useUser();
  const { categorias, fetchCategorias, seleccionarCategoria } = useCategoria();
  const {
    productosFiltrados,
    fetchProductos,
    filtrarPorNombre,
    filtrarPorCategoria,
    limpiarFiltros
  } = useProducto();

  // Hook de carrito
  const {
    carritoItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    calcularTotal,
    procesarVenta,
    loading,
    error,
    isInCart,
    getCartItemQuantity
  } = useCarrito();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [processingVenta, setProcessingVenta] = useState(false);
  const [showCarrito, setShowCarrito] = useState(true);

  // Añadir estado para el menú contraído
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    fetchCategorias();
    fetchProductos();
  }, []);

  // Mostrar errores del carrito
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Ajustar vista en cambios de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // En pantallas grandes, mostrar ambos
        setShowCarrito(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Manejar búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    filtrarPorNombre(value);
  };

  // Manejar selección de categoría
  const handleCategoriaClick = (categoria: CategoriaType) => {
    if (selectedCategoria === categoria.categoriaId) {
      // Si ya está seleccionada, limpiar filtros
      setSelectedCategoria(null);
      limpiarFiltros();
    } else {
      // Seleccionar nueva categoría
      setSelectedCategoria(categoria.categoriaId);
      seleccionarCategoria(categoria);
      filtrarPorCategoria(categoria.categoriaId);
    }
  };

  // Manejar cambio de vista
  const handleViewModeChange = (mode: "cards" | "list") => {
    setViewMode(mode);
  };

  // Función para agregar producto al carrito
  const handleAddToCart = async (producto: ProductoType, cantidad?: number) => {
    try {
      const success = await addToCart(producto, cantidad);

      if (success) {
        // Personalizar mensaje según tipo de producto
        const mensaje = producto.tipo === "Liquido" && cantidad
          ? `${producto.nombre} (${cantidad.toFixed(3)} L) agregado al carrito`
          : `${producto.nombre} agregado al carrito`;

        toast.success(mensaje);

        // En móviles, mostrar el carrito automáticamente al agregar un producto
        if (window.innerWidth < 768 && carritoItems.length === 0) {
          setTimeout(() => setShowCarrito(true), 300);
        }
      }
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      toast.error("No se pudo agregar el producto al carrito");
    }
  };

  // Función para procesar la venta
  const handleProcessVenta = async (conIva: boolean, cliente: ClienteType | null,descuenos:Record<number, number>) => {
    setProcessingVenta(true);
    try {
      console.log(carritoItems);
      
      const ventaRealizada = await procesarVenta(conIva, cliente,descuenos);
      if (ventaRealizada) {
        toast.success(`Venta realizada con éxito. Total: $${ventaRealizada.total.toFixed(2)}`);
        fetchProductos();

        // Ocultar carrito en móvil después de la venta
        if (window.innerWidth < 768) {
          setTimeout(() => setShowCarrito(false), 2000);
        }
      }
    } finally {
      setProcessingVenta(false);
    }
  };

  // Alternar visualización del carrito en móvil
  const toggleCarrito = () => {
    setShowCarrito(!showCarrito);
  };

  // Añadir el estado para el modal de corte de caja
  const { isOpen: isCorteCajaOpen, openModal: openCorteCaja, closeModal: closeCorteCaja } = useModal();

  // Función para abrir el modal de corte de caja
  const handleCorteCajaClick = () => {
    openCorteCaja(); // Abrir el modal de corte de caja
  };

  // Función para alternar el estado del menú (expandido/contraído)
  const toggleMenuCollapse = () => {
    setMenuCollapsed(!menuCollapsed);
  };

  // Modificar la estructura del componente para quitar la barra superior
  return (
    <section className="flex flex-col w-full min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-gray-100">
      <div className="flex flex-row w-full flex-1 min-h-0">
        {/* Menú lateral */}
        <aside className={`${menuCollapsed ? 'w-16' : 'w-60'} bg-slate-900 shadow-lg border-r border-slate-800 transition-all duration-300 flex flex-col`}>
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            {!menuCollapsed && <h2 className="text-lg font-semibold text-slate-200">Menú</h2>}
            <button
              onClick={toggleMenuCollapse}
              className="p-1 hover:bg-slate-800 rounded-full transition-colors"
            >
              {menuCollapsed ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>
          {user && !menuCollapsed && (
            <div className="p-4 border-b border-slate-800">
              <p className="text-xs text-slate-400">Usuario:</p>
              <p className="font-medium text-slate-200">{user.nombre}</p>
            </div>
          )}
          <nav className="flex-1 p-2 space-y-1">
            <button
              className={`w-full flex items-center gap-3 p-2 rounded hover:bg-slate-800 transition-colors ${menuCollapsed ? 'justify-center' : 'text-left'}`}
              onClick={handleCorteCajaClick}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {!menuCollapsed && <span>Corte de caja</span>}
            </button>
            <button
              className={`w-full flex items-center gap-3 p-2 rounded hover:bg-slate-800 transition-colors ${menuCollapsed ? 'justify-center' : 'text-left'}`}
              onClick={() => setShowCarrito(true)}
            >
              <div className="relative">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {carritoItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {carritoItems.length}
                  </span>
                )}
              </div>
              {!menuCollapsed && <span>Carrito {carritoItems.length > 0 && `(${carritoItems.length})`}</span>}
            </button>
          </nav>
          <div className="p-2 mt-auto">
            <button
              className={`w-full flex items-center gap-3 p-2 rounded hover:bg-slate-800 transition-colors text-red-400 ${menuCollapsed ? 'justify-center' : 'text-left'}`}
              onClick={logout}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!menuCollapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex flex-col lg:flex-row w-full flex-1 min-h-0 overflow-hidden">
          {/* Panel de productos */}
          <div className={`w-full lg:w-2/3 xl:w-3/4 flex-shrink-0 overflow-y-auto ${showCarrito ? 'hidden lg:block' : 'block'}`}>
            <div className="p-3 md:p-4 lg:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
                <h1 className="text-lg md:text-xl font-bold text-slate-100">Módulo de ventas</h1>
                <div className="flex items-center gap-2">
                  <button
                    className={`flex text-xs md:text-sm items-center gap-1 ${viewMode === "cards" ? "bg-blue-700" : "bg-slate-700"
                      } text-white px-2 py-1 md:px-3 md:py-2 rounded-md transition-colors`}
                    onClick={() => handleViewModeChange("cards")}
                  >
                    <CreditCardIcon className="h-4 w-4 text-white" />
                    <span className="hidden sm:inline">Tarjetas</span>
                  </button>

                  <button
                    className={`flex items-center text-xs md:text-sm gap-1 ${viewMode === "list" ? "bg-blue-700" : "bg-slate-700"
                      } text-white px-2 py-1 md:px-3 md:py-2 rounded-md transition-colors`}
                    onClick={() => handleViewModeChange("list")}
                  >
                    <ListBulletIcon className="h-4 w-4 text-white" />
                    <span className="hidden sm:inline">Lista</span>
                  </button>
                </div>
              </div>

              <Input
                className="w-full"
                placeholder="Buscar producto..."
                id="search"
                name="search"
                type="search"
                variant="search"
                value={searchTerm}
                onChange={handleSearch}
              />

              <Card className="w-full bg-slate-900/80 p-2 md:p-4">
                <CardHead className="flex items-center justify-start gap-2 flex-wrap overflow-x-auto pb-2">
                  <Badge
                    key="todas"
                    className={`cursor-pointer whitespace-nowrap ${selectedCategoria === null ? "bg-blue-500" : "bg-slate-800"
                    } hover:bg-blue-600 transition-colors mb-2`}
                    onClick={() => {
                      setSelectedCategoria(null);
                      limpiarFiltros();
                    }}
                  >
                    Todas
                  </Badge>

                  {categorias.map((categoria) => (
                    <Badge
                      key={categoria.categoriaId}
                      className={`cursor-pointer mb-2 whitespace-nowrap ${selectedCategoria === categoria.categoriaId
                        ? "bg-blue-500"
                        : "bg-slate-800"
                        }`}
                      style={{
                        backgroundColor: selectedCategoria === categoria.categoriaId
                          ? ""
                          : categoria.color
                      }}
                      onClick={() => handleCategoriaClick(categoria)}
                    >
                      {categoria.nombre}
                    </Badge>
                  ))}
                </CardHead>

                <CardContent className="mt-2 md:mt-4 overflow-y-auto">
                  {productosFiltrados.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      {searchTerm || selectedCategoria !== null
                        ? "No se encontraron productos que coincidan con la búsqueda"
                        : "No hay productos disponibles"}
                    </div>
                  ) : viewMode === "cards" ? (
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
                      {productosFiltrados.map(producto => (
                        <ItemProductoCajero
                          key={producto.productoId}
                          producto={producto}
                          onAddToCart={(cantidad) => handleAddToCart(producto, cantidad)}
                          inCart={isInCart(producto.productoId)}
                          quantity={getCartItemQuantity(producto.productoId)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[calc(100vh-16rem)] overflow-y-auto">
                      <table className="w-full text-xs md:text-sm text-left text-slate-200">
                        <thead className="text-xs uppercase bg-slate-800">
                          <tr>
                            <th className="px-2 md:px-4 py-2 md:py-3">Producto</th>
                            <th className="px-2 md:px-4 py-2 md:py-3 hidden sm:table-cell">Categoría</th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-right">Precio</th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-right hidden sm:table-cell">Stock</th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productosFiltrados.map(producto => (
                            <tr key={producto.productoId} className="border-b border-slate-800 hover:bg-slate-800/40">
                              <td className="px-2 md:px-4 py-2 md:py-3">
                                <div className="flex flex-col">
                                  <span>{producto.nombre}</span>
                                  <span className="text-xs text-slate-400 sm:hidden">
                                    Stock: {producto.stock}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 hidden sm:table-cell">
                                <span className="flex items-center">
                                  <span
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: producto.categoria?.color || '#ccc' }}
                                  ></span>
                                  {producto.categoria?.nombre || 'Sin categoría'}
                                </span>
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-right">
                                ${producto.precio.toFixed(2)}
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-right hidden sm:table-cell">
                                <span className={producto.stock <= producto.stockMinimo ? 'text-red-400' : ''}>
                                  {producto.stock}
                                </span>
                              </td>
                              <td className="px-2 md:px-4 py-2 md:py-3 text-right">
                                <div className="flex items-center justify-end gap-1 md:gap-2">
                                  {isInCart(producto.productoId) ? (
                                    <>
                                      <button
                                        className="bg-red-500 hover:bg-red-600 px-2 md:px-3 py-1 rounded-md text-xs"
                                        onClick={() => removeFromCart(producto.productoId)}
                                      >
                                        Quitar
                                      </button>
                                      <span className="bg-blue-700 px-2 md:px-3 py-1 rounded-md text-xs">
                                        {getCartItemQuantity(producto.productoId)}
                                      </span>
                                    </>
                                  ) : (
                                    <button
                                      className="bg-blue-500 hover:bg-blue-600 px-2 md:px-3 py-1 rounded-md text-xs"
                                      onClick={() => {
                                        handleAddToCart(producto, undefined);
                                      }}
                                      disabled={producto.stock <= 0 || loading}
                                    >
                                      {producto.tipo === "Liquido" ?
                                        <span className="hidden sm:inline">Seleccionar cantidad</span> :
                                        <span className="hidden sm:inline">Agregar</span>
                                      }
                                      <span className="sm:hidden">+</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Carrito */}
          <aside className={`w-full lg:w-1/3 xl:w-1/4 ${showCarrito ? 'block' : 'hidden lg:block'}`}>
            <div className="p-3 md:p-4 lg:p-0 lg:pr-4 lg:pt-6 h-full overflow-y-auto">
              {showCarrito && (
                <button
                  className="lg:hidden mb-3 flex items-center gap-1 text-blue-400"
                  onClick={() => setShowCarrito(false)}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a productos
                </button>
              )}
              <Carrito
                items={carritoItems}
                total={calcularTotal()}
                loading={loading || processingVenta}
                onRemoveItem={removeFromCart}
                onUpdateQuantity={updateCartItemQuantity}
                onClearCart={clearCart}
                onProcessPurchase={handleProcessVenta}
              />
            </div>
          </aside>
        </main>

        {/* Indicador flotante de carrito para móvil */}
        {!showCarrito && carritoItems.length > 0 && (
          <button
            className="fixed bottom-4 right-4 lg:hidden bg-blue-500 text-white rounded-full p-3 shadow-lg z-50"
            onClick={() => setShowCarrito(true)}
          >
            <div className="absolute -top-2 -right-2 bg-blue-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {carritoItems.length}
            </div>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        )}

        {/* Modal de Corte de Caja */}
        <ModalTemplate
          isOpen={isCorteCajaOpen}
          onClose={closeCorteCaja}
          title="Corte de Caja"
        >
          <CorteCaja onClose={closeCorteCaja} />
        </ModalTemplate>
      </div>
    </section>
  );
}

export default PanelVentas;
