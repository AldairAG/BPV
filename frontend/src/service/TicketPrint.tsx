import React from "react";
import type { TicketConfig, TicketPrintProps } from '../types/TicketTypes';
import logo from '../assets/logo.png'; // Ajusta la ruta si es necesario

const defaultConfig: TicketConfig = {
  nombreTienda: "La Burbuja Felíz",
  rfc: "",
  direccion: "",
  telefono: "",
  leyenda: "¡Gracias por su compra!",
  anchoPapel: "80mm",
  fuente: "A",
};

const TicketPrint: React.FC<TicketPrintProps> = ({ venta, config }) => {


  if (!venta || !venta.items || venta.items.length === 0) {
    return <div style={{ color: "red" }}>No hay datos para imprimir el ticket.</div>;
  }

  // Lee la configuración del ticket
  let ticketConfig: TicketConfig = { ...defaultConfig, ...(config || {}) };
  if (!config) {
    try {
      const storedConfig = localStorage.getItem("ticketConfig");
      if (storedConfig) {
        ticketConfig = { ...defaultConfig, ...JSON.parse(storedConfig) };
      }
    } catch {
      // Si falla, usa defaultConfig
    }
  }

  const width = ticketConfig.anchoPapel === "58mm" ? 190 : 180;
  const fontFamily = ticketConfig.fuente === "B" ? "monospace" : "inherit";
  const nombreTienda = ticketConfig.nombreTienda || "La Burbuja Felíz";
  const leyenda = ticketConfig.leyenda || "¡Gracias por su compra!";

  return (
    <div
      className="ticket-content" // Cambia id="ticket-content" por className
      style={{
        width,
        fontFamily,
        fontSize: "11px",
        padding: 0,
        margin: 0,
        background: "#fff",
        color: "#000"
      }}
    >
      {/* Logo arriba del nombre de la tienda */}
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <img
          src={logo}
          alt="Logo"
          style={{
            display: "block",
            margin: "0 auto",
            maxWidth: 80,
            maxHeight: 80,
            objectFit: "contain"
          }}
        />
      </div>
      <div style={{ textAlign: "center", fontWeight: "bold" }}>
        {nombreTienda}
      </div>
      {ticketConfig.rfc && (
        <div style={{ textAlign: "center" }}>RFC: {ticketConfig.rfc}</div>
      )}
      {ticketConfig.direccion && (
        <div style={{ textAlign: "center" }}>{ticketConfig.direccion}</div>
      )}
      {ticketConfig.telefono && (
        <div style={{ textAlign: "center" }}>Tel: {ticketConfig.telefono}</div>
      )}
      <hr />
      <div>Fecha: {venta.fecha || "-"}</div>
      <div>Ticket #: {venta.ticketNumber || "-"}</div>
      <div>Vendedor: {venta.vendedor || "-"}</div>
      {venta.cliente && <div>Cliente: {venta.cliente.nombre}</div>}
      <hr />
      <div>
        {venta.items.map((item, idx) => (
          <div key={idx} className="ticket-row" style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", display: "inline-block" }}>
              {item.producto?.nombre || "Producto"}
            </span>
            <span style={{ minWidth: 30, textAlign: "right" }}>
              x{item.cantidad}
            </span>
            <span style={{ minWidth: 40, textAlign: "right" }}>
              ${typeof item.producto?.precioVenta === "number"
                ? item.producto.precioVenta.toFixed(2)
                : "0.00"}
            </span>
            <span style={{ minWidth: 50, textAlign: "right" }}>
              {Number(item.producto?.precioVenta) > 0 && Number(item.cantidad) > 0
                ? `$${(Number(item.producto?.precioVenta) * Number(item.cantidad)).toFixed(2)}`
                : (
                  Number(item.producto?.precioVenta) === 0 && Number(item.cantidad) > 0
                    ? "$0.00"
                    : "0.00"
                )
              }
            </span>
          </div>
        ))}
      </div>
      <hr />
      <div style={{ textAlign: "right", fontWeight: "bold" }}>
        TOTAL: ${typeof venta.total === "number" ? venta.total.toFixed(2) : "0.00"}
      </div>
      <div style={{ textAlign: "center", marginTop: 10 }}>
        {leyenda}
      </div>
      <div style={{ height: 100 }} /> {/* Espacio extra entre tickets, ajusta el valor si lo deseas */}
      <style>
        {`
          @media print {
            .ticket-content {
              width: 180px !important;
              min-width: 180px !important;
              max-width: 180px !important;
              margin: 0 0 90px 0 !important; /* 40px de espacio entre tickets */
              padding: 0 !important;
              background: #fff !important;
              color: #000 !important;
              box-sizing: border-box !important;
              page-break-after: always;
            }
            @page {
              margin: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default TicketPrint;