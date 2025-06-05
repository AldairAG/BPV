import type { VentaMonitoreoResponse, VentaRequest, VentaType } from '../types/VentaTypes';
import { apiClient } from './apiClient';

const BASE_URL = '/ventas';

/**
 * Servicio para gestionar las operaciones relacionadas con ventas
 */
export const VentaService = {
  /**
   * Crea una nueva venta
   * @param ventaRequest Datos de la venta a crear
   * @returns La venta creada con su ID asignado
   */
  crearVenta: async (ventaRequest: VentaRequest): Promise<VentaType> => {
    const response = await apiClient.post<VentaType>(BASE_URL, ventaRequest);
    return response.data;
  },

  /**
   * Obtiene una venta por su ID
   * @param id ID de la venta a buscar
   * @returns La venta encontrada
   */
  getVentaById: async (id: number): Promise<VentaType> => {
    const response = await apiClient.get<VentaType>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Obtiene todas las ventas realizadas por un usuario específico
   * @param usuarioId ID del usuario
   * @returns Lista de ventas del usuario
   */
  getVentasByUsuario: async (usuarioId: number): Promise<VentaType[]> => {
    const response = await apiClient.get<VentaType[]>(`${BASE_URL}/usuario/${usuarioId}`);
    return response.data;
  },

  /**
   * Obtiene todas las ventas realizadas en una fecha específica
   * @param fecha Fecha en formato 'YYYY-MM-DD'
   * @returns Lista de ventas de la fecha
   */
  getVentasByFecha: async (fecha: string): Promise<VentaType[]> => {
    const response = await apiClient.get<VentaType[]>(`${BASE_URL}/fecha`, {
      params: { fecha }
    });
    return response.data;
  },

  /**
   * Obtiene todas las ventas realizadas entre un rango de fechas
   * @param fechaInicio Fecha de inicio en formato 'YYYY-MM-DD'
   * @param fechaFin Fecha de fin en formato 'YYYY-MM-DD'
   * @returns Lista de ventas en el rango de fechas
   */
  getVentasByRangoDeFechas: async (fechaInicio: string, fechaFin: string): Promise<VentaType[]> => {
    const response = await apiClient.get<VentaType[]>(`${BASE_URL}/rango`, {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  /**
   * Obtiene todas las ventas realizadas entre un rango de fechas
   * @param fechaInicio Fecha de inicio en formato 'YYYY-MM-DD'
   * @param fechaFin Fecha de fin en formato 'YYYY-MM-DD'
   * @returns Lista de ventas en el rango de fechas
   */
  getVentasByRangoDeFechasParaMonitoreo: async (fechaInicio: string, fechaFin: string): Promise<VentaMonitoreoResponse[]> => {
    const response = await apiClient.get<VentaMonitoreoResponse[]>(`${BASE_URL}/rango-monitoreo`, {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  /**
   * Calcula el monto total de ventas realizadas en un rango de fechas
   * @param fechaInicio Fecha de inicio en formato 'YYYY-MM-DD'
   * @param fechaFin Fecha de fin en formato 'YYYY-MM-DD'
   * @returns Monto total de ventas
   */
  calcularTotalVentas: async (fechaInicio: string, fechaFin: string): Promise<number> => {
    const response = await apiClient.get<number>(`${BASE_URL}/total`, {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  /**
   * Anula una venta existente
   * @param id ID de la venta a anular
   */
  anularVenta: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Busca ventas que coincidan con el criterio especificado
   * @param criterio Criterio de búsqueda
   * @returns Lista de ventas que coinciden con el criterio
   */
  buscarVentas: async (criterio: string): Promise<VentaType[]> => {
    const response = await apiClient.get<VentaType[]>(`${BASE_URL}/buscar`, {
      params: { criterio }
    });
    return response.data;
  },

  /**
   * Obtiene el total de ventas del día actual
   * @returns Monto total de ventas del día
   */
  getVentasHoy: async (): Promise<number> => {
    const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const response = await apiClient.get<number>(`${BASE_URL}/total`, {
      params: { fechaInicio: hoy, fechaFin: hoy }
    });
    return response.data;
  },

  /**
   * Obtiene el total de ventas de la semana actual
   * @returns Monto total de ventas de la semana
   */
  getVentasSemana: async (): Promise<number> => {
    // Calcular el inicio de la semana (lunes)
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
    
    const fechaInicio = inicioSemana.toISOString().split('T')[0];
    const fechaFin = hoy.toISOString().split('T')[0];
    
    const response = await apiClient.get<number>(`${BASE_URL}/total`, {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  /**
   * Obtiene el total de ventas del mes actual
   * @returns Monto total de ventas del mes
   */
  getVentasMes: async (): Promise<number> => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    const fechaInicio = inicioMes.toISOString().split('T')[0];
    const fechaFin = hoy.toISOString().split('T')[0];
    
    const response = await apiClient.get<number>(`${BASE_URL}/total`, {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  /**
   * Descarga un reporte de ventas en formato PDF o Excel
   * @param fechaInicio Fecha de inicio en formato 'YYYY-MM-DD'
   * @param fechaFin Fecha de fin en formato 'YYYY-MM-DD'
   * @param formato Formato del reporte ('pdf' o 'excel')
   * @returns Blob con el archivo de reporte
   */
  descargarReporte: async (fechaInicio: string, fechaFin: string, formato: 'pdf' | 'excel'): Promise<Blob> => {
    const response = await apiClient.get(`${BASE_URL}/reporte`, {
      params: { fechaInicio, fechaFin, formato },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default VentaService;