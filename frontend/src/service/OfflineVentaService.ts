/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiService from './ApiService';
import IndexedDBService from './IndexedDBService';
import ConnectionService from './ConnectionService';
import { type VentaType } from '../types/VentaTypes';

/**
 * Servicio especializado para manejar ventas con soporte offline
 */

class OfflineVentaService {
  private static instance: OfflineVentaService;
  private indexedDBService: IndexedDBService;
  private readonly VENTAS_OFFLINE_KEY = 'ventas_pendientes';
  
  private constructor() {
    this.indexedDBService = IndexedDBService.getInstance();
  }

  public static getInstance(): OfflineVentaService {
    if (!OfflineVentaService.instance) {
      OfflineVentaService.instance = new OfflineVentaService();
    }
    return OfflineVentaService.instance;
  }

  /**
   * Registra una venta, manejando el caso offline
   */
  public async registrarVenta(venta: VentaType): Promise<any> {
    const isOnline = ConnectionService.getStatus();
    
    try {
      if (isOnline) {
        // Si estamos online, enviamos directamente al servidor
        const response = await ApiService.post('/ventas', venta);
        return response;
      } else {
        // Si estamos offline, guardamos la venta localmente
        await this.guardarVentaOffline(venta);
        
        // Devolvemos una respuesta optimista
        return {
          id: `offline-${Date.now()}`,
          success: true,
          offline: true,
          message: 'Venta guardada localmente. Se sincronizará cuando haya conexión.',
          data: venta
        };
      }
    } catch (error) {
      console.error('Error al registrar venta:', error);
      
      // Si hay un error en el servidor, intentamos guardar localmente
      await this.guardarVentaOffline(venta);
      
      return {
        id: `offline-error-${Date.now()}`,
        success: false,
        offline: true,
        message: 'Error al registrar venta. Se guardó localmente para sincronización posterior.',
        error: error,
        data: venta
      };
    }
  }

  /**
   * Guarda una venta en el almacenamiento local
   */
  private async guardarVentaOffline(venta: VentaType): Promise<void> {
    // Asignamos un ID temporal para identificarla localmente
    const ventaConIdTemporal = {
      ...venta,
      id: venta.ventaId || `temp-${Date.now()}`,
      _offline: true,
      _timestamp: Date.now()
    };
    
    // Obtenemos las ventas pendientes existentes
    const ventasPendientes = await this.getVentasPendientes() || [];
    
    // Añadimos la nueva venta
    ventasPendientes.push(ventaConIdTemporal);
    
    // Almacenamos el array actualizado
    await this.indexedDBService.storeOfflineData(this.VENTAS_OFFLINE_KEY, ventasPendientes);
    
    // También registramos la operación pendiente para sincronización futura
    await this.indexedDBService.storePendingRequest('/ventas', 'POST', venta);
    
    console.log('Venta guardada localmente:', ventaConIdTemporal);
  }

  /**
   * Obtiene todas las ventas pendientes almacenadas localmente
   */
  public async getVentasPendientes(): Promise<VentaType[]> {
    const ventasPendientes = await this.indexedDBService.getOfflineData(this.VENTAS_OFFLINE_KEY);
    return ventasPendientes || [];
  }

  /**
   * Verifica si hay ventas pendientes de sincronización
   */
  public async hayVentasPendientes(): Promise<boolean> {
    const ventasPendientes = await this.getVentasPendientes();
    return ventasPendientes.length > 0;
  }
  /**
   * Obtiene un resumen de las ventas pendientes
   */
  public async getResumenVentasPendientes(): Promise<any> {
    // Extendemos el tipo para incluir _timestamp
    const ventasPendientes = (await this.getVentasPendientes()) as (VentaType & { _timestamp?: number })[];
    
    // Calculamos algunos totales para mostrar al usuario
    const total = ventasPendientes.reduce((sum, venta) => sum + (venta.total || 0), 0);
    
    return {
      cantidad: ventasPendientes.length,
      total: total,
      fechaUltima: ventasPendientes.length > 0 
        ? new Date(Math.max(...ventasPendientes.map(v => v._timestamp || 0)))
        : null
    };
  }
  
  /**
   * Elimina una venta pendiente específica (por ejemplo, si el usuario decide descartarla)
   */
  public async eliminarVentaPendiente(idTemporal: string): Promise<void> {
    const ventasPendientes = await this.getVentasPendientes();
    const ventasActualizadas = ventasPendientes.filter(v => String(v.ventaId) !== idTemporal);
    
    await this.indexedDBService.storeOfflineData(this.VENTAS_OFFLINE_KEY, ventasActualizadas);
  }

  /**
   * Sincroniza todas las ventas pendientes
   */
  public async sincronizarVentasPendientes(): Promise<{ exitosas: number, fallidas: number }> {
    if (!ConnectionService.getStatus()) {
      throw new Error('No hay conexión a internet para sincronizar');
    }
    
    const ventasPendientes = await this.getVentasPendientes();
    let exitosas = 0;
    let fallidas = 0;
    
    for (const venta of ventasPendientes) {
      try {
        // Eliminamos propiedades temporales
        const ventaLimpia = { ...(venta as VentaType & { _offline?: boolean; _timestamp?: number }) };
        delete (ventaLimpia as any)._timestamp;
        delete (ventaLimpia as any)._offline;
        
        // Enviamos al servidor
        await ApiService.post('/ventas', ventaLimpia);
        exitosas++;
        
        // Eliminamos de la lista de pendientes
        await this.eliminarVentaPendiente(String(venta.ventaId));
      } catch (error) {
        console.error(`Error al sincronizar venta ${venta.ventaId}:`, error);
        fallidas++;
      }
    }
    
    return { exitosas, fallidas };
  }
}

export default OfflineVentaService;
