import { useState, useEffect } from 'react';

/**
 * Hook para detectar el estado de conexión a internet
 * @returns Estado de la conexión a internet
 */
export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Clase para manejar el estado de la conexión a internet
 */
class ConnectionService {
  private static isOnline: boolean = navigator.onLine;
  private static listeners: Array<(isOnline: boolean) => void> = [];

  /**
   * Inicializa el servicio de conexión
   */
  static init() {
    window.addEventListener('online', () => {
      ConnectionService.isOnline = true;
      ConnectionService.notifyListeners();
    });
    
    window.addEventListener('offline', () => {
      ConnectionService.isOnline = false;
      ConnectionService.notifyListeners();
    });
  }

  /**
   * Retorna el estado actual de la conexión
   */
  static getStatus(): boolean {
    return ConnectionService.isOnline;
  }

  /**
   * Registra un listener para cambios en el estado de conexión
   * @param listener Función a llamar cuando cambie el estado
   */
  static addListener(listener: (isOnline: boolean) => void) {
    ConnectionService.listeners.push(listener);
    return () => {
      ConnectionService.listeners = ConnectionService.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notifica a todos los listeners sobre un cambio en el estado
   */
  private static notifyListeners() {
    ConnectionService.listeners.forEach(listener => {
      listener(ConnectionService.isOnline);
    });
  }
}

// Inicializar el servicio
ConnectionService.init();

export default ConnectionService;
