import { useState, useEffect, useCallback } from 'react';
import OfflineProductoService from '../service/OfflineProductoService';
import { useConnectionStatus } from '../service/ConnectionService';
import { type ProductoType } from '../types/ProductoType';

/**
 * Hook para manejar productos con soporte offline
 */
export function useOfflineProductos() {
  const isOnline = useConnectionStatus();
  const [productos, setProductos] = useState<ProductoType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [cambiosPendientes, setCambiosPendientes] = useState<{
    total: number;
    creates: number;
    updates: number;
    deletes: number;
  }>({total: 0, creates: 0, updates: 0, deletes: 0});
  
  const productoService = OfflineProductoService.getInstance();
  
  // Cargar productos (con soporte offline)
  const cargarProductos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const productosData = await productoService.getProductos();
      setProductos(productosData);
      
      // También actualizar los cambios pendientes
      const resumenCambios = await productoService.getResumenCambiosPendientes();
      setCambiosPendientes(resumenCambios);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [productoService]);
  
  // Crear un nuevo producto (con soporte offline)
  const crearProducto = useCallback(async (producto: ProductoType) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const resultado = await productoService.createProducto(producto);
      
      // Recargar la lista de productos
      await cargarProductos();
      
      return resultado;
    } catch (err) {
      console.error('Error al crear producto:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [productoService, cargarProductos]);
  
  // Actualizar un producto (con soporte offline)
  const actualizarProducto = useCallback(async (id: number, producto: ProductoType) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const resultado = await productoService.updateProducto(id, producto);
      
      // Recargar la lista de productos
      await cargarProductos();
      
      return resultado;
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [productoService, cargarProductos]);
  
  // Eliminar un producto (con soporte offline)
  const eliminarProducto = useCallback(async (id: number) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const resultado = await productoService.deleteProducto(id);
      
      // Recargar la lista de productos
      await cargarProductos();
      
      return resultado;
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [productoService, cargarProductos]);
  
  // Verificar si hay cambios pendientes
  const hayCambiosPendientes = useCallback(async () => {
    return await productoService.hayCambiosPendientes();
  }, [productoService]);
  
  // Efecto para cargar productos inicialmente y cuando cambia el estado de conexión
  useEffect(() => {
    cargarProductos();
    
    // También escuchar eventos de sincronización
    const handleSyncEvent = () => {
      cargarProductos();
    };
    
    window.addEventListener('bpv-data-synced', handleSyncEvent);
    
    return () => {
      window.removeEventListener('bpv-data-synced', handleSyncEvent);
    };
  }, [isOnline, cargarProductos]);
  
  return {
    isOnline,
    productos,
    isLoading,
    isSaving,
    error,
    cambiosPendientes,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    hayCambiosPendientes,
    cargarProductos
  };
}

export default useOfflineProductos;
