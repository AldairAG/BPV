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

  // Cargar todos los productos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      ProductoService.getAllProductos()
        .then(setProductos)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Buscar productos por nombre
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <ModalTemplate isOpen={isOpen} onClose={onClose} title="Buscar producto">
      <div className="mb-4">
        <input
          type="text"
          className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-center text-blue-600 py-8">Cargando productos...</div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-blue-100">
                <th className="p-2 border-b">Nombre</th>
                <th className="p-2 border-b">Precio</th>
                <th className="p-2 border-b">Stock</th>
                <th className="p-2 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((producto) => (
                  <tr key={producto.productoId} className="hover:bg-blue-50">
                    <td className="p-2 border-b">{producto.nombre}</td>
                    <td className="p-2 border-b">${producto.precio}</td>
                    <td className="p-2 border-b">{producto.stock}</td>
                    <td className="p-2 border-b">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                        onClick={() => {
                          onSelect(producto);
                          onClose();
                        }}
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
      )}
    </ModalTemplate>
  );
};

export default ModalBuscarProducto;