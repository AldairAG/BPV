package com.example.lbf.service.usuario;

import com.example.lbf.auth.AuthService;
import com.example.lbf.dto.response.LoginResponse;
import com.example.lbf.entities.Usuario;
import com.example.lbf.entities.Venta;
import com.example.lbf.repository.UsuarioRepository;
import com.example.lbf.repository.VentaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private AuthService authService;

    @Override
    @Transactional
    public Usuario crearUsuario(Usuario usuario) {
        // Verificar si ya existen 2 sucursales
        long sucursalesCount = usuarioRepository.countDistinctSucursal();
        if (sucursalesCount >= 2 && usuarioRepository.countBySucursal(usuario.getSucursal()) == 0) {
            throw new IllegalStateException("No se pueden crear más de 2 sucursales.");
        }

        // Verificar si ya existen 3 usuarios en la sucursal
        long usuariosEnSucursal = usuarioRepository.countBySucursal(usuario.getSucursal());
        if (usuariosEnSucursal >= 3) {
            throw new IllegalStateException("No se pueden crear más de 3 usuarios por sucursal.");
        }

        usuario.setActivo(true);
        usuario.setUltimoAcceso(LocalDateTime.now());
        return usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public Usuario actualizarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public void desactivarUsuario(Long usuarioId) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            usuario.setActivo(false);
            usuarioRepository.save(usuario);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Usuario getUsuarioById(Long usuarioId) {
        return usuarioRepository.findById(usuarioId).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public Usuario getUsuarioByUsername(String username) {
        return usuarioRepository.findByUsername(username).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse validarCredenciales(String username, String contrasena) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            // Generar un token JWT
            String token = authService.authenticate(usuario, contrasena,
                    usuario.getRol());

            LoginResponse loginResponse = LoginResponse.builder()
                    .token(token)
                    .usuario(usuarioOpt.get())
                    .succes(true)
                    .build();

            return loginResponse;
        }

        return LoginResponse.builder()
                .succes(false)
                .build();

    }

    @Override
    @Transactional
    public void actualizarUltimoAcceso(Long usuarioId, LocalDateTime fechaAcceso) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            usuario.setUltimoAcceso(fechaAcceso);
            usuarioRepository.save(usuario);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Venta> getHistorialVentas(Long usuarioId) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            return ventaRepository.findByUsuario(usuario);
        }
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Usuario> getUsuariosByRol(String rol) {
        return usuarioRepository.findByRol(rol);
    }
}
