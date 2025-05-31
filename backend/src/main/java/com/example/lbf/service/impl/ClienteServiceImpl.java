package com.example.lbf.service.impl;

import com.example.lbf.entities.Cliente;
import com.example.lbf.repository.ClienteRepository;
import com.example.lbf.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de gestión de clientes
 */
@Service
public class ClienteServiceImpl implements ClienteService {
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Override
    public List<Cliente> getAllClientes() {
        return clienteRepository.findAll();
    }
    
    @Override
    public Cliente getClienteById(Long id) {
        Optional<Cliente> cliente = clienteRepository.findById(id);
        return cliente.orElse(null);
    }
    
    @Override
    public List<Cliente> buscarClientesPorNombre(String nombre) {
        return clienteRepository.findByNombreContainingIgnoreCase(nombre);
    }
    
    @Override
    public Cliente crearCliente(Cliente cliente) {
        // Verificar que el cliente no tenga ID (es nuevo)
        if (cliente.getIdCliente() != null) {
            cliente.setIdCliente(null);
        }
        
        return clienteRepository.save(cliente);
    }
    
    @Override
    public Cliente actualizarCliente(Long id, Cliente clienteDetails) {
        Optional<Cliente> clienteData = clienteRepository.findById(id);
        
        if (clienteData.isPresent()) {
            Cliente clienteExistente = clienteData.get();
            clienteExistente.setNombre(clienteDetails.getNombre());
            // No actualizamos las ventas directamente para evitar perder relaciones
            
            return clienteRepository.save(clienteExistente);
        }
        
        return null;
    }
    
    @Override
    public boolean eliminarCliente(Long id) {
        Optional<Cliente> cliente = clienteRepository.findById(id);
        
        if (cliente.isPresent()) {
            clienteRepository.deleteById(id);
            return true;
        }
        
        return false;
    }
}
