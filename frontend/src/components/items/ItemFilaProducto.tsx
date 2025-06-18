import React from "react";
import { X } from "lucide-react";
import type { ProductoType } from "../../types/ProductoType";

// Estilos base para celdas (más compacto y profesional)
const cellStyle: React.CSSProperties = {
  padding: "5px 8px",
  color: "#1e293b",
  borderBottom: "1px solid #e5e7eb",
  fontSize: 13,
  lineHeight: 1.2,
  verticalAlign: "middle",
  minWidth: 70,
  maxWidth: 220,
  overflow: "visible",
  whiteSpace: "normal",
  wordBreak: "break-word",
};

const ItemFilaProducto = ({
  producto,
  cantidad,
  descuento,
  handleModificarProducto,
  handleBorrarProducto,
  productoId,
  modoPDF = false,
}: {
  producto: ProductoType;
  cantidad: number;
  descuento?: number;
  handleModificarProducto: (id: number, value: number, name: string) => void;
  handleBorrarProducto: (id: number) => void;
  productoId: number;
  modoPDF?: boolean;
}) => (
  <>
    {/* Descripción */}
    <td className="compact-td" style={{ ...cellStyle, minWidth: 120, maxWidth: 260 }}>
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
            height: 22,
            padding: "2px 6px",
            fontSize: 13,
            fontWeight: 500,
            boxSizing: "border-box",
            display: "block",
          }}
          readOnly
        />
      )}
    </td>
    {/* Cantidad */}
    <td className="compact-td" style={{ ...cellStyle, minWidth: 45, maxWidth: 70, textAlign: "center" }}>
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
            height: 22,
            padding: "2px 6px",
            fontSize: 13,
            boxSizing: "border-box",
            display: "block",
            textAlign: "center",
          }}
          value={cantidad}
          onChange={e =>
            handleModificarProducto(productoId, Number(e.target.value), "cantidad")
          }
        />
      )}
    </td>
    {/* Precio unitario */}
    <td className="compact-td" style={{ ...cellStyle, minWidth: 60, maxWidth: 90, textAlign: "right" }}>
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
            height: 22,
            padding: "2px 6px",
            fontSize: 13,
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
    <td className="compact-td" style={{ ...cellStyle, minWidth: 55, maxWidth: 80, textAlign: "center" }}>
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
            height: 22,
            padding: "2px 6px",
            fontSize: 13,
            boxSizing: "border-box",
            minWidth: 40,
            appearance: "none",
            display: "block",
            textAlign: "center",
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
      className="compact-td"
      style={{
        ...cellStyle,
        background: "#f1f5f9",
        textAlign: "right",
        fontFamily: "monospace",
        fontWeight: 500,
        minWidth: 60,
        maxWidth: 90,
      }}
    >
      {(
        cantidad * producto.precio -
        ((descuento ?? 0) / 100) * (producto.precio * cantidad)
      ).toFixed(2)}
    </td>
    {/* Quitar producto */}
    <td
      className="compact-td"
      style={{
        ...cellStyle,
        textAlign: "center",
        minWidth: 30,
        maxWidth: 40,
      }}
    >
      {!modoPDF && (
        <button
          style={{
            color: "#ef4444",
            fontWeight: 700,
            padding: "0 4px",
            background: "none",
            border: "none",
            cursor: "pointer",
            height: 22,
          }}
          onClick={() => handleBorrarProducto(productoId)}
          type="button"
          title="Quitar producto"
        >
          <X style={{ width: 14, height: 14, color: "#dc2626" }} />
        </button>
      )}
    </td>
  </>
);

export default ItemFilaProducto;