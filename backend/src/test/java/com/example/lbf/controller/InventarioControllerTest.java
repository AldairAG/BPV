package com.example.lbf.controller;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import com.example.lbf.BaseIntegrationTest;
import com.example.lbf.entities.Categoria;
import com.example.lbf.entities.MovimientoInventario;
import com.example.lbf.entities.Producto;
import com.example.lbf.repository.CategoriaRepository;
import com.example.lbf.repository.MovimientoInventarioRepository;
import com.example.lbf.repository.ProductoRepository;

/**
 * Pruebas de integración para el controlador de Inventario.
 * 
 * Estas pruebas validan el funcionamiento correcto de todos los endpoints
 * relacionados con la gestión de inventario, incluyendo la actualización de stock,
 * registro de entradas y salidas, y consulta de movimientos.
 */
@DisplayName("Pruebas del Controlador de Inventario")
public class InventarioControllerTest extends BaseIntegrationTest {

    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private MovimientoInventarioRepository movimientoInventarioRepository;
    
    private Producto producto1;
    private Producto producto2;
    
    @BeforeEach
    public void setupTestData() {
        // Limpiar la base de datos de prueba
        movimientoInventarioRepository.deleteAll();
        productoRepository.deleteAll();
        categoriaRepository.deleteAll();
        
        // Crear categoría de prueba
        Categoria categoria = new Categoria();
        categoria.setNombre("General");
        categoria.setColor("#FFFFFF");
        
        categoriaRepository.save(categoria);
        
        // Crear productos de prueba
        producto1 = new Producto();
        producto1.setNombre("Producto 1");
        producto1.setPrecio(10.0f);
        producto1.setStock(100.0f);
        producto1.setCategoria(categoria);
        
        producto2 = new Producto();
        producto2.setNombre("Producto 2");
        producto2.setPrecio(20.0f);
        producto2.setStock(50.0f);
        producto2.setCategoria(categoria);
        
        productoRepository.saveAll(Arrays.asList(producto1, producto2));
    }
    
    @Test
    @DisplayName("Debería actualizar el stock de un producto")
    public void shouldUpdateProductStock() throws Exception {
        // Given: Un producto existente
        Long productoId = producto1.getProductoId();
        Float cantidadIncremento = 20.0f;
        
        // When: Se realiza una petición PATCH a /api/inventario/stock/{productoId}
        ResultActions response = mockMvc.perform(patch("/api/inventario/stock/{productoId}", productoId)
                .with(user("test").password("test").roles("ADMIN"))
                .param("cantidad", cantidadIncremento.toString())
                .param("tipoMovimiento", "ENTRADA"));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().string("true"));
        
        // Verificar que el stock se ha actualizado
        Producto updated = productoRepository.findById(productoId).orElseThrow();
        assert updated.getStock() == 120.0f; // 100 + 20 = 120
        
        // Verificar que se ha registrado el movimiento
        assert movimientoInventarioRepository.findAll().size() > 0;
    }
    
    @Test
    @DisplayName("Debería rechazar actualización de stock que resulte en valores negativos")
    public void shouldRejectNegativeStockUpdate() throws Exception {
        // Given: Un producto existente
        Long productoId = producto1.getProductoId();
        Float cantidadExcesiva = 200.0f; // Mayor que el stock (100)
        
        // When: Se realiza una petición PATCH a /api/inventario/stock/{productoId}
        ResultActions response = mockMvc.perform(patch("/api/inventario/stock/{productoId}", productoId)
                .with(user("test").password("test").roles("ADMIN"))
                .param("cantidad", cantidadExcesiva.toString())
                .param("tipoMovimiento", "SALIDA"));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isBadRequest())
                .andExpect(content().string("false"));
        
        // Verificar que el stock no ha cambiado
        Producto unchanged = productoRepository.findById(productoId).orElseThrow();
        assert unchanged.getStock() == 100.0f;
    }
    
    @Test
    @DisplayName("Debería obtener el stock actual de un producto")
    public void shouldGetCurrentStock() throws Exception {
        // Given: Un producto existente
        Long productoId = producto1.getProductoId();
        
        // When: Se realiza una petición GET a /api/inventario/stock/{productoId}
        ResultActions response = mockMvc.perform(get("/api/inventario/stock/{productoId}", productoId)
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().string("100.0"));
    }
    
    @Test
    @DisplayName("Debería registrar entrada de inventario")
    public void shouldRegisterInventoryEntry() throws Exception {
        // Given: Un producto existente
        Long productoId = producto2.getProductoId();
        Float cantidad = 30.0f;
        String motivo = "Compra de mercadería";
        
        // When: Se realiza una petición POST a /api/inventario/entrada
        ResultActions response = mockMvc.perform(post("/api/inventario/entrada")
                .with(user("test").password("test").roles("ADMIN"))
                .param("productoId", productoId.toString())
                .param("cantidad", cantidad.toString())
                .param("motivo", motivo));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk());
        
        // Verificar que el stock se ha actualizado
        Producto updated = productoRepository.findById(productoId).orElseThrow();
        assert updated.getStock() == 80.0f; // 50 + 30 = 80
        
        // Verificar que se ha registrado el movimiento
        MovimientoInventario movimiento = movimientoInventarioRepository.findAll().get(0);
        assert movimiento.getProducto().getProductoId().equals(productoId);
        assert movimiento.getCantidad().equals(cantidad);
        assert movimiento.getTipoMovimiento().equals("ENTRADA");
        assert movimiento.getMotivo().equals(motivo);
    }
    
    @Test
    @DisplayName("Debería registrar salida de inventario")
    public void shouldRegisterInventoryOutput() throws Exception {
        // Given: Un producto existente
        Long productoId = producto2.getProductoId();
        Float cantidad = 10.0f;
        String motivo = "Ajuste por inventario";
        
        // When: Se realiza una petición POST a /api/inventario/salida
        ResultActions response = mockMvc.perform(post("/api/inventario/salida")
                .with(user("test").password("test").roles("ADMIN"))
                .param("productoId", productoId.toString())
                .param("cantidad", cantidad.toString())
                .param("motivo", motivo));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk());
        
        // Verificar que el stock se ha actualizado
        Producto updated = productoRepository.findById(productoId).orElseThrow();
        assert updated.getStock() == 40.0f; // 50 - 10 = 40
        
        // Verificar que se ha registrado el movimiento
        MovimientoInventario movimiento = movimientoInventarioRepository.findAll().get(0);
        assert movimiento.getProducto().getProductoId().equals(productoId);
        assert movimiento.getCantidad().equals(cantidad);
        assert movimiento.getTipoMovimiento().equals("SALIDA");
        assert movimiento.getMotivo().equals(motivo);
    }
    
    @Test
    @DisplayName("Debería obtener los productos con stock bajo")
    public void shouldGetProductsWithLowStock() throws Exception {
        // When: Se realiza una petición GET a /api/inventario/bajo-stock
        ResultActions response = mockMvc.perform(get("/api/inventario/bajo-stock")
                .with(user("test").password("test").roles("ADMIN"))
                .param("umbral", "60.0"));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nombre", is("Producto 2")));
    }
    
    @Test
    @DisplayName("Debería realizar un inventario físico")
    public void shouldPerformPhysicalInventory() throws Exception {
        // Given: Datos de conteo de inventario
        Map<String, Float> conteo = new HashMap<>();
        conteo.put(producto1.getProductoId().toString(), 90.0f); // Disminución
        conteo.put(producto2.getProductoId().toString(), 55.0f); // Aumento
        
        // When: Se realiza una petición POST a /api/inventario/inventario-fisico
        ResultActions response = mockMvc.perform(post("/api/inventario/inventario-fisico")
                .with(user("test").password("test").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(conteo)));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk());
        
        // Verificar que los stocks se han actualizado
        Producto updated1 = productoRepository.findById(producto1.getProductoId()).orElseThrow();
        Producto updated2 = productoRepository.findById(producto2.getProductoId()).orElseThrow();
        
        assert updated1.getStock() == 90.0f;
        assert updated2.getStock() == 55.0f;
        
        // Verificar que se han registrado los movimientos
        assert movimientoInventarioRepository.findAll().size() == 2;
    }
    
    @Test
    @DisplayName("Debería obtener el historial de movimientos de un producto")
    public void shouldGetProductMovementHistory() throws Exception {
        // Given: Un producto con movimientos
        Long productoId = producto1.getProductoId();
        
        // Registrar algunos movimientos
        mockMvc.perform(post("/api/inventario/entrada")
                .with(user("test").password("test").roles("ADMIN"))
                .param("productoId", productoId.toString())
                .param("cantidad", "10.0")
                .param("motivo", "Entrada prueba 1"));
        
        mockMvc.perform(post("/api/inventario/salida")
                .with(user("test").password("test").roles("ADMIN"))
                .param("productoId", productoId.toString())
                .param("cantidad", "5.0")
                .param("motivo", "Salida prueba 1"));
        
        // When: Se realiza una petición GET a /api/inventario/movimientos/{productoId}
        ResultActions response = mockMvc.perform(get("/api/inventario/movimientos/{productoId}", productoId)
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)));
    }
}
