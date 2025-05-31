package com.example.lbf.controller;

import com.example.lbf.entities.Cliente;
import com.example.lbf.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Controlador REST para operaciones CRUD sobre clientes
 */
@RestController
@RequestMapping("/lbf/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;
    
    /**
     * Obtiene todos los clientes
     * @return Lista de clientes
     */
    @GetMapping
    public ResponseEntity<List<Cliente>> getAllClientes() {
        List<Cliente> clientes = clienteService.getAllClientes();
        return new ResponseEntity<>(clientes, HttpStatus.OK);
    }
    
    /**
     * Obtiene un cliente por su ID
     * @param id ID del cliente
     * @return Cliente encontrado o error 404
     */
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> getClienteById(@PathVariable Long id) {
        Cliente cliente = clienteService.getClienteById(id);
        
        if (cliente != null) {
            return new ResponseEntity<>(cliente, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * Busca clientes por nombre
     * @param nombre Nombre o parte del nombre a buscar
     * @return Lista de clientes que coinciden con el criterio
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<Cliente>> buscarClientesPorNombre(@RequestParam String nombre) {
        List<Cliente> clientes = clienteService.buscarClientesPorNombre(nombre);
        return new ResponseEntity<>(clientes, HttpStatus.OK);
    }
    
    /**
     * Crea un nuevo cliente
     * @param cliente Datos del cliente a crear
     * @return Cliente creado
     */
    @PostMapping
    public ResponseEntity<Cliente> crearCliente(@RequestBody Cliente cliente) {
        Cliente nuevoCliente = clienteService.crearCliente(cliente);
        return new ResponseEntity<>(nuevoCliente, HttpStatus.CREATED);
    }
    
    /**
     * Actualiza un cliente existente
     * @param id ID del cliente a actualizar
     * @param clienteDetails Nuevos datos del cliente
     * @return Cliente actualizado o error 404
     */
    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizarCliente(@PathVariable Long id, @RequestBody Cliente clienteDetails) {
        Cliente clienteActualizado = clienteService.actualizarCliente(id, clienteDetails);
        
        if (clienteActualizado != null) {
            return new ResponseEntity<>(clienteActualizado, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * Elimina un cliente
     * @param id ID del cliente a eliminar
     * @return Respuesta de éxito o error
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> eliminarCliente(@PathVariable Long id) {
        boolean eliminado = clienteService.eliminarCliente(id);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("eliminado", eliminado);
        
        if (eliminado) {
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}
