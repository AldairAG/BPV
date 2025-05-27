package com.example.lbf.controller;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import com.example.lbf.BaseIntegrationTest;
import com.example.lbf.entities.Categoria;
import com.example.lbf.entities.Producto;
import com.example.lbf.repository.CategoriaRepository;
import com.example.lbf.repository.ProductoRepository;

/**
 * Pruebas de integración para el controlador de Productos.
 * 
 * Estas pruebas validan el funcionamiento correcto de todos los endpoints
 * relacionados con la gestión de productos, incluyendo la creación, 
 * actualización, consulta y eliminación de productos, así como la 
 * gestión de stock.
 */
@DisplayName("Pruebas del Controlador de Productos")
public class ProductoControllerTest extends BaseIntegrationTest {

    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    private Categoria categoriaBebidas;
    private Categoria categoriaComidas;
    
    @BeforeEach
    public void setupTestData() {
        // Limpiar la base de datos de prueba
        productoRepository.deleteAll();
        categoriaRepository.deleteAll();
        
        // Crear categorías de prueba
        categoriaBebidas = new Categoria();
        categoriaBebidas.setNombre("Bebidas");
        categoriaBebidas.setColor("#FF0000");
        
        categoriaComidas = new Categoria();
        categoriaComidas.setNombre("Comidas");
        categoriaComidas.setColor("#00FF00");
        
        categoriaRepository.saveAll(Arrays.asList(categoriaBebidas, categoriaComidas));
        
        // Crear productos de prueba
        Producto producto1 = new Producto();
        producto1.setNombre("Agua Mineral");
        producto1.setPrecio(1.5f);
        producto1.setStock(50.0f);
        producto1.setCategoria(categoriaBebidas);
        
        Producto producto2 = new Producto();
        producto2.setNombre("Sandwich");
        producto2.setPrecio(3.5f);
        producto2.setStock(20.0f);
        producto2.setCategoria(categoriaComidas);
        
        Producto producto3 = new Producto();
        producto3.setNombre("Refresco");
        producto3.setPrecio(2.0f);
        producto3.setStock(40.0f);
        producto3.setCategoria(categoriaBebidas);
        
        productoRepository.saveAll(Arrays.asList(producto1, producto2, producto3));
    }
    
    @Test
    @DisplayName("Debería listar todos los productos")
    public void shouldListAllProducts() throws Exception {
        // When: Se realiza una petición GET a /api/productos
        ResultActions response = mockMvc.perform(get("/api/productos")
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].nombre", is("Agua Mineral")))
                .andExpect(jsonPath("$[1].nombre", is("Sandwich")))
                .andExpect(jsonPath("$[2].nombre", is("Refresco")));
    }
    
    @Test
    @DisplayName("Debería obtener un producto por su ID")
    public void shouldGetProductById() throws Exception {
        // Given: Un ID de producto existente
        Producto producto = productoRepository.findByNombreContainingIgnoreCase("Agua").get(0);
        Long productoId = producto.getProductoId();
        
        // When: Se realiza una petición GET a /api/productos/{id}
        ResultActions response = mockMvc.perform(get("/api/productos/{id}", productoId)
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.nombre", is("Agua Mineral")))
                .andExpect(jsonPath("$.precio", is(1.5)))
                .andExpect(jsonPath("$.stock", is(50.0)));
    }
    
    @Test
    @DisplayName("Debería crear un nuevo producto")
    public void shouldCreateNewProduct() throws Exception {
        // Given: Un objeto producto a crear
        Producto nuevoProducto = new Producto();
        nuevoProducto.setNombre("Jugo Natural");
        nuevoProducto.setPrecio(2.5f);
        nuevoProducto.setStock(30.0f);
        nuevoProducto.setCategoria(categoriaBebidas);
        
        // When: Se realiza una petición POST a /api/productos
        ResultActions response = mockMvc.perform(post("/api/productos")
                .with(user("test").password("test").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoProducto)));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.nombre", is("Jugo Natural")))
                .andExpect(jsonPath("$.precio", is(2.5)))
                .andExpect(jsonPath("$.stock", is(30.0)));
        
        // Verificar que se ha guardado en la base de datos
        Producto saved = productoRepository.findByNombreContainingIgnoreCase("Jugo").get(0);
        assert saved.getNombre().equals("Jugo Natural");
    }
    
    @Test
    @DisplayName("Debería actualizar un producto existente")
    public void shouldUpdateExistingProduct() throws Exception {
        // Given: Un producto existente
        Producto producto = productoRepository.findByNombreContainingIgnoreCase("Sandwich").get(0);
        Long productoId = producto.getProductoId();
        
        // Datos actualizados
        producto.setNombre("Sandwich Especial");
        producto.setPrecio(4.0f);
        
        // When: Se realiza una petición PUT a /api/productos/{id}
        ResultActions response = mockMvc.perform(put("/api/productos/{id}", productoId)
                .with(user("test").password("test").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(producto)));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.nombre", is("Sandwich Especial")))
                .andExpect(jsonPath("$.precio", is(4.0)));
        
        // Verificar que se ha actualizado en la base de datos
        Producto updated = productoRepository.findById(productoId).orElseThrow();
        assert updated.getNombre().equals("Sandwich Especial");
        assert updated.getPrecio() == 4.0f;
    }
    
    @Test
    @DisplayName("Debería actualizar el stock de un producto")
    public void shouldUpdateProductStock() throws Exception {
        // Given: Un producto existente
        Producto producto = productoRepository.findByNombreContainingIgnoreCase("Refresco").get(0);
        Long productoId = producto.getProductoId();
        Float stockInicial = producto.getStock();
        Float incremento = 10.0f;
        
        // When: Se realiza una petición PATCH a /api/productos/{id}/stock
        ResultActions response = mockMvc.perform(patch("/api/productos/{id}/stock", productoId)
                .with(user("test").password("test").roles("ADMIN"))
                .param("cantidad", incremento.toString()));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().string("true"));
        
        // Verificar que el stock se ha actualizado
        Producto updated = productoRepository.findById(productoId).orElseThrow();
        assert updated.getStock() == stockInicial + incremento;
    }
    
    @Test
    @DisplayName("Debería verificar disponibilidad de un producto")
    public void shouldCheckProductAvailability() throws Exception {
        // Given: Un producto existente
        Producto producto = productoRepository.findByNombreContainingIgnoreCase("Agua").get(0);
        Long productoId = producto.getProductoId();
        Float cantidadSolicitada = 20.0f; // Menos que el stock (50)
        
        // When: Se realiza una petición GET a /api/productos/{id}/disponibilidad
        ResultActions response = mockMvc.perform(get("/api/productos/{id}/disponibilidad", productoId)
                .with(user("test").password("test").roles("ADMIN"))
                .param("cantidad", cantidadSolicitada.toString()));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().string("true"));
        
        // Cuando la cantidad solicitada es mayor que el stock
        Float cantidadExcesiva = 100.0f; // Más que el stock (50)
        
        // When: Se realiza una petición GET a /api/productos/{id}/disponibilidad
        ResultActions response2 = mockMvc.perform(get("/api/productos/{id}/disponibilidad", productoId)
                .with(user("test").password("test").roles("ADMIN"))
                .param("cantidad", cantidadExcesiva.toString()));
        
        // Then: Se verifica la respuesta
        response2.andExpect(status().isOk())
                .andExpect(content().string("false"));
    }
    
    @Test
    @DisplayName("Debería buscar productos por criterio")
    public void shouldSearchProductsByQuery() throws Exception {
        // When: Se realiza una petición GET a /api/productos/buscar
        ResultActions response = mockMvc.perform(get("/api/productos/buscar")
                .with(user("test").password("test").roles("ADMIN"))
                .param("criterio", "beb"));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }
    
    @Test
    @DisplayName("Debería encontrar productos con stock bajo")
    public void shouldFindProductsWithLowStock() throws Exception {
        // When: Se realiza una petición GET a /api/productos/bajo-stock
        ResultActions response = mockMvc.perform(get("/api/productos/bajo-stock")
                .with(user("test").password("test").roles("ADMIN"))
                .param("stockMinimo", "30.0"));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].nombre", is("Sandwich")));
    }
}
