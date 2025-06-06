/* eslint-disable @typescript-eslint/no-explicit-any */
import ConnectionService from './ConnectionService';
import IndexedDBService from './IndexedDBService';
import OfflineVentaService from './OfflineVentaService';
import { toast } from 'react-hot-toast';

class SyncService {
  private static instance: SyncService;
  private indexedDBService: IndexedDBService;
  private offlineVentaService: OfflineVentaService;
  private isSyncing: boolean = false;
  private syncInterval: number | null = null;
  private retryLimit: number = 3;
  private syncIntervalTime: number = 30000; // 30 seconds

  private constructor() {
    this.indexedDBService = IndexedDBService.getInstance();
    this.offlineVentaService = OfflineVentaService.getInstance();
    
    // Register to connection status changes
    ConnectionService.addListener(this.handleConnectionChange.bind(this));
    
    // Initial check
    if (ConnectionService.getStatus()) {
      this.startSync();
    }
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private handleConnectionChange(isOnline: boolean): void {
    if (isOnline) {
      console.log('Connection restored. Starting sync process...');
      
      // Notificar al usuario que se ha recuperado la conexión
      toast.success('Conexión a Internet restaurada', {
        duration: 3000,
        position: 'top-center'
      });
      
      this.startSync();
    } else {
      console.log('Connection lost. Stopping sync process...');
      
      // Notificar al usuario que se ha perdido la conexión
      toast.error('Conexión a Internet perdida. Trabajando en modo offline', {
        duration: 5000,
        position: 'top-center'
      });
      
      this.stopSync();
    }
  }

  private startSync(): void {
    if (this.syncInterval === null) {
      // Perform an immediate sync
      this.syncPendingRequests();
      this.syncOfflineVentas();
      
      // Set up interval for future syncs
      this.syncInterval = window.setInterval(() => {
        this.syncPendingRequests();
        this.syncOfflineVentas();
      }, this.syncIntervalTime);
    }
  }

  private stopSync(): void {
    if (this.syncInterval !== null) {
      window.clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sincroniza las ventas pendientes almacenadas offline
   */
  private async syncOfflineVentas(): Promise<void> {
    if (!ConnectionService.getStatus() || this.isSyncing) {
      return;
    }

    try {
      // Verificar si hay ventas pendientes
      const hayVentasPendientes = await this.offlineVentaService.hayVentasPendientes();
      
      if (!hayVentasPendientes) {
        return;
      }
      
      // Obtener resumen para mostrar notificación
      const resumen = await this.offlineVentaService.getResumenVentasPendientes();
      
      // Notificar al usuario que se están sincronizando las ventas
      toast.loading(`Sincronizando ${resumen.cantidad} ventas pendientes...`, {
        id: 'sync-ventas',
        duration: 3000
      });
      
      // Intentar sincronizar todas las ventas pendientes
      try {
        // Obtener todas las ventas pendientes
        const ventasPendientes = await this.offlineVentaService.getVentasPendientes();
        let exitosas = 0;
        let fallidas = 0;
        
        // Procesar cada venta
        for (const venta of ventasPendientes) {
          try {
            // Enviar la venta al servidor (usando el método sendRequest)
            await this.sendRequest('/ventas', 'POST', venta);
            
            // Si se envió correctamente, eliminarla de pendientes
            await this.offlineVentaService.eliminarVentaPendiente(String(venta.ventaId));
            exitosas++;
          } catch (error) {
            console.error(`Error al sincronizar venta ${venta.ventaId}:`, error);
            fallidas++;
          }
        }
        
        // Notificar el resultado
        if (exitosas > 0) {
          toast.success(
            `Sincronización completada: ${exitosas} ventas sincronizadas correctamente${
              fallidas > 0 ? `, ${fallidas} fallidas` : ''
            }`, 
            { duration: 5000 }
          );
          
          // Dispatch event for components to update
          this.dispatchSyncEvent('/ventas', { syncedCount: exitosas });
        }
        
        if (fallidas > 0 && exitosas === 0) {
          toast.error(
            `No se pudieron sincronizar ${fallidas} ventas. Se intentará nuevamente más tarde.`, 
            { duration: 5000 }
          );
        }
      } catch (error) {
        console.error('Error durante la sincronización de ventas:', error);
        toast.error('Error al sincronizar las ventas pendientes', { duration: 3000 });
      }
      
    } catch (error) {
      console.error('Error al sincronizar ventas offline:', error);
    }
  }

  private async syncPendingRequests(): Promise<void> {
    if (this.isSyncing || !ConnectionService.getStatus()) {
      return;
    }

    try {
      this.isSyncing = true;
      
      // Get all pending requests
      const pendingRequests = await this.indexedDBService.getPendingRequests();
      
      if (pendingRequests.length === 0) {
        console.log('No pending requests to sync');
        this.isSyncing = false;
        return;
      }
      
      console.log(`Syncing ${pendingRequests.length} pending requests`);
      
      // Process each request sequentially
      for (const request of pendingRequests) {
        try {
          // Send the request
          const response = await this.sendRequest(
            request.endpoint,
            request.method,
            request.data
          );
          
          // If successful, remove from pending
          await this.indexedDBService.deletePendingRequest(request.id);
          console.log(`Successfully synced request: ${request.id}`);
          
          // Dispatch a custom event to notify components that data has been synced
          this.dispatchSyncEvent(request.endpoint, response);
          
        } catch (error) {
          console.error(`Error syncing request ${request.id}:`, error);
          
          // Increment retry count
          request.retries += 1;
          
          // If exceeded retry limit, mark as failed or remove
          if (request.retries >= this.retryLimit) {
            await this.indexedDBService.deletePendingRequest(request.id);
            console.warn(`Request ${request.id} exceeded retry limit and was removed`);
            // TODO: Consider adding to a "failed" store for review
          }
        }
      }
      
    } catch (error) {
      console.error('Error during sync process:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async sendRequest(endpoint: string, method: string, data: any): Promise<any> {
    const url = endpoint.startsWith('http') ? endpoint : `${import.meta.env.VITE_API_BASE_URL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Add authorization headers if needed
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    return await response.json();
  }

  private dispatchSyncEvent(endpoint: string, data: any): void {
    const event = new CustomEvent('bpv-data-synced', {
      detail: {
        endpoint,
        data,
        timestamp: Date.now(),
      },
    });
    
    window.dispatchEvent(event);
  }

  // Public API for manual sync
  public manualSync(): void {
    if (ConnectionService.getStatus()) {
      this.syncPendingRequests();
    }
  }
}

export default SyncService;
