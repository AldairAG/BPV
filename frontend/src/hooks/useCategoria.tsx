/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch, useSelector } from 'react-redux';
import {
    categoriaSelector,
    setCategorias,
    setCategoriaActual,
    addCategoria,
    updateCategoria,
    removeCategoria,
    clearCategorias
} from '../store/slices/categoriaSlice';
import type { CategoriaType } from '../types/CategoriaType';
import { CategoriaService } from '../service/CategoriaService';
import type { ProductoType } from '../types/ProductoType';

/**
 * Hook personalizado `useCategoria` para gestionar el estado de categorías en la aplicación.
 *
 * @returns {object} Un objeto con las siguientes propiedades y funciones:
 * 
 * - `categorias` {CategoriaType[]}: Lista de todas las categorías del sistema.
 * - `categoriaActual` {CategoriaType | null}: Categoría seleccionada actualmente.
 * - `setCategoriaActual` {(categoria: CategoriaType | null) => void}: Establece la categoría actual.
 * - `fetchCategorias` {() => Promise<CategoriaType[]>}: Obtiene todas las categorías del backend.
 * - `fetchCategoriaById` {(id: number) => Promise<CategoriaType | null>}: Obtiene una categoría por su ID.
 * - `createCategoria` {(categoria: Omit<CategoriaType, 'categoriaId'>) => Promise<CategoriaType | null>}: Crea una nueva categoría.
 * - `updateCategoria` {(id: number, categoria: Partial<CategoriaType>) => Promise<CategoriaType | null>}: Actualiza una categoría existente.
 * - `deleteCategoria` {(id: number) => Promise<boolean>}: Elimina una categoría.
 * - `getProductosByCategoria` {(id: number) => Promise<ProductoType[]>}: Obtiene productos por categoría.
 */
export const useCategoria = () => {
    const dispatch = useDispatch();

    // Selectores de estado desde el categoriaSlice
    const categorias = useSelector(categoriaSelector.categorias);
    const categoriaActual = useSelector(categoriaSelector.categoriaActual);

    /**
     * Establece la categoría seleccionada actualmente
     */
    const seleccionarCategoria = (categoria: CategoriaType | null) => {
        dispatch(setCategoriaActual(categoria));
    };

    /**
     * Obtiene todas las categorías del sistema
     */
    const fetchCategorias = async (): Promise<CategoriaType[]> => {
        try {
            const response = await CategoriaService.getAllCategorias();
            dispatch(setCategorias(response));
            return response;
        } catch (error: any) {
            console.error('Error al obtener categorías:', error);
            const errorMessage = error.response?.data?.message || 'Error al obtener categorías';
            alert(errorMessage);
            return [];
        }
    };

    /**
     * Obtiene una categoría por su ID
     */
    const fetchCategoriaById = async (id: number): Promise<CategoriaType | null> => {
        try {
            const response = await CategoriaService.getCategoriaById(id);
            dispatch(setCategoriaActual(response));
            return response;
        } catch (error: any) {
            console.error('Error al obtener categoría:', error);
            const errorMessage = error.response?.data?.message || 'Error al obtener categoría';
            alert(errorMessage);
            return null;
        }
    };

    /**
     * Crea una nueva categoría
     */
    const createCategoria = async (categoria: Omit<CategoriaType, 'categoriaId'>): Promise<CategoriaType | null> => {
        try {
            console.log('Creando categoría:', categoria);
            const nuevaCategoria = await CategoriaService.crearCategoria(categoria);
            dispatch(addCategoria(nuevaCategoria));
            return nuevaCategoria;
        } catch (error: any) {
            console.error('Error al crear categoría:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear categoría';
            alert(errorMessage);
            return null;
        }
    };

    /**
     * Actualiza una categoría existente
     */
    const updateCategoriaById = async (id: number, categoria: Partial<CategoriaType>): Promise<CategoriaType | null> => {
        try {
            const categoriaActualizada = await CategoriaService.actualizarCategoria(id, categoria);
            dispatch(updateCategoria(categoriaActualizada));
            return categoriaActualizada;
        } catch (error: any) {
            console.error('Error al actualizar categoría:', error);
            const errorMessage = error.response?.data?.message || 'Error al actualizar categoría';
            alert(errorMessage);
            return null;
        }
    };

    /**
     * Elimina una categoría
     */
    const deleteCategoria = async (id: number): Promise<boolean> => {
        try {
            await CategoriaService.eliminarCategoria(id);
            dispatch(removeCategoria(id));
            return true;
        } catch (error: any) {
            console.error('Error al eliminar categoría:', error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar categoría';
            alert(errorMessage);
            return false;
        }
    };

    /**
     * Obtiene los productos de una categoría
     */
    const getProductosByCategoria = async (id: number): Promise<ProductoType[]> => {
        try {
            return await CategoriaService.getProductosByCategoria(id);
        } catch (error: any) {
            console.error('Error al obtener productos por categoría:', error);
            const errorMessage = error.response?.data?.message || 'Error al obtener productos por categoría';
            alert(errorMessage);
            return [];
        }
    };

    /**
     * Limpia el estado de categorías
     */
    const limpiarCategorias = () => {
        dispatch(clearCategorias());
    };

    return {
        // Estado
        categorias,
        categoriaActual,

        // Acciones de selección
        seleccionarCategoria,

        // Acciones CRUD
        fetchCategorias,
        fetchCategoriaById,
        createCategoria,
        updateCategoriaById,
        deleteCategoria,
        getProductosByCategoria,

        // Acciones de limpieza
        limpiarCategorias,
    };
};

export default useCategoria;