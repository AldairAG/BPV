/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  productoSelector,
  setProductos,
  setProductoActual,
  addProducto,
  updateProducto,
  removeProducto,
  updateStock,
  clearProductos,
  filtrarProductosPorNombre,
  filtrarProductosPorCategoria,
  filtrarProductosBajoStock,
  setProductosFiltrados
} from '../store/slices/productoSlice';
import type { ProductoType } from '../types/ProductoType';
import { ProductoService } from '../service/ProductoService';

/**
 * Hook personalizado `useProducto` para gestionar el estado de productos en la aplicación.
 *
 * @returns {object} Un objeto con las siguientes propiedades y funciones:
 * 
 * - `productos` {ProductoType[]}: Lista de todos los productos del sistema.
 * - `productosFiltrados` {ProductoType[]}: Lista de productos filtrados.
 * - `productoActual` {ProductoType | null}: Producto seleccionado actualmente.
 * - `seleccionarProducto` {(producto: ProductoType | null) => void}: Establece el producto actual.
 * - `fetchProductos` {() => Promise<ProductoType[]>}: Obtiene todos los productos del backend.
 * - `fetchProductoById` {(id: number) => Promise<ProductoType | null>}: Obtiene un producto por su ID.
 * - `createProducto` {(producto: Omit<ProductoType, 'productoId'>) => Promise<ProductoType | null>}: Crea un nuevo producto.
 * - `updateProductoById` {(id: number, producto: Partial<ProductoType>) => Promise<ProductoType | null>}: Actualiza un producto existente.
 * - `deleteProducto` {(id: number) => Promise<boolean>}: Elimina un producto.
 * - `actualizarStock` {(id: number, cantidad: number) => Promise<boolean>}: Actualiza el stock de un producto.
 * - `buscarProductos` {(criterio: string) => Promise<ProductoType[]>}: Busca productos por nombre.
 * - `getProductosBajoStock` {(stockMinimo: number) => Promise<ProductoType[]>}: Obtiene productos con stock bajo.
 * - `getProductosByCategoria` {(categoriaId: number) => Promise<ProductoType[]>}: Obtiene productos por categoría.
 * - `filtrarPorNombre` {(criterio: string) => void}: Filtra productos por nombre en el estado local.
 * - `filtrarPorCategoria` {(categoriaId: number) => void}: Filtra productos por categoría en el estado local.
 * - `filtrarPorStockBajo` {(stockMinimo: number) => void}: Filtra productos con stock bajo en el estado local.
 * - `limpiarFiltros` {() => void}: Restablece los filtros, mostrando todos los productos.
 * - `limpiarProductos` {() => void}: Limpia el estado de productos.
 */
export const useProducto = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selectores de estado desde el productoSlice
  const productos = useSelector(productoSelector.productos);
  const productosFiltrados = useSelector(productoSelector.productosFiltrados);
  const productoActual = useSelector(productoSelector.productoActual);

  /**
   * Establece el producto seleccionado actualmente
   */
  const seleccionarProducto = (producto: ProductoType | null) => {
    dispatch(setProductoActual(producto));
  };

  /**
   * Obtiene todos los productos del sistema
   */
  const fetchProductos = async (): Promise<ProductoType[]> => {
    try {
      const response = await ProductoService.getAllProductos();
      dispatch(setProductos(response));
      return response;
    } catch (error: any) {
      console.error('Error al obtener productos:', error);
      const errorMessage = error.response?.data?.message || 'Error al obtener productos';
      alert(errorMessage);
      return [];
    }
  };

  /**
   * Obtiene un producto por su ID
   */
  const fetchProductoById = async (id: number): Promise<ProductoType | null> => {
    try {
      const response = await ProductoService.getProductoById(id);
      dispatch(setProductoActual(response));
      return response;
    } catch (error: any) {
      console.error('Error al obtener producto:', error);
      const errorMessage = error.response?.data?.message || 'Error al obtener producto';
      alert(errorMessage);
      return null;
    }
  };

  /**
   * Crea un nuevo producto
   */
  const createProducto = async (producto: Omit<ProductoType, 'productoId'>): Promise<ProductoType | null> => {
    try {
      console.log('Creando producto:', producto);
      const nuevoProducto = await ProductoService.crearProducto(producto);
      dispatch(addProducto(nuevoProducto));
      return nuevoProducto;
    } catch (error: any) {
      console.error('Error al crear producto:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear producto';
      alert(errorMessage);
      return null;
    }
  };

  /**
   * Actualiza un producto existente
   */
  const updateProductoById = async (id: number, producto: Partial<ProductoType>): Promise<ProductoType | null> => {
    try {
      const productoActualizado = await ProductoService.actualizarProducto(id, producto);
      dispatch(updateProducto(productoActualizado));
      return productoActualizado;
    } catch (error: any) {
      console.error('Error al actualizar producto:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar producto';
      alert(errorMessage);
      return null;
    }
  };

  /**
   * Elimina un producto
   */
  const deleteProducto = async (id: number): Promise<boolean> => {
    try {
      await ProductoService.eliminarProducto(id);
      dispatch(removeProducto(id));
      return true;
    } catch (error: any) {
      console.error('Error al eliminar producto:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar producto';
      alert(errorMessage);
      return false;
    }
  };

  /**
   * Actualiza el stock de un producto
   */
  const actualizarStock = async (id: number, cantidad: number): Promise<boolean> => {
    try {
      const success = await ProductoService.actualizarStock(id, cantidad);
      if (success) {
        dispatch(updateStock({ id, cantidad }));
      }
      return success;
    } catch (error: any) {
      console.error('Error al actualizar stock:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar stock';
      alert(errorMessage);
      return false;
    }
  };

  /**
   * Busca productos por nombre
   */
  const buscarProductos = async (criterio: string): Promise<ProductoType[]> => {
    try {
      const resultados = await ProductoService.buscarProductos(criterio);
      dispatch(setProductosFiltrados(resultados));
      return resultados;
    } catch (error: any) {
      console.error('Error al buscar productos:', error);
      const errorMessage = error.response?.data?.message || 'Error al buscar productos';
      alert(errorMessage);
      return [];
    }
  };

  /**
   * Obtiene productos con stock bajo
   */
  const getProductosBajoStock = async (stockMinimo: number): Promise<ProductoType[]> => {
    try {
      const resultados = await ProductoService.getProductosBajoStock(stockMinimo);
      dispatch(setProductosFiltrados(resultados));
      return resultados;
    } catch (error: any) {
      console.error('Error al obtener productos con stock bajo:', error);
      const errorMessage = error.response?.data?.message || 'Error al obtener productos con stock bajo';
      alert(errorMessage);
      return [];
    }
  };

  /**
   * Obtiene productos por categoría
   */
  const getProductosByCategoria = async (categoriaId: number): Promise<ProductoType[]> => {
    try {
      const resultados = await ProductoService.getProductosByCategoria(categoriaId);
      dispatch(setProductosFiltrados(resultados));
      return resultados;
    } catch (error: any) {
      console.error('Error al obtener productos por categoría:', error);
      const errorMessage = error.response?.data?.message || 'Error al obtener productos por categoría';
      alert(errorMessage);
      return [];
    }
  };

  /**
   * Verifica disponibilidad de stock
   */
  const verificarDisponibilidad = async (id: number, cantidad: number): Promise<boolean> => {
    try {
      return await ProductoService.verificarDisponibilidad(id, cantidad);
    } catch (error: any) {
      console.error('Error al verificar disponibilidad:', error);
      const errorMessage = error.response?.data?.message || 'Error al verificar disponibilidad';
      alert(errorMessage);
      return false;
    }
  };

  /**
   * Filtra productos por nombre en el estado local (sin llamada al backend)
   */
  const filtrarPorNombre = (criterio: string) => {
    dispatch(filtrarProductosPorNombre(criterio));
  };

  /**
   * Filtra productos por categoría en el estado local (sin llamada al backend)
   */
  const filtrarPorCategoria = (categoriaId: number) => {
    dispatch(filtrarProductosPorCategoria(categoriaId));
  };

  /**
   * Filtra productos con stock bajo en el estado local (sin llamada al backend)
   */
  const filtrarPorStockBajo = (stockMinimo: number) => {
    dispatch(filtrarProductosBajoStock(stockMinimo));
  };

  /**
   * Restablece los filtros, mostrando todos los productos
   */
  const limpiarFiltros = () => {
    dispatch(setProductosFiltrados(productos));
  };

  /**
   * Limpia el estado de productos
   */
  const limpiarProductos = () => {
    dispatch(clearProductos());
  };

  /**
   * Navega a una ruta específica
   */
  const navigateTo = (to: string) => {
    navigate(to);
  };

  return {
    // Estado
    productos,
    productosFiltrados,
    productoActual,
    
    // Acciones de selección
    seleccionarProducto,
    
    // Acciones CRUD
    fetchProductos,
    fetchProductoById,
    createProducto,
    updateProductoById,
    deleteProducto,
    
    // Acciones específicas de productos
    actualizarStock,
    verificarDisponibilidad,
    
    // Búsqueda y filtrado con backend
    buscarProductos,
    getProductosBajoStock,
    getProductosByCategoria,
    
    // Filtrado local
    filtrarPorNombre,
    filtrarPorCategoria,
    filtrarPorStockBajo,
    limpiarFiltros,
    
    // Acciones de limpieza
    limpiarProductos,
    
    // Navegación
    navigateTo
  };
};

export default useProducto;