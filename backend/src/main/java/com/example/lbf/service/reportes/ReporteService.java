package com.example.lbf.service.reportes;

import com.example.lbf.dto.response.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ReporteService {
    
    List<ProductosMasVendidosResponse> getProductosMasVendidos(LocalDate fechaInicio, LocalDate fechaFin, int limite);
    
    List<VentaPorUsuarioDTO> getVentasPorUsuario(LocalDate fechaInicio, LocalDate fechaFin);
    
    List<VentaPorCategoriaDTO> getVentasPorCategoria(LocalDate fechaInicio, LocalDate fechaFin);
    
    List<VentaDiariaDTO> getVentasDiarias(LocalDate fechaInicio, LocalDate fechaFin);
    
    List<VentaMensualDTO> getVentasMensuales(int año);
    
    BigDecimal calcularIngresoTotal(LocalDate fechaInicio, LocalDate fechaFin);
    
    List<ProductoBajoStockDTO> getProductosBajoStock();
}
