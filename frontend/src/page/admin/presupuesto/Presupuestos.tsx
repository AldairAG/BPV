import { useEffect, useState } from "react";
import ItemFilaProducto from "../../../components/items/ItemFilaProducto";
import { Formik, Form, Field, ErrorMessage } from "formik";
import type { ProductoType } from "../../../types/ProductoType";
import * as Yup from "yup";
import ModalBuscarProducto from "../../../components/modal/ModalBuscarProducto";

const inputFields = [
    { name: "nombre", placeholder: "Nombre del cliente" },
    { name: "telefono", placeholder: "Teléfono" },
    { name: "email", placeholder: "E-mail" },
    { name: "direccion", placeholder: "Dirección" },
    { name: "pie", placeholder: "Pie de página" },
    { name: "agregarIVA", placeholder: "Agregar IVA", type: "checkbox" },
]


interface formValues {
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
    pie: string;
    agregarIVA: boolean;
    productos: {
        productoId: number // ID del producto
        cantidad: number
        producto: ProductoType
        descuento?: number; // Descuento opcional para cada producto
    }[];
    [key: string]: string | boolean | {productoId:number, cantidad: number; producto: ProductoType,descuento?:number }[];
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

    // Calculos
    const subtotal = formValues.productos.reduce(
        (acc: number, prod: { cantidad: number; producto: ProductoType, descuento?: number }) =>
            acc +
            Number(prod.cantidad) *
            (Number(prod.producto.precio) - (Number(prod.producto.precio) * (Number(prod.descuento)) / 100||0)), 0
    )||0;
    const iva = formValues.agregarIVA ? subtotal * 0.16 : 0;
    const total = subtotal + iva;

    useEffect(() => {
        console.log("Valores del formulario:", formValues);
        
    }, [formValues]);

    // Handlers

    const handleAddProducto = (producto: ProductoType) => {
        setFormValues(prev => ({
            ...prev,
            productos: [...prev.productos, { productoId: producto.productoId, cantidad: 1, producto }]
        }));
    }

    const handleModificarProducto = (productoId: number, value: number,name:string) => {
        setFormValues(prev => {
            const productosActualizados = prev.productos.map(prod => {
                if (prod.productoId === productoId) {
                    return {
                        ...prod,
                        [name]: value, // Actualiza el campo específico
                        cantidad: name === "cantidad" ? value : prod.cantidad, // Asegura que cantidad se actualice correctamente
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

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 py-10 w-full print:bg-white"
            style={{ overflow: "hidden" }}
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
                    <Form >
                        <div
                            className="relative bg-white/95 w-[816px] h-[1056px] shadow-2xl rounded-lg border border-blue-200 font-mono flex flex-col mx-auto print:shadow-none print:bg-white print:border-none"
                        >
                            <div
                                className="w-full h-[20px] bg-blue-600 rounded-t-lg max-h-[2cm] print:bg-blue-600"
                            />
                            {/* Encabezado */}
                            <div className="flex flex-col items-center border-b-2 border-blue-300 pb-2 mb-4 pt-4 px-4">
                                <span className="text-lg font-bold text-blue-800 tracking-widest uppercase mb-1">
                                    Presupuestos
                                </span>
                                <span className="text-base font-semibold text-blue-700 text-center">
                                    Artículos de limpieza "La Burbuja Feliz"
                                </span>
                                <span className="text-xs text-gray-700 text-center font-normal">
                                    Tel: 2281278853 &nbsp;|&nbsp; Fabricación, venta y distribución de productos químicos para limpieza a granel, mayoreo y menudeo.
                                </span>
                            </div>

                            {/* Datos del cliente */}
                            <div className="mb-5 border border-blue-100 rounded-lg p-3 bg-blue-50/60 mx-4 print:bg-white">
                                <h3 className="font-bold text-blue-800 mb-2 tracking-wide uppercase text-xs">Datos del cliente</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                                    {inputFields
                                        .filter(field => field.name !== "pie" && field.name !== "agregarIVA")
                                        .map((field, index) => (
                                            <div key={index} className="flex flex-col">
                                                <Field
                                                    type={field.type || "text"}
                                                    name={field.name}
                                                    placeholder={field.placeholder}
                                                    value={values[field.name]}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className="border-b border-blue-300 bg-transparent px-2 py-1 focus:outline-none focus:border-blue-500 transition text-sm text-blue-900 print:bg-white"
                                                />
                                                <ErrorMessage
                                                    name={field.name}
                                                    component="div"
                                                    className="text-red-500 text-xs mt-1"
                                                />
                                            </div>
                                        ))}

                                </div>
                            </div>

                            {/* Productos */}
                            <div className="mb-5 mx-4 print:bg-white">
                                <h3 className="font-bold text-blue-800 mb-2 tracking-wide uppercase text-xs">Productos</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border border-blue-200 rounded-lg bg-blue-50/40 text-xs shadow print:bg-white">
                                        <thead>
                                            <tr className="bg-blue-600 text-white uppercase print:bg-blue-600 print:text-white">
                                                <th className="border-b border-blue-200 px-2 py-1 font-semibold">Descripción</th>
                                                <th className="border-b border-blue-200 px-2 py-1 font-semibold">Cantidad</th>
                                                <th className="border-b border-blue-200 px-2 py-1 font-semibold">P/U</th>
                                                <th className="border-b border-blue-200 px-2 py-1 font-semibold">Descuentos</th>
                                                <th className="border-b border-blue-200 px-2 py-1 font-semibold bg-blue-500 text-white">Sub Total</th>
                                                <th className="border-b border-blue-200 px-2 py-1"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formValues.productos.map((producto, i) => (
                                                <tr key={i}>
                                                    <ItemFilaProducto producto={producto.producto} handleModificarProducto={handleModificarProducto}/>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* Botones de acción */}
                            <div className="mb-5 mx-4 flex gap-2 print:hidden">
                                <button
                                    className="px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition text-xs font-semibold"
                                    onClick={() => {setModalOpen(true)}}
                                    type="button"
                                >
                                    + Agregar producto
                                </button>
                                <button
                                    className="px-3 py-1 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition text-xs font-semibold"
                                    type="submit"
                                >
                                    Imprimir
                                </button>
                            </div>

                            {/* Totales */}
                            <div className="flex flex-col md:flex-row md:justify-end gap-4 items-end mb-5 mx-4 print:bg-white">
                                <div className="flex flex-col gap-2 w-full md:w-72 bg-blue-100 border border-blue-200 rounded-lg p-3 shadow-lg print:bg-white">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-black">Sub Total</span>
                                        <span className="font-mono text-black">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-black">
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
                                                className="accent-blue-600"
                                            />
                                            IVA (16%)
                                        </label>
                                        <span className="font-mono text-black">${iva.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-base border-t pt-2">
                                        <span className="text-black">Total General</span>
                                        <span className="font-mono text-black">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pie de página */}
                            <div className="mt-auto print:bg-white">
                                <div
                                    className="w-full print:bg-blue-600"
                                    style={{
                                        height: "20px",
                                        background: "#2563eb",
                                        borderBottomLeftRadius: "0.5rem",
                                        borderBottomRightRadius: "0.5rem",
                                        maxHeight: "2cm",
                                    }}
                                />
                                <div className="px-4 pt-4 pb-2">
                                    <label className="block font-bold text-blue-800 mb-1 uppercase text-xs">
                                        Observaciones / Dirección adicional:
                                    </label>
                                    <textarea
                                        className="w-full border-b border-blue-300 bg-transparent px-3 py-2 focus:outline-none focus:border-blue-500 transition text-sm text-blue-900 print:bg-white"
                                        rows={2}
                                        placeholder="Agrega aquí una dirección u observación si es necesario..."
                                        value={values.pie}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div >
    );
};

export default Presupuestos;