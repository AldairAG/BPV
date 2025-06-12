import type { CategoriaType } from "./CategoriaType";
import type { ProductoVendidoType } from "./VentaTypes";

// Interfaces for the Producto-related types
export type ProductoType = {
  id: number;
  productoId: number;
  nombre: string;
  precio: number;
  precioCompra: number;
  stock: number;
  stockMinimo: number;
  codigoBarras?: string;
  categoria: CategoriaType;
  activo: boolean;
  tipo: string;
  sucursal:string;
  productoVentas: ProductoVendidoType[];
  descuentos?: number[]; // Array de hasta 4 descuentos en porcentaje
}
