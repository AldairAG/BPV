package com.example.lbf.controller;

import com.example.lbf.entities.Categoria;
import com.example.lbf.entities.Producto;
import com.example.lbf.service.categoria.CategoriaService;

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
 * Controlador REST para la gestión de categorías de productos.
 * Proporciona endpoints para crear, actualizar, eliminar y consultar categorías.
 */
@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
@Tag(name = "Categorías", description = "API para la gestión de categorías de productos")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;    @Operation(summary = "Crear una nueva categoría", description = "Crea una nueva categoría de productos en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Categoría creada correctamente", 
                     content = { @Content(mediaType = "application/json", 
                     schema = @Schema(implementation = Categoria.class)) }),
        @ApiResponse(responseCode = "400", description = "Datos de categoría inválidos")
    })
    @PostMapping
    public ResponseEntity<Categoria> crearCategoria(
            @Parameter(description = "Datos de la categoría a crear", required = true)
            @RequestBody Categoria categoria) {
        Categoria nuevaCategoria = categoriaService.crearCategoria(categoria);
        return new ResponseEntity<>(nuevaCategoria, HttpStatus.CREATED);
    }    @Operation(summary = "Actualizar una categoría existente", 
               description = "Actualiza los datos de una categoría identificada por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Categoría actualizada correctamente",
                     content = { @Content(mediaType = "application/json", 
                     schema = @Schema(implementation = Categoria.class)) }),
        @ApiResponse(responseCode = "400", description = "Datos de categoría inválidos"),
        @ApiResponse(responseCode = "404", description = "Categoría no encontrada")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Categoria> actualizarCategoria(
            @Parameter(description = "ID de la categoría a actualizar", required = true)
            @PathVariable Long id, 
            @Parameter(description = "Datos actualizados de la categoría", required = true)
            @RequestBody Categoria categoria) {
        categoria.setCategoriaId(id);
        Categoria categoriaActualizada = categoriaService.actualizarCategoria(categoria);
        return ResponseEntity.ok(categoriaActualizada);
    }    @Operation(summary = "Eliminar una categoría", 
               description = "Elimina una categoría del sistema por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Categoría eliminada correctamente"),
        @ApiResponse(responseCode = "404", description = "Categoría no encontrada"),
        @ApiResponse(responseCode = "400", description = "No se puede eliminar la categoría porque tiene productos asociados")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCategoria(
            @Parameter(description = "ID de la categoría a eliminar", required = true)
            @PathVariable Long id) {
        categoriaService.eliminarCategoria(id);
        return ResponseEntity.noContent().build();
    }    @Operation(summary = "Obtener una categoría por ID", 
               description = "Devuelve una categoría específica basada en su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Categoría encontrada", 
                     content = { @Content(mediaType = "application/json", 
                     schema = @Schema(implementation = Categoria.class)) }),
        @ApiResponse(responseCode = "404", description = "Categoría no encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Categoria> getCategoriaById(
            @Parameter(description = "ID de la categoría a buscar", required = true)
            @PathVariable Long id) {
        Categoria categoria = categoriaService.getCategoriaById(id);
        if (categoria != null) {
            return ResponseEntity.ok(categoria);
        }
        return ResponseEntity.notFound().build();
    }    @Operation(summary = "Obtener todas las categorías", 
               description = "Devuelve todas las categorías registradas en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Categorías encontradas", 
                     content = { @Content(mediaType = "application/json", 
                     schema = @Schema(implementation = Categoria.class)) })
    })
    @GetMapping
    public ResponseEntity<List<Categoria>> getAllCategorias() {
        List<Categoria> categorias = categoriaService.getAllCategorias();
        return ResponseEntity.ok(categorias);
    }

        @Operation(summary = "Obtener productos por categoría", 
               description = "Devuelve todos los productos asociados a una categoría específica")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Productos encontrados", 
                     content = { @Content(mediaType = "application/json", 
                     schema = @Schema(implementation = Producto.class)) }),
        @ApiResponse(responseCode = "404", description = "Categoría no encontrada")
    })
    @GetMapping("/{id}/productos")
    public ResponseEntity<List<Producto>> getProductosByCategoria(
            @Parameter(description = "ID de la categoría", required = true)
            @PathVariable Long id) {
        List<Producto> productos = categoriaService.getProductosByCategoria(id);
        return ResponseEntity.ok(productos);
    }
}
