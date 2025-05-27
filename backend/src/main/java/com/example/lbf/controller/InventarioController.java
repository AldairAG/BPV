package com.example.lbf.controller;

import com.example.lbf.entities.Producto;
import com.example.lbf.service.inventario.InventarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión del inventario.
 * Proporciona endpoints para actualizar stock, registrar entradas y salidas, y consultar
 * el estado del inventario.
 */
@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*")
@Tag(name = "Inventario", description = "API para la gestión del inventario de productos")
public class InventarioController {

    @Autowired
    private InventarioService inventarioService;    @Operation(summary = "Actualizar stock de un producto", 
               description = "Actualiza el stock de un producto mediante un incremento o decremento")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stock actualizado correctamente", 
                     content = { @Content(mediaType = "application/json", 
                     schema = @Schema(implementation = Boolean.class)) }),
        @ApiResponse(responseCode = "400", description = "No se pudo actualizar el stock")
    })
    @PatchMapping("/stock/{productoId}")
    public ResponseEntity<Boolean> actualizarStock(
            @Parameter(description = "ID del producto", required = true)
            @PathVariable Long productoId,
            @Parameter(description = "Cantidad a incrementar o decrementar", required = true)
            @RequestParam Float cantidad,
            @Parameter(description = "Tipo de movimiento (ENTRADA, SALIDA, AJUSTE)", required = true)
            @RequestParam String tipoMovimiento) {
        boolean actualizado = inventarioService.actualizarStock(productoId, cantidad, tipoMovimiento);
        if (actualizado) {
            return ResponseEntity.ok(true);
        }
        return ResponseEntity.badRequest().body(false);
    }    @Operation(summary = "Obtener stock actual de un producto", 
               description = "Devuelve el stock actual de un producto específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stock obtenido correctamente", 
                     content = { @Content(mediaType = "application/json", 
                     schema = @Schema(implementation = Float.class)) }),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @GetMapping("/stock/{productoId}")
    public ResponseEntity<Float> getStockActual(
            @Parameter(description = "ID del producto", required = true)
            @PathVariable Long productoId) {
        Float stock = inventarioService.getStockActual(productoId);
        return ResponseEntity.ok(stock);
    }    @Operation(summary = "Obtener productos con bajo stock", 
               description = "Devuelve una lista de productos cuyo stock está por debajo del umbral especificado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de productos obtenida correctamente", 
                     content = { @Content(mediaType = "application/json", 
                     schema = @Schema(implementation = Producto.class)) })
    })
    @GetMapping("/bajo-stock")
    public ResponseEntity<List<Producto>> getProductosBajoStock(
            @Parameter(description = "Umbral de stock mínimo", required = true)
            @RequestParam Float umbral) {
        List<Producto> productos = inventarioService.getProductosBajoStock(umbral);
        return ResponseEntity.ok(productos);
    }    @Operation(summary = "Registrar entrada de inventario", 
               description = "Registra una entrada de productos al inventario")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Entrada registrada correctamente"),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    @PostMapping("/entrada")
    public ResponseEntity<Void> registrarEntradaInventario(
            @Parameter(description = "ID del producto", required = true)
            @RequestParam Long productoId,
            @Parameter(description = "Cantidad que ingresa", required = true)
            @RequestParam Float cantidad,
            @Parameter(description = "Motivo de la entrada", required = true)
            @RequestParam String motivo) {
        inventarioService.registrarEntradaInventario(productoId, cantidad, motivo);
        return ResponseEntity.ok().build();
    }    @Operation(summary = "Registrar salida de inventario", 
               description = "Registra una salida de productos del inventario")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Salida registrada correctamente"),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado"),
        @ApiResponse(responseCode = "400", description = "Datos de salida inválidos o stock insuficiente")
    })
    @PostMapping("/salida")
    public ResponseEntity<Void> registrarSalidaInventario(
            @Parameter(description = "ID del producto", required = true)
            @RequestParam Long productoId,
            @Parameter(description = "Cantidad que sale", required = true)
            @RequestParam Float cantidad,
            @Parameter(description = "Motivo de la salida", required = true)
            @RequestParam String motivo) {
        inventarioService.registrarSalidaInventario(productoId, cantidad, motivo);
        return ResponseEntity.ok().build();
    }    @Operation(summary = "Obtener historial de movimientos", 
               description = "Devuelve el historial de movimientos de inventario para un producto específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Historial obtenido correctamente", 
                     content = { @Content(mediaType = "application/json") }),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @GetMapping("/movimientos/{productoId}")
    public ResponseEntity<List<Object[]>> getHistorialMovimientos(
            @Parameter(description = "ID del producto", required = true)
            @PathVariable Long productoId) {
        List<Object[]> movimientos = inventarioService.getHistorialMovimientos(productoId);
        return ResponseEntity.ok(movimientos);
    }    @Operation(summary = "Realizar inventario físico", 
               description = "Ajusta el inventario según el conteo físico realizado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Inventario físico registrado correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos de inventario inválidos")
    })
    @PostMapping("/inventario-fisico")
    public ResponseEntity<Void> realizarInventarioFisico(
            @Parameter(description = "Mapa de productos con sus cantidades contadas (ID producto -> cantidad)", required = true)
            @RequestBody Map<Long, Float> conteoProductos) {
        inventarioService.realizarInventarioFisico(conteoProductos);
        return ResponseEntity.ok().build();
    }
}
