package com.example.lbf.service;

import com.example.lbf.entities.Cliente;
import java.util.List;

/**
 * Interfaz para el servicio de gestión de clientes
 */
public interface ClienteService {
    
    /**
     * Obtiene todos los clientes
     * @return Lista de todos los clientes
     */
    List<Cliente> getAllClientes();
    
    /**
     * Obtiene un cliente por su ID
     * @param id ID del cliente
     * @return Cliente encontrado o null si no existe
     */
    Cliente getClienteById(Long id);
    
    /**
     * Busca clientes por nombre (coincidencia parcial)
     * @param nombre Nombre o parte del nombre a buscar
     * @return Lista de clientes que coinciden con el criterio
     */
    List<Cliente> buscarClientesPorNombre(String nombre);
    
    /**
     * Crea un nuevo cliente
     * @param cliente Datos del cliente a crear
     * @return Cliente creado con su ID asignado
     */
    Cliente crearCliente(Cliente cliente);
    
    /**
     * Actualiza un cliente existente
     * @param id ID del cliente a actualizar
     * @param clienteDetails Nuevos datos del cliente
     * @return Cliente actualizado o null si no existe
     */
    Cliente actualizarCliente(Long id, Cliente clienteDetails);
    
    /**
     * Elimina un cliente por su ID
     * @param id ID del cliente a eliminar
     * @return true si se eliminó correctamente, false si no existe
     */
    boolean eliminarCliente(Long id);
}
