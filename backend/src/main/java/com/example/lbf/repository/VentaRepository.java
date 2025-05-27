package com.example.lbf.repository;

import com.example.lbf.entities.Venta;
import com.example.lbf.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findByUsuario(Usuario usuario);
    List<Venta> findByFecha(LocalDate fecha);
    List<Venta> findByFechaBetween(LocalDate fechaInicio, LocalDate fechaFin);
    
    @Query("SELECT SUM(v.total) FROM Venta v WHERE v.fecha BETWEEN :fechaInicio AND :fechaFin")
    BigDecimal calcularTotalVentasPorRango(LocalDate fechaInicio, LocalDate fechaFin);
    
    @Query("SELECT v FROM Venta v JOIN v.usuario u WHERE " +
           "LOWER(u.nombre) LIKE LOWER(CONCAT('%', :criterio, '%')) OR " +
           "CAST(v.ventaId AS string) LIKE CONCAT('%', :criterio, '%')")
    List<Venta> buscarVentas(String criterio);
}
