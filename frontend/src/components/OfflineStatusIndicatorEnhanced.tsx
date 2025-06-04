import React, { useState, useEffect } from 'react';
import { useConnectionStatus } from '../service/ConnectionService';
import SyncService from '../service/SyncService';
import IndexedDBService from '../service/IndexedDBService';
import OfflineVentaService from '../service/OfflineVentaService';
import OfflineProductoService from '../service/OfflineProductoService';

interface OfflineStatusProps {
  position?: 'top' | 'bottom';
  showSyncButton?: boolean;
}

const OfflineStatusIndicatorEnhanced: React.FC<OfflineStatusProps> = ({
  position = 'top',
  showSyncButton = true
}) => {
  const isOnline = useConnectionStatus();
  const [pendingChanges, setPendingChanges] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [ventasPendientes, setVentasPendientes] = useState<{cantidad: number, total: number}>({cantidad: 0, total: 0});
  const [productosPendientes, setProductosPendientes] = useState<{total: number, creates: number, updates: number, deletes: number}>({total: 0, creates: 0, updates: 0, deletes: 0});
  const [showDetails, setShowDetails] = useState<boolean>(false);

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

  const detailsContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: position === 'top' ? '40px' : 'auto',
    bottom: position === 'bottom' ? '40px' : 'auto',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'white',
    color: '#333',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    zIndex: 999,
    minWidth: '300px',
    display: showDetails ? 'block' : 'none'
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

  const infoButtonStyle: React.CSSProperties = {
    marginLeft: '5px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    color: 'white',
    border: 'none',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // Get pending changes count and details
  const updatePendingChanges = async () => {
    try {
      // Get general pending requests
      const pendingRequests = await IndexedDBService.getInstance().getPendingRequests();
      setPendingChanges(pendingRequests.length);
      
      // Get ventas específicas pendientes
      try {
        const ventasService = OfflineVentaService.getInstance();
        const ventasPendientesArr = await ventasService.getVentasPendientes();
        const cantidad = ventasPendientesArr.length;
        const total = ventasPendientesArr.reduce((acc, venta) => acc + (venta.total || 0), 0);
        setVentasPendientes({
          cantidad,
          total
        });
      } catch (error) {
        console.error('Error al obtener ventas pendientes:', error);
      }
      
      // Get productos con cambios pendientes
      try {
        const productosService = OfflineProductoService.getInstance();
        const resumenProductos = await productosService.getResumenCambiosPendientes();
        setProductosPendientes({
          total: resumenProductos.total,
          creates: resumenProductos.creates,
          updates: resumenProductos.updates,
          deletes: resumenProductos.deletes
        });
      } catch (error) {
        console.error('Error al obtener cambios en productos:', error);
      }
      
      // Show notification if there are pending changes or if offline
      setShowNotification(pendingRequests.length > 0 || !isOnline);
    } catch (error) {
      console.error('Error getting pending changes:', error);
    }
  };

  // Toggle details panel
  const toggleDetails = () => {
    setShowDetails(!showDetails);
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

  // Formateador de moneda
  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <>
      <div style={containerStyle}>
        <span>
          {isOnline 
            ? pendingChanges > 0 
              ? 'Conectado - Cambios pendientes de sincronización' 
              : 'Conectado'
            : 'Sin conexión - Los cambios se guardarán localmente'}
        </span>
        
        {pendingChanges > 0 && (
          <>
            <span style={badgeStyle}>{pendingChanges}</span>
            <button 
              style={infoButtonStyle} 
              onClick={toggleDetails}
              title="Ver detalles"
            >
              i
            </button>
          </>
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

      {/* Panel de detalles */}
      <div style={detailsContainerStyle}>
        <h3 style={{margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>
          Operaciones pendientes
        </h3>
        
        {ventasPendientes.cantidad > 0 && (
          <div style={{marginBottom: '10px'}}>
            <h4 style={{margin: '0 0 5px 0', fontSize: '14px'}}>Ventas pendientes:</h4>
            <div style={{fontSize: '13px', padding: '5px', backgroundColor: '#f9f9f9', borderRadius: '4px'}}>
              <div>Cantidad: <strong>{ventasPendientes.cantidad}</strong></div>
              <div>Total: <strong>{formatMoney(ventasPendientes.total)}</strong></div>
            </div>
          </div>
        )}
        
        {productosPendientes.total > 0 && (
          <div style={{marginBottom: '10px'}}>
            <h4 style={{margin: '0 0 5px 0', fontSize: '14px'}}>Cambios en productos:</h4>
            <div style={{fontSize: '13px', padding: '5px', backgroundColor: '#f9f9f9', borderRadius: '4px'}}>
              {productosPendientes.creates > 0 && (
                <div>Nuevos: <strong>{productosPendientes.creates}</strong></div>
              )}
              {productosPendientes.updates > 0 && (
                <div>Actualizados: <strong>{productosPendientes.updates}</strong></div>
              )}
              {productosPendientes.deletes > 0 && (
                <div>Eliminados: <strong>{productosPendientes.deletes}</strong></div>
              )}
            </div>
          </div>
        )}
        
        {isOnline && pendingChanges > 0 && (
          <button 
            onClick={handleSync}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
              marginTop: '10px'
            }}
            disabled={isSyncing}
          >
            {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
          </button>
        )}
        
        <button 
          onClick={toggleDetails}
          style={{
            backgroundColor: '#f0f0f0',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
            marginTop: '5px'
          }}
        >
          Cerrar
        </button>
      </div>
    </>
  );
};

export default OfflineStatusIndicatorEnhanced;
