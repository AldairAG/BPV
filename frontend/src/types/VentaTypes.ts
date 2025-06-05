import type { ClienteType } from "./ClienteType";
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
  hora: string;
  productosVendidos: ProductoVendidoType[];
  sucursal: string;
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
  descuento?: number|0; // Descuento opcional
}

/**
 * Interfaz para la solicitud de creación de venta
 */
export interface VentaRequest {
  sucursal: string;
  usuarioId: number;
  clienteId?: number | null;  // Agregar campo para el ID del cliente
  productos: ProductoVendidoType[];
  conIva: boolean;
}

export interface VentaMonitoreoResponse {
  usuario: UsuarioType;
  venta: VentaType;
  productosVendidos: ProductoType[];
  cliente:ClienteType;
}