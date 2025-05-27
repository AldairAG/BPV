import { apiClient } from './apiClient';
import type { UsuarioType } from '../types/UsuarioType';
import type { LoginRequest, LoginResponse } from '../types/LoginTypes';
import type { VentaType } from '../types/VentaTypes';

const BASE_URL = '/usuarios';

export const UserService = {
  /**
   * Crea un nuevo usuario en el sistema
   * @param usuario Datos del usuario a crear
   * @returns El usuario creado
   */
  crearUsuario: async (usuario: UsuarioType): Promise<UsuarioType> => {
    const response = await apiClient.post<UsuarioType>(BASE_URL, usuario);
    return response.data;
  },

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario a actualizar
   * @param usuario Datos actualizados del usuario
   * @returns El usuario actualizado
   */
  actualizarUsuario: async (id: number, usuario: UsuarioType): Promise<UsuarioType> => {
    const response = await apiClient.put<UsuarioType>(`${BASE_URL}/${id}`, usuario);
    return response.data;
  },

  /**
   * Desactiva un usuario (eliminación lógica)
   * @param id ID del usuario a desactivar
   */
  desactivarUsuario: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario a buscar
   * @returns El usuario encontrado
   */
  getUsuarioById: async (id: number): Promise<UsuarioType> => {
    const response = await apiClient.get<UsuarioType>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Obtiene un usuario por su nombre de usuario
   * @param username Nombre de usuario a buscar
   * @returns El usuario encontrado
   */
  getUsuarioByUsername: async (username: string): Promise<UsuarioType> => {
    const response = await apiClient.get<UsuarioType>(`${BASE_URL}/username/${username}`);
    return response.data;
  },

  /**
   * Obtiene todos los usuarios del sistema
   * @returns Lista de todos los usuarios
   */
  getAllUsuarios: async (): Promise<UsuarioType[]> => {
    const response = await apiClient.get<UsuarioType[]>(BASE_URL);
    return response.data;
  },

  /**
   * Valida las credenciales de un usuario e inicia sesión
   * @param credentials Credenciales de inicio de sesión (username y contraseña)
   * @returns Los datos del usuario si las credenciales son válidas
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<UsuarioType>(`${BASE_URL}/login`, credentials);
    return {
      usuario: response.data,
      // El token tendría que venir del backend si implementas JWT
    };
  },

  /**
   * Obtiene el historial de ventas de un usuario
   * @param id ID del usuario
   * @returns Lista de ventas realizadas por el usuario
   */
  getHistorialVentas: async (id: number): Promise<VentaType[]> => {
    const response = await apiClient.get<VentaType[]>(`${BASE_URL}/${id}/ventas`);
    return response.data;
  },

  /**
   * Obtiene usuarios por rol
   * @param rol Rol de los usuarios a buscar (ADMIN, VENDEDOR, etc.)
   * @returns Lista de usuarios con el rol especificado
   */
  getUsuariosByRol: async (rol: string): Promise<UsuarioType[]> => {
    const response = await apiClient.get<UsuarioType[]>(`${BASE_URL}/rol/${rol}`);
    return response.data;
  },

  /**
   * Configura el token de autenticación para las solicitudes futuras
   * @param token Token JWT a configurar en el header de autorización
   */
  setAuthToken: (token: string | null): void => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }
};

export default UserService;