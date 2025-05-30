import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { UsuarioType } from '../../types/UsuarioType';
import UserService from '../../service/UserService';

/**
 * Interface que define la estructura del estado de autenticación
 */
interface AuthState {
  user: UsuarioType | null;
  token: string | null;
}

/**
 * Estado inicial para el slice de autenticación
 */
const initialState: AuthState = {
  user: null,
  token: null,
};

/**
 * Función para extraer los roles del token JWT
 * @param token - Token JWT a decodificar
 * @returns Array de roles del usuario
 */
const getRoleFromToken = (token: string): string[] => {
  try {
    // Decodificar el token (simple split por '.' y decodificación base64)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Asumiendo que el rol está en el claim 'rol' y solo hay un rol
    const rol = payload.rol;
    console.log('Rol extraído del token:', rol);
    
    return rol ? [rol] : [];
  } catch (error) {
    console.error('Error decoding token:', error);
    return [];
  }
};

/**
 * @file userSlice.ts
 * @description Este archivo define el `userSlice` para gestionar el estado relacionado con la autenticación en la aplicación.
 * Utiliza Redux Toolkit's `createSlice` para manejar la información del usuario y el token.
 */

/**
 * @constant userSlice
 * @description Un slice de Redux para gestionar el estado de autenticación.
 * Contiene lo siguiente:
 * - `name`: El nombre del slice, establecido como 'user'.
 * - `initialState`: El estado inicial del slice de autenticación.
 * - `reducers`: Un objeto que contiene funciones reductoras para manejar actualizaciones de estado.
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    
    // Acciones para manejar usuario y token
    setUser: (state, action: PayloadAction<{ user: UsuarioType; token: string | null }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      
      if (action.payload.token) {
        UserService.setAuthToken(action.payload.token);
      }
    },
    
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      UserService.setAuthToken(null);
    },

  }
});

export const { setUser, clearUser } = userSlice.actions;

/**
 * Selector para obtener los roles del usuario a partir del token
 */
const selectUserRoles = createSelector(
  [(state: { user: AuthState }) => state.user.token],
  (token) => token ? getRoleFromToken(token) : []
);

/**
 * Objeto que contiene selectores para acceder al estado del usuario
 */
export const userSelector = {
  user: (state: { user: AuthState }) => state.user.user,
  token: (state: { user: AuthState }) => state.user.token,
  roles: selectUserRoles,
  isAuthenticated: (state: { user: AuthState }) => !!state.user.user,
};

export default userSlice.reducer;