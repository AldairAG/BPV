import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { CategoriaType } from '../../types/CategoriaType';

/**
 * Interface que define la estructura del estado de categorías
 */
interface CategoriaState {
  categorias: CategoriaType[];
  categoriaActual: CategoriaType | null;
}

/**
 * Estado inicial para el slice de categorías
 */
const initialState: CategoriaState = {
  categorias: [],
  categoriaActual: null
};

/**
 * @file categoriaSlice.ts
 * @description Este archivo define el `categoriaSlice` para gestionar el estado relacionado con las categorías en la aplicación.
 * Utiliza Redux Toolkit's `createSlice` para manejar la información de categorías.
 */

/**
 * @constant categoriaSlice
 * @description Un slice de Redux para gestionar el estado de categorías.
 * Contiene lo siguiente:
 * - `name`: El nombre del slice, establecido como 'categoria'.
 * - `initialState`: El estado inicial del slice de categorías.
 * - `reducers`: Un objeto que contiene funciones reductoras para manejar actualizaciones de estado.
 */
const categoriaSlice = createSlice({
  name: 'categoria',
  initialState,
  reducers: {

    // Acciones para manejar las categorías
    setCategorias: (state, action: PayloadAction<CategoriaType[]>) => {
      state.categorias = action.payload;
    },
    
    setCategoriaActual: (state, action: PayloadAction<CategoriaType | null>) => {
      state.categoriaActual = action.payload;
    },
    
    addCategoria: (state, action: PayloadAction<CategoriaType>) => {
      state.categorias.push(action.payload);
    },
    
    updateCategoria: (state, action: PayloadAction<CategoriaType>) => {
      const index = state.categorias.findIndex(cat => cat.categoriaId === action.payload.categoriaId);
      if (index !== -1) {
        state.categorias[index] = action.payload;
      }
      if (state.categoriaActual?.categoriaId === action.payload.categoriaId) {
        state.categoriaActual = action.payload;
      }
    },
    
    removeCategoria: (state, action: PayloadAction<number>) => {
      state.categorias = state.categorias.filter(cat => cat.categoriaId !== action.payload);
      if (state.categoriaActual?.categoriaId === action.payload) {
        state.categoriaActual = null;
      }
    },
    
    clearCategorias: (state) => {
      state.categorias = [];
      state.categoriaActual = null;
    },
  }
});

export const { 
  setCategorias, 
  setCategoriaActual, 
  addCategoria, 
  updateCategoria, 
  removeCategoria, 
  clearCategorias 
} = categoriaSlice.actions;

/**
 * Selector para obtener todas las categorías
 */
const selectAllCategorias = (state: { categoria: CategoriaState }) => state.categoria.categorias;

/**
 * Selector para obtener una categoría por ID
 */
const selectCategoriaById = createSelector(
  [
    selectAllCategorias,
    (_: { categoria: CategoriaState }, categoriaId: number) => categoriaId
  ],
  (categorias, categoriaId) => categorias.find(cat => cat.categoriaId === categoriaId) || null
);

/**
 * Objeto que contiene selectores para acceder al estado de categorías
 */
export const categoriaSelector = {
  categorias: selectAllCategorias,
  categoriaActual: (state: { categoria: CategoriaState }) => state.categoria.categoriaActual,
  categoriaById: selectCategoriaById
};

export default categoriaSlice.reducer;