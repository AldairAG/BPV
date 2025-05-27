/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  userSelector, 
  setUser, 
  clearUser, 
  clearError, 
  setLoading, 
  setError 
} from '../store/slices/userSlice';
import type { UsuarioType } from '../types/UsuarioType';
import type { LoginRequest } from '../types/LoginTypes';
import UserService from '../service/UserService';

/**
 * Hook personalizado `useUser` para gestionar el estado del usuario y la navegación en la aplicación.
 *
 * @returns {object} Un objeto con las siguientes propiedades y funciones:
 * 
 * - `user` {UsuarioType}: El usuario actual obtenido del estado global.
 * - `token` {string}: El token de autenticación del usuario obtenido del estado global.
 * - `roles` {string[]}: Los roles del usuario extraídos del token JWT.
 * - `isAuthenticated` {boolean}: Indica si el usuario está autenticado.
 * - `loading` {boolean}: Indica si hay una operación en curso.
 * - `error` {string}: Mensaje de error si ocurrió alguno durante la autenticación.
 * - `login` {(username: string, contrasena: string) => Promise<boolean>}: Función para iniciar sesión.
 * - `logout` {() => void}: Función para cerrar sesión.
 * - `navigateTo` {(to: string) => void}: Función para navegar a una ruta específica.
 */
export const useUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Selectores de estado desde el userSlice
  const user = useSelector(userSelector.user);
  const token = useSelector(userSelector.token);
  const roles = useSelector(userSelector.roles);
  const isAuthenticated = useSelector(userSelector.isAuthenticated);
  const loading = useSelector(userSelector.loading);
  const error = useSelector(userSelector.error);

  /**
   * Establece el usuario y token en el estado global
   */
  const setUserData = (userData: UsuarioType, userToken: string | null) => {
    dispatch(setUser({ user: userData, token: userToken }));
  };

  /**
   * Limpia el usuario del estado global (cierre de sesión)
   */
  const logout = () => {
    dispatch(clearUser());
    navigateTo('/login');
  };

  /**
   * Limpia los errores de autenticación
   */
  const resetError = () => {
    dispatch(clearError());
  };

  /**
   * Navega a una ruta específica
   */
  const navigateTo = (to: string) => {
    navigate(to);
  };

  /**
   * Inicia sesión con username y contraseña
   * @returns {boolean} true si el login fue exitoso, false si falló
   */
  const login = async (username: string, contrasena: string): Promise<boolean> => {
    try {
      dispatch(setLoading(true));
      
      const credentials: LoginRequest = { username, contrasena };
      const response = await UserService.login(credentials);
      
      if (response.token) {
        // Usar setUserData en lugar de dispatch directo
        setUserData(response.usuario, response.token);
        return true;
      } else {
        dispatch(setError('Credenciales inválidas'));
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error en el inicio de sesión';
      dispatch(setError(errorMessage));
      return false;
    }
  };

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  /**
   * Verifica si el usuario tiene al menos uno de los roles especificados
   */
  const hasAnyRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some(role => roles.includes(role));
  };

  /**
   * Obtiene el usuario por ID y lo establece como usuario actual
   */
  const getUserById = async (id: number): Promise<UsuarioType | null> => {
    try {
      dispatch(setLoading(true));
      const userData = await UserService.getUsuarioById(id);
      dispatch(setLoading(false));
      
      if (userData) {
        // Usar setUserData en lugar de dispatch directo
        setUserData(userData, token);
        return userData;
      }
      
      return null;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener el usuario';
      dispatch(setError(errorMessage));
      return null;
    }
  };

  /**
   * Obtiene todos los usuarios
   */
  const getAllUsers = async (): Promise<UsuarioType[]> => {
    try {
      dispatch(setLoading(true));
      const users = await UserService.getAllUsuarios();
      dispatch(setLoading(false));
      return users;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al obtener usuarios';
      dispatch(setError(errorMessage));
      return [];
    }
  };

  /**
   * Crea un nuevo usuario
   */
  const createUser = async (userData: UsuarioType): Promise<UsuarioType | null> => {
    try {
      dispatch(setLoading(true));
      const newUser = await UserService.crearUsuario(userData);
      dispatch(setLoading(false));
      return newUser;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear usuario';
      dispatch(setError(errorMessage));
      return null;
    }
  };

  /**
   * Actualiza un usuario existente
   */
  const updateUser = async (id: number, userData: UsuarioType): Promise<UsuarioType | null> => {
    try {
      dispatch(setLoading(true));
      const updatedUser = await UserService.actualizarUsuario(id, userData);
      dispatch(setLoading(false));
      
      // Si se actualiza el usuario actual, actualizar también en el estado
      if (user && user.id === id) {
        // Usar setUserData en lugar de dispatch directo
        setUserData(updatedUser, token);
      }
      
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar usuario';
      dispatch(setError(errorMessage));
      return null;
    }
  };

  /**
   * Establece un usuario existente como usuario actual
   */
  const setCurrentUser = (userData: UsuarioType, userToken: string | null = null) => {
    // Usar setUserData para establecer el usuario actual
    setUserData(userData, userToken || token);
  };

  return {
    // Estado
    user,
    token,
    roles,
    isAuthenticated,
    loading,
    error,
    
    // Funciones de autenticación
    login,
    logout,
    resetError,
    setUserData,       // Exponer setUserData para usar desde componentes
    setCurrentUser,    // Método útil para establecer un usuario existente
    
    // Navegación
    navigateTo,
    
    // Verificación de roles
    hasRole,
    hasAnyRole,
    
    // Operaciones CRUD
    getUserById,
    getAllUsers,
    createUser,
    updateUser
  };
};

export default useUser;