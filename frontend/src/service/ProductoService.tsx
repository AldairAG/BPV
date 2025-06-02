import { apiClient } from './apiClient';
import type { ProductoType } from '../types/ProductoType';

const BASE_URL = '/productos';

/**
 * Servicio para gestionar las operaciones relacionadas con productos
 */
export const ProductoService = {
  /**
   * Crea un nuevo producto
   * @param producto Datos del producto a crear
   * @returns El producto creado con su ID asignado
   */
  crearProducto: async (producto: Omit<ProductoType, 'productoId'>): Promise<ProductoType> => {
    console.log('Creando producto:', producto);
    const response = await apiClient.post<ProductoType>(BASE_URL, producto);
    return response.data;
  },

  /**
   * Actualiza un producto existente
   * @param id ID del producto a actualizar
   * @param producto Datos actualizados del producto
   * @returns El producto actualizado
   */
  actualizarProducto: async (id: number, producto: Partial<ProductoType>): Promise<ProductoType> => {
    const productoConId = { ...producto, productoId: id };
    const response = await apiClient.put<ProductoType>(`${BASE_URL}/${id}`, productoConId);
    return response.data;
  },

  /**
   * Elimina un producto del sistema
   * @param id ID del producto a eliminar
   */
  eliminarProducto: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Obtiene un producto por su ID
   * @param id ID del producto a buscar
   * @returns El producto encontrado
   */
  getProductoById: async (id: number): Promise<ProductoType> => {
    const response = await apiClient.get<ProductoType>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Obtiene todos los productos registrados en el sistema
   * @returns Lista de todos los productos
   */
  getAllProductos: async (): Promise<ProductoType[]> => {
    const response = await apiClient.get<ProductoType[]>(BASE_URL);
    return response.data;
  },

  /**
   * Obtiene todos los productos de una categoría específica
   * @param categoriaId ID de la categoría
   * @returns Lista de productos que pertenecen a la categoría
   */
  getProductosByCategoria: async (categoriaId: number): Promise<ProductoType[]> => {
    const response = await apiClient.get<ProductoType[]>(`${BASE_URL}/categoria/${categoriaId}`);
    return response.data;
  },

  /**
   * Actualiza el stock de un producto
   * @param id ID del producto
   * @param cantidad Cantidad a añadir (positivo) o restar (negativo) del stock
   * @returns true si la operación fue exitosa, false si no se pudo actualizar
   */
  actualizarStock: async (id: number, cantidad: number): Promise<boolean> => {
    const response = await apiClient.patch<boolean>(`${BASE_URL}/${id}/stock?cantidad=${cantidad}`);
    return response.data;
  },

  /**
   * Busca productos que coincidan con el criterio especificado
   * @param criterio Texto a buscar en el nombre del producto
   * @returns Lista de productos que coinciden con el criterio
   */
  buscarProductos: async (criterio: string): Promise<ProductoType[]> => {
    const response = await apiClient.get<ProductoType[]>(`${BASE_URL}/buscar?criterio=${encodeURIComponent(criterio)}`);
    return response.data;
  },

  /**
   * Obtiene productos con stock por debajo del umbral especificado
   * @param stockMinimo Umbral de stock mínimo
   * @returns Lista de productos con stock bajo
   */
  getProductosBajoStock: async (stockMinimo: number): Promise<ProductoType[]> => {
    const response = await apiClient.get<ProductoType[]>(`${BASE_URL}/bajo-stock?stockMinimo=${stockMinimo}`);
    console.log('Productos bajo stock:', response.data);
    
    return response.data;
  },

  /**
   * Verifica si hay suficiente stock de un producto para la cantidad solicitada
   * @param id ID del producto
   * @param cantidad Cantidad solicitada
   * @returns true si hay suficiente stock, false si no
   */
  verificarDisponibilidad: async (id: number, cantidad: number): Promise<boolean> => {
    const response = await apiClient.get<boolean>(`${BASE_URL}/${id}/disponibilidad?cantidad=${cantidad}`);
    return response.data;
  }
};

export default ProductoService;