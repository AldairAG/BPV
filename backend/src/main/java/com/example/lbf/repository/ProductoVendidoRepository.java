package com.example.lbf.repository;

import com.example.lbf.entities.ProductoVendido;
import com.example.lbf.entities.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductoVendidoRepository extends JpaRepository<ProductoVendido, Long> {
    List<ProductoVendido> findByProducto(Producto producto);
    
    @Query("SELECT pv.producto, SUM(pv.cantidad) FROM ProductoVendido pv " +
           "JOIN pv.venta v WHERE v.fecha BETWEEN :fechaInicio AND :fechaFin " +
           "GROUP BY pv.producto ORDER BY SUM(pv.cantidad) DESC")
    List<Object[]> findProductosMasVendidos(LocalDate fechaInicio, LocalDate fechaFin);
    
    @Query("SELECT pv.producto.categoria.nombre, SUM(pv.subtotal) FROM ProductoVendido pv " +
           "JOIN pv.venta v WHERE v.fecha BETWEEN :fechaInicio AND :fechaFin " +
           "GROUP BY pv.producto.categoria.nombre")
    List<Object[]> findVentasPorCategoria(LocalDate fechaInicio, LocalDate fechaFin);
}
