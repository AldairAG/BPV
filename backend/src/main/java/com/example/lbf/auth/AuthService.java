package com.example.lbf.auth;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.example.lbf.entities.Usuario;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class AuthService {

    private static final String SECRET_KEY = "+_key_C4puccin0_+r3vol_de_7_h0j4$"; // Clave secreta para firmar el JWT
    private static final long EXPIRATION_TIME = 86_400_000; // Tiempo de expiración (1 día)

    public String authenticate(Usuario usuario, String password, String rol) {

        if (!usuario.getContrasena().equals(password) || !usuario.getEstado()) {
            throw new RuntimeException("inicio de sesión fallido: usuario o contraseña incorrectos");
        }

        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));

        // Genera el token JWT
        return Jwts.builder()
                .setSubject(usuario.getUsername())
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

}
