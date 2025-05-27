package com.example.lbf.service.reportes;

import com.example.lbf.entities.Producto;
import com.example.lbf.entities.Usuario;

import java.time.LocalDate;
import java.util.Map;
import java.math.BigDecimal;

public interface ReporteService {
    Map<Producto, Integer> getProductosMasVendidos(LocalDate fechaInicio, LocalDate fechaFin, int limite);
    Map<Usuario, BigDecimal> getVentasPorUsuario(LocalDate fechaInicio, LocalDate fechaFin);
    Map<String, BigDecimal> getVentasPorCategoria(LocalDate fechaInicio, LocalDate fechaFin);
    Map<LocalDate, BigDecimal> getVentasDiarias(LocalDate fechaInicio, LocalDate fechaFin);
    Map<Integer, BigDecimal> getVentasMensuales(int año);
    BigDecimal calcularIngresoTotal(LocalDate fechaInicio, LocalDate fechaFin);
    Map<Producto, Float> getProductosBajoStock();
}
