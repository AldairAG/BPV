import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import VentaService from '../../service/VentaService';
import type { VentaMonitoreoResponse } from '../../types/VentaTypes';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';
import useUser from '../../hooks/useUser';
import {EyeIcon, Printer } from 'lucide-react';
import ModalTemplate, { useModal } from '../modal/ModalTemplate';
import TicketPrint from "../../service/TicketPrint";

interface CorteCajaProps {
  onClose: () => void;
}

const formatearPrecio = (valor: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(valor);
};

const CorteCaja = ({ onClose }: CorteCajaProps) => {
  const { user } = useUser();
  const [ventas, setVentas] = useState<VentaMonitoreoResponse[]>([]);
  const [ventasFiltradas, setVentasFiltradas] = useState<VentaMonitoreoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendedores, setVendedores] = useState<{ id: number, nombre: string }[]>([]);
  const [filtroVendedores, setFiltroVendedores] = useState<number[]>([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaMonitoreoResponse | null>(null);
  // Usar el hook de modal para gestionar el estado del modal
  const { isOpen, openModal, closeModal } = useModal();
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

  // Ver detalle de venta
  const verDetalleVenta = (venta: VentaMonitoreoResponse) => {
    setVentaSeleccionada(venta);
    openModal(); // Abrir el modal
  };

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
  // Cerrar detalle de venta
  const cerrarDetalleVenta = () => {
    closeModal(); // Cerrar el modal
    // Opcionalmente, podemos limpiar la venta seleccionada después de un breve retraso
    // para permitir que la animación de cierre termine
    setTimeout(() => {
      setVentaSeleccionada(null);
    }, 300);
  };

  
  const getVentaParaTicket = (ventaSeleccionada: VentaMonitoreoResponse | null) => {
    if (!ventaSeleccionada) return undefined;
    return {
      fecha: ventaSeleccionada.venta.fecha,
      ticketNumber: `${ventaSeleccionada.venta.ventaId}`,
      vendedor: ventaSeleccionada.usuario?.nombre || "Desconocido",
      cliente: ventaSeleccionada.cliente
        ? { nombre: ventaSeleccionada.cliente.nombre || "Sin nombre" }
        : undefined,
      items: ventaSeleccionada.venta.productosVendidos.map(pv => ({
        producto: {
          nombre:
            (pv.productoVendidoId != null
              ? findNombreById(pv.productoVendidoId)
              : null) || pv.producto.nombre || "Producto desconocido",
          precioVenta: pv.precioUnitario
        },
        cantidad: pv.cantidad
      })),
      total: ventaSeleccionada.venta.total
    };
  };

  
  const findNombreById = (id: number) => {
    const productoEncontrado = ventaSeleccionada?.productosVendidos.find(producto =>
      producto.productoVentas.some(venta => venta.productoVendidoId === id)
    );

    // Mostrar el resultado
    if (productoEncontrado) {
      console.log("Producto encontrado:", productoEncontrado.nombre);
      return productoEncontrado.nombre || "Producto sin nombre";
    } else {
      console.log("Producto no encontrado");
      return null
    }
  }

  // Renderizar el contenido del modal de detalle de venta
  const renderDetalleVenta = () => {
    if (!ventaSeleccionada) return null;

    return (
      <div className="flex flex-col md:flex-row gap-6">
        {/* Detalle de productos (izquierda) */}
        <div className="flex-1 min-w-0">
          {ventaSeleccionada.venta.anulada && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md mb-4 text-sm font-bold text-center">
              Esta venta ha sido anulada
            </div>
          )}

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha y Hora</h4>
              <p className="text-sm">
                {new Date(ventaSeleccionada.venta.fecha).toLocaleDateString()}
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {ventaSeleccionada.venta.hora}
                </span>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Usuario</h4>
              <p className="text-sm">{ventaSeleccionada?.usuario?.nombre || "Desconocido"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">IVA</h4>
              <p className="text-sm">{ventaSeleccionada.venta.conIva ? 'Incluido' : 'No incluido'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</h4>
              <p className="text-sm font-bold">{formatearPrecio(ventaSeleccionada.venta.total)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cliente</h4>
              <p className="text-sm">
                {ventaSeleccionada.cliente ? (
                  <span className="font-bold">
                    {ventaSeleccionada.cliente.nombre || "Sin nombre"}
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">- - -</span>
                )}
              </p>
            </div>
          </div>

          <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Productos Vendidos</h4>
          <div className="w-full border dark:border-gray-700 rounded-md overflow-x-auto max-h-80 overflow-y-auto">
            <table className="min-w-[600px] w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
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
                {ventaSeleccionada?.venta?.productosVendidos?.length > 0 ? (
                  ventaSeleccionada.venta.productosVendidos.map((productoVendido, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2 whitespace-nowrap text-xs">
                        <div className="font-medium">
                          {productoVendido.productoVendidoId != null
                            ? findNombreById(productoVendido.productoVendidoId) || "Producto desconocido"
                            : "Producto desconocido"}
                        </div>
                        {typeof productoVendido.descuento === "number" && productoVendido.descuento > 0 ? (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            Descuento: {productoVendido.descuento}%
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                        {productoVendido.cantidad}
                        {productoVendido.producto?.tipo === "Líquido"
                          ? " lt"
                          : productoVendido.producto?.tipo === "Sólido"
                            ? " kg"
                            : " uds"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-right">
                        {formatearPrecio(productoVendido.precioUnitario)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-right font-medium">
                        {formatearPrecio(productoVendido.subtotal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                      No hay productos en esta venta
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <td colSpan={2} className="px-4 py-2 whitespace-nowrap"></td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-right font-medium">
                    Subtotal:
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-right font-medium">
                    {formatearPrecio(
                      ventaSeleccionada.venta.productosVendidos?.reduce(
                        (total, p) => total + (p.subtotal || 0), 0
                      ) || 0
                    )}
                  </td>
                </tr>
                {ventaSeleccionada.venta.conIva && (
                  <tr>
                    <td colSpan={2} className="px-4 py-2 whitespace-nowrap"></td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-right font-medium">
                      IVA (16%):
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-right font-medium">
                      {formatearPrecio(
                        ventaSeleccionada.venta.total - (
                          ventaSeleccionada.venta.productosVendidos?.reduce(
                            (total, p) => total + (p.subtotal || 0), 0
                          ) || 0
                        )
                      )}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={2} className="px-4 py-2 whitespace-nowrap"></td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold">
                    Total:
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold">
                    {formatearPrecio(ventaSeleccionada.venta.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Ticket (derecha) */}
        <div className="flex flex-col items-center md:items-start md:w-[260px] w-full">
          <div className="w-full bg-gradient-to-br from-blue-50 to-blue-200 dark:from-blue-900 dark:to-blue-700 rounded-xl shadow-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="text-center text-blue-700 dark:text-blue-200 font-bold mb-3 tracking-wide uppercase text-sm">
              Vista previa del ticket
            </h4>
            <div className="flex justify-center">
              <div id="ticket-area" className="bg-white dark:bg-gray-900 rounded shadow p-2">
                <TicketPrint venta={getVentaParaTicket(ventaSeleccionada)} />
              </div>
            </div>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 mt-4 w-full"
            onClick={() => {
              const printContents = document.getElementById("ticket-area")?.innerHTML;
              if (printContents) {
                const printWindow = window.open('', '', 'height=600,width=400');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Imprimir Ticket</title>
                        <style>
                          body { background: #fff; color: #000; margin: 0; }
                          .ticket-content { width: 180px !important; min-width: 180px !important; max-width: 180px !important; margin: 0 auto; }
                          @media print { @page { margin: 0; } }
                        </style>
                      </head>
                      <body>
                        ${printContents}
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                  }, 300);
                }
              }
            }}
            disabled={ventaSeleccionada.venta.anulada}
          >
            <Printer className="h-4 w-4" />
            Imprimir Ticket
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="text-gray-900 dark:text-gray-100 flex justify-center">
      <div className="w-full max-w-6xl">
        {/* Modal de detalle de venta */}
        <ModalTemplate
          isOpen={isOpen}
          onClose={cerrarDetalleVenta}
          title={ventaSeleccionada ? `Detalle de Venta #${ventaSeleccionada.venta.ventaId}` : ""}
        >
          <div className="max-h-[80vh] overflow-y-auto">
            {renderDetalleVenta()}
          </div>
        </ModalTemplate>

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
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm flex gap-2 justify-center">
                              <button
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                onClick={() => verDetalleVenta(venta)}
                                title="Ver detalle"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              {!venta.venta.anulada && (
                                <button
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={async () => {
                                    try {
                                      await VentaService.anularVenta(venta.venta.ventaId);
                                      toast.success("Venta anulada correctamente");
                                      window.location.reload(); // <-- Fuerza el refresco de la página
                                    } catch (error) {
                                      console.error("Error al anular la venta:", error);
                                      toast.error("No se pudo anular la venta");
                                    }
                                  }}
                                  title="Anular venta"
                                >
                                  <span className="sr-only">Anular</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
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
    </div>
  );
};

export default CorteCaja;