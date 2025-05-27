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
 * Pruebas de integración para el controlador de Categorías.
 * 
 * Estas pruebas validan el funcionamiento correcto de todos los endpoints
 * relacionados con la gestión de categorías, incluyendo la creación, 
 * actualización, consulta y eliminación de categorías.
 */
@DisplayName("Pruebas del Controlador de Categorías")
public class CategoriaControllerTest extends BaseIntegrationTest {

    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @BeforeEach
    public void setupTestData() {
        // Limpiar la base de datos de prueba
        productoRepository.deleteAll();
        categoriaRepository.deleteAll();
        
        // Crear categorías de prueba
        Categoria categoria1 = new Categoria();
        categoria1.setNombre("Electrónica");
        categoria1.setColor("#0000FF");
        
        Categoria categoria2 = new Categoria();
        categoria2.setNombre("Ropa");
        categoria2.setColor("#FF0000");
        
        categoriaRepository.saveAll(Arrays.asList(categoria1, categoria2));
        
        // Crear productos para las categorías
        Producto producto1 = new Producto();
        producto1.setNombre("Celular");
        producto1.setPrecio(500.0f);
        producto1.setStock(10.0f);
        producto1.setCategoria(categoria1);
        
        Producto producto2 = new Producto();
        producto2.setNombre("Laptop");
        producto2.setPrecio(1000.0f);
        producto2.setStock(5.0f);
        producto2.setCategoria(categoria1);
        
        Producto producto3 = new Producto();
        producto3.setNombre("Camiseta");
        producto3.setPrecio(20.0f);
        producto3.setStock(100.0f);
        producto3.setCategoria(categoria2);
        
        productoRepository.saveAll(Arrays.asList(producto1, producto2, producto3));
    }
    
    @Test
    @DisplayName("Debería listar todas las categorías")
    public void shouldListAllCategories() throws Exception {
        // When: Se realiza una petición GET a /api/categorias
        ResultActions response = mockMvc.perform(get("/api/categorias")
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].nombre", is("Electrónica")))
                .andExpect(jsonPath("$[1].nombre", is("Ropa")));
    }
    
    @Test
    @DisplayName("Debería obtener una categoría por su ID")
    public void shouldGetCategoryById() throws Exception {
        // Given: Una categoría existente
        Categoria categoria = categoriaRepository.findAll().get(0);
        Long categoriaId = categoria.getCategoriaId();
        
        // When: Se realiza una petición GET a /api/categorias/{id}
        ResultActions response = mockMvc.perform(get("/api/categorias/{id}", categoriaId)
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.nombre", is("Electrónica")))
                .andExpect(jsonPath("$.color", is("#0000FF")));
    }
    
    @Test
    @DisplayName("Debería crear una nueva categoría")
    public void shouldCreateNewCategory() throws Exception {
        // Given: Un objeto categoría a crear
        Categoria nuevaCategoria = new Categoria();
        nuevaCategoria.setNombre("Hogar");
        nuevaCategoria.setColor("#00FF00");
        
        // When: Se realiza una petición POST a /api/categorias
        ResultActions response = mockMvc.perform(post("/api/categorias")
                .with(user("test").password("test").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevaCategoria)));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.nombre", is("Hogar")))
                .andExpect(jsonPath("$.color", is("#00FF00")));
        
        // Verificar que se ha guardado en la base de datos
        assert categoriaRepository.findAll().size() == 3;
    }
    
    @Test
    @DisplayName("Debería actualizar una categoría existente")
    public void shouldUpdateExistingCategory() throws Exception {
        // Given: Una categoría existente
        Categoria categoria = categoriaRepository.findAll().get(0);
        Long categoriaId = categoria.getCategoriaId();
        
        // Datos actualizados
        categoria.setNombre("Tecnología");
        categoria.setColor("#000088");
        
        // When: Se realiza una petición PUT a /api/categorias/{id}
        ResultActions response = mockMvc.perform(put("/api/categorias/{id}", categoriaId)
                .with(user("test").password("test").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(categoria)));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.nombre", is("Tecnología")))
                .andExpect(jsonPath("$.color", is("#000088")));
        
        // Verificar que se ha actualizado en la base de datos
        Categoria updated = categoriaRepository.findById(categoriaId).orElseThrow();
        assert updated.getNombre().equals("Tecnología");
        assert updated.getColor().equals("#000088");
    }
    
    @Test
    @DisplayName("Debería eliminar una categoría")
    public void shouldDeleteCategory() throws Exception {
        // Given: Una categoría sin productos
        Categoria nuevaCategoria = new Categoria();
        nuevaCategoria.setNombre("Temporal");
        nuevaCategoria.setColor("#CCCCCC");
        nuevaCategoria = categoriaRepository.save(nuevaCategoria);
        Long categoriaId = nuevaCategoria.getCategoriaId();
        
        // When: Se realiza una petición DELETE a /api/categorias/{id}
        ResultActions response = mockMvc.perform(delete("/api/categorias/{id}", categoriaId)
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isNoContent());
        
        // Verificar que la categoría ya no existe
        assert categoriaRepository.findById(categoriaId).isEmpty();
    }
    
    @Test
    @DisplayName("Debería obtener productos por categoría")
    public void shouldGetProductsByCategory() throws Exception {
        // Given: Una categoría existente con productos
        Categoria categoria = categoriaRepository.findAll().get(0); // Electrónica
        Long categoriaId = categoria.getCategoriaId();
        
        // When: Se realiza una petición GET a /api/categorias/{id}/productos
        ResultActions response = mockMvc.perform(get("/api/categorias/{id}/productos", categoriaId)
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].nombre", is("Celular")))
                .andExpect(jsonPath("$[1].nombre", is("Laptop")));
        
        // Verificar con otra categoría
        Categoria categoria2 = categoriaRepository.findAll().get(1); // Ropa
        Long categoriaId2 = categoria2.getCategoriaId();
        
        // When: Se realiza una petición GET a /api/categorias/{id}/productos
        ResultActions response2 = mockMvc.perform(get("/api/categorias/{id}/productos", categoriaId2)
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response2.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nombre", is("Camiseta")));
    }
}
