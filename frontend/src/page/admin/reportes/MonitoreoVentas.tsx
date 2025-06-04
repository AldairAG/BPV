import { useState, useEffect } from "react";
import { FileTextIcon, EyeIcon, Printer } from "lucide-react";
import { Card, CardContent, CardHead, CardTittle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import VentaService from "../../../service/VentaService";
import PrinterService from "../../../service/PrinterService";
import { toast } from "react-hot-toast";
import type { VentaMonitoreoResponse } from "../../../types/VentaTypes";
import ModalTemplate, { useModal } from "../../../components/modal/ModalTemplate";

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
  const [ventasFiltradas, setVentasFiltradas] = useState<VentaMonitoreoResponse[]>([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaMonitoreoResponse | null>(null);
  const [imprimiendo, setImprimiendo] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Usar el hook de modal para gestionar el estado del modal
  const { isOpen, openModal, closeModal } = useModal();

  // Cargar ventas al iniciar o cuando cambian las fechas
  useEffect(() => {
    cargarVentas();
  }, [fechaInicio, fechaFin]);

  // Función para cargar ventas
  const cargarVentas = async () => {
    setLoading(true);
    try {
      const response = await VentaService.getVentasByRangoDeFechasParaMonitoreo(fechaInicio, fechaFin);
      console.log("Ventas cargadas:", response);

      // Ordenar por fecha más reciente por defecto
      const ventasOrdenadas = [...response].sort(
        (a, b) => new Date(b.venta.fecha).getTime() - new Date(a.venta.fecha).getTime()
      );
      setVentasFiltradas(ventasOrdenadas);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      toast.error("Error al cargar datos de ventas");
    } finally {
      setLoading(false);
    }
  };

  // Ver detalle de venta
  const verDetalleVenta = (venta: VentaMonitoreoResponse) => {
    setVentaSeleccionada(venta);
    openModal(); // Abrir el modal
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

  // Imprimir ticket de venta
  const imprimirTicket = async (response: VentaMonitoreoResponse) => {
    if (!response) return;

    setImprimiendo(true);

    try {
      // Preparar datos para impresión
      const ticketData = {
        ticketNumber: `${response.venta.ventaId}`,
        items: response.venta.productosVendidos.map(pv => ({
          producto: pv.producto,
          cantidad: pv.cantidad
        })),
        subtotal: response.venta.productosVendidos.reduce((total, pv) => total + pv.subtotal, 0),
        iva: response.venta.conIva ? (response.venta.total - response.venta.productosVendidos.reduce((total, pv) => total + pv.subtotal, 0)) : 0,
        total: response.venta.total,
        fecha: new Date(response.venta.fecha).toLocaleString(),
        vendedor: response.venta.usuario?.nombre || "Desconocido",
        conIva: response.venta.conIva,
        descuentos: response.venta.productosVendidos.reduce((acc, pv) => {
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

  // Renderizar el contenido del modal de detalle de venta
  const renderDetalleVenta = () => {
    if (!ventaSeleccionada) return null;

    return (
      <>
        {ventaSeleccionada.venta.anulada && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md mb-4 text-sm">
            Esta venta ha sido anulada
          </div>
        )}

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha</h4>
            <p className="text-sm">{ventaSeleccionada.venta.fecha}</p>
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
        </div>

        <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Productos Vendidos</h4>
        <div className="max-h-80 overflow-y-auto border dark:border-gray-700 rounded-md">
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
              {ventaSeleccionada?.productosVendidos?.length > 0 ? (
                ventaSeleccionada.venta.productosVendidos.map((productoVendido, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 whitespace-nowrap text-xs">
                      <div className="font-medium">{ventaSeleccionada?.usuario.nombre || "Desconocido"}</div>
                      {productoVendido.precioUnitario > 0 ? (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            Descuento: {productoVendido.descuento ?? 0}%
                          </div>
                        ) : null}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                      {productoVendido.cantidad}
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

        <div className="mt-4 text-right">
          <Button
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            onClick={() => imprimirTicket(ventaSeleccionada)}
            disabled={imprimiendo || ventaSeleccionada.venta.anulada}
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
      </>
    );
  };

  return (
    <Card className="bg-white dark:bg-gray-800 w-full">
      <CardHead>
        <CardTittle className="flex items-center">
          <FileTextIcon className="h-5 w-5 mr-2" />
          Monitoreo de Ventas
        </CardTittle>
      </CardHead>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
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
                      No se encontraron ventas en el período seleccionado
                    </td>
                  </tr>
                ) : (
                  ventasFiltradas.map((ventaResponse) => (
                    <tr
                      key={ventaResponse.venta.ventaId}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${ventaResponse.venta.anulada ? 'text-gray-400 dark:text-gray-500' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        #{ventaResponse.venta.ventaId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {ventaResponse.venta.fecha}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {ventaResponse?.usuario?.nombre || 'Desconocido'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {ventaResponse.venta.anulada ? (
                          <span className="line-through">{formatearPrecio(ventaResponse.venta.total)}</span>
                        ) : (
                          formatearPrecio(ventaResponse.venta.total)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {ventaResponse.venta.anulada ? (
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
                          onClick={() => verDetalleVenta(ventaResponse)}
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
        )}
      </CardContent>

      {/* Modal para mostrar los detalles de la venta */}
      <ModalTemplate
        isOpen={isOpen}
        onClose={cerrarDetalleVenta}
        title={ventaSeleccionada ? `Detalle de Venta #${ventaSeleccionada.venta.ventaId}` : ""}
      >
        {renderDetalleVenta()}
      </ModalTemplate>
    </Card>
  );
};

export default MonitoreoVentas;