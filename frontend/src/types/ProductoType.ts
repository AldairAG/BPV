import type { CategoriaType } from "./CategoriaType";

// Interfaces for the Producto-related types
export type ProductoType = {
  id: number;
  productoId: number;
  nombre: string;
  precioVenta: number;
  precioCompra: number;
  stock: number;
  stockMinimo: number;
  codigoBarras?: string;
  categoria: CategoriaType;
  activo: boolean;
  tipo: string;
  descuentos?: number[]; // Array de hasta 4 descuentos en porcentaje
}
