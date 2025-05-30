package com.example.lbf.service.usuario;

import com.example.lbf.dto.response.LoginResponse;
import com.example.lbf.entities.Usuario;
import com.example.lbf.entities.Venta;

import java.time.LocalDateTime;
import java.util.List;

public interface UsuarioService {
    Usuario crearUsuario(Usuario usuario);
    Usuario actualizarUsuario(Usuario usuario);
    void desactivarUsuario(Long usuarioId);
    Usuario getUsuarioById(Long usuarioId);
    Usuario getUsuarioByUsername(String username);
    List<Usuario> getAllUsuarios();
    LoginResponse validarCredenciales(String username, String contrasena);
    void actualizarUltimoAcceso(Long usuarioId, LocalDateTime fechaAcceso);
    List<Venta> getHistorialVentas(Long usuarioId);
    List<Usuario> getUsuariosByRol(String rol);
}
