/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import ReporteService, {
  type ProductoVenta,
  type UsuarioVenta,
  type CategoriaVenta,
  type VentaDiaria,
  type VentaMensual,
  type ProductoStock
} from '../service/ReporteService';

/**
 * Hook personalizado para acceder a los reportes del sistema
 */
const useReportes = () => {
  // Estados para los diferentes tipos de datos
  const [productosMasVendidos, setProductosMasVendidos] = useState<ProductoVenta[]>([]);
  const [ventasPorUsuario, setVentasPorUsuario] = useState<UsuarioVenta[]>([]);
  const [ventasPorCategoria, setVentasPorCategoria] = useState<CategoriaVenta[]>([]);
  const [ventasDiarias, setVentasDiarias] = useState<VentaDiaria[]>([]);
  const [ventasMensuales, setVentasMensuales] = useState<VentaMensual[]>([]);
  const [productosBajoStock, setProductosBajoStock] = useState<ProductoStock[]>([]);
  const [ingresoTotal, setIngresoTotal] = useState<number>(0);

  // Estado para manejar carga y errores
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar productos más vendidos
   */
  const cargarProductosMasVendidos = useCallback(async (
    fechaInicio: string,
    fechaFin: string,
    limite: number = 10
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReporteService.getProductosMasVendidos(fechaInicio, fechaFin, limite);

      setProductosMasVendidos(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos más vendidos');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar ventas por usuario
   */
  const cargarVentasPorUsuario = useCallback(async (
    fechaInicio: string,
    fechaFin: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReporteService.getVentasPorUsuario(fechaInicio, fechaFin);
      setVentasPorUsuario(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al cargar ventas por usuario');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar ventas por categoría
   */
  const cargarVentasPorCategoria = useCallback(async (
    fechaInicio: string,
    fechaFin: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReporteService.getVentasPorCategoria(fechaInicio, fechaFin);
      setVentasPorCategoria(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al cargar ventas por categoría');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar ventas diarias
   */
  const cargarVentasDiarias = useCallback(async (
    fechaInicio: string,
    fechaFin: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReporteService.getVentasDiarias(fechaInicio, fechaFin);
      setVentasDiarias(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al cargar ventas diarias');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar ventas mensuales
   */
  const cargarVentasMensuales = useCallback(async (año: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReporteService.getVentasMensuales(año);
      setVentasMensuales(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al cargar ventas mensuales');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar productos con bajo stock
   */
  const cargarProductosBajoStock = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReporteService.getProductosBajoStock();
      setProductosBajoStock(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos con bajo stock');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calcular ingreso total
   */
  const calcularIngresoTotal = useCallback(async (
    fechaInicio: string,
    fechaFin: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const total = await ReporteService.calcularIngresoTotal(fechaInicio, fechaFin);
      setIngresoTotal(total);
      return total;
    } catch (err: any) {
      setError(err.message || 'Error al calcular ingreso total');
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar dashboard con indicadores principales (combinación de múltiples reportes)
   */
  const cargarDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Ejecutar todas las solicitudes en paralelo
      const [
        ventasHoy,
        ventasSemana,
        ventasMes,
        productosBajo,
        ventasUltimaSemana,
        ventasMesActual,
        ventasAnuales,
        productosMasVendidos
      ] = await Promise.all([
        ReporteService.getVentasHoy(),
        ReporteService.getVentasSemanaActual(),
        ReporteService.getVentasMesActualTotal(),
        ReporteService.getProductosBajoStock(),
        ReporteService.getVentasUltimaSemana(),
        ReporteService.getVentasMesActual(),
        ReporteService.getVentasAñoActual(),
        ReporteService.getProductosMasVendidos('1970-01-01', '2100-12-31', 10) // Todos los tiempos
      ]);
      // Actualizar todos los estados
      setIngresoTotal(ventasHoy);
      setProductosBajoStock(productosBajo);
      setVentasDiarias(ventasUltimaSemana);
      setVentasMensuales(ventasAnuales);
      setProductosMasVendidos(productosMasVendidos);
      
      // Devolver los datos como un objeto para facilitar su uso
      return {
        ventasHoy,
        ventasSemana,
        ventasMes,
        productosBajo,
        ventasUltimaSemana,
        ventasMesActual,
        ventasAnuales
      };
    } catch (err: any) {
      setError('Error al cargar dashboard');
      console.log('Error al cargar dashboard:', err);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Descargar reporte
   */
  const descargarReporte = useCallback(async (
    tipoReporte: 'ventas' | 'productos' | 'stock',
    fechaInicio: string,
    fechaFin: string,
    formato: 'pdf' | 'excel'
  ) => {
    try {
      setLoading(true);
      setError(null);

      const blob = await ReporteService.descargarReporte(
        tipoReporte,
        fechaInicio,
        fechaFin,
        formato
      );

      // Crear URL para el blob y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${tipoReporte}_${fechaInicio}_${fechaFin}.${formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      return true;
    } catch (err: any) {
      setError(err.message || 'Error al descargar reporte');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Estados
    productosMasVendidos,
    ventasPorUsuario,
    ventasPorCategoria,
    ventasDiarias,
    ventasMensuales,
    productosBajoStock,
    ingresoTotal,
    loading,
    error,

    // Métodos para cargar datos
    cargarProductosMasVendidos,
    cargarVentasPorUsuario,
    cargarVentasPorCategoria,
    cargarVentasDiarias,
    cargarVentasMensuales,
    cargarProductosBajoStock,
    calcularIngresoTotal,
    cargarDashboard,
    descargarReporte,
  };
};

export default useReportes;