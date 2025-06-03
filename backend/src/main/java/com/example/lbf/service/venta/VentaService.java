package com.example.lbf.service.venta;

import com.example.lbf.entities.Usuario;
import com.example.lbf.entities.Venta;
import com.example.lbf.dto.request.VentaRequest;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

public interface VentaService {
    Venta crearVenta(Usuario usuario,VentaRequest ventaRequest);
    Venta getVentaById(Long ventaId);
    List<Venta> getVentasByUsuario(Long usuarioId);
    List<Venta> getVentasByFecha(LocalDate fecha);
    List<Venta> getVentasByRangoDeFechas(LocalDate fechaInicio, LocalDate fechaFin);
    BigDecimal calcularTotalVentas(LocalDate fechaInicio, LocalDate fechaFin);
    void anularVenta(Long ventaId);
    List<Venta> buscarVentas(String criterio);
}
