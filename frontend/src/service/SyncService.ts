/* eslint-disable @typescript-eslint/no-explicit-any */
import ConnectionService from './ConnectionService';
import IndexedDBService from './IndexedDBService';

class SyncService {
  private static instance: SyncService;
  private indexedDBService: IndexedDBService;
  private isSyncing: boolean = false;
  private syncInterval: number | null = null;
  private retryLimit: number = 3;
  private syncIntervalTime: number = 30000; // 30 seconds

  private constructor() {
    this.indexedDBService = IndexedDBService.getInstance();
    
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
      this.startSync();
    } else {
      console.log('Connection lost. Stopping sync process...');
      this.stopSync();
    }
  }

  private startSync(): void {
    if (this.syncInterval === null) {
      // Perform an immediate sync
      this.syncPendingRequests();
      
      // Set up interval for future syncs
      this.syncInterval = window.setInterval(() => {
        this.syncPendingRequests();
      }, this.syncIntervalTime);
    }
  }

  private stopSync(): void {
    if (this.syncInterval !== null) {
      window.clearInterval(this.syncInterval);
      this.syncInterval = null;
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
