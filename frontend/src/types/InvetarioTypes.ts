import type { ProductoType } from "./ProductoType";

// Interfaces for the MovimientoInventario type
export type MovimientoInventarioType ={
  movimientoId?: number;
  producto: ProductoType;
  fecha: string;
  cantidad: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  motivo: string;
}