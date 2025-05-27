// Interfaces for the Usuario-related types
export type UsuarioType= {
  id: number;
  nombre: string;
  username: string;
  contrasena?: string; // Optional because we don't always get this back
  email: string;
  rol: string;
  activo: boolean;
  ultimoAcceso?: string;
}