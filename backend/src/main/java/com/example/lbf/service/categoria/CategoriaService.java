package com.example.lbf.service.categoria;

import com.example.lbf.entities.Categoria;
import com.example.lbf.entities.Producto;

import java.util.List;

public interface CategoriaService {
    Categoria crearCategoria(Categoria categoria);
    Categoria actualizarCategoria(Categoria categoria);
    void eliminarCategoria(Long categoriaId);
    Categoria getCategoriaById(Long categoriaId);
    List<Categoria> getAllCategorias();
    List<Producto> getProductosByCategoria(Long categoriaId);
}
