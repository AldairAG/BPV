package com.example.lbf.repository;

import com.example.lbf.entities.MovimientoInventario;
import com.example.lbf.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {
    
    List<MovimientoInventario> findByProductoOrderByFechaDesc(Producto producto);
    
    List<MovimientoInventario> findByTipoMovimiento(String tipoMovimiento);
    
    @Query("SELECT m FROM MovimientoInventario m WHERE m.producto.productoId = :productoId ORDER BY m.fecha DESC")
    List<MovimientoInventario> findMovimientosByProductoId(Long productoId);
    
    @Query("SELECT m FROM MovimientoInventario m WHERE m.fecha BETWEEN :fechaInicio AND :fechaFin")
    List<MovimientoInventario> findMovimientosByRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin);
}
