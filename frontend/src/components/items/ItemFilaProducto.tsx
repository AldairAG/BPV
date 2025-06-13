import React from "react";
import { X } from "lucide-react";
import type { ProductoType } from "../../types/ProductoType";

// Estilos base para celdas
const cellStyle: React.CSSProperties = {
  padding: "10px 14px",
  color: "#1e293b",
  background: "#fff",
  borderBottom: "1px solid #e5e7eb",
  fontSize: 16,
  verticalAlign: "middle",
  minWidth: 90,
  maxWidth: 260,
  overflow: "visible",
  whiteSpace: "normal",
  wordBreak: "break-word",
  height: 40,
};

// Estilos para inputs y selects para que llenen la celda y no se corten

const ItemFilaProducto = ({
  producto,
  cantidad,
  descuento,
  handleModificarProducto,
  handleBorrarProducto,
  productoId,
  modoPDF = false, // <--- NUEVO
}: {
  producto: ProductoType;
  cantidad: number;
  descuento?: number;
  handleModificarProducto: (id: number, value: number, name: string) => void;
  handleBorrarProducto: (id: number) => void;
  productoId: number;
  modoPDF?: boolean; // <--- NUEVO
}) => (
  <>
    {/* Descripción */}
    <td style={{ ...cellStyle, minWidth: 160, maxWidth: 300 }}>
      {modoPDF ? (
        <span style={{ fontWeight: 500 }}>{producto?.nombre}</span>
      ) : (
        <input
          type="text"
          value={producto?.nombre}
          placeholder="Nombre del producto"
          style={{
            color: "#1e293b",
            background: "#fff",
            border: "none",
            borderBottom: "1px solid #e5e7eb",
            outline: "none",
            width: "100%",
            height: 32,
            padding: "4px 8px",
            fontSize: 16,
            fontWeight: 500,
            boxSizing: "border-box",
            display: "block",
          }}
          readOnly
        />
      )}
    </td>
    {/* Cantidad */}
    <td style={{ ...cellStyle, minWidth: 60, maxWidth: 90 }}>
      {modoPDF ? (
        <span>{cantidad}</span>
      ) : (
        <input
          type="number"
          min={1}
          name="cantidad"
          style={{
            color: "#1e293b",
            background: "#fff",
            border: "none",
            borderBottom: "1px solid #e5e7eb",
            outline: "none",
            width: "100%",
            height: 32,
            padding: "4px 8px",
            fontSize: 16,
            boxSizing: "border-box",
            display: "block",
          }}
          value={cantidad}
          onChange={e =>
            handleModificarProducto(productoId, Number(e.target.value), "cantidad")
          }
        />
      )}
    </td>
    {/* Precio unitario */}
    <td style={{ ...cellStyle, minWidth: 80, maxWidth: 110, textAlign: "right" }}>
      {modoPDF ? (
        <span>{producto?.precio}</span>
      ) : (
        <input
          type="number"
          min={0}
          step={0.01}
          style={{
            color: "#1e293b",
            background: "#fff",
            border: "none",
            borderBottom: "1px solid #e5e7eb",
            outline: "none",
            width: "100%",
            height: 32,
            padding: "4px 8px",
            fontSize: 16,
            boxSizing: "border-box",
            display: "block",
            textAlign: "right",
          }}
          value={producto?.precio}
          readOnly
        />
      )}
    </td>
    {/* Descuento */}
    <td style={{ ...cellStyle, minWidth: 80, maxWidth: 110 }}>
      {modoPDF ? (
        <span>{descuento ?? 0}%</span>
      ) : (
        <select
          name="descuento"
          style={{
            color: "#1e293b",
            background: "#fff",
            border: "none",
            borderBottom: "1px solid #e5e7eb",
            outline: "none",
            width: "100%",
            height: 32,
            padding: "4px 8px",
            fontSize: 16,
            boxSizing: "border-box",
            minWidth: 60,
            appearance: "none",
            display: "block",
          }}
          value={descuento ?? 0}
          onChange={e =>
            handleModificarProducto(productoId, Number(e.target.value), "descuento")
          }
        >
          <option value={0}>0%</option>
          {producto?.descuentos?.filter(d => d !== 0).map((desc, idx) => (
            <option key={idx} value={desc}>
              {desc}%
            </option>
          ))}
        </select>
      )}
    </td>
    {/* Sub Total */}
    <td
      style={{
        ...cellStyle,
        background: "#f1f5f9",
        textAlign: "right",
        fontFamily: "monospace",
        fontWeight: 500,
        minWidth: 90,
        maxWidth: 120,
      }}
    >
      {(
        cantidad * producto.precio -
        ((descuento ?? 0) / 100) * (producto.precio * cantidad)
      ).toFixed(2)}
    </td>
    {/* Quitar producto */}
    <td
      style={{
        ...cellStyle,
        textAlign: "center",
        minWidth: 40,
        maxWidth: 60,
      }}
    >
      {!modoPDF && (
        <button
          style={{
            color: "#ef4444",
            fontWeight: 700,
            padding: "0 8px",
            background: "none",
            border: "none",
            cursor: "pointer",
            height: 32,
          }}
          onClick={() => handleBorrarProducto(productoId)}
          type="button"
          title="Quitar producto"
        >
          <X style={{ width: 16, height: 16, color: "#dc2626" }} />
        </button>
      )}
    </td>
  </>
);

export default ItemFilaProducto;