import { apiClient } from './apiClient';
import type { CategoriaType } from '../types/CategoriaType';
import type { ProductoType } from '../types/ProductoType';

const BASE_URL = '/categorias';

/**
 * Servicio para gestionar las operaciones relacionadas con categorías
 */
export const CategoriaService = {
  /**
   * Crea una nueva categoría
   * @param categoria Datos de la categoría a crear
   * @returns La categoría creada con su ID asignado
   */
  crearCategoria: async (categoria: Omit<CategoriaType, 'categoriaId'>): Promise<CategoriaType> => {
    const response = await apiClient.post<CategoriaType>(BASE_URL, categoria);
    return response.data;
  },

  /**
   * Actualiza una categoría existente
   * @param id ID de la categoría a actualizar
   * @param categoria Datos actualizados de la categoría
   * @returns La categoría actualizada
   */
  actualizarCategoria: async (id: number, categoria: Partial<CategoriaType>): Promise<CategoriaType> => {
    const response = await apiClient.put<CategoriaType>(`${BASE_URL}/${id}`, categoria);
    return response.data;
  },

  /**
   * Elimina una categoría del sistema
   * @param id ID de la categoría a eliminar
   */
  eliminarCategoria: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Obtiene una categoría por su ID
   * @param id ID de la categoría a buscar
   * @returns La categoría encontrada
   */
  getCategoriaById: async (id: number): Promise<CategoriaType> => {
    const response = await apiClient.get<CategoriaType>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Obtiene todas las categorías registradas en el sistema
   * @returns Lista de todas las categorías
   */
  getAllCategorias: async (): Promise<CategoriaType[]> => {
    const response = await apiClient.get<CategoriaType[]>(BASE_URL);
    return response.data;
  },

  /**
   * Obtiene todos los productos asociados a una categoría específica
   * @param id ID de la categoría
   * @returns Lista de productos que pertenecen a la categoría
   */
  getProductosByCategoria: async (id: number): Promise<ProductoType[]> => {
    const response = await apiClient.get<ProductoType[]>(`${BASE_URL}/${id}/productos`);
    return response.data;
  }
};

export default CategoriaService;