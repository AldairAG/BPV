/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import ClienteService from '../service/ClienteService';
import type { ClienteType } from '../types/ClienteType';

/**
 * Hook personalizado para gestionar clientes
 * @returns Métodos y estados para gestionar clientes en componentes React
 */
export const useCliente = () => {
    // Estados para almacenar los datos y estados de carga/error
    const [clientes, setClientes] = useState<ClienteType[]>([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteType | null>(null);
    const [clientesFiltrados, setClientesFiltrados] = useState<ClienteType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Obtiene todos los clientes
     */
    const fetchClientes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ClienteService.getAllClientes();
            setClientes(data);
            setClientesFiltrados(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar los clientes');
            console.error('Error fetching clientes:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Busca clientes por nombre usando el endpoint del backend
     */
    const buscarClientesPorNombre = useCallback(async (nombre: string) => {
        if (!nombre.trim()) {
            setClientesFiltrados(clientes);
            return;
        }
        
        setLoading(true);
        try {
            const data = await ClienteService.buscarClientesPorNombre(nombre);
            setClientesFiltrados(data);
        } catch (err: any) {
            setError(err.message || 'Error al buscar clientes');
            console.error('Error searching clientes:', err);
        } finally {
            setLoading(false);
        }
    }, [clientes]);

    /**
     * Filtra clientes localmente por nombre sin hacer peticiones al backend
     */
    const filtrarPorNombre = useCallback((nombre: string) => {
        if (!nombre.trim()) {
            setClientesFiltrados(clientes);
            return;
        }
        
        const filtrados = clientes.filter(cliente => 
            cliente.nombre.toLowerCase().includes(nombre.toLowerCase())
        );
        setClientesFiltrados(filtrados);
    }, [clientes]);

    /**
     * Obtiene un cliente específico por ID
     */
    const getClienteById = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const cliente = await ClienteService.getClienteById(id);
            setClienteSeleccionado(cliente);
            return cliente;
        } catch (err: any) {
            setError(err.message || `Error al obtener cliente con ID ${id}`);
            console.error(`Error fetching cliente with ID ${id}:`, err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Selecciona un cliente para edición (sin hacer petición al backend)
     */
    const seleccionarCliente = useCallback((cliente: ClienteType) => { 
        setClienteSeleccionado(cliente);
    }, []);

    /**
     * Crea un nuevo cliente
     */
    const createCliente = useCallback(async (cliente: Omit<ClienteType, 'idCliente'>) => {
        setLoading(true);
        setError(null);
        try {
            const nuevoCliente = await ClienteService.crearCliente(cliente);
            setClientes(prevClientes => [...prevClientes, nuevoCliente]);
            setClientesFiltrados(prevClientes => [...prevClientes, nuevoCliente]);
            return nuevoCliente;
        } catch (err: any) {
            setError(err.message || 'Error al crear el cliente');
            console.error('Error creating cliente:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Actualiza un cliente existente
     */
    const updateCliente = useCallback(async (id: number, cliente: Partial<ClienteType>) => {
        setLoading(true);
        setError(null);
        try {
            const clienteActualizado = await ClienteService.actualizarCliente(id, cliente);
            
            setClientes(prevClientes => 
                prevClientes.map(c => c.idCliente === id ? clienteActualizado : c)
            );
            
            setClientesFiltrados(prevClientes => 
                prevClientes.map(c => c.idCliente === id ? clienteActualizado : c)
            );
            
            return clienteActualizado;
        } catch (err: any) {
            setError(err.message || 'Error al actualizar el cliente');
            console.error('Error updating cliente:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Elimina un cliente
     */
    const deleteCliente = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await ClienteService.eliminarCliente(id);
            
            // Actualizar el estado después de eliminar correctamente
            setClientes(prevClientes => 
                prevClientes.filter(c => c.idCliente !== id)
            );
            
            setClientesFiltrados(prevClientes => 
                prevClientes.filter(c => c.idCliente !== id)
            );
            
            // Si el cliente seleccionado es el que se eliminó, deseleccionarlo
            if (clienteSeleccionado?.idCliente === id) {
                setClienteSeleccionado(null);
            }
            
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al eliminar el cliente');
            console.error('Error deleting cliente:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [clienteSeleccionado]);

    /**
     * Obtiene las ventas de un cliente específico
     */
    const getVentasByCliente = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const ventas = await ClienteService.getVentasByCliente(id);
            return ventas;
        } catch (err: any) {
            setError(err.message || `Error al obtener ventas del cliente ${id}`);
            console.error(`Error fetching ventas for cliente ${id}:`, err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Limpia los errores acumulados
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Limpia el cliente seleccionado
     */
    const clearSeleccion = useCallback(() => {
        setClienteSeleccionado(null);
    }, []);

    return {
        // Estados
        clientes,
        clientesFiltrados,
        clienteSeleccionado,
        loading,
        error,
        
        // Métodos de obtención y filtrado
        fetchClientes,
        getClienteById,
        buscarClientesPorNombre,
        filtrarPorNombre,
        seleccionarCliente,
        getVentasByCliente,
        
        // Métodos CRUD
        createCliente,
        updateCliente,
        deleteCliente,
        
        // Utilidades
        clearError,
        clearSeleccion
    };
};

export default useCliente;
