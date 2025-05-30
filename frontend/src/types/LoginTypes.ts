import type { UsuarioType } from "./UsuarioType";

export type LoginRequest= {
  username: string;
  contrasena: string;
}

export type LoginResponse ={
  token?: string|null;
  usuario: UsuarioType;
}