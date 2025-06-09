import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import TicketPrint from "../service/TicketPrint";
import type { TicketConfig, TicketPrintProps } from "../types/TicketTypes";

const venta: TicketPrintProps["venta"] = {
  fecha: "2025-06-08",
  ticketNumber: "12345",
  vendedor: "Anderson",
  cliente: { nombre: "Cliente de ejemplo" },
  items: [
    { producto: { nombre: "Producto 1", precioVenta: 10 }, cantidad: 2 },
    { producto: { nombre: "Producto 2", precioVenta: 20 }, cantidad: 1 }
  ],
  total: 40
};

const config: TicketConfig = {
  nombreTienda: "La Burbuja Feliz",
  rfc: "RFC123456",
  direccion: "Calle Ejemplo 123",
  telefono: "555-1234",
  leyenda: "¡Gracias por su compra!",
  anchoPapel: "80mm",
  fuente: "A"
};

const TicketPage: React.FC = () => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
  });

  return (
    <div>
      <button onClick={handlePrint}>Imprimir ticket</button>
      <div ref={ticketRef}>
        <TicketPrint venta={venta} config={config} />
      </div>
    </div>
  );
};

export default TicketPage;