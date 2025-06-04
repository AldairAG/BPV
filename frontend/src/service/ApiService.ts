/* eslint-disable @typescript-eslint/no-explicit-any */
import ConnectionService from './ConnectionService';
import IndexedDBService from './IndexedDBService';
import SyncService from './SyncService';

class ApiService {
  private static baseUrl: string = import.meta.env.VITE_API_BASE_URL || '';
  private static indexedDBService = IndexedDBService.getInstance();

  // Initialize the sync service
  static {
    SyncService.getInstance();
  }
  
  /**
   * Generic request method that handles offline support
   */
  private static async request<T>(
    endpoint: string,
    method: string = 'GET',
    data?: any,
    offlineDataType?: string
  ): Promise<T> {
    const isOnline = ConnectionService.getStatus();
    
    // If offline and this is a GET request, try to retrieve from offline storage
    if (!isOnline && method === 'GET' && offlineDataType) {
      console.log(`Offline: Retrieving ${offlineDataType} from local storage`);
      const offlineData = await this.indexedDBService.getOfflineData(offlineDataType);
      
      if (offlineData) {
        return offlineData as T;
      }
      
      throw new Error(`No offline data available for ${offlineDataType}`);
    }
    
    // If offline and this is a write operation, store for later sync
    if (!isOnline && method !== 'GET') {
      console.log(`Offline: Storing ${method} request to ${endpoint} for later sync`);
      await this.indexedDBService.storePendingRequest(endpoint, method, data);
      
      // Return optimistic response if appropriate
      // This is a simplified approach - in a real app you might want to handle this differently
      return { success: true, offline: true, pendingSync: true } as unknown as T;
    }
    
    // Otherwise proceed with normal API request
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
      
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
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // If this was a successful GET, store the data for offline use
      if (method === 'GET' && offlineDataType) {
        await this.indexedDBService.storeOfflineData(offlineDataType, responseData);
      }
      
      return responseData;
    } catch (error) {
      console.error('API request error:', error);
      
      // If online request failed but we have offline data, use that as fallback
      if (method === 'GET' && offlineDataType) {
        const offlineData = await this.indexedDBService.getOfflineData(offlineDataType);
        if (offlineData) {
          return offlineData as T;
        }
      }
      
      throw error;
    }
  }
  
  // Helper methods for common HTTP methods
  public static async get<T>(endpoint: string, offlineDataType?: string): Promise<T> {
    return this.request<T>(endpoint, 'GET', undefined, offlineDataType);
  }
  
  public static async post<T>(endpoint: string, data: any, offlineDataType?: string): Promise<T> {
    return this.request<T>(endpoint, 'POST', data, offlineDataType);
  }
  
  public static async put<T>(endpoint: string, data: any, offlineDataType?: string): Promise<T> {
    return this.request<T>(endpoint, 'PUT', data, offlineDataType);
  }
  
  public static async delete<T>(endpoint: string, offlineDataType?: string): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', undefined, offlineDataType);
  }
  
  // Method to manually trigger sync
  public static triggerSync(): void {
    SyncService.getInstance().manualSync();
  }
}

export default ApiService;
