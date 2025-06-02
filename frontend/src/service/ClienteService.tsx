/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ClienteType } from '../types/ClienteType';
import { apiClient } from './apiClient';

const BASE_URL = '/clientes';

/**
 * Servicio para gestionar operaciones con clientes
 */
export const ClienteService = {
    /**
     * Obtiene todos los clientes
     * @returns Lista de todos los clientes
     */
    getAllClientes: async (): Promise<ClienteType[]> => {
        const response = await apiClient.get<ClienteType[]>(BASE_URL);
        return response.data;
    },

    /**
     * Obtiene un cliente por su ID
     * @param id ID del cliente
     * @returns El cliente encontrado
     */
    getClienteById: async (id: number): Promise<ClienteType> => {
        const response = await apiClient.get<ClienteType>(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Busca clientes por nombre
     * @param nombre Nombre o parte del nombre a buscar
     * @returns Lista de clientes que coinciden
     */
    buscarClientesPorNombre: async (nombre: string): Promise<ClienteType[]> => {
        const response = await apiClient.get<ClienteType[]>(`${BASE_URL}/buscar`, {
            params: { nombre }
        });
        return response.data;
    },

    /**
     * Crea un nuevo cliente
     * @param cliente Datos del cliente a crear
     * @returns El cliente creado con su ID asignado
     */
    crearCliente: async (cliente: Omit<ClienteType, 'idCliente'>): Promise<ClienteType> => {
        const response = await apiClient.post<ClienteType>(BASE_URL, cliente);
        return response.data;
    },

    /**
     * Actualiza un cliente existente
     * @param id ID del cliente a actualizar
     * @param cliente Datos actualizados del cliente
     * @returns El cliente actualizado
     */
    actualizarCliente: async (id: number, cliente: Partial<ClienteType>): Promise<ClienteType> => {
        const response = await apiClient.put<ClienteType>(`${BASE_URL}/${id}`, cliente);
        return response.data;
    },

    /**
     * Elimina un cliente por su ID
     * @param id ID del cliente a eliminar
     */
    eliminarCliente: async (id: number): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },

    /**
     * Obtiene todas las ventas asociadas a un cliente específico
     * @param id ID del cliente
     * @returns Lista de ventas que pertenecen al cliente
     */
    getVentasByCliente: async (id: number): Promise<any[]> => {
        const response = await apiClient.get<any[]>(`${BASE_URL}/${id}/ventas`);
        return response.data;
    }
};

export default ClienteService;