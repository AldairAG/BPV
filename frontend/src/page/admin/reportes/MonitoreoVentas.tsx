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
      // Ordenar por fecha más reciente por defecto
      const ventasOrdenadas = [...response].sort((a, b) => {
        const fechaA = new Date(a.venta.fecha + 'T00:00:00');
        const fechaB = new Date(b.venta.fecha + 'T00:00:00');
        return fechaB.getTime() - fechaA.getTime();
      });

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

  // --- ESTILO DETALLE DE VENTA ---
  const renderDetalleVenta = () => {
    if (!ventaSeleccionada) return null;

    return (
      <div className="space-y-6">
        {ventaSeleccionada.venta.anulada && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-lg mb-2 text-sm font-semibold flex items-center gap-2 shadow">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Esta venta ha sido anulada
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 dark:text-gray-100">
          <div>
            <h4 className="text-xs font-semibold text-blue-600 uppercase">Fecha y Hora</h4>
            <p className="text-base font-medium">
              {new Date(ventaSeleccionada.venta.fecha).toLocaleDateString()}
              <span className="ml-2 text-blue-500 font-mono">{ventaSeleccionada.venta.hora}</span>
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-blue-600 uppercase">Usuario</h4>
            <p className="text-base font-medium">{ventaSeleccionada?.usuario?.nombre || "Desconocido"}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-blue-600 uppercase">IVA</h4>
            <p className="text-base">{ventaSeleccionada.venta.conIva ? 'Incluido' : 'No incluido'}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-blue-600 uppercase">Total</h4>
            <p className="text-lg font-bold text-blue-700">{formatearPrecio(ventaSeleccionada.venta.total)}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-blue-600 uppercase">Cliente</h4>
            <p className="text-base font-bold">
              {ventaSeleccionada.cliente ? (
                ventaSeleccionada.cliente.nombre || "Sin nombre"
              ) : (
                <span className="text-gray-400">- - -</span>
              )}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-blue-700">Productos Vendidos</h4>
          <div className="max-h-80 overflow-y-auto border dark:border-gray-700 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-900 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-gray-700 dark:text-gray-200">Producto</th>
                  <th className="px-4 py-2 text-center font-bold text-gray-700 dark:text-gray-200">Cant.</th>
                  <th className="px-4 py-2 text-right font-bold text-gray-700 dark:text-gray-200">Precio</th>
                  <th className="px-4 py-2 text-right font-bold text-gray-700 dark:text-gray-200">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-100 dark:divide-gray-900">
                {ventaSeleccionada?.venta?.productosVendidos?.length > 0 ? (
                  ventaSeleccionada.venta.productosVendidos.map((productoVendido, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/60 transition">
                      <td className="px-4 py-2 whitespace-nowrap font-medium">
                        {productoVendido.productoVendidoId != null
                          ? findNombreById(productoVendido.productoVendidoId) || "Producto desconocido"
                          : "Producto desconocido"}
                        {typeof productoVendido.descuento === "number" && productoVendido.descuento > 0 && (
                          <span className="ml-2 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900 px-2 py-0.5 rounded-full font-semibold">
                            -{productoVendido.descuento}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">{productoVendido.cantidad}
                        <span className="text-xs text-gray-400">
                          {productoVendido.producto?.tipo === "Líquido"
                            ? " lt"
                            : productoVendido.producto?.tipo === "Sólido"
                              ? " kg"
                              : " uds"}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">{formatearPrecio(productoVendido.precioUnitario)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-right font-semibold">{formatearPrecio(productoVendido.subtotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                      No hay productos en esta venta
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <td colSpan={2}></td>
                  <td className="px-4 py-2 text-right font-semibold">Subtotal:</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatearPrecio(
                      ventaSeleccionada.venta.productosVendidos?.reduce(
                        (total, p) => total + (p.subtotal || 0), 0
                      ) || 0
                    )}
                  </td>
                </tr>
                {ventaSeleccionada.venta.conIva && (
                  <tr>
                    <td colSpan={2}></td>
                    <td className="px-4 py-2 text-right font-semibold">IVA (16%):</td>
                    <td className="px-4 py-2 text-right font-semibold">
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
                  <td colSpan={2}></td>
                  <td className="px-4 py-2 text-right text-base font-bold">Total:</td>
                  <td className="px-4 py-2 text-right text-base font-bold text-blue-700">{formatearPrecio(ventaSeleccionada.venta.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Área del ticket a imprimir */}
        <div id="ticket-area" className="mt-6">
          {ventaSeleccionada && (
            <TicketPrint venta={getVentaParaTicket(ventaSeleccionada)} />
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button
            className="bg-gradient-to-r from-blue-700 to-gray-800 hover:from-blue-800 hover:to-gray-900 text-white font-semibold flex items-center gap-2 px-6 py-2 rounded-lg shadow"
            onClick={() => window.print()}
            disabled={ventaSeleccionada.venta.anulada}
          >
            <Printer className="h-4 w-4" />
            Imprimir Ticket
          </Button>
        </div>
      </div>
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
    <Card className="bg-white dark:bg-gray-900 w-full shadow-xl border border-gray-200 dark:border-gray-800">
      <CardHead>
        <CardTittle className="flex items-center text-gray-800 dark:text-gray-100">
          <FileTextIcon className="h-5 w-5 mr-2" />
          Monitoreo de Ventas
        </CardTittle>
      </CardHead>

      <CardContent className="flex flex-col space-y-6">
        {/* Filtros */}
        <div className="mb-4 grid md:grid-cols-3 sm:grid-cols-2 gap-4 items-center sm:items-end">
          <div className="w-full">
            <label
              htmlFor="cliente-filter"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1"
            >
              Filtrar por cliente
            </label>
            <div className="relative">
              <select
                id="cliente-filter"
                value={filtroCliente}
                onChange={handleFiltroClienteChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-900 dark:text-white"
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
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1"
            >
              Hora inicio
            </label>
            <input
              id="hora-inicio-filter"
              type="time"
              value={filtroHoraInicio}
              onChange={handleFiltroHoraInicioChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="w-full">
            <label
              htmlFor="hora-fin-filter"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1"
            >
              Hora fin
            </label>
            <input
              id="hora-fin-filter"
              type="time"
              value={filtroHoraFin}
              onChange={handleFiltroHoraFinChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-900 dark:text-white"
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
              className="h-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 rounded-md font-semibold"
            >
              Limpiar filtros
            </Button>
          </div>

          <div className="ml-auto text-sm text-gray-600 dark:text-gray-300 sm:col-span-2 md:col-span-1">
            Mostrando {ventasFiltradas.length} de {ventasOriginales.length} ventas
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-b-gray-700 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-lg shadow">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-right font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-center font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-100 dark:divide-gray-900">
                {ventasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-400 dark:text-gray-500">
                      No se encontraron ventas con los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  ventasFiltradas.map((ventaResponse) => (
                    <tr
                      key={ventaResponse.venta.ventaId}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-900/60 transition ${ventaResponse.venta.anulada ? 'text-gray-400 dark:text-gray-700' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">#{ventaResponse.venta.ventaId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{ventaResponse.venta.fecha}</div>
                        <div className="text-xs text-blue-500">{ventaResponse.venta.hora}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{ventaResponse?.usuario?.nombre || 'Desconocido'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ventaResponse?.cliente?.nombre ||
                          <span className="text-gray-400">Sin cliente</span>
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          className="text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition"
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