import { useState, useEffect } from "react";
import { FileTextIcon, EyeIcon, Printer } from "lucide-react";
import { Card, CardContent, CardHead, CardTittle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import VentaService from "../../../service/VentaService";
import TicketPrint from "../../../service/TicketPrint";
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
  const [ventasOriginales, setVentasOriginales] = useState<VentaMonitoreoResponse[]>([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaMonitoreoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filtroCliente, setFiltroCliente] = useState<string>("");
  const [clientesUnicos, setClientesUnicos] = useState<{ id: number, nombre: string }[]>([]);
  // Añadir nuevos estados para filtrar por hora
  const [filtroHoraInicio, setFiltroHoraInicio] = useState<string>("");
  const [filtroHoraFin, setFiltroHoraFin] = useState<string>("");

  // Usar el hook de modal para gestionar el estado del modal
  const { isOpen, openModal, closeModal } = useModal();

  // Cargar ventas al iniciar o cuando cambian las fechas
  useEffect(() => {
    cargarVentas();
  }, [fechaInicio, fechaFin]);

  // Extraer los clientes únicos de las ventas
  useEffect(() => {
    if (ventasOriginales.length > 0) {
      const clientes = ventasOriginales
        .filter(venta => venta.cliente?.idCliente)
        .map(venta => ({
          id: venta.cliente.idCliente,
          nombre: venta.cliente.nombre || "Cliente sin nombre"
        }));

      // Eliminar duplicados
      const clientesMap = new Map();
      clientes.forEach(cliente => {
        if (!clientesMap.has(cliente.id)) {
          clientesMap.set(cliente.id, cliente);
        }
      });

      const clientesUnicosArray = Array.from(clientesMap.values());

      // Ordenar alfabéticamente
      clientesUnicosArray.sort((a, b) => a.nombre.localeCompare(b.nombre));

      setClientesUnicos(clientesUnicosArray);
    }
  }, [ventasOriginales]);

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

      setVentasOriginales(ventasOrdenadas);
      setVentasFiltradas(ventasOrdenadas);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      toast.error("Error al cargar datos de ventas");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el cambio de hora de inicio
  const handleFiltroHoraInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroHoraInicio(e.target.value);
    aplicarFiltros(filtroCliente, e.target.value, filtroHoraFin);
  };

  // Función para manejar el cambio de hora de fin
  const handleFiltroHoraFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroHoraFin(e.target.value);
    aplicarFiltros(filtroCliente, filtroHoraInicio, e.target.value);
  };

  // Función para aplicar todos los filtros a la vez
  const aplicarFiltros = (clienteId: string, horaInicio: string, horaFin: string) => {
    let ventasFiltradas = [...ventasOriginales];

    // Filtrar por cliente si hay uno seleccionado
    if (clienteId !== "") {
      ventasFiltradas = ventasFiltradas.filter(
        venta => venta.cliente?.idCliente === parseInt(clienteId)
      );
    }

    // Filtrar por hora de inicio si está definida
    if (horaInicio) {
      ventasFiltradas = ventasFiltradas.filter(venta => {
        // Convertir hora de la venta a formato comparable
        const horaVenta = venta.venta.hora ?
          venta.venta.hora.replace(/\s?[AP]M$/i, "").trim() :
          "00:00";

        return horaVenta >= horaInicio;
      });
    }

    // Filtrar por hora de fin si está definida
    if (horaFin) {
      ventasFiltradas = ventasFiltradas.filter(venta => {
        // Convertir hora de la venta a formato comparable
        const horaVenta = venta.venta.hora ?
          venta.venta.hora.replace(/\s?[AP]M$/i, "").trim() :
          "00:00";

        return horaVenta <= horaFin;
      });
    }

    setVentasFiltradas(ventasFiltradas);
  };

  // Manejar el cambio del filtro de cliente
  const handleFiltroClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = e.target.value;
    setFiltroCliente(clienteId);
    aplicarFiltros(clienteId, filtroHoraInicio, filtroHoraFin);
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
      <>
        {ventaSeleccionada.venta.anulada && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md mb-4 text-sm">
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
        <div className="max-h-80 overflow-y-auto border dark:border-gray-700 rounded-md">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
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

        {/* Área del ticket a imprimir */}
        <div id="ticket-area" style={{ marginTop: 24 }}>
          {ventaSeleccionada && (
            <TicketPrint venta={getVentaParaTicket(ventaSeleccionada)} />
          )}
        </div>

        <div className="mt-4 text-right">
          <Button
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            onClick={() => window.print()}
            disabled={ventaSeleccionada.venta.anulada}
          >
            <Printer className="h-4 w-4" />
            Imprimir Ticket
          </Button>
        </div>
      </>
    );
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

  return (
    <Card className="bg-white dark:bg-gray-800 w-full">
      <CardHead>
        <CardTittle className="flex items-center">
          <FileTextIcon className="h-5 w-5 mr-2" />
          Monitoreo de Ventas
        </CardTittle>
      </CardHead>

      <CardContent className="flex flex-col space-y-4">
        {/* Filtros */}
        <div className="mb-4 grid md:grid-cols-3 sm:grid-cols-2 gap-4 items-center sm:items-end">
          <div className="w-full">
            <label
              htmlFor="cliente-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filtrar por cliente
            </label>
            <div className="relative">
              <select
                id="cliente-filter"
                value={filtroCliente}
                onChange={handleFiltroClienteChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos los clientes</option>
                {clientesUnicos.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full">
            <label
              htmlFor="hora-inicio-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Hora inicio
            </label>
            <input
              id="hora-inicio-filter"
              type="time"
              value={filtroHoraInicio}
              onChange={handleFiltroHoraInicioChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="w-full">
            <label
              htmlFor="hora-fin-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Hora fin
            </label>
            <input
              id="hora-fin-filter"
              type="time"
              value={filtroHoraFin}
              onChange={handleFiltroHoraFinChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => {
                setFiltroCliente("");
                setFiltroHoraInicio("");
                setFiltroHoraFin("");
                setVentasFiltradas(ventasOriginales);
              }}
              className="h-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Limpiar filtros
            </Button>
          </div>

          <div className="ml-auto text-sm text-gray-500 dark:text-gray-400 sm:col-span-2 md:col-span-1">
            Mostrando {ventasFiltradas.length} de {ventasOriginales.length} ventas
          </div>
        </div>

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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cliente
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
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No se encontraron ventas con los filtros seleccionados
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
                        <div className="font-medium">
                          {new Date(ventaResponse.venta.fecha).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {ventaResponse.venta.hora}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {ventaResponse?.usuario?.nombre || 'Desconocido'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {ventaResponse?.cliente?.nombre ||
                          <span className="text-gray-400 dark:text-gray-500">Sin cliente</span>
                        }
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

      {/* Estilos para la impresión del ticket */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #ticket-area, #ticket-area * {
            visibility: visible !important;
          }
          #ticket-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            background: #fff;
            z-index: 9999;
          }
        }
      `}</style>
    </Card>
  );
};

export default MonitoreoVentas;