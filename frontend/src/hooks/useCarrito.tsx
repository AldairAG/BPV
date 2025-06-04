/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from 'react';
import useProducto from './useProducto';
import useUser from './useUser';
import VentaService from '../service/VentaService';
import type { ProductoType } from '../types/ProductoType';
import type { VentaType, VentaRequest } from '../types/VentaTypes';
import type { ClienteType } from '../types/ClienteType';

// Definir el tipo para los items del carrito
export type CarritoItem = {
  producto: ProductoType;
  cantidad: number;
};

// Estado para el carrito en localStorage
const CARRITO_STORAGE_KEY = 'bpv_carrito';

/**
 * Hook personalizado para gestionar el carrito de compras
 * 
 * @returns {Object} Métodos y estado para controlar el carrito
 */
export const useCarrito = () => {
  // Estados para el carrito
  const [carritoItems, setCarritoItems] = useState<CarritoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ventaRealizada, setVentaRealizada] = useState<VentaType | null>(null);
  
  // Hooks relacionados
  const { verificarDisponibilidad, fetchProductos } = useProducto();
  const { user } = useUser();
  
  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem(CARRITO_STORAGE_KEY);
    if (carritoGuardado) {
      try {
        const items = JSON.parse(carritoGuardado);
        setCarritoItems(items);
      } catch (err) {
        console.error('Error al cargar carrito desde localStorage:', err);
        localStorage.removeItem(CARRITO_STORAGE_KEY);
      }
    }
  }, []);
  
  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (carritoItems.length > 0) {
      localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carritoItems));
    } else {
      localStorage.removeItem(CARRITO_STORAGE_KEY);
    }
  }, [carritoItems]);



  /**
   * Añade un producto al carrito
   * @param producto Producto a añadir
   * @param cantidad Cantidad a añadir (por defecto 1)
   * @returns true si se añadió correctamente, false si no hay stock suficiente
   */
  const addToCart = useCallback(async (producto: ProductoType, cantidad: number = 1): Promise<boolean> => {
    try {
      setError(null);
      
      // Verificar si hay stock disponible
      const stockActual = producto.stock;
      
      if (stockActual < cantidad) {
        setError(`No hay suficiente stock para ${producto.nombre}. Stock disponible: ${stockActual}`);
        return false;
      }
      
      setCarritoItems(prevItems => {
        // Verificar si el producto ya está en el carrito
        const existingItem = prevItems.find(item => item.producto.productoId === producto.productoId);
        
        if (existingItem) {
          // Verificar si la cantidad total no excede el stock
          const nuevaCantidad = existingItem.cantidad + cantidad;
          if (nuevaCantidad > stockActual) {
            setError(`No puedes añadir más unidades. Stock disponible: ${stockActual}`);
            return prevItems;
          }
          
          // Incrementar cantidad si ya existe
          return prevItems.map(item => 
            item.producto.productoId === producto.productoId 
              ? { ...item, cantidad: nuevaCantidad } 
              : item
          );
        } else {
          // Añadir nuevo item si no existe
          return [...prevItems, { producto, cantidad }];
        }
      });
      
      return true;
    } catch (err) {
      console.error('Error al añadir producto al carrito:', err);
      setError('Error al añadir producto al carrito');
      return false;
    }
  }, []);

  /**
   * Elimina un producto del carrito
   * @param productoId ID del producto a eliminar
   */
  const removeFromCart = useCallback((productoId: number) => {
    setError(null);
    setCarritoItems(prevItems => 
      prevItems.filter(item => item.producto.productoId !== productoId)
    );
  }, []);

  /**
   * Actualiza la cantidad de un producto en el carrito
   * @param productoId ID del producto a actualizar
   * @param cantidad Nueva cantidad
   * @returns true si se actualizó correctamente, false si no hay stock suficiente
   */
  const updateCartItemQuantity = useCallback(async (productoId: number, cantidad: number): Promise<boolean> => {
    try {
      setError(null);
      
      // Si la cantidad es 0 o negativa, eliminar el producto
      if (cantidad <= 0) {
        removeFromCart(productoId);
        return true;
      }
      
      // Encontrar el producto en el carrito
      const item = carritoItems.find(item => item.producto.productoId === productoId);
      if (!item) return false;
      
      // Verificar stock disponible
      if (cantidad > item.producto.stock) {
        setError(`No hay suficiente stock. Stock disponible: ${item.producto.stock}`);
        return false;
      }
      
      // Actualizar cantidad
      setCarritoItems(prevItems =>
        prevItems.map(item =>
          item.producto.productoId === productoId
            ? { ...item, cantidad }
            : item
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
      setError('Error al actualizar cantidad');
      return false;
    }
  }, [carritoItems, removeFromCart]);

  /**
   * Limpia todos los productos del carrito
   */
  const clearCart = useCallback(() => {
    setError(null);
    setCarritoItems([]);
    setVentaRealizada(null);
  }, []);

  /**
   * Calcula el total del carrito
   * @returns Importe total del carrito
   */
  const calcularTotal = useCallback((): number => {
    return carritoItems.reduce(
      (total, item) => total + item.producto.precioVenta * item.cantidad,
      0
    );
  }, [carritoItems]);

  /**
   * Calcula el total de items en el carrito (suma de cantidades)
   * @returns Número total de items
   */
  const calcularCantidadTotal = useCallback((): number => {
    return carritoItems.reduce(
      (total, item) => total + item.cantidad,
      0
    );
  }, [carritoItems]);

  /**
   * Procesa la venta, enviando los datos al servidor
   * @param conIva Indica si la venta incluye IVA
   * @returns La venta creada si tuvo éxito
   */
  const procesarVenta = useCallback(async (conIva: boolean,cliente:ClienteType|null): Promise<VentaType | null> => {
    try {
      setLoading(true);
      setError(null);

      // Verificar que haya un usuario logueado
      if (!user || !user.id) {
        setError('Debes iniciar sesión para realizar una venta');
        return null;
      }
      
      // Verificar que haya productos en el carrito
      if (carritoItems.length === 0) {
        setError('El carrito está vacío');
        return null;
      }
      
      // Verificar stock disponible para todos los productos
      for (const item of carritoItems) {
        const disponible = await verificarDisponibilidad(
          item.producto.productoId, 
          item.cantidad
        );
        
        if (!disponible) {
          setError(`No hay suficiente stock para ${item.producto.nombre}`);
          return null;
        }
      }

      // Preparar request para crear venta
      const ventaRequest: VentaRequest = {
        usuarioId: user.id,
        clienteId: cliente?.idCliente || null, // Puede ser null si no hay cliente seleccionado
        productos: carritoItems.map(item => ({
          productoVendidoId: null, // Placeholder, will be set by backend
          precioUnitario: item.producto.precioVenta,
          subtotal: item.producto.precioVenta * item.cantidad,
          producto: item.producto,
          cantidad: item.cantidad,
          descuento: 0
        })),
        conIva
      };

      // Enviar solicitud al servidor
      const ventaCreada = await VentaService.crearVenta(ventaRequest);
      
      // Limpiar carrito después de venta exitosa
      clearCart();
      
      // Actualizar productos para reflejar nuevo stock
      await fetchProductos();
      
      // Guardar la venta realizada
      setVentaRealizada(ventaCreada);
      
      return ventaCreada;
    } catch (err: any) {
      console.error('Error al procesar la venta:', err);
      setError(err.response?.data?.message || 'Error al procesar la venta');
      return null;
    } finally {
      setLoading(false);
    }
  }, [carritoItems, user, clearCart, verificarDisponibilidad, fetchProductos]);

  /**
   * Anula una venta existente
   * @param ventaId ID de la venta a anular
   * @returns true si se anuló correctamente
   */
  const anularVenta = useCallback(async (ventaId: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await VentaService.anularVenta(ventaId);
      
      // Actualizar productos para reflejar stock restaurado
      await fetchProductos();
      
      return true;
    } catch (err: any) {
      console.error('Error al anular la venta:', err);
      setError(err.response?.data?.message || 'Error al anular la venta');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProductos]);

  /**
   * Obtiene una venta por su ID
   * @param ventaId ID de la venta
   * @returns La venta encontrada o null si hubo error
   */
  const getVentaById = useCallback(async (ventaId: number): Promise<VentaType | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const venta = await VentaService.getVentaById(ventaId);
      return venta;
    } catch (err: any) {
      console.error('Error al obtener la venta:', err);
      setError(err.response?.data?.message || 'Error al obtener la venta');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene las ventas realizadas por el usuario actual
   * @returns Lista de ventas del usuario o array vacío si hubo error
   */
  const getVentasUsuarioActual = useCallback(async (): Promise<VentaType[]> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.id) {
        setError('No hay usuario logueado');
        return [];
      }
      
      const ventas = await VentaService.getVentasByUsuario(user.id);
      return ventas;
    } catch (err: any) {
      console.error('Error al obtener ventas del usuario:', err);
      setError(err.response?.data?.message || 'Error al obtener ventas del usuario');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Verifica si un producto ya está en el carrito
   * @param productoId ID del producto a verificar
   * @returns true si el producto está en el carrito
   */
  const isInCart = useCallback((productoId: number): boolean => {
    return carritoItems.some(item => item.producto.productoId === productoId);
  }, [carritoItems]);

  /**
   * Obtiene la cantidad de un producto en el carrito
   * @param productoId ID del producto
   * @returns Cantidad del producto en el carrito o 0 si no está
   */
  const getCartItemQuantity = useCallback((productoId: number): number => {
    const item = carritoItems.find(item => item.producto.productoId === productoId);
    return item ? item.cantidad : 0;
  }, [carritoItems]);



  return {
    // Estado
    carritoItems,
    loading,
    error,
    ventaRealizada,
    
    // Acciones básicas del carrito
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    
    // Cálculos
    calcularTotal,
    calcularCantidadTotal,
    
    // Ventas
    procesarVenta,
    anularVenta,
    getVentaById,
    getVentasUsuarioActual,
    
    // Helpers
    isInCart,
    getCartItemQuantity,
    isEmpty: carritoItems.length === 0,
    itemCount: carritoItems.length,

  };
};

export default useCarrito;