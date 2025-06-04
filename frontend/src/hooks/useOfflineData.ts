/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import ApiService from '../service/ApiService';
import { useConnectionStatus } from '../service/ConnectionService';
import IndexedDBService from '../service/IndexedDBService';

/**
 * Custom hook for handling API data with offline support
 * @param endpoint API endpoint to fetch data from
 * @param offlineDataType Type identifier for storing/retrieving offline data
 * @param initialData Initial data to use (optional)
 */
export function useOfflineData<T>(
  endpoint: string,
  offlineDataType: string,
  initialData?: T
) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const isOnline = useConnectionStatus();

  // Fetch data with offline support
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.get<T>(endpoint, offlineDataType);
      setData(result);
    } catch (err) {
      console.error(`Error fetching ${offlineDataType}:`, err);
      setError(err as Error);
      
      // Try to get data from offline storage as fallback
      try {
        const offlineData = await IndexedDBService.getInstance().getOfflineData(offlineDataType);
        if (offlineData) {
          setData(offlineData as T);
        }
      } catch (offlineErr) {
        console.error('Error getting offline data:', offlineErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, offlineDataType]);

  // Save data with offline support
  const saveData = useCallback(async (
    method: 'POST' | 'PUT' | 'DELETE',
    dataToSave?: any,
    customEndpoint?: string
  ) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const targetEndpoint = customEndpoint || endpoint;
      let result;
      
      switch (method) {
        case 'POST':
          result = await ApiService.post<T>(targetEndpoint, dataToSave, offlineDataType);
          break;
        case 'PUT':
          result = await ApiService.put<T>(targetEndpoint, dataToSave, offlineDataType);
          break;
        case 'DELETE':
          result = await ApiService.delete<T>(targetEndpoint, offlineDataType);
          break;
      }
      
      // If we're offline, the operation is pending, we should update UI optimistically
      if (result && (result as any).pendingSync) {
        // Optimistic update - in a real app, you might want a more sophisticated approach
        // This is a simplified example
        if (method === 'POST' && Array.isArray(data)) {
          // For arrays, add the new item (with a temporary ID if needed)
          const newItem = {
            ...dataToSave,
            id: dataToSave.id || `temp-${Date.now()}`,
            _pending: true
          };
          setData([...(data as any), newItem] as any);
        } else if (method === 'PUT' && dataToSave.id) {
          // For updates, update the item in the array
          if (Array.isArray(data)) {
            const updatedData = (data as any).map((item: any) => 
              item.id === dataToSave.id ? { ...dataToSave, _pending: true } : item
            );
            setData(updatedData as any);
          }
        } else if (method === 'DELETE' && Array.isArray(data)) {
          // For deletes, filter out the item
          const filteredData = (data as any).filter((item: any) => 
            item.id !== (customEndpoint?.split('/').pop() || '')
          );
          setData(filteredData as any);
        }
      } else if (result) {
        // Online response - update with actual server data
        // This might need to be adjusted based on your API response format
        fetchData();
      }
      
      return result;
    } catch (err) {
      console.error(`Error saving ${offlineDataType}:`, err);
      setError(err as Error);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [endpoint, offlineDataType, data, fetchData]);

  // Listen for sync events that might affect our data
  useEffect(() => {
    const handleSyncEvent = (event: Event) => {
      const syncEvent = event as CustomEvent;
      if (syncEvent.detail?.endpoint === endpoint) {
        fetchData();
      }
    };
    
    window.addEventListener('bpv-data-synced', handleSyncEvent);
    
    return () => {
      window.removeEventListener('bpv-data-synced', handleSyncEvent);
    };
  }, [endpoint, fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Re-fetch when coming back online
  useEffect(() => {
    if (isOnline) {
      fetchData();
    }
  }, [isOnline, fetchData]);

  return {
    data,
    isLoading,
    error,
    isSaving,
    isOffline: !isOnline,
    fetchData,
    saveData,
    // Helper methods for common operations
    create: (data: any) => saveData('POST', data),
    update: (data: any, id?: string) => 
      saveData('PUT', data, id ? `${endpoint}/${id}` : undefined),
    remove: (id: string) => saveData('DELETE', undefined, `${endpoint}/${id}`)
  };
}

export default useOfflineData;
