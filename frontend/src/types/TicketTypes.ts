// filepath: c:\Users\Anderson\Documents\POS BURBUJA\BPV\frontend\src\types\TicketTypes.ts
export type TicketConfig = {
  nombreTienda: string;
  rfc: string;
  direccion: string;
  telefono: string;
  leyenda: string;
  anchoPapel: "80mm" | "58mm";
  fuente: "A" | "B";
};

export type TicketPrintProps = {
  venta?: {
    fecha: string;
    ticketNumber: string | number;
    vendedor: string;
    cliente?: { nombre: string };
    items: { producto: { nombre: string; precioVenta: number }, cantidad: number }[];
    total: number;
  };
  config?: TicketConfig;
};