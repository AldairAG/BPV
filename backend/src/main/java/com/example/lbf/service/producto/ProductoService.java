package com.example.lbf.service.producto;

import com.example.lbf.entities.Producto;
import com.example.lbf.entities.Categoria;

import java.util.List;

public interface ProductoService {
    Producto crearProducto(Producto producto);
    Producto actualizarProducto(Producto producto);
    void eliminarProducto(Long productoId);
    Producto getProductoById(Long productoId);
    List<Producto> getAllProductos();
    List<Producto> getProductosByCategoria(Long categoriaId);
    boolean actualizarStock(Long productoId, Float cantidad);
    List<Producto> buscarProductos(String criterio);
    List<Producto> getProductosBajoStock(Float stockMinimo);
    boolean verificarDisponibilidad(Long productoId, Float cantidad);
}
