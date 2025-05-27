package com.example.lbf.controller;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import com.example.lbf.BaseIntegrationTest;
import com.example.lbf.entities.Categoria;
import com.example.lbf.entities.Producto;
import com.example.lbf.entities.ProductoVendido;
import com.example.lbf.entities.Usuario;
import com.example.lbf.entities.Venta;
import com.example.lbf.repository.CategoriaRepository;
import com.example.lbf.repository.ProductoRepository;
import com.example.lbf.repository.UsuarioRepository;
import com.example.lbf.repository.VentaRepository;
import com.example.lbf.controller.VentaController.VentaRequest;

/**
 * Pruebas de integración para el controlador de Ventas.
 * 
 * Estas pruebas validan el funcionamiento correcto de todos los endpoints
 * relacionados con la gestión de ventas, incluyendo la creación, 
 * consulta y anulación de ventas, así como la búsqueda por diferentes
 * criterios.
 */
@DisplayName("Pruebas del Controlador de Ventas")
public class VentaControllerTest extends BaseIntegrationTest {

    @Autowired
    private VentaRepository ventaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    private Usuario vendedor;
    private Producto producto1;
    private Producto producto2;
    
    @BeforeEach
    public void setupTestData() {
        // Limpiar la base de datos de prueba
        ventaRepository.deleteAll();
        productoRepository.deleteAll();
        categoriaRepository.deleteAll();
        usuarioRepository.deleteAll();
        
        // Crear usuario de prueba
        vendedor = new Usuario();
        vendedor.setUsername("vendedor");
        vendedor.setContrasena("vend123");
        vendedor.setNombre("Vendedor Prueba");
        vendedor.setRol("VENDEDOR");
        vendedor.setEstado(true);
        vendedor.setUltimoAcceso(LocalDateTime.now());
        
        usuarioRepository.save(vendedor);
        
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
        
        // Crear algunas ventas de prueba
        Venta venta1 = new Venta();
        venta1.setUsuario(vendedor);
        venta1.setFecha(LocalDate.now());
        venta1.setTotal(new BigDecimal("30.00"));
        venta1.setConIva(true);
        
        ProductoVendido pv1 = new ProductoVendido();
        pv1.setProducto(producto1);
        pv1.setCantidad(2.0f);
        pv1.setDescuento(0.0f);
        pv1.setSubtotal(20.0f);
        pv1.setVenta(venta1);
        
        ProductoVendido pv2 = new ProductoVendido();
        pv2.setProducto(producto2);
        pv2.setCantidad(0.5f);
        pv2.setDescuento(0.0f);
        pv2.setSubtotal(10.0f);
        pv2.setVenta(venta1);
        
        venta1.setProductosVendidos(Arrays.asList(pv1, pv2));
        
        Venta venta2 = new Venta();
        venta2.setUsuario(vendedor);
        venta2.setFecha(LocalDate.now().minusDays(1));
        venta2.setTotal(new BigDecimal("20.00"));
        venta2.setConIva(false);
        
        ProductoVendido pv3 = new ProductoVendido();
        pv3.setProducto(producto2);
        pv3.setCantidad(1.0f);
        pv3.setDescuento(0.0f);
        pv3.setSubtotal(20.0f);
        pv3.setVenta(venta2);
        
        venta2.setProductosVendidos(Arrays.asList(pv3));
        
        ventaRepository.saveAll(Arrays.asList(venta1, venta2));
    }
    
    @Test
    @DisplayName("Debería crear una nueva venta")
    public void shouldCreateNewSale() throws Exception {
        // Given: Una solicitud de venta
        VentaRequest ventaRequest = new VentaRequest();
        ventaRequest.setUsuarioId(vendedor.getId());
        ventaRequest.setConIva(true);
        
        List<ProductoVendido> productos = new ArrayList<>();
        
        ProductoVendido pv = new ProductoVendido();
        pv.setProducto(producto1);
        pv.setCantidad(3.0f);
        pv.setDescuento(0.0f);
        pv.setSubtotal(30.0f);
        
        productos.add(pv);
        ventaRequest.setProductos(productos);
        
        // When: Se realiza una petición POST a /api/ventas
        ResultActions response = mockMvc.perform(post("/api/ventas")
                .with(user("test").password("test").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ventaRequest)));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.total", is(30.0)))
                .andExpect(jsonPath("$.conIva", is(true)))
                .andExpect(jsonPath("$.productosVendidos", hasSize(1)));
        
        // Verificar que el stock del producto se ha reducido
        Producto updatedProducto = productoRepository.findById(producto1.getProductoId()).orElseThrow();
        assert updatedProducto.getStock() == 97.0f; // 100 - 3 = 97
    }
    
    @Test
    @DisplayName("Debería obtener una venta por su ID")
    public void shouldGetSaleById() throws Exception {
        // Given: Una venta existente
        Venta venta = ventaRepository.findAll().get(0);
        Long ventaId = venta.getVentaId();
        
        // When: Se realiza una petición GET a /api/ventas/{id}
        ResultActions response = mockMvc.perform(get("/api/ventas/{id}", ventaId)
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.ventaId", is(ventaId.intValue())))
                .andExpect(jsonPath("$.productosVendidos", hasSize(2)));
    }
    
    @Test
    @DisplayName("Debería obtener ventas por usuario")
    public void shouldGetSalesByUser() throws Exception {
        // Given: Un usuario con ventas
        Long usuarioId = vendedor.getId();
        
        // When: Se realiza una petición GET a /api/ventas/usuario/{usuarioId}
        ResultActions response = mockMvc.perform(get("/api/ventas/usuario/{usuarioId}", usuarioId)
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)));
    }
    
    @Test
    @DisplayName("Debería obtener ventas por fecha")
    public void shouldGetSalesByDate() throws Exception {
        // Given: Fecha de hoy
        LocalDate hoy = LocalDate.now();
        
        // When: Se realiza una petición GET a /api/ventas/fecha
        ResultActions response = mockMvc.perform(get("/api/ventas/fecha")
                .with(user("test").password("test").roles("ADMIN"))
                .param("fecha", hoy.toString()));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].total", is(30.0)));
    }
    
    @Test
    @DisplayName("Debería obtener ventas por rango de fechas")
    public void shouldGetSalesByDateRange() throws Exception {
        // Given: Rango de fechas
        LocalDate hoy = LocalDate.now();
        LocalDate ayer = hoy.minusDays(1);
        
        // When: Se realiza una petición GET a /api/ventas/rango
        ResultActions response = mockMvc.perform(get("/api/ventas/rango")
                .with(user("test").password("test").roles("ADMIN"))
                .param("fechaInicio", ayer.toString())
                .param("fechaFin", hoy.toString()));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)));
    }
    
    @Test
    @DisplayName("Debería calcular el total de ventas en un rango")
    public void shouldCalculateTotalSales() throws Exception {
        // Given: Rango de fechas
        LocalDate hoy = LocalDate.now();
        LocalDate ayer = hoy.minusDays(1);
        
        // When: Se realiza una petición GET a /api/ventas/total
        ResultActions response = mockMvc.perform(get("/api/ventas/total")
                .with(user("test").password("test").roles("ADMIN"))
                .param("fechaInicio", ayer.toString())
                .param("fechaFin", hoy.toString()));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", is(50.0)));
    }
    
    @Test
    @DisplayName("Debería anular una venta")
    public void shouldCancelSale() throws Exception {
        // Given: Una venta existente
        Venta venta = ventaRepository.findAll().get(0);
        Long ventaId = venta.getVentaId();
        
        // Guardar stock actual para verificar después
        Float stockProducto1Antes = producto1.getStock();
        Float stockProducto2Antes = producto2.getStock();
        
        // When: Se realiza una petición DELETE a /api/ventas/{id}
        ResultActions response = mockMvc.perform(delete("/api/ventas/{id}", ventaId)
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isNoContent());
        
        // Verificar que la venta ya no existe
        assert ventaRepository.findById(ventaId).isEmpty();
        
        // Verificar que el stock de los productos se ha restaurado
        Producto updatedProducto1 = productoRepository.findById(producto1.getProductoId()).orElseThrow();
        Producto updatedProducto2 = productoRepository.findById(producto2.getProductoId()).orElseThrow();
        
        assert updatedProducto1.getStock() == stockProducto1Antes + 2.0f; // +2 unidades
        assert updatedProducto2.getStock() == stockProducto2Antes + 0.5f; // +0.5 unidades
    }
    
    @Test
    @DisplayName("Debería buscar ventas por criterio")
    public void shouldSearchSalesByCriteria() throws Exception {
        // When: Se realiza una petición GET a /api/ventas/buscar
        ResultActions response = mockMvc.perform(get("/api/ventas/buscar")
                .with(user("test").password("test").roles("ADMIN"))
                .param("criterio", "Vendedor"));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }
    
    // Clase auxiliar para la creación de ventas en la prueba
    static class VentaRequest {
        private Long usuarioId;
        private List<ProductoVendido> productos;
        private Boolean conIva;
        
        public Long getUsuarioId() {
            return usuarioId;
        }
        
        public void setUsuarioId(Long usuarioId) {
            this.usuarioId = usuarioId;
        }
        
        public List<ProductoVendido> getProductos() {
            return productos;
        }
        
        public void setProductos(List<ProductoVendido> productos) {
            this.productos = productos;
        }
        
        public Boolean getConIva() {
            return conIva;
        }
        
        public void setConIva(Boolean conIva) {
            this.conIva = conIva;
        }
    }
}
