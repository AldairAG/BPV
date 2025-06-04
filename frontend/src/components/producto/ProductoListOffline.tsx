/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import useOfflineData from '../../hooks/useOfflineData';

// Ejemplo de un componente que implementa soporte offline
const ProductoListOffline = () => {
  
  const {
    data: productos,
    isLoading,
    error,
    isOffline,
    create,
    update,
    remove
  } = useOfflineData('/productos', 'productos', []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const productoData = {
      nombre: formData.get('nombre') as string,
      precio: parseFloat(formData.get('precio') as string),
      descripcion: formData.get('descripcion') as string,
      // Añadir otros campos según sea necesario
    };
    
    try {
      await create(productoData);
      // Resetear el formulario
      event.currentTarget.reset();
    } catch (error) {
      console.error('Error al crear producto:', error);
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await update(data, id);
    } catch (error) {
      console.error(`Error al actualizar producto ${id}:`, error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);
    }
  };

  if (isLoading) {
    return <div className="p-4">Cargando productos...</div>;
  }

  if (error && !productos?.length) {
    return (
      <div className="p-4 text-red-500">
        Error al cargar productos. {isOffline && 'Estás trabajando sin conexión.'}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center">
        <h2 className="text-xl font-bold">Lista de Productos</h2>
        {isOffline && (
          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            Modo sin conexión
          </span>
        )}
      </div>

      {/* Formulario para crear productos */}
      <form onSubmit={handleCreate} className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">Añadir Nuevo Producto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Nombre</label>
            <input 
              type="text" 
              name="nombre" 
              required 
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Precio</label>
            <input 
              type="number" 
              name="precio" 
              step="0.01" 
              required 
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1">Descripción</label>
            <textarea 
              name="descripcion" 
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
        <button 
          type="submit" 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Guardar Producto
        </button>
      </form>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {productos?.map((producto: any) => (
          <div 
            key={producto.id} 
            className={`p-4 border rounded-lg ${producto._pending ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold">{producto.nombre}</h3>
              {producto._pending && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Pendiente
                </span>
              )}
            </div>
            <p className="text-gray-700">${producto.precio?.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">{producto.descripcion}</p>
            
            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => {
                  const newPrice = prompt('Nuevo precio:', producto.precio);
                  if (newPrice !== null) {
                    handleUpdate(producto.id, {
                      ...producto,
                      precio: parseFloat(newPrice)
                    });
                  }
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Editar
              </button>
              <button 
                onClick={() => handleDelete(producto.id)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        
        {productos?.length === 0 && (
          <div className="col-span-3 p-4 text-center text-gray-500">
            No hay productos disponibles.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductoListOffline;
