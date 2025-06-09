/* eslint-disable @typescript-eslint/no-explicit-any */

// TypeScript declaration for Web Serial API
interface SerialPort {
  open(options: SerialOptions): Promise<void>;
  writable: WritableStream<Uint8Array>;
  close(): Promise<void>;
}
interface SerialOptions {
  baudRate: number;
  dataBits?: number;
  stopBits?: number;
  parity?: "none" | "even" | "odd";
  flowControl?: "none" | "hardware";
}
interface NavigatorWithSerial extends Navigator {
  serial: {
    requestPort(options?: any): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  };
}
declare const navigator: NavigatorWithSerial;

export type TicketData = {
  ticketNumber: string | number;
  items: { producto: { nombre: string; precioVenta: number }, cantidad: number }[];
  total: number;
  subtotal: number;
  iva: number;
  cliente?: { nombre: string } | null;
  fecha: string;
  vendedor: string;
  conIva: boolean;
  descuentos?: Record<number, number>;
};

// Servicio para manejar la impresión de tickets
export const PrinterService = {
  /**
   * Imprime un ticket en la impresora IM09 de Elegate
   * @param data Datos del ticket a imprimir
   * @returns Promise que resuelve cuando la impresión se completa
   */
  printTicket: async (data: TicketData): Promise<boolean> => {
    console.log("PrinterService.printTicket recibe:", data);
    try {
      const commands: (string | Uint8Array)[] = [];
      const config = JSON.parse(localStorage.getItem("ticketConfig") || "{}");

      // Inicializar impresora
      commands.push('\x1B\x40'); // ESC @

      // Centrar texto y negrita
      commands.push('\x1B\x61\x01');
      commands.push('\x1B\x21\x08');
      commands.push((config.nombreTienda || 'BPV - SISTEMA DE VENTAS') + '\n');
      if (config.rfc) commands.push(`RFC: ${config.rfc}\n`);
      if (config.direccion) commands.push(config.direccion + '\n');
      if (config.telefono) commands.push('Tel: ' + config.telefono + '\n');
      commands.push('\x1B\x21\x00');

      // Fecha y ticket
      commands.push(`Fecha: ${data.fecha || "-"}\n`);
      commands.push(`Ticket #: ${data.ticketNumber || "-"}\n`);
      commands.push(`Vendedor: ${data.vendedor || "-"}\n`);
      if (data.cliente && data.cliente.nombre) commands.push(`Cliente: ${data.cliente.nombre}\n`);
      commands.push('-----------------------------\n');

      // Productos
      if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
          const nombre = item.producto?.nombre || "Producto";
          const cantidad = item.cantidad || 0;
          const precio = typeof item.producto?.precioVenta === "number" ? item.producto.precioVenta : 0;
          const total = (precio * cantidad).toFixed(2);
          commands.push(`${nombre} x${cantidad} $${total}\n`);
        });
      } else {
        commands.push("Sin productos\n");
      }
      commands.push('-----------------------------\n');

      // Totales
      commands.push(`TOTAL: $${typeof data.total === "number" ? data.total.toFixed(2) : "0.00"}\n`);

      // Leyenda final
      commands.push('\n');
      commands.push((config.leyenda || "¡Gracias por su compra!") + '\n');

      // Cortar papel
      commands.push('\x1D\x56\x00');

      // Unir y codificar comandos
      const encoder = new TextEncoder();
      const commandString = commands.join('');
      const dataToSend = encoder.encode(commandString);

      // Web Serial API
      if ('serial' in navigator) {
        let port: SerialPort | null = null;
        try {
          port = await navigator.serial.requestPort();
          await port.open({
            baudRate: 9600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            flowControl: 'none'
          });
          const writer = port.writable.getWriter();
          await writer.write(dataToSend);
          writer.releaseLock();
          await port.close();
          return true;
        } catch (err) {
          if (port) await port.close().catch(() => {});
          console.error('Error específico al conectar con impresora USB:', err);
          throw new Error('No se pudo conectar con la impresora USB: ' + (err instanceof Error ? err.message : String(err)));
        }
      } else {
        alert('La impresión directa solo está disponible en Chrome/Edge y en conexiones seguras (HTTPS o localhost).');
        return false;
      }
    } catch (error) {
      console.error('Error al imprimir ticket:', error);
      alert('Error al imprimir ticket: ' + (error instanceof Error ? error.message : String(error)));
      return false;
    }
  }
};

export default PrinterService;