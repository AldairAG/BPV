/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiService from './ApiService';
import IndexedDBService from './IndexedDBService';
import ConnectionService from './ConnectionService';
import { type ProductoType } from '../types/ProductoType';

/**
 * Servicio especializado para manejar productos con soporte offline
 */
class OfflineProductoService {
  private static instance: OfflineProductoService;
  private indexedDBService: IndexedDBService;
  private readonly PRODUCTOS_CACHE_KEY = 'productos_cache';
  private readonly PRODUCTOS_CHANGES_KEY = 'productos_cambios';

  private constructor() {
    this.indexedDBService = IndexedDBService.getInstance();

    // Iniciar la carga de productos cuando se crea el servicio
    this.initProductosCache();
  }

  public static getInstance(): OfflineProductoService {
    if (!OfflineProductoService.instance) {
      OfflineProductoService.instance = new OfflineProductoService();
    }
    return OfflineProductoService.instance;
  }

  /**
   * Inicializa la caché de productos si estamos online
   */
  private async initProductosCache(): Promise<void> {
    if (ConnectionService.getStatus()) {
      try {
        // Cargar todos los productos al inicio
        const productos = await ApiService.get('/productos');
        if (productos) {
          await this.indexedDBService.storeOfflineData(this.PRODUCTOS_CACHE_KEY, productos);
          console.log('Caché de productos inicializada con', (productos as ProductoType[]).length, 'productos');
        }
      } catch (error) {
        console.error('Error al inicializar caché de productos:', error);
      }
    }
  }

  /**
   * Obtiene todos los productos, usando la caché si estamos offline
   */
  public async getProductos(): Promise<ProductoType[]> {
    try {
      if (ConnectionService.getStatus()) {
        // Si estamos online, obtenemos los productos del servidor y actualizamos la caché
        const productos = await ApiService.get('/productos');
        await this.indexedDBService.storeOfflineData(this.PRODUCTOS_CACHE_KEY, productos);
        return productos as ProductoType[];
      } else {
        // Si estamos offline, usamos la caché
        const productosCache = await this.indexedDBService.getOfflineData(this.PRODUCTOS_CACHE_KEY);

        if (!productosCache) {
          console.warn('No hay productos en caché para modo offline');
          return [];
        }

        return productosCache;
      }
    } catch (error) {
      console.error('Error al obtener productos:', error);

      // Si hay error, intentamos usar la caché como fallback
      const productosCache = await this.indexedDBService.getOfflineData(this.PRODUCTOS_CACHE_KEY);
      return productosCache || [];
    }
  }

  /**
   * Crea un nuevo producto con soporte offline
   */
  public async createProducto(producto: ProductoType): Promise<any> {
    try {
      if (ConnectionService.getStatus()) {
        // Si estamos online, enviamos directamente al servidor
        const response = await ApiService.post('/productos', producto);

        // Actualizamos la caché local
        await this.updateProductoCache(response as ProductoType);

        return response;
      } else {
        // Si estamos offline, guardamos localmente para sincronización posterior
        return await this.saveProductoOffline('CREATE', producto);
      }
    } catch (error) {
      console.error('Error al crear producto:', error);

      // En caso de error, guardamos para sincronización posterior
      return await this.saveProductoOffline('CREATE', producto);
    }
  }

  /**
   * Actualiza un producto con soporte offline
   */
  public async updateProducto(id: number, producto: ProductoType): Promise<any> {
    try {
      if (ConnectionService.getStatus()) {
        // Si estamos online, enviamos directamente al servidor
        const response = await ApiService.put(`/productos/${id}`, producto);

        // Actualizamos la caché local
        await this.updateProductoCache(response as ProductoType);

        return response;
      } else {
        // Si estamos offline, guardamos localmente para sincronización posterior
        return await this.saveProductoOffline('UPDATE', { ...producto, id });
      }
    } catch (error) {
      console.error(`Error al actualizar producto ${id}:`, error);

      // En caso de error, guardamos para sincronización posterior
      return await this.saveProductoOffline('UPDATE', { ...producto, id });
    }
  }

  /**
   * Elimina un producto con soporte offline
   */
  public async deleteProducto(id: number): Promise<any> {
    try {
      if (ConnectionService.getStatus()) {
        // Si estamos online, enviamos directamente al servidor
        const response = await ApiService.delete(`/productos/${id}`);

        // Actualizamos la caché local
        await this.removeProductoFromCache(id);

        return response;
      } else {
        // Si estamos offline, guardamos localmente para sincronización posterior
        return await this.saveProductoOffline('DELETE', {
          id,
          productoId: 0,
          nombre: '',
          precioVenta: 0,
          precioCompra: 0,
          stock: 0,
          stockMinimo: 0,
          categoria: {
            categoriaId: 0,
            nombre: '',
            color: '',
            productos: []
          },
          activo: false,
          tipo: '',
          productoVentas: []
        });
      }
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);

      // En caso de error, guardamos para sincronización posterior
      return await this.saveProductoOffline('DELETE', {
        id,
        productoId: 0,
        nombre: '',
        precioVenta: 0,
        precioCompra: 0,
        stock: 0,
        stockMinimo: 0,
        categoria: {
          categoriaId: 0,
          nombre: '',
          color: '',
          productos: []
        },
        activo: false,
        tipo: '',
        productoVentas: []
      });
    }
  }

  /**
   * Guarda un cambio de producto localmente para sincronización posterior
   */
  private async saveProductoOffline(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    producto: ProductoType & { id?: number }
  ): Promise<any> {
    // Asignamos un ID temporal si es una creación
    const productoConId = action === 'CREATE' && !producto.id
      ? { ...producto, id: `temp-${Date.now()}` }
      : producto;

    // Guardamos el cambio en la lista de cambios pendientes
    const cambio = {
      id: `${action}-${productoConId.id}-${Date.now()}`,
      action,
      producto: productoConId,
      timestamp: Date.now()
    };

    // Obtenemos la lista actual de cambios
    const cambiosPendientes = await this.getProductosCambiosPendientes();
    cambiosPendientes.push(cambio);

    // Guardamos la lista actualizada
    await this.indexedDBService.storeOfflineData(this.PRODUCTOS_CHANGES_KEY, cambiosPendientes);

    // También actualizamos la caché local para reflejar el cambio inmediatamente
    if ((action === 'CREATE' || action === 'UPDATE') && typeof productoConId.id === 'number') {
      await this.updateProductoCache(productoConId as ProductoType);
    } else if (action === 'DELETE' && typeof productoConId.id === 'number') {
      await this.removeProductoFromCache(productoConId.id);
    }

    // Registramos la operación para sincronización
    if (action === 'CREATE') {
      await this.indexedDBService.storePendingRequest('/productos', 'POST', producto);
    } else if (action === 'UPDATE') {
      await this.indexedDBService.storePendingRequest(`/productos/${producto.id}`, 'PUT', producto);
    } else if (action === 'DELETE') {
      await this.indexedDBService.storePendingRequest(`/productos/${producto.id}`, 'DELETE', {});
    }

    console.log(`Cambio de producto (${action}) guardado localmente:`, productoConId);

    // Devolvemos respuesta optimista
    return {
      ...productoConId,
      _offline: true,
      success: true,
      message: `Producto ${action === 'CREATE' ? 'creado' : action === 'UPDATE' ? 'actualizado' : 'eliminado'} localmente. Se sincronizará cuando haya conexión.`
    };
  }

  /**
   * Actualiza un producto en la caché local
   */
  private async updateProductoCache(producto: ProductoType): Promise<void> {
    const productos = await this.indexedDBService.getOfflineData(this.PRODUCTOS_CACHE_KEY) || [];

    // Buscamos si ya existe el producto
    const index = productos.findIndex((p: ProductoType) => p.id === producto.id);

    if (index >= 0) {
      // Actualizamos el producto existente
      productos[index] = { ...productos[index], ...producto, _offlineUpdated: true };
    } else {
      // Añadimos el nuevo producto
      productos.push({ ...producto, _offlineCreated: true });
    }

    // Guardamos la caché actualizada
    await this.indexedDBService.storeOfflineData(this.PRODUCTOS_CACHE_KEY, productos);
  }

  /**
   * Elimina un producto de la caché local
   */
  private async removeProductoFromCache(id: number): Promise<void> {
    const productos = await this.indexedDBService.getOfflineData(this.PRODUCTOS_CACHE_KEY) || [];

    // Filtramos el producto a eliminar
    const productosActualizados = productos.filter((p: ProductoType) => p.id !== id);

    // Guardamos la caché actualizada
    await this.indexedDBService.storeOfflineData(this.PRODUCTOS_CACHE_KEY, productosActualizados);
  }

  /**
   * Obtiene todos los cambios pendientes de productos
   */
  private async getProductosCambiosPendientes(): Promise<any[]> {
    const cambios = await this.indexedDBService.getOfflineData(this.PRODUCTOS_CHANGES_KEY);
    return cambios || [];
  }

  /**
   * Verifica si hay cambios pendientes de productos
   */
  public async hayCambiosPendientes(): Promise<boolean> {
    const cambios = await this.getProductosCambiosPendientes();
    return cambios.length > 0;
  }

  /**
   * Obtiene un resumen de los cambios pendientes para mostrar al usuario
   */
  public async getResumenCambiosPendientes(): Promise<any> {
    const cambios = await this.getProductosCambiosPendientes();

    const creates = cambios.filter(c => c.action === 'CREATE').length;
    const updates = cambios.filter(c => c.action === 'UPDATE').length;
    const deletes = cambios.filter(c => c.action === 'DELETE').length;

    return {
      total: cambios.length,
      creates,
      updates,
      deletes,
      fechaUltimo: cambios.length > 0
        ? new Date(Math.max(...cambios.map(c => c.timestamp)))
        : null
    };
  }
}

export default OfflineProductoService;
