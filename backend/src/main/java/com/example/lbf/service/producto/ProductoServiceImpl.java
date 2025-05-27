package com.example.lbf.service.producto;

import com.example.lbf.entities.Producto;
import com.example.lbf.entities.Categoria;
import com.example.lbf.repository.ProductoRepository;
import com.example.lbf.repository.CategoriaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoServiceImpl implements ProductoService {

    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;

    @Override
    @Transactional
    public Producto crearProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public Producto actualizarProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public void eliminarProducto(Long productoId) {
        productoRepository.deleteById(productoId);
    }

    @Override
    @Transactional(readOnly = true)
    public Producto getProductoById(Long productoId) {
        return productoRepository.findById(productoId).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> getAllProductos() {
        return productoRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> getProductosByCategoria(Long categoriaId) {
        Optional<Categoria> categoriaOpt = categoriaRepository.findById(categoriaId);
        if (categoriaOpt.isPresent()) {
            Categoria categoria = categoriaOpt.get();
            return productoRepository.findByCategoria(categoria);
        }
        return List.of();
    }

    @Override
    @Transactional
    public boolean actualizarStock(Long productoId, Float cantidad) {
        Optional<Producto> productoOpt = productoRepository.findById(productoId);
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            Float nuevoStock = producto.getStock() + cantidad;
            if (nuevoStock >= 0) {
                producto.setStock(nuevoStock);
                productoRepository.save(producto);
                return true;
            }
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> buscarProductos(String criterio) {
        return productoRepository.buscarProductos(criterio);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> getProductosBajoStock(Float stockMinimo) {
        return productoRepository.findByStockLessThan(stockMinimo);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verificarDisponibilidad(Long productoId, Float cantidad) {
        Optional<Producto> productoOpt = productoRepository.findById(productoId);
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            return producto.getStock() >= cantidad;
        }
        return false;
    }
}
