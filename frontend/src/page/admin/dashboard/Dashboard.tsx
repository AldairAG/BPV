import { useEffect, useState, useCallback } from "react";
import useReportes from "../../../hooks/useReportes";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

type VentaDiariaGrafica = { fecha: string; total: number };

// Utilidad para obtener los últimos 7 días en formato YYYY-MM-DD
function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

const Dashboard = () => {
  const {
    cargarDashboard,
    ingresoTotal,
    productosBajoStock,
    ventasDiarias,
    ventasMensuales,
    productosMasVendidos,
    loading,
    error
  } = useReportes();

  const [ventasDiariasGrafica, setVentasDiariasGrafica] = useState<VentaDiariaGrafica[]>([]);

  // Permite refrescar el dashboard desde fuera (si lo necesitas en el futuro)
  const refrescarDashboard = useCallback(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  useEffect(() => {
    // Log para depuración en el dashboard
    console.log("Dashboard state:", {
      ingresoTotal,
      productosBajoStock,
      ventasDiarias,
      ventasMensuales,
      productosMasVendidos
    });
  }, [ingresoTotal, productosBajoStock, ventasDiarias, ventasMensuales, productosMasVendidos]);

  // Asegura que ingresoTotal sea número válido
  const ingresoTotalSeguro = isNaN(Number(ingresoTotal)) ? 0 : Number(ingresoTotal);

  // Prepara datos para la gráfica de ventas diarias, rellenando días faltantes
  useEffect(() => {
    if (!Array.isArray(ventasDiarias)) {
      setVentasDiariasGrafica([]);
      return;
    }
    const dias = getLast7Days();
    const ventasMap = new Map<string, number>();
    ventasDiarias.forEach((item: any) => {
      const fecha = String(item.fecha ?? item.dia ?? item.date ?? "");
      const total = Number(item.total);
      if (fecha && !isNaN(total)) {
        ventasMap.set(fecha, total < 0 ? 0 : total);
      }
    });
    setVentasDiariasGrafica(
      dias.map(fecha => ({
        fecha,
        total: ventasMap.get(fecha) ?? 0
      }))
    );
  }, [ventasDiarias]);

  if (loading) return <div>Cargando dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <div>Ingreso total hoy: <b>${ingresoTotalSeguro.toFixed(2)}</b></div>
      <div>Productos bajo stock: <b>{productosBajoStock ? productosBajoStock.length : 0}</b></div>
      <div>Ventas diarias: <b>{ventasDiarias ? ventasDiarias.length : 0}</b></div>
      <div>Ventas mensuales: <b>{ventasMensuales ? ventasMensuales.length : 0}</b></div>
      <div>Productos más vendidos: <b>{productosMasVendidos ? productosMasVendidos.length : 0}</b></div>

      {ventasDiariasGrafica && ventasDiariasGrafica.length > 0 && (
        <div className="my-8">
          <h3 className="text-lg font-semibold mb-2">Ventas últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventasDiariasGrafica}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Dashboard;