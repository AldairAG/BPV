package com.example.lbf.controller;

import com.example.lbf.dto.response.*;
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
import java.util.List;

/**
 * Controlador REST para la generación de reportes.
 * Proporciona endpoints para obtener diferentes reportes sobre ventas,
 * productos,
 * categorías e inventario.
 */
@RestController
@RequestMapping("/lbf/reportes")
@CrossOrigin(origins = "*")
@Tag(name = "Reportes", description = "API para la generación de reportes y estadísticas del sistema")
public class ReporteController {

        @Autowired
        private ReporteService reporteService;

        @Operation(summary = "Obtener productos más vendidos", description = "Devuelve un listado de productos ordenados por cantidad vendida en un período")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Reporte generado correctamente", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = ProductosMasVendidosResponse.class)) })
        })
        @GetMapping("/productos-mas-vendidos")
        public ResponseEntity<List<ProductosMasVendidosResponse>> getProductosMasVendidos(
                        @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                        @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
                        @Parameter(description = "Límite de resultados a mostrar", required = false) @RequestParam(defaultValue = "10") int limite) {
                List<ProductosMasVendidosResponse> productos = reporteService.getProductosMasVendidos(fechaInicio,
                                fechaFin,
                                limite);
                return ResponseEntity.ok(productos);
        }

        @Operation(summary = "Obtener ventas por usuario", description = "Devuelve un informe de ventas agrupadas por usuario en un período")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Reporte generado correctamente", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = VentaPorUsuarioDTO.class)) })
        })
        @GetMapping("/ventas-por-usuario")
        public ResponseEntity<List<VentaPorUsuarioDTO>> getVentasPorUsuario(
                        @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                        @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
                List<VentaPorUsuarioDTO> ventas = reporteService.getVentasPorUsuario(fechaInicio, fechaFin);
                return ResponseEntity.ok(ventas);
        }

        @Operation(summary = "Obtener ventas por categoría", description = "Devuelve un informe de ventas agrupadas por categoría de producto en un período")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Reporte generado correctamente", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = VentaPorCategoriaDTO.class)) })
        })
        @GetMapping("/ventas-por-categoria")
        public ResponseEntity<List<VentaPorCategoriaDTO>> getVentasPorCategoria(
                        @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                        @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
                List<VentaPorCategoriaDTO> ventas = reporteService.getVentasPorCategoria(fechaInicio, fechaFin);
                return ResponseEntity.ok(ventas);
        }

        @Operation(summary = "Obtener ventas diarias", description = "Devuelve un informe de ventas agrupadas por día en un período")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Reporte generado correctamente", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = VentaDiariaDTO.class)) })
        })
        @GetMapping("/ventas-diarias")
        public ResponseEntity<List<VentaDiariaDTO>> getVentasDiarias(
                        @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                        @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
                List<VentaDiariaDTO> ventas = reporteService.getVentasDiarias(fechaInicio, fechaFin);
                return ResponseEntity.ok(ventas);
        }

        @Operation(summary = "Obtener ventas mensuales", description = "Devuelve un informe de ventas agrupadas por mes para un año específico")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Reporte generado correctamente", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = VentaMensualDTO.class)) })
        })
        @GetMapping("/ventas-mensuales")
        public ResponseEntity<List<VentaMensualDTO>> getVentasMensuales(
                        @Parameter(description = "Año para el reporte", required = true) @RequestParam int año) {
                List<VentaMensualDTO> ventas = reporteService.getVentasMensuales(año);
                return ResponseEntity.ok(ventas);
        }

        @Operation(summary = "Calcular ingreso total", description = "Calcula el ingreso total por ventas en un período específico")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Cálculo realizado correctamente", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = BigDecimal.class)) })
        })
        @GetMapping("/ingreso-total")
        public ResponseEntity<BigDecimal> calcularIngresoTotal(
                        @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                        @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
                BigDecimal ingreso = reporteService.calcularIngresoTotal(fechaInicio, fechaFin);
                return ResponseEntity.ok(ingreso);
        }

        @Operation(summary = "Obtener productos con bajo stock", description = "Devuelve una lista de productos con stock por debajo del mínimo configurado")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Reporte generado correctamente", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = ProductoBajoStockDTO.class)) })
        })
        @GetMapping("/productos-bajo-stock")
        public ResponseEntity<List<ProductoBajoStockDTO>> getProductosBajoStock() {
                List<ProductoBajoStockDTO> productos = reporteService.getProductosBajoStock();
                return ResponseEntity.ok(productos);
        }

        // Endpoint adicional para descargar reportes en diferentes formatos
        @Operation(summary = "Descargar reporte en formato PDF o Excel", description = "Permite descargar un reporte en el formato especificado")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Reporte generado correctamente", content = {
                                        @Content(mediaType = "application/octet-stream") })
        })
        @GetMapping("/descargar-reporte")
        public ResponseEntity<byte[]> descargarReporte(
                        @Parameter(description = "Tipo de reporte (ventas, productos, stock)", required = true) @RequestParam String tipoReporte,
                        @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                        @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
                        @Parameter(description = "Formato de salida (pdf, excel)", required = true) @RequestParam String formato) {

                // Esta funcionalidad requeriría implementar un servicio de generación de
                // reportes
                // Por ahora, podemos devolver un error o un placeholder
                return ResponseEntity.notFound().build();

                // La implementación completa requeriría algo como:
                /*
                 * byte[] reporteBytes = reporteService.generarReporteEnFormato(tipoReporte,
                 * fechaInicio, fechaFin, formato);
                 * 
                 * return ResponseEntity.ok()
                 * .header("Content-Disposition", "attachment; filename=reporte_" + tipoReporte
                 * + "." + formato)
                 * .body(reporteBytes);
                 */
        }
}
