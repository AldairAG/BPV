package com.example.lbf.controller;

import com.example.lbf.entities.Venta;
import com.example.lbf.service.usuario.UsuarioService;
import com.example.lbf.service.venta.VentaService;
import com.example.lbf.entities.Usuario;
import com.example.lbf.dto.request.VentaRequest;
import com.example.lbf.dto.response.VentaMonitoreoResponse;
import com.example.lbf.entities.Producto;
import com.example.lbf.entities.ProductoVendido;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Controlador REST para la gestión de ventas.
 * Proporciona endpoints para crear, consultar y anular ventas,
 * así como para realizar búsquedas y cálculos sobre las ventas.
 */
@RestController
@RequestMapping("/lbf/ventas")
@CrossOrigin(origins = "*")
@Tag(name = "Ventas", description = "API para la gestión de ventas del sistema")
public class VentaController {

        @Autowired
        private VentaService ventaService;

        @Autowired
        private UsuarioService usuarioService;

        @Operation(summary = "Crear una nueva venta", description = "Registra una nueva venta en el sistema")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Venta creada correctamente", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = Venta.class)) }),
                        @ApiResponse(responseCode = "400", description = "Datos de venta inválidos o usuario no encontrado")
        })
        @PostMapping
        public ResponseEntity<Venta> crearVenta(
                        @Parameter(description = "Datos de la venta a crear", required = true) @RequestBody VentaRequest ventaRequest) {
                Usuario usuario = usuarioService.getUsuarioById(ventaRequest.getUsuarioId());
                if (usuario == null) {
                        return ResponseEntity.badRequest().build();
                }

                Venta venta = ventaService.crearVenta(usuario, ventaRequest);
                return new ResponseEntity<>(venta, HttpStatus.CREATED);
        }

        @Operation(summary = "Obtener una venta por ID", description = "Devuelve una venta específica basada en su ID")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Venta encontrada", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = Venta.class)) }),
                        @ApiResponse(responseCode = "404", description = "Venta no encontrada")
        })
        @GetMapping("/{id}")
        public ResponseEntity<Venta> getVentaById(
                        @Parameter(description = "ID de la venta a buscar", required = true) @PathVariable Long id) {
                Venta venta = ventaService.getVentaById(id);
                if (venta != null) {
                        return ResponseEntity.ok(venta);
                }
                return ResponseEntity.notFound().build();
        }

        @Operation(summary = "Obtener ventas por usuario", description = "Devuelve todas las ventas realizadas por un usuario específico")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Ventas encontradas", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = Venta.class)) })
        })
        @GetMapping("/usuario/{usuarioId}")
        public ResponseEntity<List<Venta>> getVentasByUsuario(
                        @Parameter(description = "ID del usuario", required = true) @PathVariable Long usuarioId) {
                List<Venta> ventas = ventaService.getVentasByUsuario(usuarioId);
                return ResponseEntity.ok(ventas);
        }

        @Operation(summary = "Obtener ventas por fecha", description = "Devuelve todas las ventas realizadas en una fecha específica")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Ventas encontradas", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = Venta.class)) })
        })
        @GetMapping("/fecha")
        public ResponseEntity<List<Venta>> getVentasByFecha(
                        @Parameter(description = "Fecha en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
                List<Venta> ventas = ventaService.getVentasByFecha(fecha);
                return ResponseEntity.ok(ventas);
        }

        @Operation(summary = "Obtener ventas por rango de fechas", description = "Devuelve todas las ventas realizadas entre un rango de fechas")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Ventas encontradas", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = Venta.class)) })
        })
        @GetMapping("/rango")
        public ResponseEntity<List<Venta>> getVentasByRangoDeFechas(
                        @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                        @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
                List<Venta> ventas = ventaService.getVentasByRangoDeFechas(fechaInicio, fechaFin);
                return ResponseEntity.ok(ventas);
        }

        @Operation(summary = "Obtener ventas por rango de fechas para monitoreo", description = "Devuelve todas las ventas realizadas entre un rango de fechas para monitoreo")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Ventas encontradas", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = Venta.class)) })
        })
        @GetMapping("/rango-monitoreo")
        public ResponseEntity<List<VentaMonitoreoResponse>> getVentasByRangoDeFechasParaMonitoreo(
                        @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                        @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

                List<Venta> ventas = ventaService.getVentasByRangoDeFechas(fechaInicio, fechaFin);

                List<VentaMonitoreoResponse> ventasMonitoreo = new ArrayList<>();

                for (Venta venta : ventas) {
                        VentaMonitoreoResponse response = new VentaMonitoreoResponse();
                        response.setUsuario(venta.getUsuario());
                        response.setVenta(venta);
                        response.setCliente(venta.getCliente());

                        List<ProductoVendido> productosVendidos = venta.getProductosVendidos();

                        List<Producto> productos = new ArrayList<>();
                        for (ProductoVendido pv : productosVendidos) {
                                productos.add(pv.getProducto());
                        }

                        response.setProductosVendidos(productos);

                        ventasMonitoreo.add(response);
                }

                return ResponseEntity.ok(ventasMonitoreo);
        }

        @Operation(summary = "Calcular total de ventas", description = "Calcula el monto total de ventas realizadas en un rango de fechas")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Cálculo realizado correctamente", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = BigDecimal.class)) })
        })
        @GetMapping("/total")
        public ResponseEntity<BigDecimal> calcularTotalVentas(
                        @Parameter(description = "Fecha de inicio en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                        @Parameter(description = "Fecha de fin en formato ISO (YYYY-MM-DD)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
                BigDecimal total = ventaService.calcularTotalVentas(fechaInicio, fechaFin);
                return ResponseEntity.ok(total);
        }

        @Operation(summary = "Anular una venta", description = "Anula una venta existente en el sistema")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Venta anulada correctamente"),
                        @ApiResponse(responseCode = "404", description = "Venta no encontrada")
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> anularVenta(
                        @Parameter(description = "ID de la venta a anular", required = true) @PathVariable Long id) {
                ventaService.anularVenta(id);
                return ResponseEntity.noContent().build();
        }

        @Operation(summary = "Buscar ventas", description = "Busca ventas que coincidan con el criterio especificado")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Búsqueda realizada correctamente", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = Venta.class)) })
        })
        @GetMapping("/buscar")
        public ResponseEntity<List<Venta>> buscarVentas(
                        @Parameter(description = "Criterio de búsqueda", required = true) @RequestParam String criterio) {
                List<Venta> ventas = ventaService.buscarVentas(criterio);
                return ResponseEntity.ok(ventas);
        }

}
