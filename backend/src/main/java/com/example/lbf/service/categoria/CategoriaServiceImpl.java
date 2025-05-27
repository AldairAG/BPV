package com.example.lbf.service.categoria;

import com.example.lbf.entities.Categoria;
import com.example.lbf.entities.Producto;
import com.example.lbf.repository.CategoriaRepository;
import com.example.lbf.repository.ProductoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaServiceImpl implements CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private ProductoRepository productoRepository;

    @Override
    @Transactional
    public Categoria crearCategoria(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @Override
    @Transactional
    public Categoria actualizarCategoria(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @Override
    @Transactional
    public void eliminarCategoria(Long categoriaId) {
        categoriaRepository.deleteById(categoriaId);
    }

    @Override
    @Transactional(readOnly = true)
    public Categoria getCategoriaById(Long categoriaId) {
        return categoriaRepository.findById(categoriaId).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Categoria> getAllCategorias() {
        return categoriaRepository.findAll();
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
}
