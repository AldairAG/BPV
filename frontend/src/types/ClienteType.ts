import type { VentaType } from '../types/VentaTypes';

// Definición del tipo Cliente basado en la entidad del backend
export type ClienteType ={
    idCliente: number;
    nombre: string;
    ventas?: VentaType[]; // Opcional porque normalmente no necesitamos cargar todas las ventas
}
