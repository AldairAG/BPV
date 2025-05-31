package com.example.lbf.controller;

import com.example.lbf.dto.request.NuevoProductoRequest;
import com.example.lbf.entities.Producto;
import com.example.lbf.service.producto.ProductoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de productos.
 * Proporciona endpoints para crear, actualizar, consultar y eliminar productos,
 * así como para gestionar el stock y buscar productos por diferentes criterios.
 */
@RestController
@RequestMapping("/lbf/productos")
@CrossOrigin(origins = "*")
@Tag(name = "Productos", description = "API para la gestión de productos del sistema")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @Operation(summary = "Crear un nuevo producto", description = "Crea un nuevo producto en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Producto creado correctamente", 
                     content = { @Content(mediaType = "application/json", 
                     schema = @Schema(implementation = Producto.class)) }),
        @ApiResponse(responseCode = "400", description = "Datos de producto inválidos")
    })
    @PostMapping
    public ResponseEntity<Producto> crearProducto(
            @Parameter(description = "Datos del producto a crear", required = true)
            @RequestBody NuevoProductoRequest producto) {
        Producto nuevoProducto = productoService.crearProducto(producto);
        return new ResponseEntity<>(nuevoProducto, HttpStatus.CREATED);
    }

    @Operation(summary = "Actualizar un producto existente", 
               description = "Actualiza los datos de un producto identificado por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Producto actualizado correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos de producto inválidos"),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(
            @Parameter(description = "ID del producto a actualizar", required = true)
            @PathVariable Long id, 
            @Parameter(description = "Datos actualizados del producto", required = true)
            @RequestBody Producto producto) {
        producto.setProductoId(id);
        Producto productoActualizado = productoService.actualizarProducto(producto);
        return ResponseEntity.ok(productoActualizado);
    }

    @Operation(summary = "Eliminar un producto", 
               description = "Elimina un producto del sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Producto eliminado correctamente"),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(
            @Parameter(description = "ID del producto a eliminar", required = true)
            @PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Obtener un producto por su ID", 
               description = "Retorna un producto según su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Producto encontrado"),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProductoById(
            @Parameter(description = "ID del producto a buscar", required = true)
            @PathVariable Long id) {
        Producto producto = productoService.getProductoById(id);
        if (producto != null) {
            return ResponseEntity.ok(producto);
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Obtener todos los productos", 
               description = "Retorna una lista con todos los productos del sistema")
    @ApiResponse(responseCode = "200", description = "Lista de productos obtenida correctamente")
    @GetMapping
    public ResponseEntity<List<Producto>> getAllProductos() {
        List<Producto> productos = productoService.getAllProductos();
        return ResponseEntity.ok(productos);
    }    @Operation(summary = "Obtener productos por categoría", 
               description = "Retorna todos los productos que pertenecen a una categoría específica")
    @ApiResponse(responseCode = "200", description = "Lista de productos obtenida correctamente")
    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<Producto>> getProductosByCategoria(
            @Parameter(description = "ID de la categoría", required = true)
            @PathVariable Long categoriaId) {
        List<Producto> productos = productoService.getProductosByCategoria(categoriaId);
        return ResponseEntity.ok(productos);
    }

    @Operation(summary = "Actualizar el stock de un producto", 
               description = "Incrementa o decrementa el stock de un producto")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stock actualizado correctamente"),
        @ApiResponse(responseCode = "400", description = "No se pudo actualizar el stock (p.ej. stock negativo)"),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Boolean> actualizarStock(
            @Parameter(description = "ID del producto", required = true)
            @PathVariable Long id,
            @Parameter(description = "Cantidad a añadir (positivo) o restar (negativo) del stock", required = true)
            @RequestParam Float cantidad) {
        boolean actualizado = productoService.actualizarStock(id, cantidad);
        if (actualizado) {
            return ResponseEntity.ok(true);
        }
        return ResponseEntity.badRequest().body(false);
    }

    @Operation(summary = "Buscar productos por criterio", 
               description = "Busca productos que coincidan con el criterio especificado (nombre)")
    @ApiResponse(responseCode = "200", description = "Lista de productos encontrados")
    @GetMapping("/buscar")
    public ResponseEntity<List<Producto>> buscarProductos(
            @Parameter(description = "Criterio de búsqueda (texto en el nombre del producto)", required = true)
            @RequestParam String criterio) {
        List<Producto> productos = productoService.buscarProductos(criterio);
        return ResponseEntity.ok(productos);
    }

    @Operation(summary = "Obtener productos con stock bajo", 
               description = "Retorna productos cuyo stock es menor al umbral especificado")
    @ApiResponse(responseCode = "200", description = "Lista de productos con stock bajo")
    @GetMapping("/bajo-stock")
    public ResponseEntity<List<Producto>> getProductosBajoStock(
            @Parameter(description = "Umbral de stock mínimo", required = true)
            @RequestParam Float stockMinimo) {
        List<Producto> productos = productoService.getProductosBajoStock(stockMinimo);
        return ResponseEntity.ok(productos);
    }

    @Operation(summary = "Verificar disponibilidad de un producto", 
               description = "Verifica si hay suficiente stock de un producto para la cantidad solicitada")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Verificación completada"),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @GetMapping("/{id}/disponibilidad")
    public ResponseEntity<Boolean> verificarDisponibilidad(
            @Parameter(description = "ID del producto", required = true)
            @PathVariable Long id,
            @Parameter(description = "Cantidad solicitada", required = true)
            @RequestParam Float cantidad) {
        boolean disponible = productoService.verificarDisponibilidad(id, cantidad);
        return ResponseEntity.ok(disponible);
    }
}
