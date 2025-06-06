/* eslint-disable @typescript-eslint/no-explicit-any */
import { openDB, type IDBPDatabase, type DBSchema } from 'idb';

// Define the database schema
interface BPVOfflineDB extends DBSchema {
  pendingRequests: {
    key: string;
    value: {
      id: string;
      endpoint: string;
      method: string;
      data: any;
      timestamp: number;
      retries: number;
    };
    indexes: { 'by-timestamp': number };
  };
  offlineData: {
    key: string;
    value: {
      type: string; // e.g., 'productos', 'ventas', etc.
      data: any;
      lastUpdated: number;
    };
  };
  offlineVentas: {
    key: string;
    value: {
      id: string;
      items: any[];
      conIva: boolean;
      cliente: any;
      fechaCreacion: number;
      total: number;
      sincronizado: boolean;
      fechaSincronizacion?: number;
    };
    indexes: { 'by-sincronizado': 'sincronizado'; 'by-fecha': 'fechaCreacion' };
  };
}

class IndexedDBService {
  private static instance: IndexedDBService;
  private db: IDBPDatabase<BPVOfflineDB> | null = null;
  private dbName = 'bpv-offline-db';
  private dbVersion = 2; // Incrementamos la versión para actualizar el esquema

  private constructor() {
    this.initDB();
  }

  public static getInstance(): IndexedDBService {
    if (!IndexedDBService.instance) {
      IndexedDBService.instance = new IndexedDBService();
    }
    return IndexedDBService.instance;
  }

  private async initDB(): Promise<void> {
    try {
      this.db = await openDB<BPVOfflineDB>(this.dbName, this.dbVersion, {
        upgrade(db, oldVersion, newVersion) {
          // Create stores if they don't exist
          if (!db.objectStoreNames.contains('pendingRequests')) {
            const pendingRequestsStore = db.createObjectStore('pendingRequests', { keyPath: 'id' });
            pendingRequestsStore.createIndex('by-timestamp', 'timestamp');
          }

          if (!db.objectStoreNames.contains('offlineData')) {
            db.createObjectStore('offlineData', { keyPath: 'type' });
          }

          // Añadir store para ventas offline
          if (!db.objectStoreNames.contains('offlineVentas')) {
            const ventasStore = db.createObjectStore('offlineVentas', { keyPath: 'id' });
            ventasStore.createIndex('by-sincronizado', 'sincronizado');
            ventasStore.createIndex('by-fecha', 'fechaCreacion');
          }

          console.log(`DB upgraded from version ${oldVersion} to ${newVersion}`);
        },
      });
      console.log('IndexedDB initialized successfully');
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
    }
  }

  // Store pending API request to be processed when online
  public async storePendingRequest(endpoint: string, method: string, data: any): Promise<string> {
    await this.ensureDBInitialized();
    
    const id = `${method}-${endpoint}-${Date.now()}`;
    const request = {
      id,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    await this.db!.add('pendingRequests', request);
    return id;
  }

  // Get all pending requests
  public async getPendingRequests(): Promise<any[]> {
    await this.ensureDBInitialized();
    return this.db!.getAllFromIndex('pendingRequests', 'by-timestamp');
  }

  // Delete a pending request after it's processed
  public async deletePendingRequest(id: string): Promise<void> {
    await this.ensureDBInitialized();
    await this.db!.delete('pendingRequests', id);
  }

  // Store data for offline use
  public async storeOfflineData(type: string, data: any): Promise<void> {
    await this.ensureDBInitialized();
    
    await this.db!.put('offlineData', {
      type,
      data,
      lastUpdated: Date.now(),
    });
  }

  // Get offline data by type
  public async getOfflineData(type: string): Promise<any | null> {
    await this.ensureDBInitialized();
    
    try {
      const result = await this.db!.get('offlineData', type);
      return result?.data || null;
    } catch (error) {
      console.error(`Error getting offline data for type ${type}:`, error);
      return null;
    }
  }

  // Añadir una venta para procesamiento offline
  public async storeOfflineVenta(venta: {
    items: any[];
    conIva: boolean;
    cliente: any | null;
    total: number;
  }): Promise<string> {
    await this.ensureDBInitialized();
    
    const id = `venta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ventaData = {
      id,
      ...venta,
      fechaCreacion: Date.now(),
      sincronizado: false
    };

    await this.db!.add('offlineVentas', ventaData);
    return id;
  }

  // Obtener todas las ventas pendientes de sincronizar
  public async getUnsyncedVentas(): Promise<any[]> {
    await this.ensureDBInitialized();
    return this.db!.getAllFromIndex('offlineVentas', 'by-sincronizado', IDBKeyRange.only(false));
  }

  // Marcar una venta como sincronizada
  public async markVentaAsSynced(id: string): Promise<void> {
    await this.ensureDBInitialized();
    
    const venta = await this.db!.get('offlineVentas', id);
    if (venta) {
      venta.sincronizado = true;
      venta.fechaSincronizacion = Date.now();
      await this.db!.put('offlineVentas', venta);
    }
  }

  // Obtener todas las ventas (sincronizadas y no sincronizadas)
  public async getAllVentas(): Promise<any[]> {
    await this.ensureDBInitialized();
    return this.db!.getAllFromIndex('offlineVentas', 'by-fecha');
  }

  // Ensure database is initialized before any operation
  private async ensureDBInitialized(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }
  }

  // Clear all data (useful for testing or reset)
  public async clearAllData(): Promise<void> {
    await this.ensureDBInitialized();
    await this.db!.clear('pendingRequests');
    await this.db!.clear('offlineData');
    await this.db!.clear('offlineVentas');
  }
}

export default IndexedDBService;
