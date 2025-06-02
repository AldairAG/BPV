import { CreditCardIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import { Input } from "../components/ui/Input";
import { Badge, Card, CardContent, CardHead } from "../components/ui/Card";
import ItemProductoCajero from "../components/items/ItemProducto";
import Carrito from "../components/carrito/Carrito";
import useUser from "../hooks/useUser";
import { ROLES } from "../constants/roles";
import useCategoria from "../hooks/useCategoria";
import useProducto from "../hooks/useProducto";
import useCarrito from "../hooks/useCarrito"; // Importamos el hook personalizado
import { useEffect, useState } from "react";
import type { ProductoType } from "../types/ProductoType";
import type { CategoriaType } from "../types/CategoriaType";
import { toast } from "react-hot-toast"; // Asegúrate de tener esta dependencia instalada

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
      // Si es un producto a granel (líquido) y no se proporciona cantidad,
      // el componente ItemProductoCajero se encargará de mostrar el modal
      // y luego llamará de nuevo a esta función con la cantidad seleccionada
      
      const success = await addToCart(producto, cantidad);
      console.log(`Producto agregado al carrito: ${producto.nombre}, Cantidad: ${cantidad}`);
      
      
      if (success) {
        // Personalizar mensaje según tipo de producto
        const mensaje = producto.tipo === "Liquido" && cantidad 
          ? `${producto.nombre} (${cantidad.toFixed(3)} L) agregado al carrito`
          : `${producto.nombre} agregado al carrito`;
        
        toast.success(mensaje);
      }
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      toast.error("No se pudo agregar el producto al carrito");
    }
  };

  // Función para procesar la venta
  const handleProcessVenta = async (conIva:boolean) => {
    setProcessingVenta(true);                               
    try {
      const ventaRealizada = await procesarVenta(conIva); // true para incluir IVA
      if (ventaRealizada) {
        toast.success(`Venta realizada con éxito. Total: $${ventaRealizada.total.toFixed(2)}`);
        // Recargar productos para reflejar nuevo stock
        fetchProductos();
      }
    } finally {
      setProcessingVenta(false);
    }
  };

  return (
    <section className="flex flex-col w-full h-screen text-white min-h-screen bg-gray-900">
      {hasRole(ROLES.USER) && (
        <header className="flex items-center justify-between h-16 bg-gray-900 
        text-white px-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-sky-500">
            La Burbuja Feliz Manager
          </h1>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-gray-300">
                Bienvenido, {user.nombre}
              </span>
            )}
            <button
              onClick={logout}
              className="px-4 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </header>
      )}

      <main className="grid max-w-[1600px] w-full p-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Módulo de ventas</h1>
          <div className="flex items-center gap-4">
            <button
              className={`flex text-sm items-center gap-2 ${viewMode === "cards" ? "bg-blue-800" : "bg-gray-700"
                } text-white px-4 py-2 rounded-md transition-colors`}
              onClick={() => handleViewModeChange("cards")}
            >
              <CreditCardIcon className="h-5 w-5 text-white" />
              Tarjetas
            </button>

            <button
              className={`flex items-center text-sm gap-2 ${viewMode === "list" ? "bg-blue-800" : "bg-gray-700"
                } text-white px-4 py-2 rounded-md transition-colors`}
              onClick={() => handleViewModeChange("list")}
            >
              <ListBulletIcon className="h-5 w-5 text-white" />
              Lista
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="w-full flex flex-col col-span-2 gap-4">
            <Input
              className="w-full col-span-2"
              placeholder="Buscar producto por nombre, código o categoría..."
              id="search"
              name="search"
              type="search"
              variant="search"
              value={searchTerm}
              onChange={handleSearch}
            />

            <Card className="w-full col-span-2 bg-gray-800 p-4">
              <CardHead className="flex items-center justify-start gap-2 flex-wrap">
                <Badge
                  key="todas"
                  className={`cursor-pointer ${selectedCategoria === null ? "bg-blue-600" : "bg-gray-600"
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
                    className={`cursor-pointer mb-2 ${selectedCategoria === categoria.categoriaId
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

              <CardContent className="mt-4">
                {productosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    {searchTerm || selectedCategoria !== null
                      ? "No se encontraron productos que coincidan con la búsqueda"
                      : "No hay productos disponibles"}
                  </div>
                ) : viewMode === "cards" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                      <thead className="text-xs uppercase bg-gray-700">
                        <tr>
                          <th scope="col" className="px-4 py-3">Producto</th>
                          <th scope="col" className="px-4 py-3">Categoría</th>
                          <th scope="col" className="px-4 py-3 text-right">Precio</th>
                          <th scope="col" className="px-4 py-3 text-right">Stock</th>
                          <th scope="col" className="px-4 py-3 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosFiltrados.map(producto => (
                          <tr key={producto.productoId} className="border-b border-gray-700 hover:bg-gray-700">
                            <td className="px-4 py-3">{producto.nombre}</td>
                            <td className="px-4 py-3">
                              <span className="flex items-center">
                                <span
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: producto.categoria?.color || '#ccc' }}
                                ></span>
                                {producto.categoria?.nombre || 'Sin categoría'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              ${producto.precioVenta.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={producto.stock <= producto.stockMinimo ? 'text-red-400' : ''}>
                                {producto.stock}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isInCart(producto.productoId) ? (
                                  <>
                                    <button
                                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-xs"
                                      onClick={() => removeFromCart(producto.productoId)}
                                    >
                                      Quitar
                                    </button>
                                    <span className="bg-gray-700 px-3 py-1 rounded-md text-xs">
                                      {getCartItemQuantity(producto.productoId)}
                                    </span>
                                  </>
                                ) : (
                                  <button
                                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-xs"
                                    onClick={() => {
                                      // Si es líquido, mostrará el modal desde ItemProductoCajero
                                      // Enviamos undefined para que el componente maneje la cantidad
                                      handleAddToCart(producto, undefined);
                                    }}
                                    disabled={producto.stock <= 0 || loading}
                                  >
                                    {producto.tipo === "Liquido" ? "Seleccionar cantidad" : "Agregar"}
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

          <aside className="col-span-1 w-full">
            <Carrito
              items={carritoItems}
              total={calcularTotal()}
              loading={loading || processingVenta}
              onRemoveItem={removeFromCart}
              onUpdateQuantity={updateCartItemQuantity}
              onClearCart={clearCart}
              onProcessPurchase={handleProcessVenta}
            />
          </aside>
        </div>
      </main>
    </section>
  );
}

export default PanelVentas;
