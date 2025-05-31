package com.example.lbf.repository;

import com.example.lbf.entities.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
    /**
     * Busca clientes por nombre (coincidencia parcial)
     * @param nombre Nombre o parte del nombre del cliente
     * @return Lista de clientes que coinciden con el criterio de búsqueda
     */
    List<Cliente> findByNombreContainingIgnoreCase(String nombre);
    
    /**
     * Verifica si existe un cliente con el nombre exacto
     * @param nombre Nombre exacto del cliente
     * @return true si existe, false en caso contrario
     */
    boolean existsByNombreIgnoreCase(String nombre);
}
