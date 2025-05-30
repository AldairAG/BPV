import type { ProductoType } from "./ProductoType";

// Interfaces for the Categoria-related types
export type CategoriaType ={
  categoriaId: number;
  nombre: string;
  color: string;
  productos: ProductoType[];
}