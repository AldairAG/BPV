package com.example.lbf.service.inventario;

import com.example.lbf.entities.Producto;

import java.util.List;
import java.util.Map;

public interface InventarioService {
    boolean actualizarStock(Long productoId, Float cantidad, String tipoMovimiento);
    Float getStockActual(Long productoId);
    List<Producto> getProductosBajoStock(Float umbral);
    void registrarEntradaInventario(Long productoId, Float cantidad, String motivo);
    void registrarSalidaInventario(Long productoId, Float cantidad, String motivo);
    List<Object[]> getHistorialMovimientos(Long productoId);
    void realizarInventarioFisico(Map<Long, Float> conteoProductos);
}
