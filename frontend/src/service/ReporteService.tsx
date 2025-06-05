import { apiClient } from './apiClient';
import type { ProductoType } from '../types/ProductoType';
import type { UsuarioType } from '../types/UsuarioType';

/**
 * Interfaces para los tipos de respuestas de reportes
 */
export interface ProductoVenta {
  producto: ProductoType;
  cantidad: number;
}

export interface UsuarioVenta {
  usuario: UsuarioType;
  total: number;
}

export interface CategoriaVenta {
  categoria: string;
  total: number;
}

export interface VentaDiaria {
  fecha: string;
  total: number;
}

export interface VentaMensual {
  mes: number;
  total: number;
}

export interface ProductoStock {
  producto: ProductoType;
  porcentajeStock: number;
}

const BASE_URL = '/reportes';

/**
 * Servicio para obtener reportes y estadísticas del sistema
 */
const ReporteService = {
  /**
   * Obtiene los productos más vendidos en un período de tiempo
   * @param fechaInicio Fecha de inicio en formato 'YYYY-MM-DD'
   * @param fechaFin Fecha de fin en formato 'YYYY-MM-DD'
   * @param limite Límite de resultados a mostrar (por defecto 10)
   * @returns Lista de productos con su cantidad vendida
   */
  getProductosMasVendidos: async (
    fechaInicio: string,
    fechaFin: string,
    limite: number = 10
  ): Promise<ProductoVenta[]> => {
    const response = await apiClient.get(`${BASE_URL}/productos-mas-vendidos`, {
      params: { fechaInicio, fechaFin, limite }
    });

    // Transformar el objeto de respuesta a un array de objetos ProductoVenta
    return response.data
  },

  /**
   * Obtiene las ventas realizadas por cada usuario en un período de tiempo
   * @param fechaInicio Fecha de inicio en formato 'YYYY-MM-DD'
   * @param fechaFin Fecha de fin en formato 'YYYY-MM-DD'
   * @returns Lista de usuarios con el total vendido
   */
  getVentasPorUsuario: async (
    fechaInicio: string,
    fechaFin: string
  ): Promise<UsuarioVenta[]> => {
    const response = await apiClient.get(`${BASE_URL}/ventas-por-usuario`, {
      params: { fechaInicio, fechaFin }
    });

    // Transformar el objeto de respuesta a un array de objetos UsuarioVenta
    return response.data
  },

  /**
   * Obtiene las ventas agrupadas por categoría de producto en un período de tiempo
   * @param fechaInicio Fecha de inicio en formato 'YYYY-MM-DD'
   * @param fechaFin Fecha de fin en formato 'YYYY-MM-DD'
   * @returns Lista de categorías con el total vendido
   */
  getVentasPorCategoria: async (
    fechaInicio: string,
    fechaFin: string
  ): Promise<CategoriaVenta[]> => {
    const response = await apiClient.get(`${BASE_URL}/ventas-por-categoria`, {
      params: { fechaInicio, fechaFin }
    });

    // Transformar el objeto de respuesta a un array de objetos CategoriaVenta
    return response.data
  },

  /**
   * Obtiene las ventas agrupadas por día en un período de tiempo
   * @param fechaInicio Fecha de inicio en formato 'YYYY-MM-DD'
   * @param fechaFin Fecha de fin en formato 'YYYY-MM-DD'
   * @returns Lista de días con el total vendido
   */
  getVentasDiarias: async (
    fechaInicio: string,
    fechaFin: string
  ): Promise<VentaDiaria[]> => {
    const response = await apiClient.get(`${BASE_URL}/ventas-diarias`, {
      params: { fechaInicio, fechaFin }
    });

    // Transformar el objeto de respuesta a un array de objetos VentaDiaria
    return response.data
  },

  /**
   * Obtiene las ventas mensuales para un año específico
   * @param año Año para el reporte (ej: 2023)
   * @returns Lista de meses con el total vendido
   */
  getVentasMensuales: async (año: number): Promise<VentaMensual[]> => {
    const response = await apiClient.get(`${BASE_URL}/ventas-mensuales`, {
      params: { año }
    });

    // Transformar el objeto de respuesta a un array de objetos VentaMensual
    return response.data
  },

  /**
   * Calcula el ingreso total por ventas en un período específico
   * @param fechaInicio Fecha de inicio en formato 'YYYY-MM-DD'
   * @param fechaFin Fecha de fin en formato 'YYYY-MM-DD'
   * @returns Total de ingresos en el período
   */
  calcularIngresoTotal: async (
    fechaInicio: string,
    fechaFin: string
  ): Promise<number> => {
    const response = await apiClient.get(`${BASE_URL}/ingreso-total`, {
      params: { fechaInicio, fechaFin }
    });
    return parseFloat(response.data);
  },

  /**
   * Obtiene una lista de productos con stock por debajo del mínimo configurado
   * @returns Lista de productos con su porcentaje de stock respecto al mínimo
   */
  getProductosBajoStock: async (): Promise<ProductoStock[]> => {
    const response = await apiClient.get(`${BASE_URL}/productos-bajo-stock`);
    // Transformar el objeto de respuesta a un array de objetos ProductoStock
    return response.data
  },

  /**
   * Método auxiliar para obtener las ventas de los últimos 7 días
   * @returns Lista de días con el total vendido
   */
  getVentasUltimaSemana: async (): Promise<VentaDiaria[]> => {
    const hoy = new Date();
    const fechaFin = hoy.toISOString().split('T')[0];
    
    const fechaInicio = new Date();
    fechaInicio.setDate(hoy.getDate() - 6); // 7 días incluyendo hoy
    const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
    
    return ReporteService.getVentasDiarias(fechaInicioStr, fechaFin);
  },

  /**
   * Método auxiliar para obtener las ventas del mes actual
   * @returns Lista de días con el total vendido en el mes actual
   */
  getVentasMesActual: async (): Promise<VentaDiaria[]> => {
    const hoy = new Date();
    const fechaFin = hoy.toISOString().split('T')[0];
    
    const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const fechaInicioStr = fechaInicio.toISOString().split('T')[0];

    return ReporteService.getVentasDiarias(fechaInicioStr, fechaFin);
  },

  /**
   * Método auxiliar para obtener las ventas del año actual
   * @returns Lista de meses con el total vendido en el año actual
   */
  getVentasAñoActual: async (): Promise<VentaMensual[]> => {
    const año = new Date().getFullYear();
    return ReporteService.getVentasMensuales(año);
  },

  /**
   * Método auxiliar para obtener el total de ventas de hoy
   * @returns Total de ventas del día actual
   */
  getVentasHoy: async (): Promise<number> => {
    const hoy = new Date().toISOString().split('T')[0];
    return ReporteService.calcularIngresoTotal(hoy, hoy);
  },

  /**
   * Método auxiliar para obtener el total de ventas de la semana actual
   * @returns Total de ventas de la semana actual
   */
  getVentasSemanaActual: async (): Promise<number> => {
    const hoy = new Date();
    const fechaFin = hoy.toISOString().split('T')[0];
    
    const fechaInicio = new Date();
    fechaInicio.setDate(hoy.getDate() - 6); // 7 días incluyendo hoy
    const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
    
    return ReporteService.calcularIngresoTotal(fechaInicioStr, fechaFin);
  },

  /**
   * Método auxiliar para obtener el total de ventas del mes actual
   * @returns Total de ventas del mes actual
   */
  getVentasMesActualTotal: async (): Promise<number> => {
    const hoy = new Date();
    const fechaFin = hoy.toISOString().split('T')[0];
    
    const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
    
    return ReporteService.calcularIngresoTotal(fechaInicioStr, fechaFin);
  },

  /**
   * Descarga un reporte en formato PDF o Excel
   * @param tipoReporte Tipo de reporte a descargar ('ventas', 'productos', 'stock')
   * @param fechaInicio Fecha de inicio en formato 'YYYY-MM-DD'
   * @param fechaFin Fecha de fin en formato 'YYYY-MM-DD'
   * @param formato Formato del reporte ('pdf' o 'excel')
   * @returns Blob con el archivo de reporte
   */
  descargarReporte: async (
    tipoReporte: 'ventas' | 'productos' | 'stock',
    fechaInicio: string,
    fechaFin: string,
    formato: 'pdf' | 'excel'
  ): Promise<Blob> => {
    const response = await apiClient.get(`${BASE_URL}/descargar-reporte`, {
      params: { tipoReporte, fechaInicio, fechaFin, formato },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default ReporteService;