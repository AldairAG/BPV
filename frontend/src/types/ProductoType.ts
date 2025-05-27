// Interfaces for the Producto-related types
export type ProductoType= {
  productoId: number;
  nombre: string;
  descripcion: string;
  precioVenta: number;
  precioCosto: number;
  stock: number;
  stockMinimo: number;
  imagen?: string;
  codigoBarras?: string;
  categoria: {
    categoriaId: number;
    nombre: string;
    color: string;
  };
  activo: boolean;
}
