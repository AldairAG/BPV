import type { CategoriaType } from "./CategoriaType";

// Interfaces for the Producto-related types
export type ProductoType= {
  productoId: number;
  nombre: string;
  precioVenta: number;
  precioCosto: number;
  stock: number;
  stockMinimo: number;
  codigoBarras?: string;
  categoria: CategoriaType;
  activo: boolean;
  tipo: string;
}
