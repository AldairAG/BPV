import React, { useEffect, useState } from "react";
import ModalTemplate from "./ModalTemplate";
import ProductoService from "../../service/ProductoService";
import type { ProductoType } from "../../types/ProductoType";

interface ModalBuscarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (producto: ProductoType) => void;
}

const ModalBuscarProducto: React.FC<ModalBuscarProductoProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [productos, setProductos] = useState<ProductoType[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      ProductoService.getAllProductos()
        .then(setProductos)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Nuevo: No cerrar el modal al seleccionar, solo seleccionar
  const handleSelect = (producto: ProductoType) => {
    onSelect(producto);
    // El modal solo se cierra si el usuario lo decide
    // onClose();
  };

  return (
    <ModalTemplate isOpen={isOpen} onClose={onClose} title="Buscar producto">
      <div className="mb-4">
        <input
          type="text"
          className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-center text-blue-700 py-8 animate-pulse">
          Cargando productos...
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {/* Vista escritorio */}
          <div className="hidden md:block">
            <table className="w-full text-sm border rounded-lg overflow-hidden shadow">
              <thead>
                <tr className="bg-blue-200">
                  <th className="p-3 text-left text-blue-900">Nombre</th>
                  <th className="p-3 text-left text-blue-900">Precio</th>
                  <th className="p-3 text-left text-blue-900">Stock</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      No se encontraron productos.
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((producto) => (
                    <tr
                      key={producto.productoId}
                      className="bg-white hover:bg-blue-100 transition"
                    >
                      <td className="p-3 text-blue-900">{producto.nombre}</td>
                      <td className="p-3 text-blue-900">${producto.precio}</td>
                      <td className="p-3 text-blue-900">{producto.stock}</td>
                      <td className="p-3">
                        <button
                          className="px-4 py-1 bg-blue-200 text-blue-900 rounded-lg hover:bg-blue-300 text-xs font-semibold shadow transition"
                          onClick={() => handleSelect(producto)}
                        >
                          Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Vista móvil: tarjetas */}
          <div className="md:hidden flex flex-col gap-3">
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-6 text-gray-500 bg-white rounded-lg shadow">
                No se encontraron productos.
              </div>
            ) : (
              productosFiltrados.map((producto) => (
                <div
                  key={producto.productoId}
                  className="bg-white rounded-lg shadow border border-blue-100 p-4 flex flex-col gap-2"
                >
                  <div className="font-bold text-blue-900">{producto.nombre}</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Precio:</span>
                    <span className="font-mono text-blue-900">
                      ${producto.precio}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className="font-mono text-blue-900">{producto.stock}</span>
                  </div>
                  <button
                    className="mt-2 px-4 py-1 bg-blue-200 text-blue-900 rounded-lg hover:bg-blue-300 text-xs font-semibold shadow transition"
                    onClick={() => handleSelect(producto)}
                  >
                    Seleccionar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* Botón para cerrar el modal */}
      <div className="mt-6 flex justify-end">
        <button
          className="px-6 py-2 bg-gray-200 text-blue-900 rounded-lg hover:bg-gray-300 font-semibold transition"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </ModalTemplate>
  );
};

export default ModalBuscarProducto;