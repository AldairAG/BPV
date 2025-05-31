/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClienteType } from "./clienteService";
import { type CarritoItem } from "../hooks/useCarrito";

interface TicketData {
  ticketNumber: string;
  items: CarritoItem[];
  total: number;
  subtotal: number;
  iva: number;
  cliente?: ClienteType | null;
  fecha: string;
  vendedor: string;
  conIva: boolean;
  descuentos?: Record<number, number>;
}

// Servicio para manejar la impresión de tickets
export const PrinterService = {
  /**
   * Imprime un ticket en la impresora IM09 de Elegate
   * @param data Datos del ticket a imprimir
   * @returns Promise que resuelve cuando la impresión se completa
   */
  printTicket: async (data: TicketData): Promise<boolean> => {
    try {
      // Formato ESC/POS para impresora térmica
      const commands = [];
      
      // Inicializar impresora
      commands.push('\x1B\x40');  // ESC @ - Inicializar impresora
      
      // Centrar texto
      commands.push('\x1B\x61\x01');  // ESC a 1 - Alineación centrada
      
      // Encabezado con negrita
      commands.push('\x1B\x21\x08');  // ESC ! - Modo enfatizado (negrita)
      commands.push('BPV - SISTEMA DE VENTAS');
      commands.push('\x0A');  // Salto de línea
      commands.push('\x1B\x21\x00');  // Volver a modo normal
      
      // Fecha y número de ticket
      commands.push(`Fecha: ${data.fecha}`);
      commands.push('\x0A');
      commands.push(`Ticket #: ${data.ticketNumber}`);
      commands.push('\x0A\x0A');
      
      // Información del vendedor
      commands.push(`Vendedor: ${data.vendedor}`);
      commands.push('\x0A');
      
      // Información del cliente si existe
      if (data.cliente) {
        commands.push(`Cliente: ${data.cliente.nombre}`);
        commands.push('\x0A');
      }
      
      // Separador
      commands.push('--------------------------------');
      commands.push('\x0A');
      
      // Alineación a la izquierda para los productos
      commands.push('\x1B\x61\x00');  // ESC a 0 - Alineación izquierda
      
      // Encabezados de columnas
      commands.push('PRODUCTO          CANT  PRECIO  TOTAL');
      commands.push('\x0A');
      commands.push('--------------------------------');
      commands.push('\x0A');
      
      // Productos
      data.items.forEach(item => {
        const descuento = data.descuentos?.[item.producto.productoId] || 0;
        const precioConDescuento = item.producto.precioVenta * (1 - descuento / 100);
        const subtotalItem = precioConDescuento * item.cantidad;
        
        // Nombre del producto (max 16 caracteres)
        let nombre = item.producto.nombre.substring(0, 16);
        nombre = nombre.padEnd(16, ' ');
        
        // Cantidad (3 caracteres alineados a la derecha)
        const cantidad = item.cantidad.toString().padStart(3, ' ');
        
        // Precio unitario (6 caracteres alineados a la derecha)
        const precio = precioConDescuento.toFixed(2).padStart(6, ' ');
        
        // Subtotal (7 caracteres alineados a la derecha)
        const total = subtotalItem.toFixed(2).padStart(7, ' ');
        
        commands.push(`${nombre} ${cantidad} ${precio} ${total}`);
        commands.push('\x0A');
        
        // Si hay descuento, mostrarlo
        if (descuento > 0) {
          commands.push(`   Descuento: ${descuento}%`);
          commands.push('\x0A');
        }
      });
      
      // Separador
      commands.push('--------------------------------');
      commands.push('\x0A');
      
      // Totales a la derecha
      commands.push('\x1B\x61\x02');  // ESC a 2 - Alineación derecha
      
      // Subtotal, IVA y Total
      commands.push(`SUBTOTAL: $${data.subtotal.toFixed(2)}`);
      commands.push('\x0A');
      
      if (data.conIva) {
        commands.push(`IVA (16%): $${data.iva.toFixed(2)}`);
        commands.push('\x0A');
      }
      
      // Total en negrita
      commands.push('\x1B\x21\x08');  // Modo enfatizado (negrita)
      commands.push(`TOTAL: $${data.total.toFixed(2)}`);
      commands.push('\x1B\x21\x00');  // Volver a modo normal
      commands.push('\x0A\x0A');
      
      // Mensaje de agradecimiento centrado
      commands.push('\x1B\x61\x01');  // Alineación centrada
      commands.push('¡GRACIAS POR SU COMPRA!');
      commands.push('\x0A\x0A');
      
      // Cortar papel
      commands.push('\x1D\x56\x41');  // GS V A - Corte de papel
      
      // Unir todos los comandos en un solo string
      const commandString = commands.join('');
      
      // Enviar a la impresora por USB
      if ('serial' in navigator) {
        try {
          // Solicitar acceso a la impresora a través del puerto serie USB
          const port = await navigator.serial.requestPort();
          
          // Ajusta estos parámetros según la configuración de tu impresora
          // Común para impresoras térmicas: 9600, pero puede variar (19200, 38400, etc.)
          await port.open({ 
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            flowControl: 'none'
          });
          
          // Convertir comandos a Uint8Array
          const encoder = new TextEncoder();
          const data = encoder.encode(commandString);
          
          // Enviar datos a la impresora
          const writer = port.writable.getWriter();
          await writer.write(data);
          writer.releaseLock();
          
          // Cerrar puerto
          await port.close();
          
          return true;
        } catch (err) {
          console.error('Error específico al conectar con impresora USB:', err);
          throw new Error(`No se pudo conectar con la impresora USB: ${err.message}`);
        }
      } else {
        // Mensaje más claro sobre compatibilidad
        throw new Error('La impresión USB directa solo está disponible en Chrome/Edge y en conexiones seguras (HTTPS o localhost)');
      }
    } catch (error) {
      console.error('Error al imprimir ticket:', error);
      return false;
    }
  }
};

export default PrinterService;