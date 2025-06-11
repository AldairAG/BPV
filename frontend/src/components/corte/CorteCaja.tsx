import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import VentaService from '../../service/VentaService';
import type { VentaMonitoreoResponse } from '../../types/VentaTypes';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';
import useUser from '../../hooks/useUser';
import { Eye } from 'lucide-react';

interface CorteCajaProps {
  onClose: () => void;
}

const CorteCaja = ({ onClose }: CorteCajaProps) => {
  const { user } = useUser();
  const [ventas, setVentas] = useState<VentaMonitoreoResponse[]>([]);
  const [ventasFiltradas, setVentasFiltradas] = useState<VentaMonitoreoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendedores, setVendedores] = useState<{ id: number, nombre: string }[]>([]);
  const [filtroVendedores, setFiltroVendedores] = useState<number[]>([]);
  /* const [imprimiendo, setImprimiendo] = useState(false);
   */
  // Fecha actual para el corte
  const fechaHoy = format(new Date(), 'yyyy-MM-dd');
  const fechaFormateada = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

  // Cargar ventas del día
  useEffect(() => {
    const cargarVentas = async () => {
      setLoading(true);
      try {
        const response = await VentaService.getVentasByRangoDeFechasParaMonitoreo(fechaHoy, fechaHoy);

        // Filtrar ventas por la sucursal del usuario actual
        let ventasFiltradas = response;
        if (user?.sucursal) {
          ventasFiltradas = response.filter(venta =>
            venta.venta.sucursal === user.sucursal
          );
        }

        setVentas(ventasFiltradas);
        setVentasFiltradas(ventasFiltradas);

        // Extraer vendedores únicos
        const vendedoresMap = new Map();
        ventasFiltradas.forEach(venta => {
          if (venta.usuario && venta.usuario.id) {
            vendedoresMap.set(venta.usuario.id, {
              id: venta.usuario.id,
              nombre: venta.usuario.nombre || 'Usuario desconocido'
            });
          }
        });
        setVendedores(Array.from(vendedoresMap.values()));

      } catch (error) {
        console.error('Error al cargar ventas del día:', error);
        toast.error('No se pudieron cargar las ventas del día');
      } finally {
        setLoading(false);
      }
    };

    cargarVentas();
  }, [fechaHoy, user]);

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...ventas];
    if (filtroVendedores.length > 0) {
      resultado = resultado.filter(venta =>
        venta.usuario && venta.usuario.id != null && filtroVendedores.includes(venta.usuario.id)
      );
    }
    setVentasFiltradas(resultado);
  }, [ventas, filtroVendedores]);

  // Calcular totales
  const calcularTotalVentas = () => {
    const fuente = filtroVendedores.length === 0 ? ventas : ventasFiltradas;
    return fuente.reduce((total, venta) => {
      // Solo sumar ventas no anuladas
      if (!venta.venta.anulada) {
        return total + venta.venta.total;
      }
      return total;
    }, 0);
  };

  const calcularNumeroVentas = () => {
    const fuente = filtroVendedores.length === 0 ? ventas : ventasFiltradas;
    return fuente.filter(venta => !venta.venta.anulada).length;
  };

  const calcularVentasAnuladas = () => {
    const fuente = filtroVendedores.length === 0 ? ventas : ventasFiltradas;
    return fuente.filter(venta => venta.venta.anulada).length;
  };

  const formatearDinero = (cantidad: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad);
  };

  return (
    <div className="text-gray-900 dark:text-gray-100">



      <div className="mb-6">
        <h3 className="text-lg font-medium">Corte de Caja - {fechaFormateada}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Resumen de ventas en {user?.sucursal || 'tu sucursal'}
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-5">
        <div>
          <label className="block text-sm font-medium mb-1">
            Vendedor
          </label>
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700"
              value={filtroVendedores.length > 0 ? filtroVendedores[0] : ''}
              onChange={(e) => {
                const value = e.target.value;
                setFiltroVendedores(value ? [Number(value)] : []);
              }}
            >
              <option value="">Todos los vendedores</option>
              {vendedores.map((vendedor) => (
                <option key={vendedor.id} value={vendedor.id}>
                  {vendedor.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen de ventas */}
      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="w-10 h-10 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total de ventas</div>
              <div className="mt-1 text-2xl font-semibold">{formatearDinero(calcularTotalVentas())}</div>
            </div>

            <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Ventas realizadas</div>
              <div className="mt-1 text-2xl font-semibold">{calcularNumeroVentas()}</div>
            </div>

            <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Ventas anuladas</div>
              <div className="mt-1 text-2xl font-semibold">{calcularVentasAnuladas()}</div>
            </div>
          </div>

          {/* Lista de ventas */}
          <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium">Detalle de ventas</h3>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {ventasFiltradas.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Hora
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Vendedor
                      </th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {ventasFiltradas
                      .slice()
                      .sort((a, b) => b.venta.ventaId - a.venta.ventaId) // Ordena por ID descendente
                      .map((venta) => (
                        <tr key={venta.venta.ventaId} className={venta.venta.anulada ? 'text-gray-400 dark:text-gray-500' : ''}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            #{venta.venta.ventaId}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {venta.venta.hora}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {venta.usuario?.nombre || 'Desconocido'}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                            {venta.venta.anulada ? (
                              <span className="line-through">{formatearDinero(venta.venta.total)}</span>
                            ) : (
                              formatearDinero(venta.venta.total)
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-center">
                            {venta.venta.anulada ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Anulada
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Completada
                              </span>
                            )}
                          </td>
                          <td>
                            <button>
                              <Eye className='w-5 h-5 text-white' />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                  No hay ventas registradas para el día de hoy
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 mt-6">
        {/*         <Button 
          onClick={imprimirCorte}
          disabled={imprimiendo}
          className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 inline-flex items-center gap-1.5"
        >
          {imprimiendo ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Imprimiendo...
            </>
          ) : (
            <>
              <PrinterIcon className="h-4 w-4" />
              Imprimir Corte
            </>
          )}
        </Button>
        
        <Button 
          onClick={exportarExcel}
          className="bg-green-600 hover:bg-green-700 focus:ring-green-500 inline-flex items-center gap-1.5"
        >
          <ArrowDownCircleIcon className="h-4 w-4" />
          Exportar Excel
        </Button> */}

        <Button
          onClick={onClose}
          className="bg-gray-600 hover:bg-gray-700 focus:ring-gray-500"
        >
          Cerrar
        </Button>
      </div>

      {/* Información del usuario */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
        Corte generado por: {user?.nombre || 'Usuario del sistema'} • {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
      </div>
    </div>
  );
};

export default CorteCaja;