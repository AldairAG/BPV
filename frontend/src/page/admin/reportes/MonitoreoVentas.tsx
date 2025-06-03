import { useState, useEffect } from "react";
import { FileTextIcon, ArrowUpDownIcon, EyeIcon, SearchIcon, X, Printer } from "lucide-react";
import { Card, CardContent, CardHead, CardTittle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import VentaService from "../../../service/VentaService";
import PrinterService from "../../../service/PrinterService";
import { toast } from "react-hot-toast";
import type { VentaType } from "../../../types/VentaTypes";

interface MonitoreoVentasProps {
  fechaInicio: string;
  fechaFin: string;
}

const formatearPrecio = (valor: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(valor);
};

const MonitoreoVentas = ({ fechaInicio, fechaFin }: MonitoreoVentasProps) => {
  // Estados para el monitoreo de ventas
  const [ventas, setVentas] = useState<VentaType[]>([]);
  const [ventasFiltradas, setVentasFiltradas] = useState<VentaType[]>([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaType | null>(null);
  const [busquedaVenta, setBusquedaVenta] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'activas' | 'anuladas'>('todas');
  const [ordenVentas, setOrdenVentas] = useState<'recientes' | 'antiguas' | 'monto-alto' | 'monto-bajo'>('recientes');
  const [imprimiendo, setImprimiendo] = useState<boolean>(false);
  const [menuOrdenVisible, setMenuOrdenVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Cargar ventas al iniciar o cuando cambian las fechas
  useEffect(() => {
    cargarVentas();
  }, [fechaInicio, fechaFin]);

  // Función para cargar ventas
  const cargarVentas = async () => {
    setLoading(true);
    try {
      const response = await VentaService.getVentasByRangoDeFechas(fechaInicio, fechaFin);
      setVentas(response);
      aplicarFiltros(response);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      toast.error("Error al cargar datos de ventas");
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros a las ventas
  const aplicarFiltros = (ventasData: VentaType[] = ventas) => {
    let resultado = [...ventasData];

    // Filtrar por estado
    if (filtroEstado === 'activas') {
      resultado = resultado.filter(venta => !venta.anulada);
    } else if (filtroEstado === 'anuladas') {
      resultado = resultado.filter(venta => venta.anulada);
    }

    // Filtrar por búsqueda
    if (busquedaVenta.trim()) {
      const termino = busquedaVenta.toLowerCase();
      resultado = resultado.filter(venta =>
        venta.ventaId.toString().includes(termino) ||
        (venta.usuario?.nombre?.toLowerCase() || "").includes(termino) ||
        venta.total.toString().includes(termino)
      );
    }

    // Ordenar las ventas
    resultado = ordenarVentas(resultado, ordenVentas);

    setVentasFiltradas(resultado);
  };

  // Ordenar ventas según el criterio seleccionado
  const ordenarVentas = (ventasAOrdenar: VentaType[], criterio: string) => {
    const ventasOrdenadas = [...ventasAOrdenar];

    switch (criterio) {
      case 'recientes':
        ventasOrdenadas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        break;
      case 'antiguas':
        ventasOrdenadas.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        break;
      case 'monto-alto':
        ventasOrdenadas.sort((a, b) => b.total - a.total);
        break;
      case 'monto-bajo':
        ventasOrdenadas.sort((a, b) => a.total - b.total);
        break;
    }

    return ventasOrdenadas;
  };

  // Cambiar filtro de estado
  const cambiarFiltroEstado = (estado: 'todas' | 'activas' | 'anuladas') => {
    setFiltroEstado(estado);
    aplicarFiltros();
  };

  // Cambiar orden de ventas
  const cambiarOrden = (orden: 'recientes' | 'antiguas' | 'monto-alto' | 'monto-bajo') => {
    setOrdenVentas(orden);
    setMenuOrdenVisible(false);
    aplicarFiltros();
  };

  // Ver detalle de venta
  const verDetalleVenta = (venta: VentaType) => {
    setVentaSeleccionada(venta);
  };

  // Cerrar detalle de venta
  const cerrarDetalleVenta = () => {
    setVentaSeleccionada(null);
  };

  // Imprimir ticket de venta
  const imprimirTicket = async (venta: VentaType) => {
    if (!venta) return;

    setImprimiendo(true);

    try {
      // Preparar datos para impresión
      const ticketData = {
        ticketNumber: `${venta.ventaId}`,
        items: venta.productosVendidos.map(pv => ({
          producto: pv.producto,
          cantidad: pv.cantidad
        })),
        subtotal: venta.productosVendidos.reduce((total, pv) => total + pv.subtotal, 0),
        iva: venta.conIva ? (venta.total - venta.productosVendidos.reduce((total, pv) => total + pv.subtotal, 0)) : 0,
        total: venta.total,
        fecha: new Date(venta.fecha).toLocaleString(),
        vendedor: venta.usuario?.nombre || "Desconocido",
        conIva: venta.conIva,
        descuentos: venta.productosVendidos.reduce((acc, pv) => {
          if (pv.descuento) {
            acc[pv.producto.productoId] = pv.descuento;
          }
          return acc;
        }, {} as Record<number, number>)
      };

      const success = await PrinterService.printTicket(ticketData);

      if (success) {
        toast.success("Ticket impreso correctamente");
      } else {
        toast.error("Error al imprimir ticket");
      }
    } catch (error) {
      console.error("Error al imprimir ticket:", error);
      toast.error("Error al imprimir ticket");
    } finally {
      setImprimiendo(false);
    }
  };

  // Actualizar filtros cuando cambian los criterios
  useEffect(() => {
    aplicarFiltros();
  }, [busquedaVenta, filtroEstado, ordenVentas]);

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHead className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <CardTittle className="flex items-center">
          <FileTextIcon className="h-5 w-5 mr-2" />
          Monitoreo de Ventas
        </CardTittle>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
            <SearchIcon className="h-4 w-4 ml-3 text-gray-500" />
            <Input
              type="text"
              id="busquedaVenta"
              placeholder="Buscar venta..."
              className="border-0 focus:ring-0"
              value={busquedaVenta}
              onChange={(e) => setBusquedaVenta(e.target.value)}
            />
          </div>
          
          {/* Filtros de estado */}
          <div className="flex gap-2">
            <Button
              className={`text-xs py-1 px-2 ${filtroEstado === 'todas' ? 'bg-blue-600' : 'bg-gray-600'}`}
              onClick={() => cambiarFiltroEstado('todas')}
            >
              Todas
            </Button>
            <Button
              className={`text-xs py-1 px-2 ${filtroEstado === 'activas' ? 'bg-green-600' : 'bg-gray-600'}`}
              onClick={() => cambiarFiltroEstado('activas')}
            >
              Activas
            </Button>
            <Button
              className={`text-xs py-1 px-2 ${filtroEstado === 'anuladas' ? 'bg-red-600' : 'bg-gray-600'}`}
              onClick={() => cambiarFiltroEstado('anuladas')}
            >
              Anuladas
            </Button>
          </div>
          
          {/* Menú de ordenamiento con dropdown */}
          <div className="flex flex-col">
            <Button 
              className="text-xs w-full sm:w-auto flex items-center gap-1"
              onClick={() => setMenuOrdenVisible(!menuOrdenVisible)}
            >
              <ArrowUpDownIcon className="h-4 w-4" />
              Ordenar
            </Button>
            
            {menuOrdenVisible && (
              <div className="fixed mt-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-10 w-40">
                <div className="py-1">
                  <button 
                    className={`${ordenVentas === 'recientes' ? 'bg-gray-100 dark:bg-gray-700' : ''} w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
                    onClick={() => cambiarOrden('recientes')}
                  >
                    Más recientes
                  </button>
                  <button 
                    className={`${ordenVentas === 'antiguas' ? 'bg-gray-100 dark:bg-gray-700' : ''} w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
                    onClick={() => cambiarOrden('antiguas')}
                  >
                    Más antiguas
                  </button>
                  <button 
                    className={`${ordenVentas === 'monto-alto' ? 'bg-gray-100 dark:bg-gray-700' : ''} w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
                    onClick={() => cambiarOrden('monto-alto')}
                  >
                    Mayor monto
                  </button>
                  <button 
                    className={`${ordenVentas === 'monto-bajo' ? 'bg-gray-100 dark:bg-gray-700' : ''} w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
                    onClick={() => cambiarOrden('monto-bajo')}
                  >
                    Menor monto
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHead>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Lista de ventas */}
            <div className={`w-full ${ventaSeleccionada ? 'lg:w-1/2' : ''} overflow-x-auto`}>
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {ventasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron ventas con los criterios seleccionados
                      </td>
                    </tr>
                  ) : (
                    ventasFiltradas.map((venta) => (
                      <tr
                        key={venta.ventaId}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${ventaSeleccionada?.ventaId === venta.ventaId ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${venta.anulada ? 'text-gray-400 dark:text-gray-500' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          #{venta.ventaId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(venta.fecha).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {venta?.usuario?.nombre || 'Desconocido'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          {venta.anulada ? (
                            <span className="line-through">{formatearPrecio(venta.total)}</span>
                          ) : (
                            formatearPrecio(venta.total)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {venta.anulada ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Anulada
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Activa
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <button
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => verDetalleVenta(venta)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Detalle de venta */}
            {ventaSeleccionada && (
              <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center">
                    <FileTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Detalle de Venta #{ventaSeleccionada.ventaId}
                  </h3>
                  <button
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={cerrarDetalleVenta}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {ventaSeleccionada.anulada && (
                  <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md mb-4 text-sm">
                    Esta venta ha sido anulada
                  </div>
                )}
                
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha</h4>
                    <p className="text-sm">{new Date(ventaSeleccionada.fecha).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Usuario</h4>
                    <p className="text-sm">{ventaSeleccionada?.usuario?.nombre || "Desconocido"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">IVA</h4>
                    <p className="text-sm">{ventaSeleccionada.conIva ? 'Incluido' : 'No incluido'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</h4>
                    <p className="text-sm font-bold">{formatearPrecio(ventaSeleccionada.total)}</p>
                  </div>
                </div>
                
                <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Productos Vendidos</h4>
                <div className="max-h-96 overflow-y-auto border dark:border-gray-700 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                          Producto
                        </th>
                        <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                          Cant.
                        </th>
                        <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                          Precio
                        </th>
                        <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {ventaSeleccionada.productosVendidos.map((productoVendido, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-2 whitespace-nowrap text-xs">
                            <div className="font-medium">{productoVendido?.producto?.nombre || "Desconocido"}</div>
                            {productoVendido.descuento && productoVendido.descuento > 0 && (
                              <div className="text-xs text-green-600 dark:text-green-400">
                                Descuento: {productoVendido.descuento}%
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                            {productoVendido.cantidad}
                            {productoVendido?.producto?.tipo === "Líquido" ? " lt" :
                              productoVendido?.producto?.tipo === "Sólido" ? " kg" : " uds"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs text-right">
                            {formatearPrecio(productoVendido.precioUnitario)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs text-right font-medium">
                            {formatearPrecio(productoVendido.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <td colSpan={2} className="px-4 py-2 whitespace-nowrap"></td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-right font-medium">
                          Subtotal:
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-right font-medium">
                          {formatearPrecio(ventaSeleccionada.productosVendidos.reduce((total, p) => total + p.subtotal, 0))}
                        </td>
                      </tr>
                      {ventaSeleccionada.conIva && (
                        <tr>
                          <td colSpan={2} className="px-4 py-2 whitespace-nowrap"></td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs text-right font-medium">
                            IVA (16%):
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs text-right font-medium">
                            {formatearPrecio(ventaSeleccionada.total - ventaSeleccionada.productosVendidos.reduce((total, p) => total + p.subtotal, 0))}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={2} className="px-4 py-2 whitespace-nowrap"></td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold">
                          Total:
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold">
                          {formatearPrecio(ventaSeleccionada.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <div className="mt-4 text-right">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    onClick={() => imprimirTicket(ventaSeleccionada)}
                    disabled={imprimiendo || ventaSeleccionada.anulada}
                  >
                    {imprimiendo ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Imprimiendo...
                      </>
                    ) : (
                      <>
                        <Printer className="h-4 w-4" />
                        Imprimir Ticket
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonitoreoVentas;