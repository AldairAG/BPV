import { useEffect, useState } from "react";
import { AlertTriangleIcon } from "lucide-react";
import useReportes from "../../../hooks/useReportes";
import { Card, CardContent, CardHead, CardTittle } from "../../../components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/navigation/Tabs";
import { DatePickerWithRange } from "../../../components/ui/DatePickerWithRange";
import { toast } from "react-hot-toast";
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
import MonitoreoVentas from "./MonitoreoVentas";
import { formatInTimeZone} from "date-fns-tz";

// Helpers para fechas
const hoy = new Date();
const unMesAtras = new Date();
unMesAtras.setMonth(hoy.getMonth() - 1);

const formatearFecha = (fecha: Date): string => {
  const timeZone = 'America/Mexico_City';
  const fechaZonaMexico = formatInTimeZone(fecha, timeZone, 'yyyy-MM-dd');
  return fechaZonaMexico;
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


  // Manejar cambio en rango de fechas
  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    if (start && end) {
      setFechaInicio(formatearFecha(start));
      setFechaFin(formatearFecha(end));
    }
  };

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
            {tabActual !== 'dashboard' && tabActual !== 'mensual' && tabActual !== 'stock' && (
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
          <TabsTrigger value="ventas">Monitoreo de Ventas</TabsTrigger>
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
                  {formatearPrecio(ingresoTotal || 0)}
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
                          {formatearPrecio(item.producto.precio)}
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
                    {[...ventasDiarias].reverse().map((item) => {

                      const fecha = new Date(item.fecha);
                      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                      const diaSemana = diasSemana[fecha.getDay()];

                      return (
                        <tr key={item.fecha} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.fecha}
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
                        sucursal
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
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.producto.sucursal || "sin sucursal"}
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
            <CardContent>
              <MonitoreoVentas fechaInicio={fechaInicio} fechaFin={fechaFin} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Reportes;