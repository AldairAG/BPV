import { useEffect, useState } from "react";
import { AlertTriangleIcon, FileTextIcon, ArrowUpDownIcon, EyeIcon, SearchIcon, X, Printer } from "lucide-react";
import useReportes from "../../../hooks/useReportes";
import { Card, CardContent, CardHead, CardTittle } from "../../../components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/navigation/Tabs";
import { DatePickerWithRange } from "../../../components/ui/DatePickerWithRange";
import { toast } from "react-hot-toast";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import VentaService from "../../../service/VentaService";
import type { VentaType } from "../../../types/VentaTypes";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { TIPOS_PRODUCTO } from "../../../constants/tipoProducto";
import PrinterService from "../../../service/PrinterService";

// Helpers para fechas
const hoy = new Date();
const unMesAtras = new Date();
unMesAtras.setMonth(hoy.getMonth() - 1);

const formatearFecha = (fecha: Date): string => {
  return fecha.toISOString().split('T')[0];
};

const formatearPrecio = (valor: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(valor);
};

// Colores para gráficos
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#F44336', '#E91E63', '#9C27B0', '#673AB7'
];

const Reportes = () => {
  // Estados existentes para filtros
  const [fechaInicio, setFechaInicio] = useState<string>(formatearFecha(unMesAtras));
  const [fechaFin, setFechaFin] = useState<string>(formatearFecha(hoy));
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [tabActual, setTabActual] = useState<string>("dashboard");
  const [limite, setLimite] = useState<number>(10);

  // Nuevos estados para el monitoreo de ventas
  const [ventas, setVentas] = useState<VentaType[]>([]);
  const [ventasFiltradas, setVentasFiltradas] = useState<VentaType[]>([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaType | null>(null);
  const [busquedaVenta, setBusquedaVenta] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'activas' | 'anuladas'>('todas');
  const [ordenVentas, setOrdenVentas] = useState<'recientes' | 'antiguas' | 'monto-alto' | 'monto-bajo'>('recientes');
  const [imprimiendo, setImprimiendo] = useState<boolean>(false);
  const [menuOrdenVisible, setMenuOrdenVisible] = useState<boolean>(false);

  // Obtener funcionalidades del hook de reportes
  const {
    productosMasVendidos,
    ventasPorUsuario,
    ventasPorCategoria,
    ventasDiarias,
    ventasMensuales,
    productosBajoStock,
    ingresoTotal,
    loading,
    error,
    cargarProductosMasVendidos,
    cargarVentasPorUsuario,
    cargarVentasPorCategoria,
    cargarVentasDiarias,
    cargarVentasMensuales,
    cargarProductosBajoStock,
    cargarDashboard,
  } = useReportes();

  // Cargar dashboard al montar
  useEffect(() => {
    cargarDashboard().catch(err => {
      toast.error("Error al cargar dashboard");
      console.error(err);
    });
  }, []);

  // Cargar datos según la pestaña seleccionada
  useEffect(() => {
    switch (tabActual) {
      case "dashboard":
        cargarDashboard();
        break;
      case "ventas":
        cargarVentas();
        break;
      case "productos":
        cargarProductosMasVendidos(fechaInicio, fechaFin, limite);
        break;
      case "usuarios":
        cargarVentasPorUsuario(fechaInicio, fechaFin);
        break;
      case "categorias":
        cargarVentasPorCategoria(fechaInicio, fechaFin);
        break;
      case "diario":
        cargarVentasDiarias(fechaInicio, fechaFin);
        break;
      case "mensual":
        cargarVentasMensuales(anio);
        break;
      case "stock":
        cargarProductosBajoStock();
        break;
    }
  }, [tabActual, fechaInicio, fechaFin, anio, limite]);

  // Función para cargar ventas
  const cargarVentas = async () => {
    try {
      const response = await VentaService.getVentasByRangoDeFechas(fechaInicio, fechaFin);
      setVentas(response);
      aplicarFiltros(response);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      toast.error("Error al cargar datos de ventas");
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
        venta.usuario.nombre.toLowerCase().includes(termino) ||
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
        vendedor: venta.usuario.nombre,
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

  // Manejar cambio en rango de fechas
  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    if (start && end) {
      setFechaInicio(formatearFecha(start));
      setFechaFin(formatearFecha(end));
    }
  };

  // Actualizar filtros cuando cambian los criterios
  useEffect(() => {
    if (tabActual === 'ventas') {
      aplicarFiltros();
    }
  }, [busquedaVenta, filtroEstado, ordenVentas]);

  // Nombres de los meses para gráfico mensual
  const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="flex flex-col w-full h-full p-4 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
          <h1 className="text-2xl font-bold">Reportes y Estadísticas</h1>

          {/* Filtros y acciones */}
          <div className="flex items-center gap-4">
            {tabActual !== 'dashboard' && tabActual !== 'mensual' && tabActual !== 'stock' && tabActual !== 'ventas' && (
              <div className="bg-white dark:bg-gray-800 rounded-md shadow p-2">
                <DatePickerWithRange
                  onChange={handleDateRangeChange}
                  initialDateFrom={unMesAtras}
                  initialDateTo={hoy}
                />
              </div>
            )}
          </div>

          {tabActual === 'mensual' && (
            <select
              value={anio}
              onChange={(e) => setAnio(parseInt(e.target.value))}
              className=" bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          )}

          {tabActual === 'productos' && (
            <select
              value={limite}
              onChange={(e) => setLimite(parseInt(e.target.value))}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
          )}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Tabs para diferentes reportes */}
      <Tabs
        defaultValue="dashboard"
        onChange={setTabActual}
        className="w-full"
      >
        <TabsList className="mb-6 overflow-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          {/* <TabsTrigger value="ventas">Monitoreo de Ventas</TabsTrigger> */}
          <TabsTrigger value="productos">Productos Más Vendidos</TabsTrigger>
          <TabsTrigger value="usuarios">Ventas por Usuario</TabsTrigger>
          <TabsTrigger value="categorias">Ventas por Categoría</TabsTrigger>
          <TabsTrigger value="diario">Ventas Diarias</TabsTrigger>
          <TabsTrigger value="mensual">Ventas Mensuales</TabsTrigger>
          <TabsTrigger value="stock">Stock Bajo</TabsTrigger>
        </TabsList>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-700 dark:text-gray-300">Cargando datos...</p>
            </div>
          </div>
        )}

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Indicadores principales */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHead>
                <CardTittle>Ventas de Hoy</CardTittle>
              </CardHead>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatearPrecio(ingresoTotal)}
                </span>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardHead>
                <CardTittle>Productos con Stock Bajo</CardTittle>
              </CardHead>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {productosBajoStock.length}
                </span>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardHead>
                <CardTittle>Ventas del Mes</CardTittle>
              </CardHead>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatearPrecio(ventasMensuales.reduce((total, item) => total + item.total, 0))}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos del dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHead>
                <CardTittle>Ventas Últimos 7 Días</CardTittle>
              </CardHead>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ventasDiarias}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="fecha"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Ventas']}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#0088FE"
                      activeDot={{ r: 8 }}
                      name="Ventas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800">
              <CardHead>
                <CardTittle>Productos Más Vendidos</CardTittle>
              </CardHead>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productosMasVendidos.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="producto.nombre"
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} unidades`, 'Cantidad']}
                      labelFormatter={(label) => label}
                    />
                    <Legend />
                    <Bar
                      dataKey="cantidad"
                      fill="#00C49F"
                      name="Cantidad vendida"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Alerta de stock bajo */}
          {productosBajoStock.length > 0 && (
            <Card className="bg-white dark:bg-gray-800">
              <CardHead className="bg-amber-50 dark:bg-amber-900/30 border-b-amber-200 dark:border-b-amber-700">
                <CardTittle className="text-amber-800 dark:text-amber-300 flex items-center">
                  <AlertTriangleIcon className="h-5 w-5 mr-2" />
                  Productos con Stock Bajo
                </CardTittle>
              </CardHead>
              <CardContent className="divide-y dark:divide-gray-700 flex flex-col">
                {productosBajoStock.slice(0, 5).map((item) => (
                  <div key={item.producto.productoId} className="py-3 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.producto.nombre}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.producto.categoria?.nombre || "Sin categoría"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 dark:text-red-400 font-bold">
                        {item.producto.stock} {item.producto.tipo === "Líquido" ? "lt" : item.producto.tipo === TIPOS_PRODUCTO.GRANEL ? "Lt" : "uds"}
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                        <div
                          className="bg-red-600 h-2.5 rounded-full"
                          style={{ width: `${Math.min(item.porcentajeStock * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                {productosBajoStock.length > 5 && (
                  <div className="py-3 text-center">
                    <button
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                      onClick={() => setTabActual('stock')}
                    >
                      Ver todos los productos con stock bajo ({productosBajoStock.length})
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Productos más vendidos */}

        <TabsContent value="productos">
          <Card className="bg-white dark:bg-gray-800">
            <CardHead>
              <CardTittle>Productos Más Vendidos</CardTittle>
            </CardHead>
            <CardContent>
              <div className="h-96 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productosMasVendidos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="producto.nombre"
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} unidades`, 'Cantidad']}
                      labelFormatter={(label) => label}
                    />
                    <Legend />
                    <Bar
                      dataKey="cantidad"
                      fill="#0088FE"
                      name="Cantidad vendida"
                    >
                      {productosMasVendidos.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto mt-6 sm:w-full">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Producto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Precio
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cantidad Vendida
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {productosMasVendidos.map((item) => (
                      <tr key={item.producto.productoId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.producto.nombre}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.producto.categoria && (
                              <>
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: item.producto.categoria.color }}
                                ></div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {item.producto.categoria.nombre}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {formatearPrecio(item.producto.precioVenta)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                          {item.cantidad} {item.producto.tipo === "Líquido" ? "lt" : item.producto.tipo === "Sólido" ? "kg" : "uds"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ventas por usuario */}
        <TabsContent value="usuarios">
          <Card className="bg-white dark:bg-gray-800">
            <CardHead>
              <CardTittle>Ventas por Usuario</CardTittle>
            </CardHead>
            <CardContent>
              <div className="h-96 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ventasPorUsuario}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="usuario.nombre"
                    />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip
                      formatter={(value) => [formatearPrecio(value as number), 'Total']}
                      labelFormatter={(label) => `Usuario: ${label}`}
                    />
                    <Legend />
                    <Bar
                      dataKey="total"
                      name="Total vendido"
                      fill="#8884d8"
                    >
                      {ventasPorUsuario.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto mt-6 sm:w-full">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rol
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Vendido
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {ventasPorUsuario.map((item) => (
                      <tr key={item.usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.usuario.nombre}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.usuario.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            {item.usuario.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600 dark:text-green-400">
                          {formatearPrecio(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ventas por categoría */}
        <TabsContent value="categorias">
          <Card className="bg-white dark:bg-gray-800">
            <CardHead>
              <CardTittle>Ventas por Categoría</CardTittle>
            </CardHead>
            <CardContent>
              <div className="h-96 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ventasPorCategoria}
                      dataKey="total"
                      nameKey="categoria"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {ventasPorCategoria.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatearPrecio(value as number), 'Total']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto mt-6 sm:w-full">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Vendido
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Porcentaje
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {ventasPorCategoria.map((item, index) => {
                      const totalGeneral = ventasPorCategoria.reduce((sum, item) => sum + item.total, 0);
                      const porcentaje = (item.total / totalGeneral) * 100;

                      return (
                        <tr key={item.categoria} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.categoria}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                            {formatearPrecio(item.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm text-gray-900 dark:text-white">{porcentaje.toFixed(1)}%</div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                              <div
                                className="h-2.5 rounded-full"
                                style={{
                                  width: `${porcentaje}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ventas diarias */}
        <TabsContent value="diario">
          <Card className="bg-white dark:bg-gray-800">
            <CardHead>
              <CardTittle>Ventas Diarias</CardTittle>
            </CardHead>
            <CardContent>
              <div className="h-96 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={ventasDiarias}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="fecha"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip
                      formatter={(value) => [formatearPrecio(value as number), 'Total']}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#0088FE"
                      activeDot={{ r: 8 }}
                      name="Ventas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto mt-6 sm:w-full">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Día
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Vendido
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {ventasDiarias.map((item) => {
                      const fecha = new Date(item.fecha);
                      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                      const diaSemana = diasSemana[fecha.getDay()];

                      return (
                        <tr key={item.fecha} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {fecha.toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {diaSemana}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600 dark:text-green-400">
                            {formatearPrecio(item.total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ventas mensuales */}
        <TabsContent value="mensual">
          <Card className="bg-white dark:bg-gray-800">
            <CardHead>
              <CardTittle>Ventas Mensuales {anio}</CardTittle>
            </CardHead>
            <CardContent>
              <div className="h-96 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ventasMensuales.map(item => ({
                      ...item,
                      nombreMes: MESES[item.mes - 1]
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombreMes" />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip
                      formatter={(value) => [formatearPrecio(value as number), 'Total']}
                    />
                    <Legend />
                    <Bar
                      dataKey="total"
                      fill="#00C49F"
                      name="Ventas mensuales"
                    >
                      {ventasMensuales.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto mt-6 sm:w-full">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Mes
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Vendido
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {ventasMensuales.map((item) => (
                      <tr key={item.mes} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {MESES[item.mes - 1]} {anio}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600 dark:text-green-400">
                          {formatearPrecio(item.total)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          Total Anual
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600 dark:text-green-400">
                        {formatearPrecio(ventasMensuales.reduce((sum, item) => sum + item.total, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Productos con stock bajo */}
        <TabsContent value="stock">
          <Card className="bg-white dark:bg-gray-800">
            <CardHead className="bg-amber-50 dark:bg-amber-900/30">
              <CardTittle className="text-amber-800 dark:text-amber-300 flex items-center">
                <AlertTriangleIcon className="h-5 w-5 mr-2" />
                Productos con Stock Bajo
              </CardTittle>
            </CardHead>
            <CardContent>
              <div className="overflow-x-auto sm:w-full">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Producto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Stock Actual
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Stock Mínimo
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {productosBajoStock.map((item) => (
                      <tr key={item.producto.productoId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.producto.nombre}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.producto.codigoBarras || "Sin código"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.producto.categoria && (
                              <>
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: item.producto.categoria.color }}
                                ></div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {item.producto.categoria.nombre}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.producto.tipo || "Unidad"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-bold text-red-600 dark:text-red-400">
                            {item.producto.stock} {item.producto.tipo === "Líquido" ? "lt" : item.producto.tipo === "Sólido" ? "kg" : "uds"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.producto.stockMinimo} {item.producto.tipo === "Líquido" ? "lt" : item.producto.tipo === "Sólido" ? "kg" : "uds"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-red-600 h-2.5 rounded-full"
                              style={{ width: `${Math.min(item.producto.stock * 100 / item.producto.stockMinimo)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
                            {Math.round(item.producto.stock * 100 / item.producto.stockMinimo)}% del mínimo
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NUEVA PESTAÑA: Monitoreo de Ventas */}
        <TabsContent value="ventas" className="space-y-6">
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
                
                {/* Menú de ordenamiento con dropdown estático */}
                <div className="flex flex-col">
                  <Button 
                    className="text-xs w-full sm:w-auto flex items-center gap-1"
                    onClick={() => setMenuOrdenVisible(!menuOrdenVisible)}
                  >
                    <ArrowUpDownIcon className="h-4 w-4" />
                    Ordenar
                  </Button>
                  
                  {menuOrdenVisible && (
                    <div className="absolute mt-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-10 w-40">
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
              {/* Contenedor flexible para lista y detalle */}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Reportes;