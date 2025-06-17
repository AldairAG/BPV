import { useEffect, useState, useRef } from "react";
import ItemFilaProducto from "../../../components/items/ItemFilaProducto";
import { Formik, Form, Field, ErrorMessage } from "formik";
import type { ProductoType } from "../../../types/ProductoType";
import * as Yup from "yup";
import ModalBuscarProducto from "../../../components/modal/ModalBuscarProducto";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const inputFields = [
    { name: "nombre", placeholder: "Nombre del cliente" },
    { name: "telefono", placeholder: "Teléfono" },
    { name: "email", placeholder: "E-mail" },
    { name: "direccion", placeholder: "Dirección" },
    { name: "pie", placeholder: "Pie de página" },
    { name: "agregarIVA", placeholder: "Agregar IVA", type: "checkbox" },
];

interface formValues {
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
    pie: string;
    agregarIVA: boolean;
    productos: {
        productoId: number;
        cantidad: number;
        producto: ProductoType;
        descuento?: number;
    }[];
    [key: string]: string | boolean | { productoId: number, cantidad: number; producto: ProductoType, descuento?: number }[];
}

const Presupuestos = () => {
    const [formValues, setFormValues] = useState<formValues>({
        nombre: "",
        telefono: "",
        email: "",
        direccion: "",
        pie: "",
        agregarIVA: false,
        productos: []
    });

    const [modalOpen, setModalOpen] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);

    const subtotalConDescuento = formValues.productos.reduce(
        (acc: number, prod: { cantidad: number; producto: ProductoType, descuento?: number }) =>
            acc +
            Number(prod.cantidad) *
            (Number(prod.producto.precio) - (Number(prod.producto.precio) * (Number(prod.descuento ?? 0)) / 100)), 0
    ) || 0;

    // Total ahorrado en $ (suma de descuentos de cada producto)
    const totalAhorrado = formValues.productos.reduce(
        (acc: number, prod: { cantidad: number; producto: ProductoType, descuento?: number }) =>
            acc +
            Number(prod.cantidad) *
            (Number(prod.producto.precio) * (Number(prod.descuento ?? 0) / 100)), 0
    ) || 0;

    const iva = formValues.agregarIVA ? subtotalConDescuento * 0.16 : 0;
    const total = subtotalConDescuento + iva;

    useEffect(() => {
        console.log("Valores del formulario:", formValues);
    }, [formValues]);

    // Handlers
    const handleAddProducto = (producto: ProductoType) => {
        setFormValues(prev => ({
            ...prev,
            productos: [...prev.productos, { productoId: producto.productoId, cantidad: 1, producto }]
        }));
    };

    const handleBorrarProducto = (productoId: number) => {
        setFormValues(prev => ({
            ...prev,
            productos: prev.productos.filter(prod => prod.productoId !== productoId)
        }));
    };

    const handleModificarProducto = (productoId: number, value: number, name: string) => {
        setFormValues(prev => {
            const productosActualizados = prev.productos.map(prod => {
                if (prod.productoId === productoId) {
                    return {
                        ...prod,
                        [name]: value,
                        cantidad: name === "cantidad" ? value : prod.cantidad,
                    };
                }
                return prod;
            });
            return { ...prev, productos: productosActualizados };
        });
    };

    const handleImprimir = () => {
        window.print();
    };

    const handleGuardarPDF = async () => {
        console.log("Intentando guardar PDF...");
        if (!pdfRef.current) {
            console.warn("No se encontró el contenido para exportar. Intenta de nuevo.");
            return;
        }
        try {
            // Forzar colores seguros para html2canvas
            pdfRef.current.style.background = "#fff";
            pdfRef.current.style.color = "#222";
            // Renderizar a canvas
            const canvas = await html2canvas(pdfRef.current, {
                backgroundColor: "#fff",
                useCORS: true,
                scale: 2,
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: "a4"
            });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
            pdf.save("presupuesto.pdf");
        } catch (err) {
            console.error("Error generando PDF:", err);
            alert("No se pudo generar el PDF. Intenta simplificar el diseño o consulta soporte.");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#093283", // gris muy claro, sin degradado
                padding: "40px 0",
                width: "100%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <ModalBuscarProducto
                isOpen={modalOpen}
                onClose={() => { setModalOpen(modalOpen => !modalOpen) }}
                onSelect={handleAddProducto}
            />
            <Formik
                initialValues={formValues}
                validationSchema={Yup.object({
                    nombre: Yup.string().required("Requerido"),
                    telefono: Yup.string().required("Requerido")
                })}
                onSubmit={() => handleImprimir()}
            >
                {({ handleChange, handleBlur, values }) => (
                    <Form>
                        {/* Botón flotante Agregar producto */}
                        <button
                            style={{
                                position: "fixed",
                                top: "30%",
                                right: 0,
                                zIndex: 1000,
                                background: "#22c55e",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px 0 0 8px",
                                padding: "12px 20px",
                                fontWeight: "bold",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                cursor: "pointer",
                                marginBottom: 12,
                            }}
                            onClick={() => setModalOpen(true)}
                            type="button"
                        >
                            + Agregar producto
                        </button>

                        {/* Botón Guardar PDF */}
                        <button
                            type="button"
                            onClick={handleGuardarPDF}
                            style={{
                                position: "fixed",
                                top: "40%",
                                right: 0,
                                zIndex: 1000,
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px 0 0 8px",
                                padding: "12px 20px",
                                fontWeight: "bold",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                cursor: "pointer",
                            }}
                        >
                            Guardar PDF
                        </button>

                        {/* Contenedor a exportar */}
                        <div
                            ref={pdfRef}
                            style={{
                                background: "#f9fafb", // gris casi blanco, menos intenso que blanco puro
                                minHeight: 900,
                                width: "100%",
                                maxWidth: 900,
                                margin: "0 auto",
                                borderRadius: 16,
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 2px 16px rgba(37,99,235,0.08)",
                                display: "flex",
                                flexDirection: "column",
                                fontFamily: "sans-serif",
                                color: "#222",
                                padding: 24,
                                position: "relative"
                            }}
                            className="responsive-presupuesto-container"
                        >
                            <div style={{
                                width: "100%",
                                height: 20,
                                background: "#2563eb",
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                                marginBottom: 16
                            }} />
                            {/* Encabezado */}
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                borderBottom: "2px solid #93c5fd",
                                paddingBottom: 8,
                                marginBottom: 24,
                                paddingTop: 16,
                                paddingLeft: 16,
                                paddingRight: 16
                            }}>
                                <span style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: "#2563eb",
                                    letterSpacing: 2,
                                    textTransform: "uppercase",
                                    marginBottom: 4
                                }}>
                                    Presupuestos
                                </span>
                                <span style={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: "#1e40af",
                                    textAlign: "center"
                                }}>
                                    Artículos de limpieza "La Burbuja Feliz"
                                </span>
                                <span style={{
                                    fontSize: 13,
                                    color: "#334155",
                                    textAlign: "center",
                                    fontWeight: 400
                                }}>
                                    Tel: 2281278853 &nbsp;|&nbsp; Fabricación, venta y distribución de productos químicos para limpieza a granel, mayoreo y menudeo.
                                </span>
                            </div>

                            {/* Datos del cliente */}
                            <div
                                style={{
                                    marginBottom: 24,
                                    border: "1px solid #93c5fd",
                                    borderRadius: 10,
                                    padding: 16,
                                    background: "#f1f5f9"
                                }}
                                className="responsive-datos-cliente"
                            >
                                <h3 style={{
                                    fontWeight: 700,
                                    color: "#2563eb",
                                    marginBottom: 8,
                                    letterSpacing: 1,
                                    textTransform: "uppercase",
                                    fontSize: 13
                                }}>Datos del cliente</h3>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: 12,
                                        maxWidth: 700
                                    }}
                                    className="responsive-datos-grid"
                                >
                                    {inputFields
                                        .filter(field => field.name !== "pie" && field.name !== "agregarIVA")
                                        .map((field, index) => (
                                            <div key={index} style={{ display: "flex", flexDirection: "column" }}>
                                                <Field
                                                    type={field.type || "text"}
                                                    name={field.name}
                                                    placeholder={field.placeholder}
                                                    value={values[field.name]}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    style={{
                                                        borderBottom: "1px solid #93c5fd",
                                                        background: "transparent",
                                                        padding: "6px 8px",
                                                        fontSize: 15,
                                                        color: "#222",
                                                        outline: "none"
                                                    }}
                                                />
                                                <ErrorMessage
                                                    name={field.name}
                                                    render={msg => (
                                                        <div style={{ color: "#ef4444", fontSize: 12, marginTop: 2 }}>
                                                            {msg}
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Productos */}
                            <div style={{ marginBottom: 24 }}>
                                <h3 style={{
                                    fontWeight: 700,
                                    color: "#2563eb",
                                    marginBottom: 8,
                                    letterSpacing: 1,
                                    textTransform: "uppercase",
                                    fontSize: 13
                                }}>Productos</h3>
                                <div
                                    style={{
                                        overflowX: "auto",
                                        borderRadius: 12,
                                        background: "#fff",
                                        boxShadow: "0 1px 4px rgba(37,99,235,0.06)"
                                    }}
                                >
                                    <table
                                        style={{
                                            width: "100%",
                                            borderCollapse: "collapse",
                                            background: "#f1f5f9",
                                            fontSize: 15,
                                            borderRadius: 8,
                                            overflow: "hidden"
                                        }}
                                        className="responsive-productos-table"
                                    >
                                        <thead>
                                            <tr style={{ background: "#2563eb" }}>
                                                <th style={{ padding: 10, color: "#fff", textAlign: "left", borderTopLeftRadius: 8 }}>Descripción</th>
                                                <th style={{ padding: 10, color: "#fff", textAlign: "left" }}>Cantidad</th>
                                                <th style={{ padding: 10, color: "#fff", textAlign: "left" }}>P/U</th>
                                                <th style={{ padding: 10, color: "#fff", textAlign: "left" }}>Descuentos</th>
                                                <th style={{ padding: 10, color: "#fff", textAlign: "left", borderTopRightRadius: 8 }}>Sub Total</th>
                                                <th style={{ padding: 10 }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formValues.productos.map((producto, i) => (
                                                <tr key={i} style={{
                                                    background: "#fff",
                                                    transition: "background 0.2s"
                                                }}
                                                    onMouseOver={e => (e.currentTarget.style.background = "#e0e7ff")}
                                                    onMouseOut={e => (e.currentTarget.style.background = "#fff")}
                                                >
                                                    <ItemFilaProducto
                                                        producto={producto.producto}
                                                        cantidad={producto.cantidad}
                                                        descuento={producto.descuento}
                                                        handleModificarProducto={handleModificarProducto}
                                                        handleBorrarProducto={handleBorrarProducto}
                                                        productoId={producto.productoId}
                                                    />
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Totales */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "flex-end",
                                    gap: 16,
                                    alignItems: "flex-end",
                                    marginBottom: 24
                                }}
                                className="responsive-totales"
                            >
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                    width: 280,
                                    background: "#f1f5f9",
                                    border: "1px solid #93c5fd",
                                    borderRadius: 10,
                                    padding: 16,
                                    boxShadow: "0 1px 4px rgba(37,99,235,0.06)"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ fontWeight: 600, color: "#222" }}>Subtotal</span>
                                        <span style={{ fontFamily: "monospace", color: "#222" }}>${subtotalConDescuento.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ fontWeight: 600, color: "#16a34a" }}>Total ahorrado</span>
                                        <span style={{ fontFamily: "monospace", color: "#16a34a" }}>-${totalAhorrado.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, color: "#222" }}>
                                            <input
                                                type="checkbox"
                                                name="agregarIVA"
                                                onBlur={handleBlur}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    setFormValues(prev => ({
                                                        ...prev,
                                                        agregarIVA: e.target.checked
                                                    }));
                                                }}
                                                style={{ accentColor: "#2563eb" }}
                                            />
                                            IVA (16%)
                                        </label>
                                        <span style={{ fontFamily: "monospace", color: "#222" }}>${iva.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 17, borderTop: "1px solid #93c5fd", paddingTop: 8 }}>
                                        <span style={{ color: "#222" }}>Total general</span>
                                        <span style={{ fontFamily: "monospace", color: "#222" }}>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pie de página */}
                            <div style={{ marginTop: "auto" }}>
                                <div
                                    style={{
                                        width: "100%",
                                        height: 20,
                                        background: "#2563eb",
                                        borderBottomLeftRadius: 12,
                                        borderBottomRightRadius: 12,
                                        maxHeight: "2cm"
                                    }}
                                />
                                <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 8 }}>
                                    <label style={{
                                        display: "block",
                                        fontWeight: 700,
                                        color: "#2563eb",
                                        marginBottom: 4,
                                        textTransform: "uppercase",
                                        fontSize: 13
                                    }}>
                                        Observaciones / Dirección adicional:
                                    </label>
                                    <textarea
                                        style={{
                                            width: "100%",
                                            borderBottom: "1px solid #93c5fd",
                                            background: "transparent",
                                            padding: "8px 12px",
                                            fontSize: 15,
                                            color: "#222",
                                            outline: "none"
                                        }}
                                        rows={2}
                                        placeholder="Agrega aquí una dirección u observación si es necesario..."
                                        value={values.pie}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* --- ESTILOS RESPONSIVOS --- */}
                        <style>
                            {`
                            @media (max-width: 1024px) {
                                .responsive-presupuesto-container {
                                    max-width: 98vw !important;
                                    padding: 10px !important;
                            }
                            .responsive-datos-grid {
                                grid-template-columns: 1fr !important;
                                gap: 8px !important;
                            }
                            .responsive-totales {
                                flex-direction: column !important;
                                align-items: stretch !important;
                                gap: 8px !important;
                            }
                        }
                        @media (max-width: 700px) {
                            .responsive-presupuesto-container {
                                min-width: 0 !important;
                                max-width: 100vw !important;
                                padding: 4vw !important;
                            }
                            .responsive-datos-cliente {
                                padding: 8px !important;
                            }
                            .responsive-productos-table th,
                            .responsive-productos-table td {
                                font-size: 13px !important;
                                padding: 6px !important;
                            }
                        }
                        @media (max-width: 500px) {
                            .responsive-presupuesto-container {
                                padding: 2vw !important;
                            }
                            .responsive-productos-table th,
                            .responsive-productos-table td {
                                font-size: 11px !important;
                                padding: 3px !important;
                            }
                        }
                        `}
                        </style>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default Presupuestos;