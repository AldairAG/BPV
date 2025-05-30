import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { ProductoType } from '../../types/ProductoType';

/**
 * Interface que define la estructura del estado de productos
 */
interface ProductoState {
  productos: ProductoType[];
  productoActual: ProductoType | null;
  productosFiltrados: ProductoType[];
}

/**
 * Estado inicial para el slice de productos
 */
const initialState: ProductoState = {
  productos: [],
  productoActual: null,
  productosFiltrados: [],
};

/**
 * @file productoSlice.ts
 * @description Este archivo define el `productoSlice` para gestionar el estado relacionado con los productos en la aplicación.
 * Utiliza Redux Toolkit's `createSlice` para manejar la información de productos.
 */

/**
 * @constant productoSlice
 * @description Un slice de Redux para gestionar el estado de productos.
 * Contiene lo siguiente:
 * - `name`: El nombre del slice, establecido como 'producto'.
 * - `initialState`: El estado inicial del slice de productos.
 * - `reducers`: Un objeto que contiene funciones reductoras para manejar actualizaciones de estado.
 */
const productoSlice = createSlice({
  name: 'producto',
  initialState,
  reducers: {
    // Acciones para manejar los productos
    setProductos: (state, action: PayloadAction<ProductoType[]>) => {
      state.productos = action.payload;
      state.productosFiltrados = action.payload;
    },
    
    setProductoActual: (state, action: PayloadAction<ProductoType | null>) => {
      state.productoActual = action.payload;
    },
    
    addProducto: (state, action: PayloadAction<ProductoType>) => {
      state.productos.push(action.payload);
      state.productosFiltrados = state.productos;
    },
    
    updateProducto: (state, action: PayloadAction<ProductoType>) => {
      const index = state.productos.findIndex(prod => prod.productoId === action.payload.productoId);
      if (index !== -1) {
        state.productos[index] = action.payload;
      }
      if (state.productoActual?.productoId === action.payload.productoId) {
        state.productoActual = action.payload;
      }
      
      // Actualizar también en la lista filtrada
      const indexFiltrado = state.productosFiltrados.findIndex(prod => prod.productoId === action.payload.productoId);
      if (indexFiltrado !== -1) {
        state.productosFiltrados[indexFiltrado] = action.payload;
      }
    },
    
    removeProducto: (state, action: PayloadAction<number>) => {
      state.productos = state.productos.filter(prod => prod.productoId !== action.payload);
      state.productosFiltrados = state.productosFiltrados.filter(prod => prod.productoId !== action.payload);
      
      if (state.productoActual?.productoId === action.payload) {
        state.productoActual = null;
      }
    },
    
    // Acción para actualizar el stock de un producto
    updateStock: (state, action: PayloadAction<{ id: number, cantidad: number }>) => {
      const { id, cantidad } = action.payload;
      const producto = state.productos.find(prod => prod.productoId === id);
      
      if (producto) {
        producto.stock = producto.stock + cantidad;
        
        // Actualizar también en la lista filtrada
        const productoFiltrado = state.productosFiltrados.find(prod => prod.productoId === id);
        if (productoFiltrado) {
          productoFiltrado.stock = producto.stock;
        }
        
        // Actualizar también el producto actual si corresponde
        if (state.productoActual?.productoId === id) {
          state.productoActual.stock = producto.stock;
        }
      }
    },
    
    // Acción para filtrar productos
    setProductosFiltrados: (state, action: PayloadAction<ProductoType[]>) => {
      state.productosFiltrados = action.payload;
    },
    
    // Acción para filtrar productos por nombre
    filtrarProductosPorNombre: (state, action: PayloadAction<string>) => {
      const criterio = action.payload.toLowerCase();
      if (criterio === '') {
        state.productosFiltrados = state.productos;
      } else {
        state.productosFiltrados = state.productos.filter(
          producto => producto.nombre.toLowerCase().includes(criterio)
        );
      }
    },
    
    // Acción para filtrar productos por categoría
    filtrarProductosPorCategoria: (state, action: PayloadAction<number>) => {
      const categoriaId = action.payload;
      if (categoriaId === 0) {
        state.productosFiltrados = state.productos;
      } else {
        state.productosFiltrados = state.productos.filter(
          producto => producto.categoria?.categoriaId === categoriaId
        );
      }
    },
    
    // Acción para filtrar productos con stock bajo
    filtrarProductosBajoStock: (state, action: PayloadAction<number>) => {
      const stockMinimo = action.payload;
      state.productosFiltrados = state.productos.filter(
        producto => producto.stock <= stockMinimo
      );
    },
    
    clearProductos: (state) => {
      state.productos = [];
      state.productosFiltrados = [];
      state.productoActual = null;
    },
  }
});

export const { 
  setProductos, 
  setProductoActual, 
  addProducto, 
  updateProducto, 
  removeProducto,
  updateStock,
  setProductosFiltrados,
  filtrarProductosPorNombre,
  filtrarProductosPorCategoria,
  filtrarProductosBajoStock,
  clearProductos
} = productoSlice.actions;

/**
 * Selector para obtener todos los productos
 */
const selectAllProductos = (state: { producto: ProductoState }) => state.producto.productos;

/**
 * Selector para obtener los productos filtrados
 */
const selectProductosFiltrados = (state: { producto: ProductoState }) => state.producto.productosFiltrados;

/**
 * Selector para obtener un producto por ID
 */
const selectProductoById = createSelector(
  [
    selectAllProductos,
    (_: { producto: ProductoState }, productoId: number) => productoId
  ],
  (productos, productoId) => productos.find(prod => prod.productoId === productoId) || null
);

/**
 * Selector para obtener productos por categoría
 */
const selectProductosByCategoria = createSelector(
  [
    selectAllProductos,
    (_: { producto: ProductoState }, categoriaId: number) => categoriaId
  ],
  (productos, categoriaId) => productos.filter(prod => prod.categoria?.categoriaId === categoriaId)
);

/**
 * Selector para obtener productos con stock bajo
 */
const selectProductosBajoStock = createSelector(
  [
    selectAllProductos,
    (_: { producto: ProductoState }, stockMinimo: number) => stockMinimo
  ],
  (productos, stockMinimo) => productos.filter(prod => prod.stock <= stockMinimo)
);

/**
 * Objeto que contiene selectores para acceder al estado de productos
 */
export const productoSelector = {
  productos: selectAllProductos,
  productosFiltrados: selectProductosFiltrados,
  productoActual: (state: { producto: ProductoState }) => state.producto.productoActual,
  productoById: selectProductoById,
  productosByCategoria: selectProductosByCategoria,
  productosBajoStock: selectProductosBajoStock
};

export default productoSlice.reducer;