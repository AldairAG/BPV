import React from "react";
import type { TicketConfig, TicketPrintProps } from '../types/TicketTypes';
import logo from '../assets/logo.png'; // Ajusta la ruta si es necesario

const defaultConfig: TicketConfig = {
  nombreTienda: "La Burbuja Felíz | Fabricación, venta y distribución de productos químicos para limpieza a granel, mayoreo y menudeo.",
  rfc: "",
  direccion: "",
  telefono: "2281278853",
  leyenda: "¡Gracias por su compra!",
  anchoPapel: "80mm",
  fuente: "A",
};

const TicketPrint: React.FC<TicketPrintProps> = ({ venta, config }) => {
  console.log("Venta para imprimir:", venta);

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

  // Calcular subtotal, iva y si la venta tiene IVA
  const subtotalSinDescuento = venta.items.reduce((acc, item) => {
    const precioUnit = Number(item.producto.precioVenta);
    return acc + precioUnit * Number(item.cantidad);
  }, 0);

  const subtotal = venta.items.reduce((acc, item) => {
    const precioUnit = Number(item.producto.precioVenta);
    const desc = Number((item as any).descuento) || 0;
    const precioConDesc = precioUnit * (1 - desc / 100);
    return acc + precioConDesc * Number(item.cantidad);
  }, 0);

  const descuentoTotal = subtotalSinDescuento - subtotal;

  const conIva = venta.total > subtotal;
  const iva = conIva ? venta.total - subtotal : 0;

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
        <table style={{ width: "100%", fontSize: 11, marginBottom: 8 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Producto</th>
              <th>Cant</th>
              <th>Precio</th>
              <th>Desc</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {venta.items.map((item, idx) => {
              const precioUnit = Number(item.producto.precioVenta);
              const desc = Number((item as any).descuento) || 0;
              const precioConDesc = precioUnit * (1 - desc / 100);
              const importe = precioConDesc * Number(item.cantidad);
              return (
                <tr key={idx}>
                  <td>{item.producto.nombre}</td>
                  <td style={{ textAlign: "center" }}>{item.cantidad}</td>
                  <td style={{ textAlign: "right" }}>${precioUnit.toFixed(2)}</td>
                  <td style={{ textAlign: "right" }}>{desc}%</td>
                  <td style={{ textAlign: "right" }}>${importe.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Resumen de totales */}
      <div>
        <table style={{ width: "100%", fontSize: 11, marginTop: 8 }}>
          <tbody>
            <tr>
              <td colSpan={4} style={{ textAlign: "right" }}>Subtotal</td>
              <td style={{ textAlign: "right" }}>${subtotalSinDescuento.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ textAlign: "right" }}>Descuento total</td>
              <td style={{ textAlign: "right" }}>
                ${descuentoTotal.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan={4} style={{ textAlign: "right" }}>Subtotal c/desc</td>
              <td style={{ textAlign: "right" }}>${subtotal.toFixed(2)}</td>
            </tr>
            {conIva && (
              <tr>
                <td colSpan={4} style={{ textAlign: "right" }}>IVA (16%)</td>
                <td style={{ textAlign: "right" }}>${iva.toFixed(2)}</td>
              </tr>
            )}
            <tr>
              <td colSpan={4} style={{ textAlign: "right", fontWeight: "bold" }}>Total</td>
              <td style={{ textAlign: "right", fontWeight: "bold" }}>${venta.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ textAlign: "center", marginTop: 10 }}>
        {leyenda}
      </div>
      <div style={{ height: 160 }} /> {/* Espacio extra entre tickets, ajusta el valor si lo deseas */}
      {/* Dos líneas vacías al final del ticket */}
      <div>&nbsp;.</div>
      <div>&nbsp;</div>


      <style>
        {`
          @media print {
            html, body {
              counter-reset: page 1; 
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
              counter-reset: page 1; 
            }
            .ticket-content {
              width: 180px !important;
              min-width: 180px !important;
              max-width: 180px !important;
              margin: 0 0 40px 0 !important; /* 40px de espacio entre tickets */
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