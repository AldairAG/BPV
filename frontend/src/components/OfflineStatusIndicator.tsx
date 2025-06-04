import React, { useState, useEffect } from 'react';
import { useConnectionStatus } from '../service/ConnectionService';
import SyncService from '../service/SyncService';
import IndexedDBService from '../service/IndexedDBService';

interface OfflineStatusProps {
  position?: 'top' | 'bottom';
  showSyncButton?: boolean;
}

const OfflineStatusIndicator: React.FC<OfflineStatusProps> = ({
  position = 'top',
  showSyncButton = true
}) => {  const isOnline = useConnectionStatus();
  const [pendingChanges, setPendingChanges] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  // Style based on position
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    left: '0',
    right: '0',
    padding: '8px 16px',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.3s ease-in-out',
    backgroundColor: isOnline ? '#4caf50' : '#f44336',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    ...(position === 'top' 
      ? { top: 0, transform: showNotification ? 'translateY(0)' : 'translateY(-100%)' }
      : { bottom: 0, transform: showNotification ? 'translateY(0)' : 'translateY(100%)' })
  };

  const buttonStyle: React.CSSProperties = {
    marginLeft: '10px',
    backgroundColor: 'white',
    color: isOnline ? '#4caf50' : '#f44336',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const badgeStyle: React.CSSProperties = {
    marginLeft: '10px',
    backgroundColor: 'white',
    color: '#f44336',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '12px',
    fontWeight: 'bold',
  };

  // Get pending changes count
  const updatePendingChanges = async () => {
    try {
      const pendingRequests = await IndexedDBService.getInstance().getPendingRequests();
      setPendingChanges(pendingRequests.length);
      
      // Show notification if there are pending changes or if offline
      setShowNotification(pendingRequests.length > 0 || !isOnline);
    } catch (error) {
      console.error('Error getting pending changes:', error);
    }
  };

  // Handle sync button click
  const handleSync = () => {
    if (isOnline && pendingChanges > 0) {
      setIsSyncing(true);
      SyncService.getInstance().manualSync();
      setTimeout(() => {
        setIsSyncing(false);
        updatePendingChanges();
      }, 2000); // This is a simple approach - ideally you'd listen for sync completion
    }
  };

  // Update pending changes when online status changes
  useEffect(() => {
    updatePendingChanges();
    
    // Also set up event listener for custom sync events
    const handleSyncEvent = () => {
      updatePendingChanges();
    };
    
    window.addEventListener('bpv-data-synced', handleSyncEvent);
    
    // Periodic updates
    const interval = setInterval(updatePendingChanges, 5000);
    
    return () => {
      window.removeEventListener('bpv-data-synced', handleSyncEvent);
      clearInterval(interval);
    };
  }, [isOnline]);

  // When status changes to online, auto-hide after a delay if no pending changes
  useEffect(() => {
    let timer: number;
    
    if (isOnline && pendingChanges === 0) {
      timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOnline, pendingChanges]);

  return (
    <div style={containerStyle}>
      <span>
        {isOnline 
          ? pendingChanges > 0 
            ? 'Conectado - Cambios pendientes de sincronización' 
            : 'Conectado'
          : 'Sin conexión - Los cambios se guardarán localmente'}
      </span>
      
      {pendingChanges > 0 && (
        <span style={badgeStyle}>{pendingChanges}</span>
      )}
      
      {showSyncButton && isOnline && pendingChanges > 0 && (
        <button 
          style={buttonStyle} 
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
        </button>
      )}
    </div>
  );
};

export default OfflineStatusIndicator;
