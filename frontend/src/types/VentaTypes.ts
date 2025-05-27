// Interfaces for the Venta-related types
export type ProductoVendidoType= {
  productoVendidoId?: number;
  producto: {
    productoId: number;
    nombre: string;
    precioVenta: number;
  };
  cantidad: number;
  precioVenta: number;
  subtotal: number;
}

export type VentaType ={
  ventaId?: number;
  usuario: {
    id: number;
    nombre: string;
  };
  productosVendidos: ProductoVendidoType[];
  total: number;
  fecha: string;
  conIva: boolean;
}

export type VentaRequestType= {
  usuarioId: number;
  productos: ProductoVendidoType[];
  conIva: boolean;
}