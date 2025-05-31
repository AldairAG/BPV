import type { ProductoType } from "./ProductoType";
import type { UsuarioType } from "./UsuarioType";

/**
 * Interfaz para representar los datos de una venta
 */
export interface VentaType {
  ventaId: number;
  fecha: string;
  total: number;
  conIva: boolean;
  anulada: boolean;
  usuario: UsuarioType;
  productosVendidos: ProductoVendidoType[];
}

/**
 * Interfaz para representar un producto vendido en una venta
 */
export interface ProductoVendidoType {
  productoVendidoId: number|null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto: ProductoType;
  descuento?: number; // Descuento opcional
}

/**
 * Interfaz para la solicitud de creación de venta
 */
export interface VentaRequest {
  usuarioId: number;
  clienteId?: number | null;  // Agregar campo para el ID del cliente
  productos: ProductoVendidoType[];
  conIva: boolean;
}