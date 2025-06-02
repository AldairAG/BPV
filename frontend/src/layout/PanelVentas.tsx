import { CreditCardIcon, ListBulletIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "../components/ui/Input";
import { Badge, Card, CardContent, CardHead } from "../components/ui/Card";
import ItemProductoCajero from "../components/items/ItemProducto";
import Carrito from "../components/carrito/Carrito";
import useUser from "../hooks/useUser";
import { ROLES } from "../constants/roles";
import useCategoria from "../hooks/useCategoria";
import useProducto from "../hooks/useProducto";
import useCarrito from "../hooks/useCarrito";
import { useEffect, useState, useRef } from "react";
import type { ProductoType } from "../types/ProductoType";
import type { CategoriaType } from "../types/CategoriaType";
import { toast } from "react-hot-toast";

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
  const [showCarrito, setShowCarrito] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Referencia para detectar clics fuera del menú móvil
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Cierra menús al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
  const handleProcessVenta = async (conIva: boolean) => {
    setProcessingVenta(true);
    try {
      const ventaRealizada = await procesarVenta(conIva);
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

  return (
    <section className="flex flex-col w-full text-white bg-gray-900 overflow-auto">
      {/* Header responsive */}
      {hasRole(ROLES.USER) && (
        <header className="flex items-center justify-between h-16 bg-gray-900 
        text-white px-4 md:px-6 border-b border-gray-700 z-10">
          <div className="flex items-center">
            <button
              className="mr-3 lg:hidden text-gray-300 hover:text-white"
              onClick={() => setShowMenu(!showMenu)}
            >
              {showMenu ?
                <XMarkIcon className="h-6 w-6" /> :
                <Bars3Icon className="h-6 w-6" />
              }
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-sky-500 truncate">
              La Burbuja Feliz
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Botón de carrito en móvil */}
            <button
              className="relative lg:hidden px-3 py-1 bg-blue-600 rounded-md"
              onClick={toggleCarrito}
            >
              {carritoItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {carritoItems.length}
                </span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>

            {/* Nombre de usuario (visible en tabletas y escritorio) */}
            {user && (
              <span className="hidden md:inline text-gray-300 truncate max-w-[120px] lg:max-w-none">
                {user.nombre}
              </span>
            )}

            <button
              onClick={logout}
              className="px-2 py-1 md:px-4 md:py-1 text-xs md:text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
            >
              Salir
            </button>
          </div>
        </header>
      )}

      {/* Menú desplegable para móvil */}
      {showMenu && (
        <div
          ref={menuRef}
          className="lg:hidden fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-gray-800 z-50 shadow-lg p-4 overflow-y-auto transition-all duration-300"
          style={{ transform: showMenu ? 'translateX(0)' : 'translateX(-100%)' }}
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold border-b border-gray-700 pb-2">Menú</h2>

            {user && (
              <div className="py-2 border-b border-gray-700">
                <p className="text-sm text-gray-400">Usuario:</p>
                <p className="font-medium">{user.nombre}</p>
              </div>
            )}

            <div className="space-y-1">
              <button
                className="w-full text-left py-2 px-3 rounded hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setShowMenu(false);
                  setShowCarrito(false);
                }}
              >
                Productos
              </button>
              <button
                className="w-full text-left py-2 px-3 rounded hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setShowMenu(false);
                  setShowCarrito(true);
                }}
              >
                Carrito {carritoItems.length > 0 && `(${carritoItems.length})`}
              </button>
              <button
                className="w-full text-left py-2 px-3 rounded hover:bg-gray-700 transition-colors text-red-400"
                onClick={logout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal responsive */}
      <main className="flex flex-col lg:flex-row w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* Panel de productos (se oculta en móvil cuando se muestra el carrito) */}
        <div className={`w-full lg:w-2/3 xl:w-3/4 flex-shrink-0 overflow-y-auto ${showCarrito ? 'hidden lg:block' : 'block'}`}>

          <div className="p-3 md:p-4 lg:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
              <h1 className="text-lg md:text-xl font-bold text-white">Módulo de ventas</h1>
              <div className="flex items-center gap-2">
                <button
                  className={`flex text-xs md:text-sm items-center gap-1 ${viewMode === "cards" ? "bg-blue-800" : "bg-gray-700"
                    } text-white px-2 py-1 md:px-3 md:py-2 rounded-md transition-colors`}
                  onClick={() => handleViewModeChange("cards")}
                >
                  <CreditCardIcon className="h-4 w-4 text-white" />
                  <span className="hidden sm:inline">Tarjetas</span>
                </button>

                <button
                  className={`flex items-center text-xs md:text-sm gap-1 ${viewMode === "list" ? "bg-blue-800" : "bg-gray-700"
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

            <Card className="w-full bg-gray-800 p-2 md:p-4">
              <CardHead className="flex items-center justify-start gap-2 flex-wrap overflow-x-auto pb-2">
                <Badge
                  key="todas"
                  className={`cursor-pointer whitespace-nowrap ${selectedCategoria === null ? "bg-blue-600" : "bg-gray-600"
                    } hover:bg-blue-700 transition-colors mb-2`}
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
                      ? "bg-blue-600"
                      : ""
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

              <CardContent className="mt-2 md:mt-4 overflow-auto">
                {productosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
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
                    <table className="w-full text-xs md:text-sm text-left text-gray-300">
                      <thead className="text-xs uppercase bg-gray-700">
                        <tr>
                          <th scope="col" className="px-2 md:px-4 py-2 md:py-3">Producto</th>
                          <th scope="col" className="px-2 md:px-4 py-2 md:py-3 hidden sm:table-cell">Categoría</th>
                          <th scope="col" className="px-2 md:px-4 py-2 md:py-3 text-right">Precio</th>
                          <th scope="col" className="px-2 md:px-4 py-2 md:py-3 text-right hidden sm:table-cell">Stock</th>
                          <th scope="col" className="px-2 md:px-4 py-2 md:py-3 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosFiltrados.map(producto => (
                          <tr key={producto.productoId} className="border-b border-gray-700 hover:bg-gray-700">
                            <td className="px-2 md:px-4 py-2 md:py-3">
                              <div className="flex flex-col">
                                <span>{producto.nombre}</span>
                                <span className="text-xs text-gray-400 sm:hidden">
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
                              ${producto.precioVenta.toFixed(2)}
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
                                      className="bg-red-600 hover:bg-red-700 px-2 md:px-3 py-1 rounded-md text-xs"
                                      onClick={() => removeFromCart(producto.productoId)}
                                    >
                                      Quitar
                                    </button>
                                    <span className="bg-gray-700 px-2 md:px-3 py-1 rounded-md text-xs">
                                      {getCartItemQuantity(producto.productoId)}
                                    </span>
                                  </>
                                ) : (
                                  <button
                                    className="bg-blue-600 hover:bg-blue-700 px-2 md:px-3 py-1 rounded-md text-xs"
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

        {/* Carrito (se muestra en pantalla completa en móvil cuando está activo) */}
        <aside className={`w-full lg:w-1/3 xl:w-1/4 h-full overflow-y-auto ${showCarrito ? 'block' : 'hidden lg:block'
          }`}>
          <div className="p-3 md:p-4 lg:p-0 lg:pr-4 lg:pt-6 h-full overflow-y-auto">
            {/* Botón de volver en móvil */}
            {showCarrito && (
              <button
                className="lg:hidden mb-3 flex items-center gap-1 text-blue-400"
                onClick={() => setShowCarrito(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
          className="fixed bottom-4 right-4 lg:hidden bg-blue-600 text-white rounded-full p-3 shadow-lg z-50"
          onClick={() => setShowCarrito(true)}
        >
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {carritoItems.length}
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      )}
    </section>
  );
}

export default PanelVentas;
