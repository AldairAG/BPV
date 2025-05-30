package com.example.lbf.controller;

import com.example.lbf.dto.response.LoginResponse;
import com.example.lbf.entities.Usuario;
import com.example.lbf.entities.Venta;
import com.example.lbf.service.usuario.UsuarioService;

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

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controlador REST para la gestión de usuarios.
 * Proporciona endpoints para crear, actualizar, consultar y desactivar usuarios,
 * así como para validar credenciales y obtener historial de ventas.
 */
@RestController
@RequestMapping("/lbf/usuarios")
@CrossOrigin(origins = "*")
@Tag(name = "Usuarios", description = "API para la gestión de usuarios del sistema")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Operation(summary = "Crear un nuevo usuario", description = "Crea un nuevo usuario en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Usuario creado correctamente", 
                     content = { @Content(mediaType = "application/json", 
                     schema = @Schema(implementation = Usuario.class)) }),
        @ApiResponse(responseCode = "400", description = "Datos de usuario inválidos"),
        @ApiResponse(responseCode = "409", description = "El nombre de usuario ya existe")
    })
    @PostMapping
    public ResponseEntity<Usuario> crearUsuario(
            @Parameter(description = "Datos del usuario a crear", required = true)
            @RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioService.crearUsuario(usuario);
        return new ResponseEntity<>(nuevoUsuario, HttpStatus.CREATED);
    }

    @Operation(summary = "Actualizar un usuario existente", 
               description = "Actualiza los datos de un usuario identificado por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario actualizado correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos de usuario inválidos"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizarUsuario(
            @Parameter(description = "ID del usuario a actualizar", required = true)
            @PathVariable Long id, 
            @Parameter(description = "Datos actualizados del usuario", required = true)
            @RequestBody Usuario usuario) {
        usuario.setId(id);
        Usuario usuarioActualizado = usuarioService.actualizarUsuario(usuario);
        return ResponseEntity.ok(usuarioActualizado);
    }

    @Operation(summary = "Desactivar un usuario", 
               description = "Desactiva un usuario en el sistema sin eliminarlo de la base de datos")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Usuario desactivado correctamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivarUsuario(
            @Parameter(description = "ID del usuario a desactivar", required = true)
            @PathVariable Long id) {
        usuarioService.desactivarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Obtener un usuario por su ID", 
               description = "Retorna un usuario según su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(
            @Parameter(description = "ID del usuario a buscar", required = true)
            @PathVariable Long id) {
        Usuario usuario = usuarioService.getUsuarioById(id);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.notFound().build();
    }    @Operation(summary = "Obtener un usuario por su nombre de usuario", 
               description = "Retorna un usuario según su nombre de usuario")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @GetMapping("/username/{username}")
    public ResponseEntity<Usuario> getUsuarioByUsername(
            @Parameter(description = "Nombre de usuario a buscar", required = true)
            @PathVariable String username) {
        Usuario usuario = usuarioService.getUsuarioByUsername(username);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Obtener todos los usuarios", 
               description = "Retorna una lista con todos los usuarios del sistema")
    @ApiResponse(responseCode = "200", description = "Lista de usuarios obtenida correctamente")
    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        List<Usuario> usuarios = usuarioService.getAllUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    @Operation(summary = "Iniciar sesión de usuario", 
               description = "Valida las credenciales de un usuario y retorna sus datos y el token si son correctas")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Credenciales válidas, sesión iniciada"),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas")
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Parameter(description = "Credenciales de inicio de sesión", required = true)
            @RequestBody LoginRequest loginRequest) {

        LoginResponse loginResponse = usuarioService.validarCredenciales(
            loginRequest.getUsername(), loginRequest.getContrasena());
        
        if (loginResponse.getSucces()) {
            Usuario usuario = usuarioService.getUsuarioByUsername(loginRequest.getUsername());
            usuarioService.actualizarUltimoAcceso(usuario.getId(), LocalDateTime.now());
            return ResponseEntity.ok(loginResponse);
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @Operation(summary = "Obtener historial de ventas de un usuario", 
               description = "Retorna todas las ventas realizadas por un usuario específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Historial de ventas obtenido correctamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @GetMapping("/{id}/ventas")
    public ResponseEntity<List<Venta>> getHistorialVentas(
            @Parameter(description = "ID del usuario", required = true)
            @PathVariable Long id) {
        List<Venta> ventas = usuarioService.getHistorialVentas(id);
        return ResponseEntity.ok(ventas);
    }

    @Operation(summary = "Obtener usuarios por rol", 
               description = "Retorna todos los usuarios que tienen un rol específico")
    @ApiResponse(responseCode = "200", description = "Lista de usuarios obtenida correctamente")
    @GetMapping("/rol/{rol}")
    public ResponseEntity<List<Usuario>> getUsuariosByRol(
            @Parameter(description = "Rol de los usuarios a buscar (ADMIN, VENDEDOR, etc.)", required = true)
            @PathVariable String rol) {
        List<Usuario> usuarios = usuarioService.getUsuariosByRol(rol);
        return ResponseEntity.ok(usuarios);
    }
      /**
     * Clase interna para manejar las solicitudes de inicio de sesión.
     */
    static class LoginRequest {
        @Schema(description = "Nombre de usuario", example = "admin", required = true)
        private String username;
        
        @Schema(description = "Contraseña del usuario", example = "password123", required = true)
        private String contrasena;
        
        public String getUsername() {
            return username;
        }
        
        public void setUsername(String username) {
            this.username = username;
        }
        
        public String getContrasena() {
            return contrasena;
        }
        
        public void setContrasena(String contrasena) {
            this.contrasena = contrasena;
        }
    }
}
