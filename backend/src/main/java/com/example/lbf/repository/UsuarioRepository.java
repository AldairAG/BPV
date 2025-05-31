package com.example.lbf.repository;

import com.example.lbf.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
    List<Usuario> findByRol(String rol);
    List<Usuario> findByActivo(Boolean estado);
    @Query("SELECT COUNT(DISTINCT u.sucursal) FROM Usuario u")
    long countDistinctSucursal();

    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.sucursal = :sucursal")
    int countBySucursal(@Param("sucursal") String sucursal);
}
