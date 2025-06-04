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
}

class IndexedDBService {
  private static instance: IndexedDBService;
  private db: IDBPDatabase<BPVOfflineDB> | null = null;
  private dbName = 'bpv-offline-db';
  private dbVersion = 1;

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
        upgrade(db) {
          // Create stores if they don't exist
          if (!db.objectStoreNames.contains('pendingRequests')) {
            const pendingRequestsStore = db.createObjectStore('pendingRequests', { keyPath: 'id' });
            pendingRequestsStore.createIndex('by-timestamp', 'timestamp');
          }

          if (!db.objectStoreNames.contains('offlineData')) {
            db.createObjectStore('offlineData', { keyPath: 'type' });
          }
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
  }
}

export default IndexedDBService;
