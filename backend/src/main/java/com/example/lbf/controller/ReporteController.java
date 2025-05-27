package com.example.lbf.controller;

import com.example.lbf.entities.Producto;
import com.example.lbf.entities.Usuario;
import com.example.lbf.service.reportes.ReporteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

/**
 * Controlador REST para la generación de reportes.
 * Proporciona endpoints para obtener diferentes reportes sobre ventas, productos,
 * categorías e inventario.
 */
@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
@Tag(name = "Reportes", description = "API para la generación de reportes y estadísticas del sistema")
public class ReporteController {

    @Autowired
    private ReporteService reporteService;    @Operation(summary = "Obtener productos más vendidos", 
               description = "Devuelve un listado de productos ordenados por cantidad vendida en un período")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reporte generado correctamente", 
                     content = { @Content(mediaType = "application/json") })
    })
    @GetMapping("/productos-mas-vendidos")
    public ResponseEntity<Map<Producto, Integer>> getProductosMasVendidos(
            @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @Parameter(description = "Límite de resultados a mostrar", required = false)
            @RequestParam(defaultValue = "10") int limite) {
        Map<Producto, Integer> productos = reporteService.getProductosMasVendidos(fechaInicio, fechaFin, limite);
        return ResponseEntity.ok(productos);
    }    @Operation(summary = "Obtener ventas por usuario", 
               description = "Devuelve un informe de ventas agrupadas por usuario en un período")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reporte generado correctamente", 
                     content = { @Content(mediaType = "application/json") })
    })
    @GetMapping("/ventas-por-usuario")
    public ResponseEntity<Map<Usuario, BigDecimal>> getVentasPorUsuario(
            @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        Map<Usuario, BigDecimal> ventas = reporteService.getVentasPorUsuario(fechaInicio, fechaFin);
        return ResponseEntity.ok(ventas);
    }    @Operation(summary = "Obtener ventas por categoría", 
               description = "Devuelve un informe de ventas agrupadas por categoría de producto en un período")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reporte generado correctamente", 
                     content = { @Content(mediaType = "application/json") })
    })
    @GetMapping("/ventas-por-categoria")
    public ResponseEntity<Map<String, BigDecimal>> getVentasPorCategoria(
            @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        Map<String, BigDecimal> ventas = reporteService.getVentasPorCategoria(fechaInicio, fechaFin);
        return ResponseEntity.ok(ventas);
    }    @Operation(summary = "Obtener ventas diarias", 
               description = "Devuelve un informe de ventas agrupadas por día en un período")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reporte generado correctamente", 
                     content = { @Content(mediaType = "application/json") })
    })
    @GetMapping("/ventas-diarias")
    public ResponseEntity<Map<LocalDate, BigDecimal>> getVentasDiarias(
            @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        Map<LocalDate, BigDecimal> ventas = reporteService.getVentasDiarias(fechaInicio, fechaFin);
        return ResponseEntity.ok(ventas);
    }    @Operation(summary = "Obtener ventas mensuales", 
               description = "Devuelve un informe de ventas agrupadas por mes para un año específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reporte generado correctamente", 
                     content = { @Content(mediaType = "application/json") })
    })
    @GetMapping("/ventas-mensuales")
    public ResponseEntity<Map<Integer, BigDecimal>> getVentasMensuales(
            @Parameter(description = "Año para el reporte", required = true)
            @RequestParam int año) {
        Map<Integer, BigDecimal> ventas = reporteService.getVentasMensuales(año);
        return ResponseEntity.ok(ventas);
    }    @Operation(summary = "Calcular ingreso total", 
               description = "Calcula el ingreso total por ventas en un período específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cálculo realizado correctamente", 
                     content = { @Content(mediaType = "application/json", 
                     schema = @Schema(implementation = BigDecimal.class)) })
    })
    @GetMapping("/ingreso-total")
    public ResponseEntity<BigDecimal> calcularIngresoTotal(
            @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        BigDecimal ingreso = reporteService.calcularIngresoTotal(fechaInicio, fechaFin);
        return ResponseEntity.ok(ingreso);
    }    @Operation(summary = "Obtener productos con bajo stock", 
               description = "Devuelve una lista de productos con stock por debajo del mínimo configurado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reporte generado correctamente", 
                     content = { @Content(mediaType = "application/json") })
    })
    @GetMapping("/productos-bajo-stock")
    public ResponseEntity<Map<Producto, Float>> getProductosBajoStock() {
        Map<Producto, Float> productos = reporteService.getProductosBajoStock();
        return ResponseEntity.ok(productos);
    }
}
