import { useState, useEffect, useCallback } from 'react';
import OfflineVentaService from '../service/OfflineVentaService';
import { useConnectionStatus } from '../service/ConnectionService';
import { type VentaType } from '../types/VentaTypes';

/**
 * Hook para manejar ventas con soporte offline
 */
export function useOfflineVentas() {
  const isOnline = useConnectionStatus();
  const [ventasPendientes, setVentasPendientes] = useState<VentaType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [resumen, setResumen] = useState<{cantidad: number, total: number}>({cantidad: 0, total: 0});
  
  const ventaService = OfflineVentaService.getInstance();
  
  // Cargar ventas pendientes
  const cargarVentasPendientes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const ventas = await ventaService.getVentasPendientes();
      setVentasPendientes(ventas);

      // Calcular resumen localmente
      const cantidad = ventas.length;
      const total = ventas.reduce((acc, venta) => acc + (venta.total || 0), 0);
      setResumen({
        cantidad,
        total
      });
    } catch (err) {
      console.error('Error al cargar ventas pendientes:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [ventaService]);
  
  // Registrar una nueva venta con soporte offline
  const registrarVenta = useCallback(async (venta: VentaType) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const resultado = await ventaService.registrarVenta(venta);
      
      // Recargar la lista de ventas pendientes si estamos offline
      if (!isOnline) {
        await cargarVentasPendientes();
      }
      
      return resultado;
    } catch (err) {
      console.error('Error al registrar venta:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [isOnline, ventaService, cargarVentasPendientes]);
  
  // Eliminar una venta pendiente
  const eliminarVentaPendiente = useCallback(async (idTemporal: string) => {
    try {
      await ventaService.eliminarVentaPendiente(idTemporal);
      await cargarVentasPendientes();
    } catch (err) {
      console.error('Error al eliminar venta pendiente:', err);
      setError(err as Error);
      throw err;
    }
  }, [ventaService, cargarVentasPendientes]);
  
  // Verificar si hay ventas pendientes
  const hayVentasPendientes = useCallback(async () => {
    return await ventaService.hayVentasPendientes();
  }, [ventaService]);
  
  // Efecto para cargar ventas pendientes inicialmente y cuando cambia el estado de conexión
  useEffect(() => {
    cargarVentasPendientes();
    
    // También escuchar eventos de sincronización
    const handleSyncEvent = () => {
      cargarVentasPendientes();
    };
    
    window.addEventListener('bpv-data-synced', handleSyncEvent);
    
    return () => {
      window.removeEventListener('bpv-data-synced', handleSyncEvent);
    };
  }, [isOnline, cargarVentasPendientes]);
  
  return {
    isOnline,
    ventasPendientes,
    isLoading,
    isSaving,
    error,
    resumen,
    registrarVenta,
    eliminarVentaPendiente,
    hayVentasPendientes,
    cargarVentasPendientes
  };
}

export default useOfflineVentas;
