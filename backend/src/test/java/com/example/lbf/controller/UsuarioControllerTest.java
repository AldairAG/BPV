package com.example.lbf.controller;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import java.time.LocalDateTime;
import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import com.example.lbf.BaseIntegrationTest;
import com.example.lbf.entities.Usuario;
import com.example.lbf.repository.UsuarioRepository;

/**
 * Pruebas de integración para el controlador de Usuarios.
 * 
 * Estas pruebas validan el funcionamiento correcto de todos los endpoints
 * relacionados con la gestión de usuarios, incluyendo la creación, 
 * actualización, consulta y eliminación de usuarios.
 */
@DisplayName("Pruebas del Controlador de Usuarios")
public class UsuarioControllerTest extends BaseIntegrationTest {

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @BeforeEach
    public void setupTestData() {
        // Limpiar la base de datos de prueba
        usuarioRepository.deleteAll();
        
        // Crear usuarios de prueba
        Usuario admin = new Usuario();
        admin.setUsername("admin");
        admin.setContrasena("admin123");
        admin.setNombre("Administrador");
        admin.setRol("ADMIN");
        admin.setEstado(true);
        admin.setUltimoAcceso(LocalDateTime.now());
        
        Usuario vendedor = new Usuario();
        vendedor.setUsername("vendedor");
        vendedor.setContrasena("vend123");
        vendedor.setNombre("Vendedor Prueba");
        vendedor.setRol("VENDEDOR");
        vendedor.setEstado(true);
        vendedor.setUltimoAcceso(LocalDateTime.now());
        
        usuarioRepository.saveAll(Arrays.asList(admin, vendedor));
    }
    
    @Test
    @DisplayName("Debería listar todos los usuarios")
    public void shouldListAllUsers() throws Exception {
        // When: Se realiza una petición GET a /api/usuarios
        ResultActions response = mockMvc.perform(get("/api/usuarios")
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].username", is("admin")))
                .andExpect(jsonPath("$[1].username", is("vendedor")));
    }
    
    @Test
    @DisplayName("Debería obtener un usuario por su ID")
    public void shouldGetUserById() throws Exception {
        // Given: Un ID de usuario existente
        Usuario usuario = usuarioRepository.findByUsername("admin").orElseThrow();
        Long usuarioId = usuario.getId();
        
        // When: Se realiza una petición GET a /api/usuarios/{id}
        ResultActions response = mockMvc.perform(get("/api/usuarios/{id}", usuarioId)
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.username", is("admin")))
                .andExpect(jsonPath("$.nombre", is("Administrador")));
    }
    
    @Test
    @DisplayName("Debería crear un nuevo usuario")
    public void shouldCreateNewUser() throws Exception {
        // Given: Un objeto usuario a crear
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setUsername("nuevo");
        nuevoUsuario.setContrasena("nuevo123");
        nuevoUsuario.setNombre("Usuario Nuevo");
        nuevoUsuario.setRol("VENDEDOR");
        
        // When: Se realiza una petición POST a /api/usuarios
        ResultActions response = mockMvc.perform(post("/api/usuarios")
                .with(user("test").password("test").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoUsuario)));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.username", is("nuevo")))
                .andExpect(jsonPath("$.nombre", is("Usuario Nuevo")))
                .andExpect(jsonPath("$.estado", is(true)));
        
        // Verificar que se ha guardado en la base de datos
        Usuario saved = usuarioRepository.findByUsername("nuevo").orElseThrow();
        assert saved.getNombre().equals("Usuario Nuevo");
    }
    
    @Test
    @DisplayName("Debería actualizar un usuario existente")
    public void shouldUpdateExistingUser() throws Exception {
        // Given: Un usuario existente
        Usuario usuario = usuarioRepository.findByUsername("vendedor").orElseThrow();
        Long usuarioId = usuario.getId();
        
        // Datos actualizados
        usuario.setNombre("Vendedor Actualizado");
        
        // When: Se realiza una petición PUT a /api/usuarios/{id}
        ResultActions response = mockMvc.perform(put("/api/usuarios/{id}", usuarioId)
                .with(user("test").password("test").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuario)));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.nombre", is("Vendedor Actualizado")));
        
        // Verificar que se ha actualizado en la base de datos
        Usuario updated = usuarioRepository.findById(usuarioId).orElseThrow();
        assert updated.getNombre().equals("Vendedor Actualizado");
    }
    
    @Test
    @DisplayName("Debería desactivar un usuario")
    public void shouldDeactivateUser() throws Exception {
        // Given: Un usuario existente
        Usuario usuario = usuarioRepository.findByUsername("vendedor").orElseThrow();
        Long usuarioId = usuario.getId();
        
        // When: Se realiza una petición DELETE a /api/usuarios/{id}
        ResultActions response = mockMvc.perform(delete("/api/usuarios/{id}", usuarioId)
                .with(user("test").password("test").roles("ADMIN")));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isNoContent());
        
        // Verificar que el usuario ha sido desactivado
        Usuario deactivated = usuarioRepository.findById(usuarioId).orElseThrow();
        assert deactivated.getEstado() == false;
    }
    
    @Test
    @DisplayName("Debería validar credenciales correctamente")
    public void shouldValidateCredentials() throws Exception {
        // Given: Credenciales de un usuario
        String loginJson = "{\"username\":\"admin\",\"contrasena\":\"admin123\"}";
        
        // When: Se realiza una petición POST a /api/usuarios/login
        ResultActions response = mockMvc.perform(post("/api/usuarios/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.username", is("admin")))
                .andExpect(jsonPath("$.rol", is("ADMIN")));
    }
    
    @Test
    @DisplayName("Debería rechazar credenciales incorrectas")
    public void shouldRejectInvalidCredentials() throws Exception {
        // Given: Credenciales incorrectas
        String loginJson = "{\"username\":\"admin\",\"contrasena\":\"incorrecto\"}";
        
        // When: Se realiza una petición POST a /api/usuarios/login
        ResultActions response = mockMvc.perform(post("/api/usuarios/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson));
        
        // Then: Se verifica la respuesta
        response.andExpect(status().isUnauthorized());
    }
}
